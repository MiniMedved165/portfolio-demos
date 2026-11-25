from datetime import datetime, timedelta
from aiogram import Bot
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from apscheduler.schedulers.asyncio import AsyncIOScheduler


async def send_renewal_warning(bot: Bot, user_id: int, plan_name: str, expires_at: str) -> None:
    """Send a 3-day pre-expiration renewal reminder."""
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🔄 Продлить подписку", callback_data="show_tariffs")]
        ]
    )
    await bot.send_message(
        chat_id=user_id,
        text=(
            "⏳ <b>Напоминание о подписке</b>\n\n"
            f"Доступ по тарифу <b>{plan_name}</b> заканчивается через 3 дня ({expires_at})."
        ),
        reply_markup=kb,
        parse_mode="HTML",
    )


async def soft_kick_expired_member(bot: Bot, channel_id: int, user_id: int) -> None:
    """Perform a soft kick (ban + immediate unban) so the user can rejoin after renewal."""
    await bot.ban_chat_member(chat_id=channel_id, user_id=user_id)
    await bot.unban_chat_member(chat_id=channel_id, user_id=user_id, only_if_banned=True)

    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🔄 Продлить и вернуться", callback_data="show_tariffs")]
        ]
    )
    await bot.send_message(
        chat_id=user_id,
        text=(
            "🔒 <b>Срок вашей подписки истёк</b>\n\n"
            "Доступ в закрытый канал приостановлен. Продлите подписку, чтобы получить новую одноразовую ссылку."
        ),
        reply_markup=kb,
        parse_mode="HTML",
    )


def schedule_subscription_lifecycle(
    scheduler: AsyncIOScheduler,
    bot: Bot,
    channel_id: int,
    user_id: int,
    plan_name: str,
    days: int,
) -> None:
    """Schedule 3-day warning and expiry soft-kick jobs."""
    now = datetime.now()
    expiry_dt = now + timedelta(days=days)
    warn_dt = max(now + timedelta(seconds=15), expiry_dt - timedelta(days=3))

    scheduler.add_job(
        send_renewal_warning,
        trigger="date",
        run_date=warn_dt,
        id=f"warn_{user_id}",
        replace_existing=True,
        kwargs={
            "bot": bot,
            "user_id": user_id,
            "plan_name": plan_name,
            "expires_at": expiry_dt.strftime("%d.%m.%Y"),
        },
    )
    scheduler.add_job(
        soft_kick_expired_member,
        trigger="date",
        run_date=expiry_dt,
        id=f"kick_{user_id}",
        replace_existing=True,
        kwargs={
            "bot": bot,
            "channel_id": channel_id,
            "user_id": user_id,
        },
    )
