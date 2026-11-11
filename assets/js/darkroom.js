/* ==========================================================================
   Darkroom print: an ASCII rendering laid exactly over the photo it came
   from. A soft lens follows the pointer and "develops" the photo through
   the characters. Without JS (or if the ASCII can't load) the photo shows.

   The ASCII is drawn once into a canvas, and the lens is moved only with
   transforms, so following the pointer never repaints anything.

   <figure class="darkroom" data-ascii="data/yosemite.txt" data-cols="400"> …
   ========================================================================== */
(function () {
  "use strict";
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const INK = "#0a0f13";
  const FONT = '500 100px "IBM Plex Mono", ui-monospace, Menlo, monospace';

  function setup(fig) {
    const stage = fig.querySelector(".dr-stage");
    const photo = fig.querySelector(".dr-photo");
    const toggle = fig.querySelector(".dr-toggle");
    const cols = +fig.dataset.cols || 400;
    let lines = [], W = 0, H = 0, R = 0;
    let developed = false, touched = false, raf = 0, visible = false, shown = false;
    let x = 0.3, y = 0.55, tx = x, ty = y;
    const t0 = performance.now();

    const canvas = document.createElement("canvas");
    canvas.className = "dr-canvas";
    canvas.setAttribute("aria-hidden", "true");
    const lens = document.createElement("div");
    lens.className = "dr-lens";
    lens.setAttribute("aria-hidden", "true");
    const lensImg = document.createElement("img");
    lensImg.src = photo.currentSrc || photo.src;
    lensImg.alt = "";
    lens.appendChild(lensImg);

    function draw() {
      W = stage.clientWidth; H = stage.clientHeight;
      if (!W || !lines.length) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = FONT;
      const charW = ctx.measureText("M".repeat(10)).width / 10 / 100;
      const size = W / (cols * charW);
      const lh = H / lines.length;
      ctx.font = FONT.replace("100px", `${size}px`);
      ctx.textBaseline = "middle";
      ctx.fillStyle = INK;
      lines.forEach((line, i) => ctx.fillText(line, 0, (i + 0.5) * lh));

      R = Math.max(70, Math.min(W, H) * 0.24);
      lens.style.width = lens.style.height = `${2 * R}px`;
      lensImg.style.width = `${W}px`; lensImg.style.height = `${H}px`;
      place();
    }

    function place() {
      const lx = x * W - R, ly = y * H - R;
      lens.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0)`;
      lensImg.style.transform = `translate3d(${(-lx).toFixed(1)}px, ${(-ly).toFixed(1)}px, 0)`;
    }

    const drifting = () => !touched && !developed && !REDUCED;

    function frame(now) {
      raf = 0;
      if (drifting()) {
        const t = (now - t0) / 1000;
        tx = 0.5 + 0.34 * Math.sin(t * 0.23); ty = 0.58 + 0.16 * Math.sin(t * 0.41 + 1);
      }
      x += (tx - x) * 0.14; y += (ty - y) * 0.14;
      place();
      const moving = Math.abs(tx - x) > 0.0005 || Math.abs(ty - y) > 0.0005;
      if (visible && (moving || drifting())) raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(frame); };

    function setLens(on) { lens.classList.toggle("on", on); }

    // the lens sits exactly under the pointer; easing is only for the idle drift
    let rect = null;
    const measure = () => { rect = stage.getBoundingClientRect(); };
    window.addEventListener("scroll", () => { rect = null; }, { passive: true });
    window.addEventListener("resize", () => { rect = null; });

    function point(e) {
      if (!shown) return;
      if (!rect) measure();
      x = tx = (e.clientX - rect.left) / rect.width;
      y = ty = (e.clientY - rect.top) / rect.height;
      touched = true;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      place();
      if (!developed) setLens(true);
    }
    stage.addEventListener("pointermove", point);
    stage.addEventListener("pointerdown", point);
    stage.addEventListener("pointerleave", (e) => { if (!developed && e.pointerType === "mouse") setLens(false); });

    toggle.addEventListener("click", () => {
      developed = !developed;
      fig.classList.toggle("developed", developed);
      setLens(!developed && (touched || !REDUCED));
      toggle.setAttribute("aria-pressed", String(developed));
      toggle.textContent = developed ? "back to ASCII" : "develop the print";
      if (!developed) kick();
    });

    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: "100px" }).observe(stage);

    let rt;
    new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(draw, 80); }).observe(stage);

    fetch(fig.dataset.ascii)
      .then((res) => (res.ok ? res.text() : Promise.reject()))
      .then((txt) => {
        lines = txt.replace(/\s+$/, "").split("\n").map((l) => l.replace(/\r$/, "").padEnd(cols).slice(0, cols));
        const fontReady = document.fonts ? document.fonts.load(FONT).catch(() => {}) : Promise.resolve();
        return fontReady;
      })
      .then(() => {
        stage.append(canvas, lens);
        draw();
        fig.classList.add("has-ascii");
        shown = true;
        if (REDUCED) { x = tx = 0.3; y = ty = 0.55; place(); }
        setLens(true);
        kick();
      })
      .catch(() => { toggle.hidden = true; });
  }

  document.querySelectorAll(".darkroom[data-ascii]").forEach(setup);
})();
