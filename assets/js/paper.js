(function () {
  "use strict";
  const { esc, authorsHtml } = window.AK;
  const papers = window.PAPERS || [];
  const id = new URLSearchParams(location.search).get("id");
  const idx = papers.findIndex((p) => p.id === id);
  const head = document.getElementById("paper-head");
  const body = document.getElementById("paper-body");
  const pager = document.getElementById("pager");

  if (idx < 0) {
    head.innerHTML = `<p class="eyebrow"><a href="research.html" style="text-decoration:none">← All research</a></p><h1>Off route.</h1><p class="lede">This paper doesn't exist (yet). Head back to the research page.</p>`;
    return;
  }

  const p = papers[idx];
  document.title = `${p.short || p.title} · Adrian Kieback`;
  document.querySelector('meta[name="description"]').setAttribute("content", p.tldr);

  const external = (url) => /^https?:/.test(url);
  const linkAttrs = (url) => (external(url) ? ' target="_blank" rel="noopener"' : ' target="_blank"');
  const primary = p.links.slice(0, 3);

  head.innerHTML = `
    <p class="eyebrow"><a href="research.html" style="text-decoration:none">← All research</a></p>
    <div class="venue">
      ${p.status ? `<span class="chip hot">${esc(p.status)}</span>` : ""}
      <span class="chip">${esc(p.venue)}</span>
      <span class="chip">${esc(p.date)}</span>
    </div>
    <h1>${esc(p.title)}</h1>
    <p class="authors">${authorsHtml(p)}</p>
    ${p.equal && p.equal.length ? `<p class="eq">* equal contribution</p>` : ""}
    <div class="paper-actions">
      ${primary.map((l, i) => `<a class="btn ${i === 0 ? "btn-glow" : "btn-ghost-light"}" href="${esc(l.url)}"${linkAttrs(l.url)}>${esc(l.label)} ↗</a>`).join("")}
    </div>`;

  const results = (p.results || []).length ? `
    <div class="results">
      ${p.results.map((r) => `
        <div class="result">
          <div class="r-label">${esc(r.label)}</div>
          <div class="r-val">${esc(r.value)}</div>
          <div class="r-base">${esc(r.baseline || "")}${r.lowerIsBetter ? " · lower is better" : ""}</div>
          ${r.pct != null ? `<div class="bar" aria-hidden="true"><i style="width:${Math.min(100, r.pct)}%"></i>${r.base != null ? `<u style="left:${Math.min(100, r.base)}%"></u>` : ""}</div>` : ""}
        </div>`).join("")}
    </div>
    ${p.results.some((r) => r.base != null) ? `<p class="mono muted" style="font-size:.75rem">Bar = this work · tick = baseline</p>` : ""}` : "";

  const video = p.video ? `
    <h2>See it in action</h2>
    <div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${esc(p.video)}" title="${esc(p.short)} demo video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>` : "";

  const photos = (p.photos || []).length ? `
    <h2>From the conference</h2>
    <div class="photo-strip">
      ${p.photos.map((ph) => `<figure><img src="${esc(ph.src)}" alt="${esc(ph.caption || "")}" loading="lazy"><figcaption>${esc(ph.caption || "")}</figcaption></figure>`).join("")}
    </div>` : "";

  body.innerHTML = `
    <article class="prose">
      <p class="tldr-box">${esc(p.tldr)}</p>
      ${p.body}
      ${results}
      ${video}
      ${photos}
    </article>
    <aside>
      <div class="side-card">
        <h4>Links</h4>
        <ul>${p.links.map((l) => `<li><a href="${esc(l.url)}"${linkAttrs(l.url)}>${esc(l.label)}</a></li>`).join("")}</ul>
      </div>
      ${p.bibtex ? `
      <div class="side-card bibtex">
        <h4>Cite</h4>
        <pre id="bib">${esc(p.bibtex)}</pre>
        <button type="button" id="copy-bib">copy</button>
      </div>` : ""}
      <div class="side-card">
        <h4>Topics</h4>
        <div>${(p.tags || []).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
      </div>
    </aside>`;

  const copy = document.getElementById("copy-bib");
  if (copy) copy.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(p.bibtex); copy.textContent = "copied ✓"; }
    catch { copy.textContent = "select & copy"; }
    setTimeout(() => (copy.textContent = "copy"), 1800);
  });

  const prev = papers[idx - 1], next = papers[idx + 1];
  pager.innerHTML = `
    <div>${prev ? `<a href="paper.html?id=${encodeURIComponent(prev.id)}"><span class="dir">← newer</span><span class="t">${esc(prev.short)}</span></a>` : ""}</div>
    <div class="next">${next ? `<a href="paper.html?id=${encodeURIComponent(next.id)}"><span class="dir">older →</span><span class="t">${esc(next.short)}</span></a>` : ""}</div>`;
})();
