export const RGB_THEMES = [
  { id: "magenta", name: "Rose / Violet", primary: "#F45C9E", secondary: "#9B5CFF", glow: "rgba(244, 92, 158, 0.55)" },
  { id: "ice", name: "Arctic Ice", primary: "#60D5FF", secondary: "#3B82F6", glow: "rgba(96, 213, 255, 0.48)" },
  { id: "amber", name: "Amber Gold", primary: "#F59E0B", secondary: "#FB7185", glow: "rgba(245, 158, 11, 0.45)" },
  { id: "stealth", name: "Stealth Off", primary: "#3F3F4A", secondary: "#2A2A32", glow: "rgba(255, 255, 255, 0.08)" }
];

export const CATEGORIES = [
  {
    id: "case",
    label: "Корпус",
    title: "Выберите корпус и эстетику",
    hint: "Влияет на внешний вид, цвет шасси и продуваемость системного блока.",
    items: [
      {
        id: "mesh_black",
        name: "Fractal North Stealth Black",
        spec: "Mid-Tower · Матовый чёрный + закалённое стекло",
        price: 16900,
        tdp: 0,
        visual: { shell: "#18181D", interior: "#0F0F13", stroke: "#383846", trim: "#25252E", glassTint: "rgba(255,255,255,0.03)", label: "Stealth Black", style: "mesh" }
      },
      {
        id: "arctic_white",
        name: "NZXT H7 Flow Arctic White",
        spec: "Mid-Tower · Керамический белый + прозрачное стекло",
        price: 18500,
        tdp: 0,
        visual: { shell: "#E6E8EE", interior: "#22242C", stroke: "#B5BAC6", trim: "#D0D4DF", glassTint: "rgba(255,255,255,0.06)", label: "Arctic White", style: "mesh" }
      },
      {
        id: "aquarium_pro",
        name: "Lian Li O11 Vision Panoramic",
        spec: "Dual-Chamber · Панорамное стекло с 2 сторон",
        price: 22900,
        tdp: 0,
        visual: { shell: "#14141A", interior: "#0B0B0F", stroke: "#4A4A5C", trim: "#1F1F28", glassTint: "rgba(155,92,255,0.04)", label: "Panoramic Glass", style: "panoramic" }
      }
    ]
  },
  {
    id: "gpu",
    label: "Видеокарта",
    title: "Графический ускоритель (GPU)",
    hint: "Главный компонент для FPS в играх, трассировки лучей и 3D-рендеринга.",
    items: [
      { id: "rtx4060ti", name: "GeForce RTX 4060 Ti 16 ГБ", spec: "Dual-Fan · Full HD / 2K High · DLSS 3", price: 54900, tdp: 165, fpsBase: 76, csBase: 360, tier: 1 },
      { id: "rtx4070tis", name: "GeForce RTX 4070 Ti Super 16 ГБ", spec: "Tri-Fan · 2K Ultra + Ray Tracing", price: 96900, tdp: 285, fpsBase: 118, csBase: 440, tier: 2, badge: "Оптимум" },
      { id: "rtx4080s", name: "GeForce RTX 4080 Super 16 ГБ", spec: "Flagship 3.5-Slot · 2K/4K Ultra", price: 129900, tdp: 320, fpsBase: 142, csBase: 510, tier: 3, badge: "Хит" },
      { id: "rtx4090", name: "GeForce RTX 4090 24 ГБ", spec: "Ультимативный 4K Gaming & AI / Blender", price: 229000, tdp: 450, fpsBase: 184, csBase: 590, tier: 4 }
    ]
  },
  {
    id: "cpu",
    label: "Процессор",
    title: "Центральный процессор (CPU)",
    hint: "Определяет скорость расчётов, стабильный 1% Low FPS и производительность в работе.",
    items: [
      { id: "r5_7600x", name: "AMD Ryzen 5 7600X", spec: "6 ядер / 12 потоков · до 5.3 ГГц · AM5", price: 28500, tdp: 105, fpsMult: 0.92, csBonus: -25 },
      { id: "r7_7800x3d", name: "AMD Ryzen 7 7800X3D", spec: "8 ядер · 3D V-Cache · Король игрового FPS", price: 46900, tdp: 120, fpsMult: 1.06, csBonus: 45, badge: "Топ для игр" },
      { id: "i7_14700k", name: "Intel Core i7-14700K", spec: "20 ядер (8P+12E) · Игры + Монтаж", price: 48500, tdp: 190, fpsMult: 1.03, csBonus: 25 },
      { id: "r9_9950x", name: "AMD Ryzen 9 9950X", spec: "16 ядер / 32 потока · Workstation / 3D / AI", price: 74900, tdp: 200, fpsMult: 1.09, csBonus: 55 }
    ]
  },
  {
    id: "cooling",
    label: "Охлаждение",
    title: "Система охлаждения процессора",
    hint: "Сразу меняет конструкцию внутри корпуса: башенный кулер или СЖО с радиатором 360 мм.",
    items: [
      { id: "air_tower", name: "DeepCool AK620 Zero Dark", spec: "Двухсекционная башня · 6 трубок · до 260 Вт", price: 7900, tdp: 10, coolingType: "air", tempLabel: "62°C" },
      { id: "aio_240", name: "NZXT Kraken 240 RGB", spec: "Жидкостная СЖО 240 мм · Тихие вентиляторы", price: 16900, tdp: 18, coolingType: "aio240", tempLabel: "51°C" },
      { id: "aio_360", name: "Lian Li Galahad II LCD 360", spec: "Топовая СЖО 360 мм · IPS-дисплей на помпе", price: 26900, tdp: 25, coolingType: "aio360", tempLabel: "44°C", badge: "Макс. тишина" }
    ]
  },
  {
    id: "ram",
    label: "Память",
    title: "Оперативная память DDR5",
    hint: "Меняет число установленных планок в слотах материнской платы на рендере.",
    items: [
      { id: "ram32", name: "32 ГБ (2×16 ГБ) DDR5 6000 МГц", spec: "G.Skill Trident Z5 RGB · CL30", price: 14900, tdp: 12, sticks: 2, fpsBonus: 0 },
      { id: "ram64", name: "64 ГБ (4×16 ГБ) DDR5 6000 МГц", spec: "4 модуля RGB · Игры + Стрим + 4K Монтаж", price: 29500, tdp: 20, sticks: 4, fpsBonus: 4, badge: "Выбор профи" },
      { id: "ram96", name: "96 ГБ (4×24 ГБ) DDR5 6400 МГц", spec: "Максимум памяти для 3D, Unreal Engine и LLM", price: 46500, tdp: 24, sticks: 4, fpsBonus: 6 }
    ]
  },
  {
    id: "ssd",
    label: "Накопитель",
    title: "Скоростной NVMe SSD PCIe 4.0",
    hint: "Мгновенная загрузка системы, игр и тяжёлых рабочих проектов.",
    items: [
      { id: "ssd1tb", name: "1 ТБ Samsung 990 PRO NVMe", spec: "Чтение до 7450 МБ/с · PCIe 4.0", price: 12900, tdp: 8 },
      { id: "ssd2tb", name: "2 ТБ Samsung 990 PRO NVMe", spec: "Оптимальный объём под 15+ AAA-игр", price: 21900, tdp: 10, badge: "Популярный" },
      { id: "ssd4tb", name: "4 ТБ WD Black SN850X NVMe", spec: "Огромный архив под видео и 3D-сцены", price: 39900, tdp: 12 }
    ]
  },
  {
    id: "psu",
    label: "Питание",
    title: "Блок питания (ATX 3.0 / PCIe 5.0)",
    hint: "Система автоматически проверяет запас мощности под выбранную видеокарту и CPU.",
    items: [
      { id: "psu750", name: "750 Вт · 80+ Gold Modular", spec: "Японские конденсаторы · Полупассивный режим", price: 11900, watts: 750 },
      { id: "psu850", name: "850 Вт · 80+ Gold ATX 3.0", spec: "Нативный кабель 12VHPWR · Запас под апгрейд", price: 15500, watts: 850, badge: "Рекомендуем" },
      { id: "psu1000", name: "1000 Вт · 80+ Platinum ATX 3.0", spec: "Максимальная стабильность под RTX 4090", price: 23900, watts: 1000 }
    ]
  }
];

export const READY_BUILDS = [
  {
    id: "pulse",
    name: "Core Pulse",
    tagline: "Чистый старт для 2K-гейминга",
    config: { case: "mesh_black", gpu: "rtx4060ti", cpu: "r5_7600x", cooling: "air_tower", ram: "ram32", ssd: "ssd1tb", psu: "psu750", rgb: "ice" }
  },
  {
    id: "phantom",
    name: "Core Phantom",
    tagline: "Идеальный баланс мощности и тишины",
    config: { case: "mesh_black", gpu: "rtx4080s", cpu: "r7_7800x3d", cooling: "aio_360", ram: "ram32", ssd: "ssd2tb", psu: "psu850", rgb: "magenta" }
  },
  {
    id: "arctic",
    name: "Core Arctic",
    tagline: "Белоснежный шоу-билд с СЖО и 64 ГБ DDR5",
    config: { case: "arctic_white", gpu: "rtx4070tis", cpu: "i7_14700k", cooling: "aio_360", ram: "ram64", ssd: "ssd2tb", psu: "psu850", rgb: "ice" }
  },
  {
    id: "apex",
    name: "Core Apex 4090",
    tagline: "Флагман для 4K Ultra, 3D-рендера и AI",
    config: { case: "aquarium_pro", gpu: "rtx4090", cpu: "r9_9950x", cooling: "aio_360", ram: "ram96", ssd: "ssd4tb", psu: "psu1000", rgb: "amber" }
  }
];
