# Portfolio Demos — Данил Буторов

Репозиторий с автономными демонстрационными проектами из моего портфолио веб-разработчика.  
Каждый проект вынесен в отдельную папку, имеет модульную структуру (HTML5 / CSS / ES6+ Modules) и запускается без сторонних сборщиков или бэкенда.

---

## Список проектов

| Папка | Проект | Ниша и технология | Live Demo |
| :--- | :--- | :--- | :--- |
| [`landing-quiz/`](./landing-quiz/) | **MONOLITH** | Квиз-лендинг со сметой ремонта, ползунком площади, пресетами интерьеров и JSON-вебхуком | [Открыть демо](https://butorov.dev/landing-quiz/demo/) |
| [`legal-127-quiz/`](./legal-127-quiz/) | **Норма · Бюро (127-ФЗ)** | Юридический квиз-калькулятор банкротства с проверкой МФЦ, прогрессивной скидкой и карточкой CRM/JSON | [Открыть демо](https://butorov.dev/legal-127-quiz/demo/) |
| [`cms-custom/`](./cms-custom/) | **КОРКА И КОФЕ** | Витрина пекарни со встроенной гостевой CMS: редактирование меню, цен и текстов в реальном времени | [Открыть демо](https://butorov.dev/cms-custom/demo/) |
| [`promo-before-after/`](./promo-before-after/) | **KRONOS DETAIL** | Промо-сайт детейлинг-студии со шторкой «До / После» (Scroll-Sync + Pointer Events) и онлайн-записью | [Открыть демо](https://butorov.dev/promo-before-after/demo/) |
| [`multilanding-utm/`](./multilanding-utm/) | **ВЕКТОР** | Мультилендинг грузоперевозок с динамической подменой офферов, автопарка и заявок по UTM-меткам | [Открыть демо](https://butorov.dev/multilanding-utm/demo/) |
| [`object-showcase/`](./object-showcase/) | **ПОД СОСНАМИ** | Витрина глэмпинга с интерактивным топографическим SVG-планом территории, фильтрами и бронью | [Открыть демо](https://butorov.dev/object-showcase/demo/) |
| [`product-configurator/`](./product-configurator/) | **/hardware.** | Визуальный конфигуратор ПК со сметой, прогнозом FPS, проверкой БП и слоистым SVG-рендером | [Открыть демо](https://butorov.dev/product-configurator/demo/) |
| [`crm-integration/`](./crm-integration/) | **SAYSO.** | Школа английского с прямой интеграцией AmoCRM API v4 / Битрикс24 REST, анти-дублем и логом API | [Открыть демо](https://butorov.dev/crm-integration/demo/) |
| [`online-payment/`](./online-payment/) | **MOTION 2026** | Конференция с песочницей онлайн-оплаты ЮKassa / СБП, тестовыми картами и выдачей чека 54-ФЗ | [Открыть демо](https://butorov.dev/online-payment/demo/) |
| [`react-3d-twin/`](./react-3d-twin/) | **KORS 3D** | Инженерный промо-сайт и B2B-каталог с интерактивной 3D-витриной на Canvas, тепловизор/CAD-переключателем и поиском Ctrl+K | [Открыть демо](https://butorov.dev/react-3d-twin/demo/) |
| [`booking-bot/`](./booking-bot/) | **SREZ** | Интерактивный Telegram-бот онлайн-записи для барбершопа (FSM + авто-напоминание за 2 часа) + код Python (Aiogram 3 + APScheduler) | [Открыть демо](https://butorov.dev/booking-bot/demo/) |
| [`paywall-bot/`](./paywall-bot/) | **РЕЗЕРВ** | Telegram-бот платной подписки на закрытый канал (ЮKassa/СБП, одноразовая ссылка `1/1`, автоудаление по сроку) + код Python | [Открыть демо](https://butorov.dev/paywall-bot/demo/) |

---

## Как запустить любой проект локально

Так как скрипты подключены как ES-модули (`type="module"`), достаточно запустить любой локальный статический сервер из папки нужного проекта:

```bash
cd landing-quiz
python -m http.server 8080
```

После этого откройте `http://localhost:8080` в браузере.
