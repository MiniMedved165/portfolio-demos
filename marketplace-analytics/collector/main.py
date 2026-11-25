import asyncio
import os
from dotenv import load_dotenv

from clients.ozon_client import OzonClient
from clients.wb_client import WildberriesClient
from services.stockout_forecast import compute_stockout_report
from services.telegram_alerts import send_stockout_alert


async def monitor_skus() -> None:
    """Run one collection cycle across Wildberries and Ozon and dispatch Telegram alerts."""
    load_dotenv()
    wb_token = os.getenv("WB_API_TOKEN", "")
    ozon_id = os.getenv("OZON_CLIENT_ID", "")
    ozon_key = os.getenv("OZON_API_KEY", "")
    tg_token = os.getenv("TG_BOT_TOKEN", "")
    tg_chat = os.getenv("TG_CHAT_ID", "")

    wb_cards = await WildberriesClient(wb_token).fetch_cards([214893041, 198420115])
    ozon_cards = await OzonClient(ozon_id, ozon_key).fetch_stocks([1489203412])

    for card in wb_cards + ozon_cards:
        forecast = compute_stockout_report(card)
        print(f"[{card['mp'].upper()}] SKU {card['sku']}: {forecast['total_qty']} pcs ({forecast['days_left']}d)")
        await send_stockout_alert(tg_token, tg_chat, card, forecast)


if __name__ == "__main__":
    asyncio.run(monitor_skus())
