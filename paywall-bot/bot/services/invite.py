from datetime import datetime, timedelta
from aiogram import Bot
from aiogram.types import ChatInviteLink


async def create_single_use_invite(bot: Bot, channel_id: int, user_id: int) -> ChatInviteLink:
    """Create a Telegram invite link limited to 1 activation and 24-hour validity."""
    return await bot.create_chat_invite_link(
        chat_id=channel_id,
        name=f"rezerv_user_{user_id}",
        member_limit=1,
        expire_date=datetime.now() + timedelta(hours=24),
    )
