# adriankieback.com

Personal site of Adrian Kieback. Plain HTML, CSS and JavaScript on GitHub Pages, with no build step.

The design idea: the page is a descent from mountain to sea. The home page opens on a dusk mountain range whose front ridge is a live speech waveform, mirrored in the ocean. A small altimeter on the right counts down from 4,200 m as you scroll, and every page ends in animated water. The tone of the content is professional; personal life is kept off the main pages.

## Pages

| Page | What it is |
| --- | --- |
| `index.html` | Home: hero, about, selected publications, current projects, news, and small Surf / Climb cards at the very bottom |
| `research.html` | All papers (filterable) and current projects |
| `paper.html?id=…` | One page per paper, generated from `data/papers.js` |
| `about.html` | Experience, education, skills, CV |
| `life.html` | Personal page (surf, climb, Yosemite print, photo wall). Not in the nav and not indexed by search engines; reached via the Surf / Climb cards at the bottom of the home page |
| `notebook.html` | Private, encrypted learning notebook (linked only from the footer lock icon) |

`Professional.html` and `Personal.html` redirect to the new pages so old links keep working.

## Updating content

All content lives in `data/`. Edit these files and push. That's it.

- **Add a paper:** copy an entry in `data/papers.js`. It automatically gets a card and its own page. Conference photos go in `images/papers/<id>/` and are listed under `photos`.
- **Home page "Current projects" and "News":** `data/site.js`.
- **Life photos:** put a photo in `images/life/` (about 1600 px wide, under 400 KB), then add an entry at the top of `moments` in `data/life.js`. The photo wall appears as soon as there is one entry. `covers` can replace the two illustrations with your own photos.

**The darkroom print** (life page) lays `data/yosemite.txt`, an ASCII rendering, exactly over `images/yosemite.jpg`. A lens follows the pointer and reveals the photo. To use another photo, swap both files: the ASCII must cover the same frame, and `data-cols` on the `<figure>` must match its width in characters.

To shrink a photo on macOS: `sips -Z 1600 -s formatOptions 78 in.jpg --out images/life/out.jpg`

## Your voice in the hero

The front ridge of the hero waveform can be driven by a real recording. Export a voice memo (drag it from Voice Memos onto the Desktop), then run:

```
python3 tools/voice.py ~/Desktop/recording.m4a
```

This writes only a loudness envelope (one value per 20 ms) to `data/voice.js`. The audio file itself is never added to the site, and the words can't be recovered from the envelope. Shorter is better: 5 to 15 seconds of natural speech loops nicely.

## The notebook

Notes are written as Markdown in `notebook-src/`. That folder is git-ignored, so the plain text never leaves your machine. Math works with `$inline$` and `$$display$$`.

```
---
title: Backpropagation, by hand
date: 2026-10-02
tags: calculus, deep learning
---
Your notes…
```

Build and publish:

```
python3 tools/notebook.py      # asks for your passphrase
git add data/notebook.json && git commit -m "notebook" && git push
```

The script encrypts all notes (AES-256 with PBKDF2, 250k iterations, using the `openssl` that ships with macOS) into `data/notebook.json`. The browser decrypts it only when you enter the passphrase. Images referenced with relative paths are embedded inside the encrypted file, so they stay private too.

The encrypted file is public, so use a long passphrase (at least 12 characters, ideally a few random words). If you forget it, the notes in `notebook-src/` are still on your machine. Rebuild with a new passphrase.

## Local preview

```
python3 -m http.server 8000
```

Then open http://localhost:8000. The notebook needs `http://localhost` or HTTPS, not `file://`.
