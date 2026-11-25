# KORS · Инженерные системы (React 3D SPA)

Интерактивное SPA на **React 19 + Vite + Tailwind CSS** с кастомным 3D-движком на HTML5 Canvas без внешних 3D-зависимостей.

🔗 **Живое демо:** [https://butorov.dev/react-3d-twin/demo/](https://butorov.dev/react-3d-twin/demo/)

## Возможности

- **3D-монолит на медных тросах (`src/components/Monolith3DCanvas.jsx`)**: 8-блочный бетонный монолит 2×2×2 с UV-текстурами, инерционным вращением, переключением режимов **`Монолит / Взрыв-схема / CAD-сетка`** и триггером `{ K }`.
- **Механика шестерён (`src/components/PrecisionGearCanvas.jsx`)**: синхронное зацепление 24/16 зубьев с режимами **Оптика / Тепловизор / CAD-сетка**.
- **Интерактив SPA**: быстрый поиск **`⌘K` / `Ctrl+K`**, инспектор архитектуры и KPI, шоурил и форма брифинга с валидацией и JSON-пейлоадом.

## Локальный запуск и сборка

```bash
npm install
npm run dev     # режим разработки
npm run build   # сборка статики в ./dist (base: './')
```

## Структура проекта

```text
react-3d-twin/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx
    ├── data/catalog.js
    ├── utils/canvas3d.js
    └── components/
        ├── ErrorBoundary.jsx
        ├── Monolith3DCanvas.jsx
        ├── PrecisionGearCanvas.jsx
        ├── CommandSearchModal.jsx
        ├── SolutionInspectorModal.jsx
        └── ContactBriefModal.jsx
```
