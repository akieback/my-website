/* ==========================================================================
   Hero landscape: dusk sky, two hazy ridges, and a front ridge drawn as a
   speech waveform that "talks", mirrored in the ocean below the horizon.
   ========================================================================== */
(function () {
  "use strict";
  const canvas = document.querySelector(".hero canvas");
  if (!canvas || !window.AK) return;
  const { makeNoise, rng, fitCanvas, REDUCED, cssVar } = window.AK;

  const noise = makeNoise(7);
  const jitter = makeNoise(99);
  const PAD = 40; // extra width so ridges can drift with the pointer
  let ctx, w, h, horizon, layers = {}, bars = [], raf = 0, visible = true;
  let px = 0.5, pxTarget = 0.5, pointerX = -1e4, pointerY = -1e4, scrollY = 0;
  const t0 = performance.now();

  const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  // mountains rise toward the right on wide screens so the text has open sky
  const rise = (x) => (w > 760 ? 0.25 + 0.75 * smooth(0.05 * w, 0.75 * w, x) : 0.75);

  function offscreen(width, height) {
    const c = document.createElement("canvas");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(width * dpr); c.height = Math.round(height * dpr);
    const x = c.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { c, x };
  }

  function ridgeLayer(amp, scale, offset, fill, reflectAlpha) {
    const W = w + PAD * 2;
    const { c, x } = offscreen(W, h);
    const pts = [];
    for (let i = 0; i <= W + 4; i += 4) {
      const gx = i - PAD;
      pts.push([i, horizon - Math.pow(noise((gx + offset) / scale), 1.7) * amp * rise(gx)]);
    }
    x.beginPath(); x.moveTo(0, horizon);
    pts.forEach(([a, b]) => x.lineTo(a, b));
    x.lineTo(W, horizon); x.closePath();
    x.fillStyle = fill; x.fill();
    // reflection, squashed and faded
    x.save(); x.globalAlpha = reflectAlpha;
    x.beginPath(); x.moveTo(0, horizon);
    pts.forEach(([a, b]) => x.lineTo(a, horizon + (horizon - b) * 0.55));
    x.lineTo(W, horizon); x.closePath();
    x.fillStyle = fill; x.fill(); x.restore();
    return c;
  }

  function build() {
    ({ ctx, w, h } = fitCanvas(canvas));
    horizon = Math.round(h * (w > 760 ? 0.76 : 0.8));

    // sky + water + sun + stars
    const sky = offscreen(w, h);
    const g = sky.x.createLinearGradient(0, 0, 0, horizon);
    g.addColorStop(0, "#0a1620"); g.addColorStop(0.45, "#152c45"); g.addColorStop(0.78, "#4a4560"); g.addColorStop(1, "#c9775a");
    sky.x.fillStyle = g; sky.x.fillRect(0, 0, w, horizon);
    const sunX = w > 760 ? w * 0.7 : w * 0.62, sunY = horizon - h * 0.11;
    const glow = sky.x.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(w, h) * 0.45);
    glow.addColorStop(0, "rgba(246,190,140,0.45)"); glow.addColorStop(0.35, "rgba(214,120,90,0.14)"); glow.addColorStop(1, "rgba(0,0,0,0)");
    sky.x.fillStyle = glow; sky.x.fillRect(0, 0, w, h);
    sky.x.fillStyle = "rgba(250,214,180,0.9)";
    sky.x.beginPath(); sky.x.arc(sunX, sunY, Math.max(14, Math.min(w, h) * 0.035), 0, Math.PI * 2); sky.x.fill();
    const r = rng(3);
    for (let i = 0; i < w / 6; i++) {
      const sx = r() * w, sy = Math.pow(r(), 1.6) * horizon * 0.6, s = r();
      sky.x.fillStyle = `rgba(241,235,224,${0.12 + s * 0.55})`;
      sky.x.fillRect(sx, sy, s > 0.93 ? 2 : 1, s > 0.93 ? 2 : 1);
    }
    const water = sky.x.createLinearGradient(0, horizon, 0, h);
    water.addColorStop(0, "#5b4c5e"); water.addColorStop(0.18, "#1d3346"); water.addColorStop(1, "#0a1620");
    sky.x.fillStyle = water; sky.x.fillRect(0, horizon, w, h - horizon);
    // sun glitter: broken horizontal strokes that widen and fade toward the viewer
    const gr = rng(11);
    for (let y = horizon + 4; y < h; y += 3) {
      const p = (y - horizon) / (h - horizon);
      const half = w * (0.015 + 0.06 * p);
      sky.x.fillStyle = `rgba(250,205,165,${0.42 * (1 - p) * (1 - p)})`;
      for (let k = 0; k < 4; k++) {
        const cx = sunX + (gr() * 2 - 1) * half, len = 4 + gr() * half * 0.5;
        sky.x.fillRect(cx - len / 2, y, len, 1.2);
      }
    }
    layers.sky = sky.c;

    const amp = h * (w > 760 ? 0.42 : 0.3);
    layers.far = ridgeLayer(amp, 620, 0, "#5a6383", 0.22);
    layers.mid = ridgeLayer(amp * 0.78, 400, 1700, "#27384f", 0.35);

    // front ridge as waveform bars
    const step = w > 760 ? 7 : 6;
    bars = [];
    for (let x = step / 2; x < w; x += step) {
      bars.push({ x, base: Math.pow(noise((x + 5300) / 260), 1.5) * amp * 0.6 * rise(x) + 6 });
    }
    layers.step = step;
  }

  function frame(now) {
    const t = REDUCED ? 0 : (now - t0) / 1000;
    px += (pxTarget - px) * 0.04;
    const drift = (px - 0.5) * PAD;
    const sy = Math.min(scrollY, h);

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(layers.sky, 0, 0, w, h);
    ctx.drawImage(layers.far, -PAD - drift * 0.4, sy * 0.12, w + PAD * 2, h);
    ctx.drawImage(layers.mid, -PAD - drift * 0.8, sy * 0.06, w + PAD * 2, h);

    // shimmer on the water
    ctx.strokeStyle = "rgba(241,226,210,0.10)"; ctx.lineWidth = 1;
    for (let row = 0; row < 14; row++) {
      const y = horizon + 8 + Math.pow(row / 14, 1.4) * (h - horizon - 20);
      ctx.beginPath();
      for (let x = (row * 37) % 80 - 80; x < w; x += 80 + row * 6) {
        const off = Math.sin(t * 0.6 + row + x * 0.01) * 14;
        ctx.moveTo(x + off, y); ctx.lineTo(x + off + 22 + row * 2, y);
      }
      ctx.stroke();
    }

    // the waveform ridge: an utterance travels left to right
    const bw = layers.step * 0.55;
    ctx.lineCap = "round"; ctx.lineWidth = bw;
    const front = new Path2D(), refl = new Path2D();
    for (const b of bars) {
      const syl = 0.5 + 0.5 * Math.sin(b.x * 0.05 - t * 3.2) * (0.6 + 0.4 * Math.sin(b.x * 0.012 + t * 0.8));
      const near = Math.exp(-Math.pow((b.x - pointerX) / 110, 2)) * (pointerY < horizon + 60 ? 1 : 0.4);
      const m = 0.72 + 0.2 * syl + 0.1 * (jitter(b.x * 0.08 + t * 2.4, 2) - 0.5) + 0.35 * near;
      const len = Math.max(2, b.base * m);
      front.moveTo(b.x, horizon); front.lineTo(b.x, horizon - len);
      refl.moveTo(b.x, horizon + 3); refl.lineTo(b.x, horizon + 3 + len * 0.5);
    }
    ctx.strokeStyle = "#0b1822"; ctx.stroke(front);
    ctx.strokeStyle = "rgba(11,24,34,0.45)"; ctx.stroke(refl);

    // the content below rises out of the sea as a gentle swell
    ctx.beginPath(); ctx.moveTo(0, h);
    for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, h - 16 + Math.sin(x * 0.012 + t * 0.5) * 6 + Math.sin(x * 0.031 - t * 0.7) * 3);
    ctx.lineTo(w, h); ctx.closePath();
    ctx.fillStyle = cssVar("--paper"); ctx.fill();

    if (visible && !REDUCED) raf = requestAnimationFrame(frame);
  }

  build();
  frame(performance.now());

  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { build(); frame(performance.now()); }, 100); });
  window.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    pointerX = e.clientX - rect.left; pointerY = e.clientY - rect.top;
    pxTarget = e.clientX / window.innerWidth;
  }, { passive: true });
  canvas.parentElement.addEventListener("pointerleave", () => { pointerX = pointerY = -1e4; });
  window.addEventListener("scroll", () => { scrollY = window.scrollY; if (REDUCED) frame(performance.now()); }, { passive: true });
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible && !REDUCED) raf = requestAnimationFrame(frame);
  }).observe(canvas);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => frame(performance.now()));
})();
