from typing import Any, Dict, List
import httpx


class TwoGisClient:
    """Async client for fetching B2B organizations from 2GIS Catalog API."""

    BASE_URL = "https://catalog.api.2gis.com/3.0/items"

    def __init__(self, api_key: str, timeout: float = 15.0) -> None:
        self.api_key = api_key
        self.timeout = timeout

    async def fetch_rubric(self, city: str, rubric: str, max_pages: int = 5) -> List[Dict[str, Any]]:
        """Fetch paginated company cards for a city and rubric."""
        if not self.api_key:
            return []

        results: List[Dict[str, Any]] = []
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for page in range(1, max_pages + 1):
                params = {
                    "q": f"{city} {rubric}",
                    "page": page,
                    "page_size": 50,
                    "fields": "items.contact_groups,items.point,items.reviews",
                    "key": self.api_key,
                }
                resp = await client.get(self.BASE_URL, params=params)
                if resp.status_code != 200:
                    break
                items = resp.json().get("result", {}).get("items", [])
                if not items:
                    break
                for item in items:
                    results.append(self._normalize_item(item, city, rubric))
        return results

    @staticmethod
    def _normalize_item(item: Dict[str, Any], city: str, rubric: str) -> Dict[str, Any]:
        """Map raw 2GIS JSON item into unified B2B lead schema."""
        return {
            "name": item.get("name", ""),
            "city": city,
            "rubric": rubric,
            "address": item.get("address_name", ""),
            "phone": "",
            "website": "",
            "email": "",
            "rating": float(item.get("reviews", {}).get("general_rating") or 0.0),
            "reviews": int(item.get("reviews", {}).get("general_review_count") or 0),
            "source": "2ГИС",
        }
