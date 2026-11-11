"""Fetch citation metrics from a Google Scholar profile and write them to data/scholar.json.

Run by .github/workflows/update-scholar.yml. Only rewrites the JSON when a metric
changes, so the workflow commits nothing on days without new citations.
"""
import datetime
import html
import json
import pathlib
import re
import sys
import urllib.request

SCHOLAR_USER = "5lkqsjIAAAAJ"
PROFILE_URL = f"https://scholar.google.com/citations?hl=en&user={SCHOLAR_USER}"
OUT_PATH = pathlib.Path(__file__).resolve().parent.parent / "data" / "scholar.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/130.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse(page):
    table = re.search(r'<table id="gsc_rsb_st">(.*?)</table>', page, re.S)
    if not table:
        raise ValueError("Citation table not found (Scholar may have served a CAPTCHA)")
    table = table.group(1)

    # Header looks like: "", "All", "Since 2021"
    headers = [html.unescape(h).strip() for h in re.findall(r'<th class="gsc_rsb_sth">(.*?)</th>', table)]
    since_match = re.search(r"\d{4}", headers[2]) if len(headers) > 2 else None
    if not since_match:
        raise ValueError(f"Unexpected table header: {headers}")

    rows = re.findall(
        r'<a [^>]*class="gsc_rsb_f[^"]*"[^>]*>(.*?)</a>.*?'
        r'<td class="gsc_rsb_std">(\d+)</td>\s*<td class="gsc_rsb_std">(\d+)</td>',
        table,
        re.S,
    )
    keys = {"Citations": "citations", "h-index": "h_index", "i10-index": "i10_index"}
    metrics = {}
    for label, all_time, recent in rows:
        key = keys.get(html.unescape(label).strip())
        if key:
            metrics[key] = {"all": int(all_time), "since": int(recent)}
    if set(metrics) != set(keys.values()):
        raise ValueError(f"Missing metrics, parsed: {metrics}")

    return {"since_year": int(since_match.group(0)), "metrics": metrics}


def main():
    data = parse(fetch(PROFILE_URL))

    if OUT_PATH.exists():
        old = json.loads(OUT_PATH.read_text())
        if old.get("metrics") == data["metrics"] and old.get("since_year") == data["since_year"]:
            print("No change in Scholar metrics.")
            return

    data["profile_url"] = PROFILE_URL
    data["updated"] = datetime.date.today().isoformat()
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(data, indent=2) + "\n")
    print(f"Updated {OUT_PATH.name}: {data['metrics']}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # leave the existing JSON untouched on any failure
        print(f"Scholar update failed: {exc}", file=sys.stderr)
        sys.exit(1)
