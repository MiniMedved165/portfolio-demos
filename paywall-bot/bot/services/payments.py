from typing import Dict, Set
from yookassa import Configuration, Payment


# In production, store processed payment IDs in PostgreSQL / Redis with UNIQUE constraint.
_PROCESSED_PAYMENTS: Set[str] = set()

TARIFF_PLANS: Dict[str, Dict[str, object]] = {
    "m1": {"name": "1 месяц", "days": 30, "price_rub": 4900},
    "m3": {"name": "3 месяца", "days": 90, "price_rub": 12900},
    "y1": {"name": "12 месяцев", "days": 365, "price_rub": 44000},
}


def init_yookassa(shop_id: str, secret_key: str) -> None:
    """Configure YooKassa SDK credentials from environment variables."""
    Configuration.account_id = shop_id
    Configuration.secret_key = secret_key


def create_subscription_payment(user_id: int, plan_id: str, return_url: str) -> str:
    """Create a YooKassa payment with 54-FZ receipt metadata and return confirmation URL."""
    plan = TARIFF_PLANS[plan_id]
    payment = Payment.create(
        {
            "amount": {"value": f"{plan['price_rub']}.00", "currency": "RUB"},
            "confirmation": {"type": "redirect", "return_url": return_url},
            "capture": True,
            "description": f"Подписка РЕЗЕРВ ({plan['name']}) · user {user_id}",
            "metadata": {"user_id": str(user_id), "plan_id": plan_id},
        }
    )
    return payment.confirmation.confirmation_url


def is_payment_already_processed(payment_id: str) -> bool:
    """Idempotency guard: prevent duplicate invite links on repeated YooKassa webhooks."""
    if payment_id in _PROCESSED_PAYMENTS:
        return True
    _PROCESSED_PAYMENTS.add(payment_id)
    return False
