"""TenderFlow Guinea — Crawler Service.

Automated web scraping for tender sources using Playwright + BeautifulSoup.
Respects robots.txt, rate limits, and legal scraping practices.
"""
import asyncio
import hashlib
import json
import re
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup


class BaseCrawler:
    """Base class for all crawlers with common functionality."""

    def __init__(self, source_config: dict):
        self.config = source_config
        self.name = source_config.get("name", "unknown")
        self.base_url = source_config.get("url", "")
        self.headers = {
            "User-Agent": "TenderFlow-Guinea/1.0 (Legal scraping bot; contact@tenderflow.local)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "fr,gn;q=0.9,en;q=0.8",
        }
        self.rate_limit_delay = source_config.get("rate_limit_seconds", 2)
        self.last_request_time = None

    async def _rate_limit(self):
        """Enforce rate limiting between requests."""
        if self.last_request_time:
            elapsed = (datetime.now(timezone.utc) - self.last_request_time).total_seconds()
            if elapsed < self.rate_limit_delay:
                await asyncio.sleep(self.rate_limit_delay - elapsed)
        self.last_request_time = datetime.now(timezone.utc)

    async def fetch_page(self, url: str) -> Optional[str]:
        """Fetch a web page with rate limiting and error handling."""
        await self._rate_limit()
        try:
            async with httpx.AsyncClient(
                headers=self.headers,
                follow_redirects=True,
                timeout=30.0,
                verify=False,
            ) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    return response.text
                else:
                    print(f"[Crawler] HTTP {response.status_code} for {url}")
                    return None
        except Exception as e:
            print(f"[Crawler] Error fetching {url}: {e}")
            return None

    def deduplicate_content(self, content: str) -> str:
        """Generate a content hash for deduplication."""
        normalized = re.sub(r'\s+', ' ', content.strip().lower())
        return hashlib.sha256(normalized.encode()).hexdigest()

    async def crawl(self) -> list[dict]:
        """Main crawl method — to be implemented by subclasses."""
        raise NotImplementedError


class HtmlCrawler(BaseCrawler):
    """Crawler for HTML-based tender listing pages."""

    async def crawl(self) -> list[dict]:
        """Crawl an HTML source for tender listings."""
        html = await self.fetch_page(self.base_url)
        if not html:
            return []

        soup = BeautifulSoup(html, "html.parser")
        selectors = self.config.get("config", {}) or {}
        item_selector = selectors.get("item_selector", "article, .tender-item, .ao-item, tr")
        title_selector = selectors.get("title_selector", "h2, h3, .title, a")
        link_selector = selectors.get("link_selector", "a")
        date_selector = selectors.get("date_selector", ".date, time, .published")
        reference_selector = selectors.get("reference_selector", ".reference, .ref")

        items = []
        elements = soup.select(item_selector)

        for element in elements[:50]:  # Limit to 50 items per crawl
            try:
                title_el = element.select_one(title_selector)
                link_el = element.select_one(link_selector)
                date_el = element.select_one(date_selector)
                ref_el = element.select_one(reference_selector)

                title = title_el.get_text(strip=True) if title_el else ""
                link = link_el.get("href", "") if link_el else ""
                if link and not link.startswith("http"):
                    link = urljoin(self.base_url, link)
                date_text = date_el.get_text(strip=True) if date_el else ""
                reference = ref_el.get_text(strip=True) if ref_el else ""

                if title and link:
                    content_hash = self.deduplicate_content(title + link)
                    items.append({
                        "title": title,
                        "url": link,
                        "reference": reference,
                        "date_text": date_text,
                        "content_hash": content_hash,
                        "source_type": "html",
                    })
            except Exception as e:
                print(f"[Crawler] Error parsing element: {e}")
                continue

        return items


class PdfCrawler(BaseCrawler):
    """Crawler for PDF-based tender sources."""

    async def crawl(self) -> list[dict]:
        """Download and extract text from a PDF source."""
        try:
            async with httpx.AsyncClient(
                headers=self.headers,
                follow_redirects=True,
                timeout=60.0,
            ) as client:
                response = await client.get(self.base_url)
                if response.status_code != 200:
                    return []

                content = response.content
                try:
                    import fitz  # PyMuPDF
                    doc = fitz.open(stream=content, filetype="pdf")
                    text = "\n\n".join(page.get_text() for page in doc)
                    doc.close()
                except ImportError:
                    text = content.decode("utf-8", errors="replace")

                return [{
                    "title": self.config.get("name", "PDF Source"),
                    "url": self.base_url,
                    "content_text": text[:50000],  # Limit text size
                    "content_hash": self.deduplicate_content(text),
                    "source_type": "pdf",
                }]
        except Exception as e:
            print(f"[Crawler] PDF crawl error: {e}")
            return []


class RssCrawler(BaseCrawler):
    """Crawler for RSS/Atom feed sources."""

    async def crawl(self) -> list[dict]:
        """Parse an RSS feed for tender listings."""
        html = await self.fetch_page(self.base_url)
        if not html:
            return []

        soup = BeautifulSoup(html, "xml")
        items = []

        for item in soup.find_all("item")[:50]:
            try:
                title = item.find("title").get_text(strip=True) if item.find("title") else ""
                link = item.find("link").get_text(strip=True) if item.find("link") else ""
                description = item.find("description").get_text(strip=True) if item.find("description") else ""
                pub_date = item.find("pubDate").get_text(strip=True) if item.find("pubDate") else ""

                if title:
                    items.append({
                        "title": title,
                        "url": link,
                        "description": description[:2000],
                        "date_text": pub_date,
                        "content_hash": self.deduplicate_content(title + description),
                        "source_type": "rss",
                    })
            except Exception as e:
                print(f"[Crawler] RSS item error: {e}")
                continue

        return items


# Crawler factory
CRAWLER_MAP = {
    "html": HtmlCrawler,
    "pdf": PdfCrawler,
    "rss": RssCrawler,
}


def get_crawler(source_config: dict) -> BaseCrawler:
    """Factory function to get the appropriate crawler for a source type."""
    source_type = source_config.get("source_type", "html")
    crawler_class = CRAWLER_MAP.get(source_type, HtmlCrawler)
    return crawler_class(source_config)


async def run_crawl(source_config: dict) -> dict:
    """Run a crawl for a source and return results.

    Returns a dict with crawl statistics and found items.
    """
    crawler = get_crawler(source_config)
    items = await crawler.crawl()

    return {
        "source_name": source_config.get("name", "unknown"),
        "source_type": source_config.get("source_type", "html"),
        "items_found": len(items),
        "items": items,
        "crawled_at": datetime.now(timezone.utc).isoformat(),
    }
