from typing import Any, Dict, List
import httpx


class OzonClient:
    """Async client for Ozon Seller API (/v3/product/info/stocks and prices)."""

    STOCKS_URL = "https://api-seller.ozon.ru/v3/product/info/stocks"

    def __init__(self, client_id: str, api_key: str, timeout: float = 15.0) -> None:
        self.client_id = client_id
        self.api_key = api_key
        self.timeout = timeout

    async def fetch_stocks(self, product_ids: List[int]) -> List[Dict[str, Any]]:
        """Fetch Ozon warehouse stocks for product IDs."""
        if not self.client_id or not self.api_key or not product_ids:
            return []

        headers = {
            "Client-Id": self.client_id,
            "Api-Key": self.api_key,
            "Content-Type": "application/json",
        }
        payload = {"filter": {"product_id": product_ids}, "limit": len(product_ids)}

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(self.STOCKS_URL, json=payload, headers=headers)
            resp.raise_for_status()
            items = resp.json().get("result", {}).get("items", [])
            return [
                {
                    "mp": "ozon",
                    "sku": str(item.get("product_id", "")),
                    "warehouses": [
                        {
                            "name": st.get("type", "fbo"),
                            "qty": int(st.get("present") or 0),
                            "daily_sales": 4,
                        }
                        for st in item.get("stocks", [])
                    ],
                }
                for item in items
            ]
