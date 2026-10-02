(function () {
  "use strict";
  const { esc, SCENES } = window.AK;
  const life = window.LIFE || { covers: {}, moments: [] };

  document.querySelectorAll(".chapter[data-scene]").forEach((el) => {
    const k = el.dataset.scene, cover = life.covers?.[k];
    el.insertAdjacentHTML("afterbegin", cover ? `<img class="scene" src="${esc(cover)}" alt="" loading="lazy">` : SCENES[k]);
  });

  const moments = life.moments || [];
  if (!moments.length) return;

  const section = document.getElementById("moments-section");
  const grid = document.getElementById("moments");
  const filters = document.getElementById("moment-filters");
  section.hidden = false;

  const labels = { all: "all", ocean: "ocean", mountains: "mountains", elsewhere: "elsewhere" };
  const kinds = ["all", ...Object.keys(labels).filter((k) => k !== "all" && moments.some((m) => m.kind === k))];

  function render(kind, instant) {
    grid.innerHTML = moments.filter((m) => kind === "all" || m.kind === kind).map((m) => `
      <figure class="moment reveal${instant ? " in" : ""}">
        ${m.image ? `<img src="${esc(m.image)}" alt="${esc(m.title)}" loading="lazy">` : ""}
        <figcaption>
          <p class="m-title">${esc(m.title)}</p>
          <span class="m-meta">${[m.place, m.date].filter(Boolean).map(esc).join(" · ")}</span>
          ${m.text ? `<p class="m-text">${esc(m.text)}</p>` : ""}
        </figcaption>
      </figure>`).join("");
    filters.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === kind)));
  }

  if (kinds.length > 2) {
    filters.innerHTML = kinds.map((k) => `<button type="button" data-k="${k}">${labels[k]}</button>`).join("");
    filters.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) render(b.dataset.k, true); });
  }
  render("all", false);
})();
