# SREZ Grooming Club — Telegram-бот онлайн-записи

Интерактивный веб-симулятор Telegram-бота для барбершопа **SREZ** и продакшн-шаблон реального бота на **Python + Aiogram 3 + APScheduler**.

- **Live Demo в браузере:** [https://butorov.dev/booking-bot/demo/](https://butorov.dev/booking-bot/demo/)

## Возможности
- **FSM-цепочка записи за 20 секунд:** Услуга → Мастер → Дата → Свободный слот → Контакт (`Поделиться номером Telegram` или ввод имени).
- **Синхронизация с журналом мастера:** новые записи сразу появляются в панели расписания, занятые слоты скрываются при повторном выборе.
- **Авто-напоминание за 2 часа до визита (APScheduler):** интерактивная кнопка `⏩ Перемотать время` отправляет в чат напоминание с кнопками `Да, буду вовремя`, `Перенести время` и `Отменить визит`.
- **Инспектор Bot API / Лог:** вкладка в панели расписания показывает JSON-события (`command`, `callback_query`, `booking.created`, `scheduler.reminder_2h_sent`).

## Структура проекта

```text
booking-bot/
├── index.html                  # Семантическая разметка страницы барбершопа и симулятора Telegram
├── css/styles.css              # Кастомные стили, обои Telegram (dark/light), анимации сообщений
├── js/
│   ├── salon-data.js           # Каталог услуг, мастера, слоты и начальный журнал записей
│   ├── bot-engine.js           # Конечный автомат диалога (FSM) и логика 2-часовых напоминаний
│   ├── telegram-ui.js          # Рендер пузырей, inline-клавиатур, статуса «печатает...»
│   ├── schedule-panel.js       # Панель расписания мастера, push-уведомлений и Bot API JSON
│   └── main.js                 # Точка входа
└── bot/                        # Реальная серверная реализация на Python
    ├── main.py                 # Точка входа Aiogram 3 + запуск APScheduler
    ├── states.py               # FSM-состояния записи (BookingState)
    ├── handlers/booking.py     # Хэндлеры выбора услуги, мастера, слота и отмены
    ├── services/reminder.py    # Планировщик авто-напоминаний за 2 часа до визита
    ├── requirements.txt        # Зависимости Python
    └── .env.example            # Шаблон переменных окружения
```

## Локальный запуск Python-бота

```bash
cd bot
python -m venv .venv
source .venv/bin/activate  # или .venv\Scripts\activate на Windows
pip install -r requirements.txt
cp .env.example .env       # укажите свой BOT_TOKEN и ADMIN_CHAT_ID
python main.py
```
