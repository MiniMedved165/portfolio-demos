from typing import Any, Dict
import httpx


async def send_stockout_alert(
    bot_token: str,
    chat_id: str,
    product: Dict[str, Any],
    forecast: Dict[str, Any],
) -> None:
    """Send Telegram alert when SKU has critical warehouse stockout risk (< 7 days)."""
    if not bot_token or not chat_id or not forecast.get("critical_warehouses"):
        return

    lines = [
        f"⚠️ <b>ПУЛЬС MP · Риск обнуления SKU {product.get('sku')}</b>",
        f"Товар: {product.get('name', '—')}",
        f"Остаток всего: {forecast['total_qty']} шт. (~{forecast['days_left']} дн.)",
        f"Рекомендуемая поставка: +{forecast['recommended_batch']} шт.",
    ]
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    async with httpx.AsyncClient(timeout=10.0) as client:
        await client.post(url, json={"chat_id": chat_id, "text": "\n".join(lines), "parse_mode": "HTML"})
