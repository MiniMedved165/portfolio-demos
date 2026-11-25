from datetime import datetime, timedelta
from typing import Dict, List

from aiogram import Bot, F, Router
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    Message,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
)
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from services.reminder import cancel_scheduled_reminder, schedule_two_hour_reminder
from states import BookingState

router = Router(name="booking")

SERVICES: Dict[str, Dict[str, str]] = {
    "haircut": {"title": "Мужская стрижка", "price": "2 200 ₽", "duration": "45 мин"},
    "combo": {"title": "Стрижка + Борода", "price": "3 400 ₽", "duration": "75 мин"},
    "beard": {"title": "Моделирование бороды", "price": "1 500 ₽", "duration": "30 мин"},
    "shave": {"title": "Королевское бритьё", "price": "1 900 ₽", "duration": "45 мин"},
}

BARBERS: Dict[str, str] = {
    "artem": "Артём Ковалёв (★ 5.0)",
    "denis": "Денис Волков (★ 4.9)",
    "timur": "Тимур Рахимов (★ 4.9)",
}

TIME_SLOTS: List[str] = ["14:30", "16:00", "17:30", "19:00", "20:30"]


@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext) -> None:
    """Greet the client and display main booking menu."""
    await state.clear()
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="✂️ Записаться на стрижку", callback_data="choose_service")],
            [
                InlineKeyboardButton(text="💈 Прайс-лист", callback_data="show_price"),
                InlineKeyboardButton(text="📍 Адрес", callback_data="show_address"),
            ],
        ]
    )
    await message.answer(
        "<b>Добро пожаловать в SREZ!</b> ✂️\n\n"
        "Запишу к барберу за 20 секунд и пришлю напоминание за 2 часа до визита.",
        reply_markup=kb,
        parse_mode="HTML",
    )


@router.callback_query(F.data == "choose_service")
async def choose_service(callback: CallbackQuery, state: FSMContext) -> None:
    """Prompt the user to pick a barbershop service."""
    await state.set_state(BookingState.select_service)
    rows = [
        [
            InlineKeyboardButton(
                text=f"{srv['title']} · {srv['price']} ({srv['duration']})",
                callback_data=f"srv:{srv_id}",
            )
        ]
        for srv_id, srv in SERVICES.items()
    ]
    await callback.message.answer(
        "<b>Шаг 1 из 4 · Выберите услугу:</b>",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=rows),
        parse_mode="HTML",
    )
    await callback.answer()


@router.callback_query(BookingState.select_service, F.data.startswith("srv:"))
async def select_barber(callback: CallbackQuery, state: FSMContext) -> None:
    """Save chosen service and prompt for barber selection."""
    srv_id = callback.data.split(":", 1)[1]
    await state.update_data(service_id=srv_id)
    await state.set_state(BookingState.select_barber)

    rows = [
        [InlineKeyboardButton(text=f"💈 {name}", callback_data=f"barber:{bid}")]
        for bid, name in BARBERS.items()
    ]
    await callback.message.answer(
        "<b>Шаг 2 из 4 · Выберите мастера:</b>",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=rows),
        parse_mode="HTML",
    )
    await callback.answer()


@router.callback_query(BookingState.select_barber, F.data.startswith("barber:"))
async def select_date(callback: CallbackQuery, state: FSMContext) -> None:
    """Save chosen barber and prompt for date."""
    barber_id = callback.data.split(":", 1)[1]
    await state.update_data(barber_id=barber_id)
    await state.set_state(BookingState.select_date)

    today = datetime.now().date()
    dates = [(today + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(4)]
    rows = [[InlineKeyboardButton(text=d, callback_data=f"date:{d}")] for d in dates]
    await callback.message.answer(
        "<b>Шаг 3 из 4 · Выберите дату:</b>",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=rows),
        parse_mode="HTML",
    )
    await callback.answer()


@router.callback_query(BookingState.select_date, F.data.startswith("date:"))
async def select_time(callback: CallbackQuery, state: FSMContext) -> None:
    """Save chosen date and display available time slots."""
    date_str = callback.data.split(":", 1)[1]
    await state.update_data(date_str=date_str)
    await state.set_state(BookingState.select_time)

    rows = [
        [InlineKeyboardButton(text=f"🕒 {slot}", callback_data=f"slot:{slot}") for slot in TIME_SLOTS[:3]],
        [InlineKeyboardButton(text=f"🕒 {slot}", callback_data=f"slot:{slot}") for slot in TIME_SLOTS[3:]],
    ]
    await callback.message.answer(
        f"<b>Свободные окна на {date_str}:</b>",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=rows),
        parse_mode="HTML",
    )
    await callback.answer()


@router.callback_query(BookingState.select_time, F.data.startswith("slot:"))
async def request_contact(callback: CallbackQuery, state: FSMContext) -> None:
    """Ask the client for contact phone or name confirmation."""
    slot = callback.data.split(":", 1)[1]
    await state.update_data(slot=slot)
    await state.set_state(BookingState.await_contact)

    kb = ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="📱 Поделиться номером Telegram", request_contact=True)]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )
    await callback.message.answer(
        "<b>Шаг 4 из 4 · Контакт для записи</b>\nНажмите кнопку ниже или введите ваше имя:",
        reply_markup=kb,
        parse_mode="HTML",
    )
    await callback.answer()


@router.message(BookingState.await_contact)
async def finalize_booking(
    message: Message,
    state: FSMContext,
    bot: Bot,
    scheduler: AsyncIOScheduler,
    admin_chat_id: int,
) -> None:
    """Persist booking, notify admin chat, and schedule the 2-hour reminder."""
    data = await state.get_data()
    srv = SERVICES.get(data.get("service_id", "haircut"), SERVICES["haircut"])
    barber_name = BARBERS.get(data.get("barber_id", "artem"), BARBERS["artem"])
    date_str = data.get("date_str", datetime.now().strftime("%Y-%m-%d"))
    slot = data.get("slot", "16:00")

    client_name = message.from_user.full_name if message.from_user else "Гость"
    phone = message.contact.phone_number if message.contact else (message.text or "не указан")
    booking_id = f"SRZ-{int(datetime.now().timestamp()) % 10000}"

    visit_dt = datetime.strptime(f"{date_str} {slot}", "%Y-%m-%d %H:%M")
    schedule_two_hour_reminder(
        scheduler=scheduler,
        bot=bot,
        chat_id=message.chat.id,
        booking_id=booking_id,
        service_title=srv["title"],
        barber_name=barber_name,
        visit_dt=visit_dt,
    )

    if admin_chat_id:
        await bot.send_message(
            chat_id=admin_chat_id,
            text=f"⚡ Новая запись #{booking_id}: {client_name} ({phone}) → {srv['title']}, {barber_name}, {date_str} {slot}",
        )

    await state.clear()
    await message.answer(
        f"<b>Готово! Вы записаны в SREZ</b> ✓\n\n"
        f"Номер записи: <b>#{booking_id}</b>\n"
        f"✂️ {srv['title']} ({srv['price']})\n"
        f"💈 Мастер: {barber_name}\n"
        f"📅 {date_str} в <b>{slot}</b>\n\n"
        "🔔 Я автоматически напомню за 2 часа до визита.",
        reply_markup=ReplyKeyboardRemove(),
        parse_mode="HTML",
    )


@router.callback_query(F.data.startswith("confirm_2h:"))
async def confirm_visit_2h(callback: CallbackQuery) -> None:
    """Handle client confirmation from the 2-hour reminder message."""
    booking_id = callback.data.split(":", 1)[1]
    await callback.message.answer(f"Отлично! Визит #{booking_id} подтверждён, ждём вас ☕️")
    await callback.answer("Визит подтверждён")


@router.callback_query(F.data.startswith("cancel:"))
async def cancel_visit(callback: CallbackQuery, scheduler: AsyncIOScheduler) -> None:
    """Cancel booking and remove scheduled reminder job."""
    booking_id = callback.data.split(":", 1)[1]
    cancel_scheduled_reminder(scheduler, booking_id)
    await callback.message.answer(f"Запись #{booking_id} отменена, слот освобождён.")
    await callback.answer("Запись отменена")
