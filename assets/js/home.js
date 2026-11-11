(function () {
  "use strict";
  const { esc, paperCard, SCENES } = window.AK;

  document.getElementById("paper-list").innerHTML = (window.PAPERS || []).map(paperCard).join("");

  document.getElementById("now-grid").innerHTML = (window.SITE?.now || []).map((n) => `
    <article class="now-card reveal">
      <div class="status">in progress</div>
      <h3>${esc(n.title)}</h3>
      <p>${esc(n.text)}</p>
      <div class="with">${esc(n.with)}</div>
    </article>`).join("");

  document.getElementById("log-list").innerHTML = (window.SITE?.log || []).map((l) => {
    const inner = `<span class="when">${esc(l.when)}</span><span class="what">${esc(l.what)}<small>${esc(l.note)}</small></span><span class="where">${esc(l.where)}</span>`;
    return `<li>${l.href ? `<a href="${esc(l.href)}" style="display:contents">${inner}</a>` : inner}</li>`;
  }).join("");

  const covers = window.LIFE?.covers || {};
  document.querySelectorAll(".chapter[data-scene]").forEach((el) => {
    const k = el.dataset.scene;
    el.insertAdjacentHTML("afterbegin", covers[k] ? `<img class="scene" src="${esc(covers[k])}" alt="" loading="lazy">` : SCENES[k]);
  });
})();
