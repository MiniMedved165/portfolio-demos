from typing import Any, Dict, List, Optional
from playwright.async_api import async_playwright


class YandexMapsCollector:
    """Playwright-based collector for Yandex Maps with optional proxy rotation."""

    def __init__(self, proxy_url: Optional[str] = None) -> None:
        self.proxy_url = proxy_url

    async def collect(self, city: str, rubric: str, limit: int = 40) -> List[Dict[str, Any]]:
        """Open Yandex Maps search results and extract organization cards."""
        launch_kwargs: Dict[str, Any] = {"headless": True}
        if self.proxy_url:
            launch_kwargs["proxy"] = {"server": self.proxy_url}

        leads: List[Dict[str, Any]] = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(**launch_kwargs)
            page = await browser.new_page()
            query = f"{city} {rubric}".replace(" ", "%20")
            await page.goto(f"https://yandex.ru/maps/?text={query}", wait_until="domcontentloaded")
            await page.wait_for_timeout(1500)

            cards = await page.locator(".search-business-snippet-view").all()
            for card in cards[:limit]:
                title = (await card.locator(".search-business-snippet-view__title").inner_text()).strip()
                address = (await card.locator(".search-business-snippet-view__address").inner_text()).strip()
                leads.append(
                    {
                        "name": title,
                        "city": city,
                        "rubric": rubric,
                        "address": address,
                        "phone": "",
                        "website": "",
                        "email": "",
                        "rating": 0.0,
                        "reviews": 0,
                        "source": "Я.Карты",
                    }
                )
            await browser.close()
        return leads
