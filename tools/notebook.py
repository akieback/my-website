#!/usr/bin/env python3
"""Build the encrypted notebook.

Reads every Markdown file in notebook-src/ (which is git-ignored, so the plain
text never reaches GitHub), encrypts them with your passphrase and writes
data/notebook.json, which notebook.html decrypts in the browser.

Each note starts with a small header:

    ---
    title: Backpropagation, by hand
    date: 2026-10-02
    tags: calculus, deep learning
    ---
    Your notes in Markdown. Math works: $\\nabla_\\theta L$ and $$E = mc^2$$

Images: put them in notebook-src/ (or a subfolder) and reference them with a
relative path, e.g. ![sketch](img/chain-rule.png). They are embedded into the
encrypted file, so they stay private too.

Usage:
    python3 tools/notebook.py              # asks for the passphrase
    NOTEBOOK_PASS=... python3 tools/notebook.py
"""

import base64
import getpass
import json
import mimetypes
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "notebook-src"
OUT = ROOT / "data" / "notebook.json"
ITER = 250_000
MAGIC = "akn1"


def parse(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    meta = {}
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?", text, re.S)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip().lower()] = v.strip()
        text = text[m.end():]
    date = meta.get("date") or path.stem[:10]
    return {
        "slug": re.sub(r"[^a-z0-9]+", "-", path.stem.lower()).strip("-"),
        "title": meta.get("title") or path.stem.replace("-", " ").title(),
        "date": date,
        "tags": [t.strip() for t in meta.get("tags", "").split(",") if t.strip()],
        "md": embed_images(text, path.parent),
    }


def embed_images(md: str, base: Path) -> str:
    def repl(m):
        alt, src = m.group(1), m.group(2)
        if re.match(r"^(https?:|data:|/)", src):
            return m.group(0)
        f = (base / src).resolve()
        if not f.is_file():
            print(f"  ! image not found: {src}", file=sys.stderr)
            return m.group(0)
        mime = mimetypes.guess_type(f.name)[0] or "application/octet-stream"
        data = base64.b64encode(f.read_bytes()).decode()
        return f"![{alt}](data:{mime};base64,{data})"

    return re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)", repl, md)


def main() -> None:
    files = sorted(p for p in SRC.rglob("*.md") if not p.name.startswith(("_", ".")) and p.name != "README.md")
    notes = sorted((parse(p) for p in files), key=lambda n: n["date"], reverse=True)

    pw = os.environ.get("NOTEBOOK_PASS")
    if not pw:
        pw = getpass.getpass("Notebook passphrase: ")
        if pw != getpass.getpass("Repeat passphrase: "):
            sys.exit("Passphrases don't match.")
    if len(pw) < 12:
        sys.exit("Use at least 12 characters. The encrypted file is public, so a short passphrase can be guessed offline.")

    payload = json.dumps({"magic": MAGIC, "notes": notes}, ensure_ascii=False).encode()
    env = dict(os.environ, NOTEBOOK_PASS=pw)
    res = subprocess.run(
        ["openssl", "enc", "-aes-256-cbc", "-pbkdf2", "-md", "sha256", "-iter", str(ITER), "-salt", "-pass", "env:NOTEBOOK_PASS"],
        input=payload, capture_output=True, env=env, check=True,
    )
    OUT.write_text(json.dumps({"v": 1, "iter": ITER, "data": base64.b64encode(res.stdout).decode()}))
    print(f"Encrypted {len(notes)} note(s) -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
