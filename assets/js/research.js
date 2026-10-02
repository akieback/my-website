(function () {
  "use strict";
  const { esc, paperCard } = window.AK;
  const papers = window.PAPERS || [];
  const list = document.getElementById("paper-list");
  const filters = document.getElementById("tag-filters");

  const topics = ["all", "speech", "self-supervised learning", "mental health", "music"];
  const has = (p, t) => t === "all" || (p.tags || []).includes(t) || (t === "music" && /music/i.test(p.venue + p.tags));

  function render(topic, instant) {
    list.innerHTML = papers.filter((p) => has(p, topic)).map(paperCard).join("");
    if (instant) list.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
    filters.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.t === topic)));
  }

  filters.innerHTML = topics.filter((t) => papers.some((p) => has(p, t))).map((t) => `<button type="button" data-t="${esc(t)}">${esc(t)}</button>`).join("");
  filters.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) render(b.dataset.t, true); });
  render("all", false);

  document.getElementById("now-grid").innerHTML = (window.SITE?.now || []).map((n) => `
    <article class="now-card reveal">
      <div class="status">in progress</div>
      <h3>${esc(n.title)}</h3>
      <p>${esc(n.text)}</p>
      <div class="with">${esc(n.with)}</div>
    </article>`).join("");
})();
