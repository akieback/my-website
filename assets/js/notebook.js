/* ==========================================================================
   Notebook: decrypts data/notebook.json (built by tools/notebook.py) in the
   browser. Format is OpenSSL "Salted__" AES-256-CBC with PBKDF2-SHA256,
   key and IV derived together (48 bytes), exactly like
   `openssl enc -aes-256-cbc -pbkdf2 -md sha256 -iter N`.
   ========================================================================== */
(function () {
  "use strict";
  const { esc } = window.AK;
  const MAGIC = "akn1";
  const KEY = "ak-notebook-pass";

  const $ = (id) => document.getElementById(id);
  const lock = $("lock"), nb = $("nb"), err = $("err"), form = $("unlock"), input = $("pass");
  let notes = [];

  async function decrypt(blob, pass) {
    const raw = Uint8Array.from(atob(blob.data), (c) => c.charCodeAt(0));
    if (new TextDecoder().decode(raw.slice(0, 8)) !== "Salted__") throw new Error("format");
    const salt = raw.slice(8, 16), ct = raw.slice(16);
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveBits"]);
    const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: blob.iter, hash: "SHA-256" }, base, 384));
    const key = await crypto.subtle.importKey("raw", bits.slice(0, 32), "AES-CBC", false, ["decrypt"]);
    const plain = await crypto.subtle.decrypt({ name: "AES-CBC", iv: bits.slice(32, 48) }, key, ct);
    const data = JSON.parse(new TextDecoder().decode(plain));
    if (data.magic !== MAGIC) throw new Error("magic");
    return data.notes;
  }

  /* Markdown with $inline$ and $$display$$ math, leaving code untouched. */
  function renderMarkdown(md) {
    const math = [];
    const stash = (tex, display) => `@@MATH${math.push({ tex, display }) - 1}@@`;
    const parts = md.split(/(```[\s\S]*?```|`[^`\n]*`)/);
    for (let i = 0; i < parts.length; i += 2) {
      parts[i] = parts[i]
        .replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => stash(t, true))
        .replace(/\\\[([\s\S]+?)\\\]/g, (_, t) => stash(t, true))
        .replace(/\$(?=\S)([^$\n]+?)(?<=\S)\$/g, (_, t) => stash(t, false));
    }
    let html = window.marked ? window.marked.parse(parts.join("")) : `<pre>${esc(md)}</pre>`;
    return html.replace(/@@MATH(\d+)@@/g, (_, n) => {
      const m = math[+n];
      if (!window.katex) return esc(m.tex);
      try { return window.katex.renderToString(m.tex, { displayMode: m.display, throwOnError: false }); }
      catch { return esc(m.tex); }
    });
  }

  function fmtDate(d) {
    const dt = new Date(d + "T12:00:00");
    return isNaN(dt) ? d : dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function renderList(filter = "") {
    const q = filter.trim().toLowerCase();
    const shown = notes.filter((n) => !q || (n.title + " " + (n.tags || []).join(" ") + " " + n.md).toLowerCase().includes(q));
    const current = decodeURIComponent(location.hash.slice(1));
    $("nb-list").innerHTML = shown.length ? shown.map((n) => `
      <li><button type="button" data-slug="${esc(n.slug)}" aria-current="${n.slug === current}">
        <span class="t">${esc(n.title)}</span><span class="d">${esc(fmtDate(n.date))}</span>
      </button></li>`).join("") : `<li class="muted mono" style="font-size:.8rem;padding:10px 12px">nothing matches</li>`;
  }

  function show(slug) {
    const n = notes.find((x) => x.slug === slug) || notes[0];
    if (!n) { $("nb-article").innerHTML = `<p class="empty-note">No notes yet. Add a markdown file to notebook-src/ and run tools/notebook.py.</p>`; return; }
    if (location.hash.slice(1) !== n.slug) history.replaceState(null, "", "#" + encodeURIComponent(n.slug));
    $("nb-article").innerHTML = `
      <p class="eyebrow">${esc(fmtDate(n.date))}</p>
      <h1>${esc(n.title)}</h1>
      <div class="nb-tags">${(n.tags || []).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
      ${renderMarkdown(n.md)}`;
    renderList($("nb-search").value);
  }

  async function unlock(pass, quiet) {
    err.textContent = quiet ? "" : "unlocking…";
    let blob;
    try {
      const res = await fetch("data/notebook.json", { cache: "no-store" });
      if (!res.ok) throw new Error("missing");
      blob = await res.json();
    } catch {
      err.textContent = "No notebook published yet. Run tools/notebook.py to build it.";
      return;
    }
    try {
      notes = await decrypt(blob, pass);
    } catch {
      if (!quiet) { err.textContent = "Wrong passphrase."; form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake"); input.select(); }
      else err.textContent = "";
      try { sessionStorage.removeItem(KEY); } catch {}
      return;
    }
    try { sessionStorage.setItem(KEY, pass); } catch {}
    lock.hidden = true; nb.hidden = false; err.textContent = "";
    show(decodeURIComponent(location.hash.slice(1)));
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); unlock(input.value); });
  $("nb-list").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-slug]");
    if (b) { show(b.dataset.slug); window.scrollTo({ top: $("nb").offsetTop - 90, behavior: "smooth" }); }
  });
  $("nb-search").addEventListener("input", (e) => renderList(e.target.value));
  $("lock-again").addEventListener("click", () => {
    try { sessionStorage.removeItem(KEY); } catch {}
    notes = []; $("nb-article").innerHTML = ""; nb.hidden = true; lock.hidden = false; input.value = "";
    history.replaceState(null, "", location.pathname);
  });
  window.addEventListener("hashchange", () => { if (notes.length) show(decodeURIComponent(location.hash.slice(1))); });

  if (!window.crypto?.subtle) {
    err.textContent = "This browser can't decrypt here (needs HTTPS or localhost).";
    return;
  }
  let saved = null;
  try { saved = sessionStorage.getItem(KEY); } catch {}
  if (saved) {
    // libraries are deferred too; wait for them before rendering
    window.addEventListener("load", () => unlock(saved, true));
  }
})();
