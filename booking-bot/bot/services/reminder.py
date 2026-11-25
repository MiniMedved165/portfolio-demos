from datetime import datetime, timedelta
from aiogram import Bot
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from apscheduler.schedulers.asyncio import AsyncIOScheduler


async def send_two_hour_reminder(
    bot: Bot,
    chat_id: int,
    booking_id: str,
    service_title: str,
    barber_name: str,
    visit_time: str,
) -> None:
    """Send an automated 2-hour pre-visit confirmation message."""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✅ Да, буду вовремя",
                    callback_data=f"confirm_2h:{booking_id}",
                )
            ],
            [
                InlineKeyboardButton(
                    text="🕒 Перенести время",
                    callback_data=f"reschedule:{booking_id}",
                ),
                InlineKeyboardButton(
                    text="❌ Отменить визит",
                    callback_data=f"cancel:{booking_id}",
                ),
            ],
        ]
    )

    text = (
        "🔔 <b>Напоминание о визите через 2 часа!</b>\n\n"
        f"Ждём вас сегодня в <b>{visit_time}</b> в SREZ (Б. Никитская, 24).\n"
        f"✂️ {service_title} · мастер {barber_name}\n\n"
        "Подтвердите, пожалуйста, визит — к вашему приходу сварим свежий кофе ☕️"
    )
    await bot.send_message(chat_id=chat_id, text=text, reply_markup=keyboard, parse_mode="HTML")


def schedule_two_hour_reminder(
    scheduler: AsyncIOScheduler,
    bot: Bot,
    chat_id: int,
    booking_id: str,
    service_title: str,
    barber_name: str,
    visit_dt: datetime,
) -> str:
    """Register or replace an APScheduler job 2 hours before the visit."""
    job_id = f"reminder_2h_{booking_id}"
    remind_at = visit_dt - timedelta(hours=2)
    if remind_at <= datetime.now():
        remind_at = datetime.now() + timedelta(seconds=10)

    scheduler.add_job(
        send_two_hour_reminder,
        trigger="date",
        run_date=remind_at,
        id=job_id,
        replace_existing=True,
        kwargs={
            "bot": bot,
            "chat_id": chat_id,
            "booking_id": booking_id,
            "service_title": service_title,
            "barber_name": barber_name,
            "visit_time": visit_dt.strftime("%H:%M"),
        },
    )
    return job_id


def cancel_scheduled_reminder(scheduler: AsyncIOScheduler, booking_id: str) -> None:
    """Remove pending reminder job when booking is cancelled."""
    job_id = f"reminder_2h_{booking_id}"
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)
