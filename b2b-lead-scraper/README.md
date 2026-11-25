# ГЕОЛИД — Парсер B2B-баз с 2ГИС и Яндекс Карт

Интерактивная веб-панель с гео-радаром и продакшн-шаблон асинхронного Python-парсера для сбора B2B-контактов.

- **Live Demo в браузере:** [https://butorov.dev/b2b-lead-scraper/demo/](https://butorov.dev/b2b-lead-scraper/demo/)

## Пайплайн сбора и дедупликации

```text
2ГИС (httpx API) + Яндекс Карты (Playwright + Proxy)
   └─▶ Нормализация телефонов и склейка дублей
          └─▶ Обогащение сайтов (Email, Telegram, WhatsApp)
                 └─▶ Безопасный экспорт: Excel CSV (UTF-8 BOM) / JSON / CRM Webhook
```

## Структура проекта

```text
b2b-lead-scraper/
├── index.html                     # Конструктор запроса, радар-карта, таблица и модалки
├── css/styles.css                 # Стили гео-радара, анимация луча, пинов и шторки
├── js/
│   ├── geo-datasets.js            # Справочники 5 городов и 5 B2B-рубрик
│   ├── dataset-builder.js         # Сборка выборки, escapeHtml() и safeCsvCell()
│   ├── radar-ui.js                # Рендер векторной карты, пинов, лога и KPI
│   ├── table-export.js            # Таблица, CSV/JSON-экспорт, шторка карточки и CRM
│   └── main.js                    # Точка входа
└── scraper/                       # Реальная серверная реализация на Python
    ├── main.py                    # CLI / Asyncio точка входа (--city --rubric --sources --output)
    ├── collectors/
    │   ├── twogis_client.py       # Асинхронный сбор из 2ГИС (httpx)
    │   └── ymaps_collector.py     # Сбор из Яндекс Карт (Playwright + прокси)
    ├── pipeline/
    │   ├── deduplicator.py        # Нормализация телефонов и склейка дублей
    │   ├── website_enricher.py    # Проверка сайта и поиск Email / TG / WA
    │   └── exporters.py           # Безопасный CSV (UTF-8 BOM), JSON и CRM webhook
    ├── requirements.txt           # Зависимости Python
    └── .env.example               # Шаблон переменных окружения без секретов
```

## Локальный запуск Python-парсера

```bash
cd scraper
python -m venv .venv
source .venv/bin/activate  # или .venv\Scripts\activate на Windows
pip install -r requirements.txt
playwright install chromium
cp .env.example .env       # укажите DGIS_API_KEY, PROXY_URL, CRM_WEBHOOK_URL
python main.py --city "Москва" --rubric "Кофейни и пекарни" --output output/leads.csv
```
