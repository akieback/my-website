(function () {
  "use strict";
  const { esc, paperCard, SCENES, REDUCED } = window.AK;

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

  const words = ["pretraining speech encoders", "checking the swell forecast", "reading a new paper", "projecting a boulder problem", "debugging a dataloader", "waiting for a GPU", "waxing a board"];
  const el = document.getElementById("ticker");
  if (!el || REDUCED) return;
  let i = 0;
  setInterval(() => {
    i = (i + 1) % words.length;
    const target = words[i];
    let n = el.textContent.length;
    const erase = setInterval(() => {
      el.textContent = el.textContent.slice(0, --n);
      if (n <= 0) {
        clearInterval(erase);
        let k = 0;
        const type = setInterval(() => {
          el.textContent = target.slice(0, ++k);
          if (k >= target.length) clearInterval(type);
        }, 45);
      }
    }, 22);
  }, 3600);
})();
