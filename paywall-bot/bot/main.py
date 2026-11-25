import asyncio
import logging
import os

from aiogram import Bot, Dispatcher
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv

from handlers.subscribe import router as subscribe_router
from services.payments import init_yookassa


async def main() -> None:
    """Bootstrap Aiogram 3 paywall bot, YooKassa SDK, and APScheduler."""
    load_dotenv()
    token = os.getenv("BOT_TOKEN", "")
    channel_id = int(os.getenv("CHANNEL_ID", "0") or 0)
    shop_id = os.getenv("YOOKASSA_SHOP_ID", "")
    secret_key = os.getenv("YOOKASSA_SECRET", "")

    if not token:
        raise RuntimeError("BOT_TOKEN is not set. Copy .env.example to .env and fill credentials.")

    if shop_id and secret_key:
        init_yookassa(shop_id=shop_id, secret_key=secret_key)

    bot = Bot(token=token)
    me = await bot.get_me()

    dp = Dispatcher()
    scheduler = AsyncIOScheduler(timezone="Europe/Moscow")

    dp.include_router(subscribe_router)
    dp["scheduler"] = scheduler
    dp["channel_id"] = channel_id
    dp["bot_username"] = me.username or "rezerv_club_bot"

    scheduler.start()
    try:
        await dp.start_polling(bot)
    finally:
        scheduler.shutdown(wait=False)
        await bot.session.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
