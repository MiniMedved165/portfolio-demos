# РЕЗЕРВ — Telegram-бот платной подписки на закрытый канал

Интерактивный веб-симулятор paywall-бота и продакшн-шаблон серверной реализации на **Python + Aiogram 3 + YooKassa API + APScheduler**.

- **Live Demo в браузере:** [https://butorov.dev/paywall-bot/demo/](https://butorov.dev/paywall-bot/demo/)

## Схема работы Paywall

```text
ЮKassa (payment.succeeded + проверка идемпотентности)
   └─▶ createChatInviteLink(member_limit=1, expire_date=+24h)
          └─▶ Вход резидента (1/1 → повторная пересылка заблокирована)
                 └─▶ APScheduler (-3 дня: напоминание)
                        └─▶ Срок истёк: banChatMember + unbanChatMember(only_if_banned=True)
```

## Структура проекта

```text
paywall-bot/
├── index.html                     # Семантическая разметка страницы клуба и двойного Telegram-экрана
├── css/styles.css                 # Стили, обои Telegram, blur закрытого канала и анимации
├── js/
│   ├── club-data.js               # Тарифы подписки и посты закрытого канала
│   ├── paywall-state.js           # Состояние подписки, утилиты и лог Bot API
│   ├── console-ui.js              # Контроллер доступа, счётчик 1/1 и экран закрытого канала
│   ├── telegram-ui.js             # Чат бота, шторка оплаты ЮKassa и симуляция срока
│   └── main.js                    # Точка входа
└── bot/                           # Реальная серверная реализация на Python
    ├── main.py                    # Точка входа Aiogram 3 + YooKassa + APScheduler
    ├── handlers/subscribe.py      # Тарифы, генерация оплаты и обработка webhook
    ├── services/
    │   ├── payments.py            # Интеграция с YooKassa API и защита от дублей webhook
    │   ├── invite.py              # Одноразовые ссылки create_chat_invite_link(member_limit=1)
    │   └── expiry_cron.py         # Напоминание за 3 дня и мягкий кик (ban + unban)
    ├── requirements.txt           # Зависимости Python
    └── .env.example               # Шаблон переменных окружения без секретов
```

## Локальный запуск Python-бота

```bash
cd bot
python -m venv .venv
source .venv/bin/activate  # или .venv\Scripts\activate на Windows
pip install -r requirements.txt
cp .env.example .env       # заполните BOT_TOKEN, CHANNEL_ID, YOOKASSA_SHOP_ID и YOOKASSA_SECRET
python main.py
```
