from typing import Any, Dict, List
import httpx


class WildberriesClient:
    """Async client for Wildberries public card detail API (price, SPP, stocks, rating)."""

    CARD_DETAIL_URL = "https://card.wb.ru/cards/v2/detail"

    def __init__(self, api_token: str = "", timeout: float = 15.0) -> None:
        self.api_token = api_token
        self.timeout = timeout

    async def fetch_cards(self, skus: List[int]) -> List[Dict[str, Any]]:
        """Fetch product telemetry for a list of Wildberries nmId SKUs."""
        if not skus:
            return []

        params = {
            "appType": 1,
            "curr": "rub",
            "dest": -1257786,
            "nm": ";".join(str(s) for s in skus),
        }
        headers = {"Authorization": self.api_token} if self.api_token else {}

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(self.CARD_DETAIL_URL, params=params, headers=headers)
            resp.raise_for_status()
            products = resp.json().get("data", {}).get("products", [])
            return [self._normalize(p) for p in products]

    @staticmethod
    def _normalize(prod: Dict[str, Any]) -> Dict[str, Any]:
        """Extract buyer price, stock per warehouse, and rating from WB payload."""
        sizes = prod.get("sizes", [])
        stocks = sizes[0].get("stocks", []) if sizes else []
        price_info = sizes[0].get("price", {}) if sizes else {}

        return {
            "mp": "wb",
            "sku": str(prod.get("id", "")),
            "name": prod.get("name", ""),
            "brand": prod.get("brand", ""),
            "buyer_price": round((price_info.get("total") or 0) / 100),
            "seller_price": round((price_info.get("basic") or 0) / 100),
            "rating": float(prod.get("reviewRating") or 0.0),
            "reviews_count": int(prod.get("feedbacks") or 0),
            "warehouses": [
                {"name": f"WH-{s.get('wh')}", "qty": int(s.get("qty") or 0), "daily_sales": 5}
                for s in stocks
            ],
        }
