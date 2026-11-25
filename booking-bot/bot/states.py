from aiogram.fsm.state import State, StatesGroup


class BookingState(StatesGroup):
    """FSM states for the SREZ Telegram booking dialog."""

    select_service = State()
    select_barber = State()
    select_date = State()
    select_time = State()
    await_contact = State()
    reschedule_date = State()
    reschedule_time = State()
