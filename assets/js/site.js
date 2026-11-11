/* ==========================================================================
   Shared site chrome: nav, footer, altimeter, reveal, landscape drawing.
   Each page sets <body data-page="home|research|about|life|notebook">.
   ========================================================================== */
(function () {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SUMMIT_M = 4200;

  /* ---------- tiny helpers ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  function hashStr(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function makeNoise(seed) {
    const r = rng(seed);
    const v = Array.from({ length: 1024 }, r);
    const n = (x) => {
      const i = Math.floor(x), f = x - i, t = f * f * (3 - 2 * f);
      const a = v[((i % 1024) + 1024) % 1024], b = v[(((i + 1) % 1024) + 1024) % 1024];
      return a + (b - a) * t;
    };
    return (x, oct = 5) => {
      let sum = 0, amp = 0.5, freq = 1, norm = 0;
      for (let o = 0; o < oct; o++) {
        const ridged = 1 - Math.abs(2 * n(x * freq + o * 31.7) - 1);
        sum += ridged * amp; norm += amp; amp *= 0.5; freq *= 2.03;
      }
      return sum / norm;
    };
  }
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function fitCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  /* Draws a filled mountain ridge between x=0..w. base = y of the valley floor,
     amp = max peak height, scale = horizontal feature size in px. */
  function ridgePath(ctx, noise, w, h, base, amp, scale, offset) {
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w + 4; x += 4) {
      const y = base - Math.pow(noise((x + offset) / scale), 1.6) * amp;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
  }

  function drawStars(ctx, w, h, seed, count) {
    const r = rng(seed);
    for (let i = 0; i < count; i++) {
      const x = r() * w, y = r() * h, s = r();
      ctx.fillStyle = `rgba(241,235,224,${0.15 + s * 0.5})`;
      ctx.fillRect(x, y, s > 0.92 ? 2 : 1, s > 0.92 ? 2 : 1);
    }
  }

  /* ---------- page header landscape (static) ---------- */
  function drawPageHead(canvas) {
    const { ctx, w, h } = fitCanvas(canvas);
    const seed = hashStr(document.body.dataset.page || "x");
    const noise = makeNoise(seed);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0c1922"); g.addColorStop(0.65, "#17304a"); g.addColorStop(1, "#3d4a63");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    drawStars(ctx, w, h * 0.6, seed, Math.round(w / 9));
    const layers = [
      { base: 0.9, amp: 0.3, scale: 520, color: "rgba(120,140,170,0.18)" },
      { base: 0.95, amp: 0.24, scale: 380, color: "rgba(60,82,108,0.5)" },
      { base: 0.99, amp: 0.17, scale: 260, color: "rgba(22,40,56,0.9)" }
    ];
    layers.forEach((l, i) => {
      ridgePath(ctx, noise, w, h, h * l.base, h * l.amp, l.scale, i * 997);
      ctx.fillStyle = l.color; ctx.fill();
    });
    ridgePath(ctx, noise, w, h, h + 2, Math.min(56, h * 0.1), 200, 4242);
    ctx.fillStyle = cssVar("--paper"); ctx.fill();
  }

  /* ---------- footer ocean (animated when visible) ---------- */
  function startOcean(canvas) {
    let ctx, w, h, raf = 0, visible = false, t0 = performance.now();
    let paper = cssVar("--paper");
    const resize = () => ({ ctx, w, h } = fitCanvas(canvas));
    resize();
    const SHORE = 88;
    const swell = (x, t) => SHORE + Math.sin(x * 0.009 + t * 0.35) * 12 + Math.sin(x * 0.021 - t * 0.6) * 5;
    const layers = [
      { dy: 26, a: 9, k: 0.016, s: -0.5, c: "rgba(143,193,196,0.16)" },
      { dy: 52, a: 7, k: 0.023, s: 0.7, c: "rgba(29,90,110,0.40)" },
      { dy: 84, a: 6, k: 0.031, s: -0.9, c: "rgba(16,48,64,0.55)" }
    ];
    // only the band where the water moves is repainted; the deep water below is drawn once
    const BAND = 220;
    let full = true;
    function frame(now) {
      raf = 0;
      const t = (now - t0) / 1000;
      ctx.save();
      if (!full) { ctx.beginPath(); ctx.rect(0, 0, w, BAND); ctx.clip(); }
      full = false;
      ctx.fillStyle = "#0c1922"; ctx.fillRect(0, 0, w, h);
      layers.forEach((l, i) => {
        ctx.beginPath(); ctx.moveTo(0, h);
        for (let x = 0; x <= w + 6; x += 6) {
          ctx.lineTo(x, SHORE + l.dy + Math.sin(x * l.k + t * l.s + i) * l.a + Math.sin(x * l.k * 1.7 - t * l.s * 0.8) * l.a * 0.5);
        }
        ctx.lineTo(w, h); ctx.closePath();
        ctx.fillStyle = l.c; ctx.fill();
      });
      // the page above meets the sea along a moving swell line
      ctx.beginPath(); ctx.moveTo(0, 0);
      for (let x = 0; x <= w + 6; x += 6) ctx.lineTo(x, swell(x, t));
      ctx.lineTo(w, 0); ctx.closePath();
      ctx.fillStyle = paper; ctx.fill();
      ctx.beginPath();
      for (let x = 0; x <= w + 6; x += 6) x === 0 ? ctx.moveTo(x, swell(x, t) + 3) : ctx.lineTo(x, swell(x, t) + 3);
      ctx.strokeStyle = "rgba(241,235,224,0.45)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();
      if (visible && !REDUCED && !document.hidden) raf = requestAnimationFrame(frame);
    }
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (visible) raf = requestAnimationFrame(frame);
    }).observe(canvas);
    let lastW = window.innerWidth;
    window.addEventListener("resize", () => { if (window.innerWidth === lastW) return; lastW = window.innerWidth; resize(); full = true; frame(performance.now()); });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { paper = cssVar("--paper"); full = true; frame(performance.now()); });
    document.addEventListener("visibilitychange", () => { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(frame); });
    frame(performance.now());

  }

  /* ---------- brand mark ---------- */
  const MARK = `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".55"/><path d="M5.5 19.5 11.5 11l3.2 4.3L19.2 8l7.3 11.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/><path d="M7 23.6c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" fill="none" stroke="#e0784e" stroke-width="1.7" stroke-linecap="round"/></svg>`;

  const ICONS = {
    mail: `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" d="M3 6h18v12H3z M3 7l9 6 9-6"/></svg>`,
    github: `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.27 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>`,
    linkedin: `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3zM9.5 9.75h3.83v1.54h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13V21h-4v-5.02c0-1.2-.02-2.74-1.67-2.74-1.67 0-1.93 1.3-1.93 2.65V21h-4z"/></svg>`,
    lock: `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
    cv: `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/></svg>`
  };

  const NAV = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "research", label: "Research", href: "research.html" },
    { id: "about", label: "About", href: "about.html" }
  ];

  function buildChrome() {
    const page = document.body.dataset.page;
    const nav = document.createElement("header");
    nav.className = "site-nav";
    nav.innerHTML = `
      <div class="wrap">
        <a class="brand" href="index.html" aria-label="Adrian Kieback, home">${MARK}<span>Adrian Kieback</span></a>
        <button class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links"><span></span><span></span><span></span></button>
        <nav aria-label="Main">
          <ul class="nav-links" id="nav-links">
            ${NAV.map((n) => `<li><a href="${n.href}"${(n.id === page || (page === "paper" && n.id === "research")) ? ' aria-current="page"' : ""}>${n.label}</a></li>`).join("")}
            <li><a class="nav-cv" href="files/Adrian_Kieback_CV.pdf" target="_blank" rel="noopener">CV ↓</a></li>
          </ul>
        </nav>
      </div>`;
    document.body.prepend(nav);

    const skip = document.createElement("a");
    skip.className = "skip-link"; skip.href = "#main"; skip.textContent = "Skip to content";
    document.body.prepend(skip);

    const foot = document.createElement("footer");
    foot.className = "site-footer";
    foot.innerHTML = `
      <canvas aria-hidden="true"></canvas>
      <div class="wrap">
        <h2>Get in <em>touch.</em></h2>
        <p class="lede">Open to research collaborations and conversations about speech, self-supervised learning and machine learning for health.</p>
        <div class="foot-links">
          <a class="btn btn-glow" href="mailto:Adrian.Kieback@gmail.com">${ICONS.mail} Adrian.Kieback@gmail.com</a>
          <a class="btn btn-ghost-light" href="https://github.com/akieback" target="_blank" rel="noopener">${ICONS.github} GitHub</a>
          <a class="btn btn-ghost-light" href="https://www.linkedin.com/in/adrian-kieback" target="_blank" rel="noopener">${ICONS.linkedin} LinkedIn</a>
        </div>
        <div class="foot-bottom">
          <span>© ${new Date().getFullYear()} Adrian Kieback</span>
          <a href="notebook.html" title="Private notebook">${ICONS.lock} notebook</a>
        </div>
      </div>`;
    document.body.append(foot);

    const alt = document.createElement("div");
    alt.className = "altimeter"; alt.setAttribute("aria-hidden", "true");
    alt.innerHTML = `<span class="cap top">▲ summit</span><div class="track"></div><div class="marker"><b>4 200 m</b><i></i></div><span class="cap bottom">≈ sea</span>`;
    document.body.append(alt);

    return { nav, foot, alt };
  }

  function wireNav(nav) {
    const toggle = nav.querySelector(".nav-toggle");
    const setOpen = (open) => {
      nav.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("nav-open")));
    nav.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

    const dark = document.querySelector(".hero, .page-head");
    let lastY = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      const navH = nav.offsetHeight;
      const overDark = dark && y < dark.offsetHeight - navH;
      nav.classList.toggle("over-hero", !!overDark);
      nav.classList.toggle("scrolled", !overDark && y > 4);
      const goingDown = y > lastY + 4, goingUp = y < lastY - 4;
      if (!nav.classList.contains("nav-open")) {
        if (goingDown && y > 240) nav.classList.add("hidden");
        else if (goingUp || y < 240) nav.classList.remove("hidden");
      }
      if (goingDown || goingUp) lastY = y;
    };
    update();
    return update;
  }

  function wireAltimeter(alt) {
    const marker = alt.querySelector(".marker");
    const label = marker.querySelector("b");
    let lastLabel = "";
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      marker.style.transform = `translateY(${(p * alt.clientHeight).toFixed(1)}px) translateY(-50%)`;
      const m = Math.round((SUMMIT_M * (1 - p)) / 10) * 10;
      const text = m === 0 ? "0 m" : `${m.toLocaleString("en-US").replace(",", " ")} m`;
      if (text !== lastLabel) { label.textContent = text; lastLabel = text; }
      const mid = window.innerHeight / 2;
      const onDark = darks.some((el) => { const b = el.getBoundingClientRect(); return b.top < mid && b.bottom > mid; });
      if (onDark !== wasDark) { alt.classList.toggle("on-dark", onDark); wasDark = onDark; }
    };
    const darks = [...document.querySelectorAll(".hero, .page-head, .site-footer")];
    let wasDark = null;
    if (getComputedStyle(alt).display === "none") return () => {};
    update();
    return update;
  }

  function wireReveal() {
    let pending = [...document.querySelectorAll(".reveal:not(.in)")];
    const check = () => {
      const limit = window.innerHeight * 0.92;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top < limit) { el.classList.add("in"); return false; }
        return true;
      });
    };
    check();
    return () => { if (pending.length) check(); };
  }

  /* ---------- shared renderers ---------- */
  function authorsHtml(p) {
    return p.authors.map((a) => {
      const star = (p.equal || []).includes(a) ? "*" : "";
      return a === "Adrian Kieback" ? `<span class="me">${esc(a)}${star}</span>` : esc(a) + star;
    }).join(", ");
  }

  function waveSvg(seed, w = 400, h = 60) {
    const r = rng(hashStr(seed));
    let d = "";
    const bars = 64, bw = w / bars;
    for (let i = 0; i < bars; i++) {
      const env = Math.sin((i / bars) * Math.PI) * 0.8 + 0.2;
      const a = (0.25 + r() * 0.75) * env * (h / 2 - 2);
      const x = (i * bw + bw / 2).toFixed(1);
      d += `M${x} ${(h / 2 - a).toFixed(1)}V${(h / 2 + a).toFixed(1)}`;
    }
    return `<svg class="wave-bg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" stroke="currentColor" stroke-width="${(bw * 0.5).toFixed(1)}" stroke-linecap="round"/></svg>`;
  }

  function paperCard(p) {
    const status = p.status ? `<span class="chip hot">${esc(p.status)}</span>` : "";
    return `
      <a class="paper-card reveal" href="paper.html?id=${encodeURIComponent(p.id)}">
        <div class="meta"><span class="year">${p.year}</span>${esc(p.venue)}</div>
        <div>
          <div>${status}${(p.tags || []).slice(0, 2).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
          <h3>${esc(p.title)}</h3>
          <p class="authors">${authorsHtml(p)}</p>
          <p class="tldr">${esc(p.tldr)}</p>
        </div>
        <span class="go" aria-hidden="true">→</span>
        ${waveSvg(p.id)}
      </a>`;
  }

  const SCENES = {
    ocean: `<svg class="scene" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="sk-o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#132b40"/><stop offset=".55" stop-color="#b8694f"/><stop offset=".62" stop-color="#eaa47c"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#sk-o)"/>
      <circle cx="292" cy="150" r="24" fill="#fbd9b5" opacity=".92"/>
      <path d="M0 162C60 152 110 170 170 161S280 150 400 163V300H0Z" fill="#2c5468"/>
      <path d="M0 190C70 177 130 199 205 189S330 178 400 193V300H0Z" fill="#1b4053"/>
      <path d="M0 236C70 236 112 160 205 152c52-4 82 30 64 52-13 15-36 4-28-10-38-2-60 50 159 44V300H0Z" fill="#0f2c3a"/>
      <path d="M0 262c40-6 80 6 120 0s80-6 120 0 80 6 160-2" fill="none" stroke="#8fc1c4" stroke-width="1.5" opacity=".5"/>
    </svg>`,
    mountains: `<svg class="scene" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="sk-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e2131"/><stop offset=".55" stop-color="#3a5370"/><stop offset=".8" stop-color="#d98d68"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#sk-m)"/>
      <g fill="#f1ebe0" opacity=".7"><circle cx="40" cy="30" r="1"/><circle cx="120" cy="52" r="1.2"/><circle cx="330" cy="40" r="1"/><circle cx="270" cy="22" r="1.3"/><circle cx="370" cy="70" r="1"/></g>
      <path d="M0 210 60 150l40 30 70-85 60 65 50-40 60 50 60-30V300H0Z" fill="#53668a" opacity=".7"/>
      <path d="M0 262 90 190l50 25 80-135 80 120 50-25 50 45V300H0Z" fill="#192b3b"/>
      <path d="M220 80l20 30-8-4-6 8-10-10-8 8-6-2Z" fill="#f1ebe0" opacity=".92"/>
      <path d="M150 268c22-24 8-40 34-62s14-44 26-64 4-38 10-58" fill="none" stroke="#f3b58f" stroke-width="2" stroke-dasharray="1 6" stroke-linecap="round"/>
      <path d="M220 82V64l11 4-11 4" fill="#f3b58f" stroke="#f3b58f" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`
  };

  window.AK = { SCENES, esc, rng, hashStr, makeNoise, fitCanvas, ridgePath, drawStars, cssVar, authorsHtml, paperCard, waveSvg, ICONS, REDUCED, wireReveal };

  /* ---------- boot ---------- */
  function boot() {
    const { nav, foot, alt } = buildChrome();
    const onScroll = [wireNav(nav), wireAltimeter(alt)];
    startOcean(foot.querySelector("canvas"));

    const head = document.querySelector(".page-head canvas");
    if (head) {
      drawPageHead(head);
      let t;
      window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => drawPageHead(head), 120); });
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => drawPageHead(head));
    }
    onScroll.push(wireReveal());
    let ticking = false;
    const tick = () => { ticking = false; onScroll.forEach((f) => f()); };
    const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  }

  // All scripts are deferred: page scripts render their content first, then this runs.
  if (document.readyState === "complete") boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
