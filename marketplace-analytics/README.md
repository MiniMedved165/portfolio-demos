# ПУЛЬС MP — Мониторинг карточек Wildberries и Ozon

Интерактивный кабинет селлера для отслеживания цен (СПП / Ozon Карты), остатков по складам, динамики рейтинга и асинхронный Python-коллектор на **HTTPX + Asyncio**.

- **Live Demo в браузере:** [https://butorov.dev/marketplace-analytics/demo/](https://butorov.dev/marketplace-analytics/demo/)

## Метрики мониторинга
- **Цена покупателя и СПП / Ozon Карта:** сравнение цены продавца и фактической витринной цены.
- **Прогноз stockout по 6 складам:** расчёт дней до обнуления на каждом складе и рекомендуемая партия доотгрузки (`+N шт.`).
- **14-дневный SVG-график:** переключение метрик `Рейтинг ★`, `Цена ₽`, `Остатки` с тултипами по дням.
- **Telegram-алерты и CSV-экспорт:** сводка по критичным складам и выгрузка watchlist в UTF-8 BOM CSV.

## Структура проекта

```text
marketplace-analytics/
├── index.html                     # Кабинет, поиск по SKU, графики и модалка алертов
├── css/styles.css                 # Стили карточек, SVG-графика и анимаций
├── js/
│   ├── sku-presets.js             # Предустановленные карточки WB/Ozon и 14д история
│   ├── sku-synthesizer.js         # Генератор профиля для произвольного артикула, safeCsvCell
│   ├── warehouses-ui.js           # Прогноз stockout и расчёт партии поставки
│   ├── chart-renderer.js          # Интерактивный 14-дневный SVG-график с тултипами
│   ├── export-alerts.js           # Экспорт в CSV (UTF-8 BOM) и сводка для Telegram
│   └── main.js                    # Точка входа
└── collector/                     # Реальная серверная реализация на Python
    ├── main.py                    # Точка входа asyncio
    ├── clients/
    │   ├── wb_client.py           # Клиент Wildberries (card.wb.ru/cards/v2/detail)
    │   └── ozon_client.py         # Клиент Ozon Seller API (/v3/product/info/stocks)
    ├── services/
    │   ├── stockout_forecast.py   # Расчёт дней до обнуления и объёма поставки
    │   └── telegram_alerts.py     # Отправка алертов в Telegram при риске < 7 дн.
    ├── requirements.txt           # Зависимости Python
    └── .env.example               # Шаблон переменных окружения без секретов
```

## Локальный запуск Python-коллектора

```bash
cd collector
python -m venv .venv
source .venv/bin/activate  # или .venv\Scripts\activate на Windows
pip install -r requirements.txt
cp .env.example .env       # укажите WB_API_TOKEN / OZON_* / TG_BOT_TOKEN
python main.py
```
