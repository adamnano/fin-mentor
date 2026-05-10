import re
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from typing import Callable

import httpx
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.openai_client import stream_completion

router = APIRouter(prefix="/news")

_BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

_RSS_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; RSS reader)",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
}

# Financial news RSS sources — tried in order until one succeeds.
# `filter` is an optional callable(link: str) -> bool to select only relevant items.
_RSS_SOURCES: list[dict] = [
    {
        "url": "https://feeds.feedburner.com/rsscna/engnews/",
        "source": "Focus Taiwan (CNA)",
        # CNA general feed — keep only business/economy/market stories
        "filter": lambda link: any(
            cat in link for cat in ["/business/", "/economy/", "/finance/", "/market/", "/trade/"]
        ),
    },
    {
        "url": "https://feeds.bbci.co.uk/news/business/rss.xml",
        "source": "BBC Business",
        "filter": None,
    },
    {
        "url": "https://www.theguardian.com/business/rss",
        "source": "The Guardian",
        "filter": None,
    },
    {
        "url": "https://finance.yahoo.com/rss/topstories",
        "source": "Yahoo Finance",
        "filter": None,
    },
]


# ── Minimal HTML → plain-text extractor ───────────────────────────────────────
class _TextExtractor(HTMLParser):
    _SKIP_TAGS = {"script", "style", "nav", "header", "footer", "aside", "noscript", "iframe"}

    def __init__(self):
        super().__init__()
        self._parts: list[str] = []
        self._depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in self._SKIP_TAGS:
            self._depth += 1

    def handle_endtag(self, tag):
        if tag in self._SKIP_TAGS and self._depth > 0:
            self._depth -= 1

    def handle_data(self, data):
        if self._depth == 0 and data.strip():
            self._parts.append(data.strip())

    def get_text(self) -> str:
        return re.sub(r"\s{2,}", " ", " ".join(self._parts))


def _strip_html(html: str) -> str:
    parser = _TextExtractor()
    parser.feed(html)
    return parser.get_text()


async def _fetch_text(url: str, *, timeout: int = 12) -> str:
    async with httpx.AsyncClient(follow_redirects=True, timeout=timeout) as client:
        resp = await client.get(url, headers=_BROWSER_HEADERS)
        resp.raise_for_status()
        return _strip_html(resp.text)


# ── GET /news/headlines ────────────────────────────────────────────────────────
def _parse_rss_items(
    xml_text: str,
    default_source: str,
    link_filter: Callable[[str], bool] | None = None,
) -> list[dict]:
    """Parse RSS XML and return up to 3 article dicts. Handles namespaces."""
    # Remove self-closing namespace-prefixed elements e.g. <media:content .../>
    clean = re.sub(r"<\w+:\w+[^>]*/\s*>", "", xml_text)
    # Remove namespace-prefixed element pairs e.g. <dc:creator>...</dc:creator>
    clean = re.sub(r"<(\w+:\w+)[^>]*>.*?</\1>", "", clean, flags=re.DOTALL)
    # Remove any stray opening/closing namespace-prefixed tags
    clean = re.sub(r"</?[\w]+:[\w]+[^>]*>", "", clean)
    # Remove namespace declarations from root so ET doesn't complain
    clean = re.sub(r'\s+xmlns(?::\w+)?="[^"]*"', "", clean)
    root = ET.fromstring(clean)
    channel = root.find("channel")
    if channel is None:
        return []

    items = []
    for item in channel.findall("item"):
        if len(items) == 3:
            break

        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        if not link:
            guid = item.find("guid")
            if guid is not None and guid.get("isPermaLink", "false").lower() != "false":
                link = (guid.text or "").strip()

        if not title or not link:
            continue
        if link_filter and not link_filter(link):
            continue

        desc_raw = item.findtext("description") or item.findtext("summary") or ""
        desc = _strip_html(desc_raw)[:300]
        pub = (item.findtext("pubDate") or item.findtext("published") or "").strip()

        source_el = item.find("source")
        source = (
            source_el.text.strip()
            if source_el is not None and source_el.text
            else default_source
        )

        items.append({
            "title": title,
            "url": link,
            "snippet": desc,
            "published": pub,
            "source": source,
        })

    return items


@router.get("/headlines")
async def get_headlines():
    """Fetch the top 3 financial news stories from available RSS sources."""
    async with httpx.AsyncClient(follow_redirects=True, timeout=12) as client:
        for src in _RSS_SOURCES:
            try:
                resp = await client.get(src["url"], headers=_RSS_HEADERS)
                if resp.status_code != 200:
                    continue
                items = _parse_rss_items(resp.text, src["source"], src.get("filter"))
                if items:
                    return {"headlines": items, "feed_source": src["source"]}
            except Exception:
                continue

    return {
        "headlines": [],
        "error": "Could not fetch financial news. Check your internet connection.",
    }


# ── Prompt ─────────────────────────────────────────────────────────────────────
ANALYZE_PROMPT = """You are a financial educator helping banking and finance professionals build intuition from real-world news.

Article headline: {title}

Article content:
---
{article}
---

Respond in EXACTLY this format — no extra text before or after:

SUMMARY:
[2-3 sentences: what happened and why it matters financially.]

QUESTIONS:
Q1: [WHY did the company/institution take this action? Focus on financial motivation.]
Q2: [WHAT does this mean for markets, investors, or competitors?]
Q3: [HOW should a financial professional interpret this from a risk or valuation perspective?]"""

DISCUSS_PROMPT = """You are an expert financial educator and AI tutor. A banking or finance professional is studying this news article.

Article: "{title}"
Summary: {summary}

They are asking: {question}

Give a clear, educational explanation (3-5 sentences) that builds genuine financial intuition. Use concrete reasoning — connect the news to financial concepts like risk, valuation, market dynamics, or policy implications. Be direct and insightful, not generic."""


# ── POST /news/analyze ─────────────────────────────────────────────────────────
class NewsRequest(BaseModel):
    url: str | None = None
    text: str | None = None      # raw article text
    title: str | None = None     # article headline (for better AI context)
    snippet: str | None = None   # RSS snippet (fallback if URL scrape fails)


@router.post("/analyze")
async def analyze_news(req: NewsRequest):
    article_text = ""

    # 1. Try fetching the full article from URL
    if req.url:
        try:
            article_text = await _fetch_text(req.url)
        except Exception:
            pass  # fall through to snippet

    # 2. Fall back to pasted text or RSS snippet.
    # Use snippet whenever scraped content is short — many sites require JS or login.
    if len(article_text) < 200:
        fallback = req.text or req.snippet or ""
        if len(fallback) > len(article_text):
            article_text = fallback

    if not article_text.strip():
        return StreamingResponse(
            iter(["No article content available. Try pasting the article text directly."]),
            media_type="text/plain",
        )

    title = req.title or "Financial News Article"
    prompt = ANALYZE_PROMPT.format(
        title=title,
        article=article_text[:3000],
    )

    async def generate():
        async for chunk in stream_completion(prompt):
            yield chunk

    return StreamingResponse(generate(), media_type="text/plain")


# ── POST /news/discuss ─────────────────────────────────────────────────────────
class DiscussRequest(BaseModel):
    title: str
    summary: str
    question: str


@router.post("/discuss")
async def discuss_news(req: DiscussRequest):
    prompt = DISCUSS_PROMPT.format(
        title=req.title,
        summary=req.summary or "(no summary available)",
        question=req.question,
    )

    async def generate():
        async for chunk in stream_completion(prompt):
            yield chunk

    return StreamingResponse(generate(), media_type="text/plain")
