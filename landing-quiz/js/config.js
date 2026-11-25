export const QUIZ_CONFIG = {
  currency: "₽",
  defaultArea: 65,
  minArea: 25,
  maxArea: 220,
  areaPresets: [42, 65, 92, 130],

  propertyTypes: [
    {
      id: "new_whitebox",
      title: "Новостройка (White-Box)",
      subtitle: "Стяжка и штукатурка уже выполнены застройщиком",
      ratePerSqm: 24500,
      roughShare: 0.34,
      durationFactor: 0.9,
      badge: "Быстрый старт"
    },
    {
      id: "new_concrete",
      title: "Новостройка (Бетон)",
      subtitle: "Свободная планировка, возведение стен и вся инженерия",
      ratePerSqm: 31000,
      roughShare: 0.42,
      durationFactor: 1.1,
      badge: "Частый выбор"
    },
    {
      id: "secondary",
      title: "Вторичный фонд",
      subtitle: "Демонтаж старой отделки, замена электрики и сантехники",
      ratePerSqm: 34500,
      roughShare: 0.45,
      durationFactor: 1.2,
      badge: "С демонтажом"
    },
    {
      id: "house",
      title: "Загородный дом / Таунхаус",
      subtitle: "Индивидуальная котельная, лестницы и усиленная инженерия",
      ratePerSqm: 36000,
      roughShare: 0.44,
      durationFactor: 1.25,
      badge: "Под ключ"
    }
  ],

  ceilingOptions: [
    { id: "standard", label: "До 3.0 м (стандарт)", multiplier: 1.0 },
    { id: "high", label: "Выше 3.0 м (+12%)", multiplier: 1.12 }
  ],

  styles: [
    {
      id: "minimalism",
      title: "Скандинавский минимализм",
      subtitle: "Светлые стены, дерево, встроенные системы хранения",
      multiplier: 1.0,
      tag: "Базовый класс",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "japandi",
      title: "Тёплый Japandi",
      subtitle: "Натуральный камень, микроцемент, тактильные фактуры",
      multiplier: 1.15,
      tag: "Хит 2026",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "neoclassic",
      title: "Современная неоклассика",
      subtitle: "Молдинги, паркет «ёлочка», латунные акценты и свет",
      multiplier: 1.24,
      tag: "Бизнес+",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "luxury",
      title: "Авторский премиум",
      subtitle: "Сложные узлы, теневые профили, натуральный мрамор",
      multiplier: 1.38,
      tag: "Индивидуально",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80"
    }
  ],

  extraOptions: [
    {
      id: "design_project",
      title: "Дизайн-проект + 3D-визуализация",
      desc: "Чертежи для строителей, подбор мебели и ведомость материалов",
      pricePerSqm: 3200,
      flatPrice: 0
    },
    {
      id: "climate_floor",
      title: "Тёплые полы и климат-контроль",
      desc: "Кондиционирование, приточная вентиляция и терморегуляторы",
      pricePerSqm: 2100,
      flatPrice: 45000
    },
    {
      id: "smart_home",
      title: "Умный дом и сценарии света",
      desc: "Управление светом, шторами и защитой от протечек со смартфона",
      pricePerSqm: 1800,
      flatPrice: 60000
    },
    {
      id: "soundproof",
      title: "Акустическая шумоизоляция",
      desc: "Многослойная защита спальни и детской от шума соседей",
      pricePerSqm: 2400,
      flatPrice: 0
    },
    {
      id: "procurement",
      title: "Комплектация и закупка материалов",
      desc: "Берём на себя доставку, подъём и оптовые скидки у поставщиков",
      pricePerSqm: 0,
      flatPrice: 75000
    }
  ],

  timelines: [
    { id: "asap", label: "В ближайшие 2 недели" },
    { id: "month", label: "В течение 1–2 месяцев" },
    { id: "keys", label: "Жду ключи (через 3–6 мес)" },
    { id: "explore", label: "Пока планирую бюджет" }
  ],

  bonuses: [
    {
      id: "discount7",
      title: "Скидка −7% на все работы",
      subtitle: "Сразу вычитается из итоговой сметы",
      discountPercent: 7
    },
    {
      id: "tech_project",
      title: "Технический дизайн-проект в подарок",
      subtitle: "Экономия до 95 000 ₽ на планировке и электрике",
      discountPercent: 4
    },
    {
      id: "audit_cleaning",
      title: "Приёмка квартиры + финальный клининг",
      subtitle: "Инженер проверит квартиру от застройщика бесплатно",
      discountPercent: 5
    }
  ]
};

export const STEP_LABELS = {
  1: "Тип объекта",
  2: "Площадь и высота",
  3: "Стиль интерьера",
  4: "Инженерные опции",
  5: "Сроки и бонус",
  6: "Готовая смета"
};
