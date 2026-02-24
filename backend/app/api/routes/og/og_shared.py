import time
import httpx
import base64
from playwright.async_api import async_playwright, Browser, Playwright


# ── Persistent browser instance
# One Chromium process shared across all requests — much faster than launching per-request. 
# Pages are still isolated (each request gets its own page).

_playwright: Playwright | None = None
_browser: Browser | None = None


async def start_browser() -> None:
    """Call in FastAPI lifespan startup."""
    global _playwright, _browser
    _playwright = await async_playwright().start()
    _browser = await _playwright.chromium.launch(
        args=["--no-sandbox", "--disable-dev-shm-usage"],  # required on Railway/Linux
    )


async def stop_browser() -> None:
    """Call in FastAPI lifespan shutdown."""
    global _playwright, _browser
    if _browser:
        await _browser.close()
        _browser = None
    if _playwright:
        await _playwright.stop()
        _playwright = None


async def render_html_to_png(html: str) -> bytes:
    """Render an HTML string to a 1200×630 PNG using the shared browser."""
    if not _browser:
        raise RuntimeError("Browser not started — call start_browser() in app lifespan.")
    page = await _browser.new_page(viewport={"width": 1200, "height": 630})
    try:
        # networkidle ensures Google Fonts finish loading before screenshot
        await page.set_content(html, wait_until="networkidle")
        return await page.screenshot(
            type="png",
            clip={"x": 0, "y": 0, "width": 1200, "height": 630},
        )
    finally:
        await page.close()


# ── In-memory cache
# TODO: Swap for Redis later with minimal changes.

_CACHE: dict[str, dict] = {}
_CACHE_TTL_24H = 60 * 60 * 24   # profiles
_CACHE_TTL_1H  = 60 * 60        # sessions (spots change)


def cache_get(key: str, ttl: int = _CACHE_TTL_24H) -> bytes | None:
    entry = _CACHE.get(key)
    if entry and (time.time() - entry["ts"]) < ttl:
        return entry["data"]
    return None


def cache_set(key: str, data: bytes) -> None:
    _CACHE[key] = {"data": data, "ts": time.time()}


def cache_invalidate(key: str) -> None:
    """Bust a cached OG image. Pass the full cache key, e.g. 'session:{uuid}'."""
    _CACHE.pop(key, None)


# ── Avatar helper
async def avatar_to_base64(url: str) -> str:
    """Fetch an avatar URL → base64 data-URI so Playwright doesn't need network."""
    if not url:
        return ""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(url)
            r.raise_for_status()
            ct = r.headers.get("content-type", "image/jpeg").split(";")[0]
            b64 = base64.b64encode(r.content).decode()
            return f"data:{ct};base64,{b64}"
    except Exception:
        return ""


# ── Text utilities
def get_initials(full_name: str) -> str:
    parts = full_name.strip().split()
    return f"{parts[0][0]}{parts[-1][0]}".upper() if len(parts) >= 2 else full_name[:2].upper()


def truncate(text: str, max_len: int) -> str:
    if not text:
        return ""
    return text if len(text) <= max_len else text[: max_len - 1] + "…"