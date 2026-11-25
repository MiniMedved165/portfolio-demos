import asyncio
import logging
import os

from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv

from handlers.booking import router as booking_router


async def main() -> None:
    """Bootstrap Aiogram 3 dispatcher and APScheduler reminder service."""
    load_dotenv()
    token = os.getenv("BOT_TOKEN", "")
    admin_chat_id = int(os.getenv("ADMIN_CHAT_ID", "0") or 0)

    if not token:
        raise RuntimeError("BOT_TOKEN is not set. Copy .env.example to .env and provide your bot token.")

    bot = Bot(token=token)
    dp = Dispatcher(storage=MemoryStorage())
    scheduler = AsyncIOScheduler(timezone="Europe/Moscow")

    dp.include_router(booking_router)
    dp["scheduler"] = scheduler
    dp["admin_chat_id"] = admin_chat_id

    scheduler.start()
    try:
        await dp.start_polling(bot)
    finally:
        scheduler.shutdown(wait=False)
        await bot.session.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
