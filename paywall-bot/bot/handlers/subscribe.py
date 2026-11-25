from aiogram import Bot, F, Router
from aiogram.filters import CommandStart
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from services.expiry_cron import schedule_subscription_lifecycle
from services.invite import create_single_use_invite
from services.payments import TARIFF_PLANS, create_subscription_payment, is_payment_already_processed

router = Router(name="subscribe")


@router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    """Send welcome message with subscription entry point."""
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="💳 Выбрать тариф и оплатить", callback_data="show_tariffs")],
        ]
    )
    await message.answer(
        "<b>Закрытый клуб «РЕЗЕРВ · Аналитика»</b> ◆\n\n"
        "Доступ выдаётся автоматически по одноразовой ссылке сразу после оплаты.",
        reply_markup=kb,
        parse_mode="HTML",
    )


@router.callback_query(F.data == "show_tariffs")
async def show_tariffs(callback: CallbackQuery) -> None:
    """Display available subscription tariffs."""
    rows = [
        [
            InlineKeyboardButton(
                text=f"{plan['name']} · {plan['price_rub']} ₽",
                callback_data=f"buy:{plan_id}",
            )
        ]
        for plan_id, plan in TARIFF_PLANS.items()
    ]
    await callback.message.answer(
        "<b>Выберите период подписки:</b>",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=rows),
        parse_mode="HTML",
    )
    await callback.answer()


@router.callback_query(F.data.startswith("buy:"))
async def start_payment(callback: CallbackQuery, bot_username: str) -> None:
    """Generate YooKassa checkout link for the selected tariff."""
    plan_id = callback.data.split(":", 1)[1]
    pay_url = create_subscription_payment(
        user_id=callback.from_user.id,
        plan_id=plan_id,
        return_url=f"https://t.me/{bot_username}",
    )
    kb = InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="💳 Перейти к оплате (ЮKassa / СБП)", url=pay_url)]]
    )
    await callback.message.answer("Оплатите подписку по кнопке ниже — ссылка придёт автоматически:", reply_markup=kb)
    await callback.answer()


async def handle_payment_succeeded_webhook(
    bot: Bot,
    scheduler: AsyncIOScheduler,
    channel_id: int,
    payment_id: str,
    user_id: int,
    plan_id: str,
) -> None:
    """Issue a single-use invite link and schedule expiry jobs after YooKassa webhook."""
    if is_payment_already_processed(payment_id):
        return

    plan = TARIFF_PLANS[plan_id]
    invite = await create_single_use_invite(bot=bot, channel_id=channel_id, user_id=user_id)
    schedule_subscription_lifecycle(
        scheduler=scheduler,
        bot=bot,
        channel_id=channel_id,
        user_id=user_id,
        plan_name=str(plan["name"]),
        days=int(plan["days"]),
    )

    kb = InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="🔓 Войти в закрытый канал (1/1)", url=invite.invite_link)]]
    )
    await bot.send_message(
        chat_id=user_id,
        text=(
            f"✅ <b>Оплата {plan['price_rub']} ₽ подтверждена!</b>\n\n"
            "Ваша одноразовая ссылка (строго 1 активация):\n"
            f"<code>{invite.invite_link}</code>"
        ),
        reply_markup=kb,
        parse_mode="HTML",
    )
