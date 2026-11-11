/* ==========================================================================
   Hero landscape: dusk sky, two hazy ridges, and a front ridge drawn as a
   speech waveform that "talks", mirrored in the ocean below the horizon.

   Everything static is painted once into the background canvas. Only the
   band around the horizon (waveform, reflections, shimmer, bottom swell)
   lives on a second, smaller canvas that animates.
   ========================================================================== */
(function () {
  "use strict";
  const bg = document.querySelector(".hero canvas");
  if (!bg || !window.AK) return;
  const { makeNoise, rng, fitCanvas, REDUCED, cssVar } = window.AK;
  const hero = bg.parentElement;

  const fx = document.createElement("canvas");
  fx.className = "hero-fx";
  fx.setAttribute("aria-hidden", "true");
  bg.after(fx);

  // A recorded voice (data/voice.js, from tools/voice.py) drives the waveform when present.
  // The envelope loops with a short pause, scrolling right to left like a live recorder.
  const VOICE = window.VOICE && window.VOICE.env && window.VOICE.env.length > 10 ? window.VOICE : null;
  let voiceEnv = null;
  if (VOICE) {
    const pause = new Array(Math.round(VOICE.fps * 0.9)).fill(0);
    voiceEnv = Float32Array.from(VOICE.env.concat(pause), (v) => Math.pow(v / 100, 1.4));
  }
  const SAMPLES_PER_BAR = 2;
  const voiceAt = (pos) => {
    const n = voiceEnv.length;
    const i = Math.floor(pos), f = pos - i;
    const a = voiceEnv[((i % n) + n) % n], b = voiceEnv[(((i + 1) % n) + n) % n];
    return a + (b - a) * f;
  };

  const noise = makeNoise(7);
  const jitter = makeNoise(99);
  let w, h, horizon, band, fctx, fw, fh, bars = [], step = 7, paper = "";
  let raf = 0, visible = true, pointerX = -1e4, pointerY = -1e4;
  const t0 = performance.now();

  const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  // mountains rise toward the right on wide screens so the text has open sky
  const rise = (x) => (w > 760 ? 0.25 + 0.75 * smooth(0.05 * w, 0.75 * w, x) : 0.75);

  function ridge(ctx, amp, scale, offset, fill, reflectAlpha) {
    const pts = [];
    for (let x = 0; x <= w + 4; x += 4) pts.push([x, horizon - Math.pow(noise((x + offset) / scale), 1.7) * amp * rise(x)]);
    ctx.beginPath(); ctx.moveTo(0, horizon);
    pts.forEach(([a, b]) => ctx.lineTo(a, b));
    ctx.lineTo(w, horizon); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.save(); ctx.globalAlpha = reflectAlpha;
    ctx.beginPath(); ctx.moveTo(0, horizon);
    pts.forEach(([a, b]) => ctx.lineTo(a, horizon + (horizon - b) * 0.55));
    ctx.lineTo(w, horizon); ctx.closePath();
    ctx.fill(); ctx.restore();
  }

  function build() {
    const b = fitCanvas(bg);
    const ctx = b.ctx; w = b.w; h = b.h;
    horizon = Math.round(h * (w > 760 ? 0.76 : 0.8));
    paper = cssVar("--paper");

    const g = ctx.createLinearGradient(0, 0, 0, horizon);
    g.addColorStop(0, "#0a1620"); g.addColorStop(0.45, "#152c45"); g.addColorStop(0.78, "#4a4560"); g.addColorStop(1, "#c9775a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, horizon);
    const sunX = w > 760 ? w * 0.7 : w * 0.62, sunY = horizon - h * 0.11;
    const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(w, h) * 0.45);
    glow.addColorStop(0, "rgba(246,190,140,0.45)"); glow.addColorStop(0.35, "rgba(214,120,90,0.14)"); glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(250,214,180,0.9)";
    ctx.beginPath(); ctx.arc(sunX, sunY, Math.max(14, Math.min(w, h) * 0.035), 0, Math.PI * 2); ctx.fill();
    const r = rng(3);
    for (let i = 0; i < w / 6; i++) {
      const sx = r() * w, sy = Math.pow(r(), 1.6) * horizon * 0.6, s = r();
      ctx.fillStyle = `rgba(241,235,224,${0.12 + s * 0.55})`;
      ctx.fillRect(sx, sy, s > 0.93 ? 2 : 1, s > 0.93 ? 2 : 1);
    }
    const water = ctx.createLinearGradient(0, horizon, 0, h);
    water.addColorStop(0, "#5b4c5e"); water.addColorStop(0.18, "#1d3346"); water.addColorStop(1, "#0a1620");
    ctx.fillStyle = water; ctx.fillRect(0, horizon, w, h - horizon);
    const gr = rng(11);
    for (let y = horizon + 4; y < h; y += 3) {
      const p = (y - horizon) / (h - horizon), half = w * (0.015 + 0.06 * p);
      ctx.fillStyle = `rgba(250,205,165,${0.42 * (1 - p) * (1 - p)})`;
      for (let k = 0; k < 4; k++) {
        const cx = sunX + (gr() * 2 - 1) * half, len = 4 + gr() * half * 0.5;
        ctx.fillRect(cx - len / 2, y, len, 1.2);
      }
    }
    const amp = h * (w > 760 ? 0.42 : 0.3);
    ridge(ctx, amp, 620, 0, "#5a6383", 0.22);
    ridge(ctx, amp * 0.78, 400, 1700, "#27384f", 0.35);

    step = w > 760 ? 7 : 6;
    bars = [];
    let maxBar = 0;
    for (let x = step / 2; x < w; x += step) {
      const base = Math.pow(noise((x + 5300) / 260), 1.5) * amp * 0.6 * rise(x) + 6;
      bars.push({ x, base });
      maxBar = Math.max(maxBar, base);
    }
    // the animated band: tallest possible bar above the horizon down to the bottom
    band = Math.max(0, Math.floor(horizon - maxBar * 1.4 - 6));
    fx.style.height = `${h - band}px`;
    ({ ctx: fctx, w: fw, h: fh } = fitCanvas(fx));
  }

  function frame(now) {
    raf = 0;
    // with reduced motion, show a still frame from the middle of the recording
    const t = REDUCED ? (VOICE ? (voiceEnv.length / VOICE.fps) * 0.6 : 0) : (now - t0) / 1000;
    const hz = horizon - band, bottom = fh;
    fctx.clearRect(0, 0, fw, fh);

    fctx.strokeStyle = "rgba(241,226,210,0.10)"; fctx.lineWidth = 1;
    fctx.beginPath();
    for (let row = 0; row < 14; row++) {
      const y = hz + 8 + Math.pow(row / 14, 1.4) * (bottom - hz - 20);
      for (let x = (row * 37) % 80 - 80; x < fw; x += 80 + row * 6) {
        const off = Math.sin(t * 0.6 + row + x * 0.01) * 14;
        fctx.moveTo(x + off, y); fctx.lineTo(x + off + 22 + row * 2, y);
      }
    }
    fctx.stroke();

    fctx.lineCap = "round"; fctx.lineWidth = step * 0.55;
    const front = new Path2D(), refl = new Path2D();
    const py = pointerY - band;
    const head = t * (VOICE ? VOICE.fps : 0) - bars.length * SAMPLES_PER_BAR;
    for (let k = 0; k < bars.length; k++) {
      const b = bars[k];
      const dx = (b.x - pointerX) / 110;
      const near = dx * dx < 9 ? Math.exp(-dx * dx) * (py < hz + 60 ? 1 : 0.4) : 0;
      let m;
      if (voiceEnv) {
        const pos = head + k * SAMPLES_PER_BAR;
        const v = Math.max(voiceAt(pos), voiceAt(pos + 1));
        m = 0.38 + 0.72 * v + 0.3 * near;
      } else {
        const syl = 0.5 + 0.5 * Math.sin(b.x * 0.05 - t * 3.2) * (0.6 + 0.4 * Math.sin(b.x * 0.012 + t * 0.8));
        m = 0.72 + 0.2 * syl + 0.1 * (jitter(b.x * 0.08 + t * 2.4, 2) - 0.5) + 0.35 * near;
      }
      const len = Math.max(2, b.base * m);
      front.moveTo(b.x, hz); front.lineTo(b.x, hz - len);
      refl.moveTo(b.x, hz + 3); refl.lineTo(b.x, hz + 3 + len * 0.5);
    }
    fctx.strokeStyle = "#0b1822"; fctx.stroke(front);
    fctx.strokeStyle = "rgba(11,24,34,0.45)"; fctx.stroke(refl);

    fctx.beginPath(); fctx.moveTo(0, bottom);
    for (let x = 0; x <= fw + 8; x += 8) fctx.lineTo(x, bottom - 16 + Math.sin(x * 0.012 + t * 0.5) * 6 + Math.sin(x * 0.031 - t * 0.7) * 3);
    fctx.lineTo(fw, bottom); fctx.closePath();
    fctx.fillStyle = paper; fctx.fill();

    if (visible && !REDUCED && !document.hidden) raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf) raf = requestAnimationFrame(frame); };

  build();
  frame(performance.now());

  let rt, lastW = window.innerWidth;
  window.addEventListener("resize", () => {
    // mobile browsers fire resize when the URL bar hides; only rebuild on real width changes
    if (window.innerWidth === lastW && Math.abs(hero.clientHeight - h) < 120) return;
    lastW = window.innerWidth;
    clearTimeout(rt); rt = setTimeout(() => { build(); frame(performance.now()); }, 150);
  });
  window.addEventListener("pointermove", (e) => {
    if (!visible) return;
    const rect = bg.getBoundingClientRect();
    pointerX = e.clientX - rect.left; pointerY = e.clientY - rect.top;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { pointerX = pointerY = -1e4; });
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !REDUCED) start(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }).observe(hero);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && visible && !REDUCED) start(); });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { paper = cssVar("--paper"); frame(performance.now()); });
})();
