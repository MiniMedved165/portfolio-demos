export const SOLUTIONS_DATA = [
  {
    id: "automation",
    num: "01",
    title: "Промышленная автоматизация",
    shortDesc: "Интеллектуальные системы управления линиями для кратного роста производительности.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
    category: "SCADA / ПЛК / IoT",
    metrics: [
      { label: "Снижение простоев", value: "−42%" },
      { label: "Окупаемость (ROI)", value: "9 мес" },
      { label: "Доступность узлов", value: "99.94%" }
    ],
    architecture: [
      "Сбор телеметрии с датчиков в реальном времени (< 15 мс)",
      "Предиктивная диагностика износа узлов на базе ML-моделей",
      "Единая диспетчерская панель React + WebSockets для инженеров"
    ],
    stack: ["React 19", "TypeScript", "WebSockets", "OPC UA", "PostgreSQL"]
  },
  {
    id: "infrastructure",
    num: "02",
    title: "Умная инфраструктура",
    shortDesc: "Устойчивые цифровые контуры для энергосетей, логистических хабов и городов.",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
    category: "Digital Twin / BIM",
    metrics: [
      { label: "Экономия энергии", value: "−28%" },
      { label: "Контроль объектов", value: "1 400+" },
      { label: "Время реакции", value: "0.4 сек" }
    ],
    architecture: [
      "Интерактивный 3D-двойник инженерных сетей и узлов зданий",
      "Автоматическая балансировка пиковых нагрузок и климата",
      "Резервирование каналов связи и аудит безопасности"
    ],
    stack: ["React", "WebGL / Canvas", "MQTT", "Go", "TimescaleDB"]
  },
  {
    id: "manufacturing",
    num: "03",
    title: "Передовое производство",
    shortDesc: "Точность, масштабируемость и сквозной контроль качества каждого изделия.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80",
    category: "Робототехника / CV",
    metrics: [
      { label: "Точность контроля", value: "0.02 мм" },
      { label: "Рост выпуска", value: "+64%" },
      { label: "Брак на линии", value: "< 0.1%" }
    ],
    architecture: [
      "Компьютерное зрение для мгновенной дефектоскопии на конвейере",
      "Синхронизация робототехнических ячеек и MES-системы",
      "Цифровой паспорт каждой партии с историей испытаний"
    ],
    stack: ["React", "Python / PyTorch", "Computer Vision", "ROS 2", "REST API"]
  }
];

export const PROJECTS_ARCHIVE = [
  {
    id: "p1",
    code: "PRJ-204",
    title: "Цифровой двойник турбинного цеха",
    location: "Санкт-Петербург · Энергетика",
    impact: "−37% внеплановых остановок за первый год",
    solutionId: "automation"
  },
  {
    id: "p2",
    code: "PRJ-189",
    title: "Автономный логистический терминал 48 000 м²",
    location: "Москва · Инфраструктура",
    impact: "Ускорение сортировки грузов в 2.3 раза",
    solutionId: "infrastructure"
  },
  {
    id: "p3",
    code: "PRJ-217",
    title: "Оптический контроль точности лопаток и шестерён",
    location: "Казань · Производство",
    impact: "Точность сканирования 0.018 мм в потоке",
    solutionId: "manufacturing"
  }
];

export const KEY_METRICS = [
  { value: "250+", label: "Реализованных проектов" },
  { value: "18", label: "Стран внедрения" },
  { value: "99.9%", label: "Надёжность систем" },
  { value: "12+", label: "Лет инженерной практики" }
];

export const PARTNER_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80"
];
