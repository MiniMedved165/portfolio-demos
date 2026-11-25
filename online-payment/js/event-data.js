export const TICKET_TIERS = [
  {
    id: "online",
    name: "Online Pass",
    subtitle: "4K-трансляция всех 3 сцен, чат участников и доступ к записям на 6 месяцев.",
    price: 4900,
    elevated: false,
    badge: "Удалённо",
    iconSvg: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>`,
    visualHtml: `
      <div class="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-obsidian-950 mt-auto">
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80" alt="Online Pass" class="w-full h-full object-cover grayscale contrast-125 opacity-80" onerror="this.src='https://placehold.co/480x260/111/FF4D00?text=ONLINE'">
        <div class="absolute inset-0 bg-gradient-to-tr from-flame/50 via-transparent to-transparent mix-blend-screen"></div>
      </div>`
  },
  {
    id: "pro",
    name: "Pro Pass",
    subtitle: "Личное участие в Artplay (2 дня), доступ ко всем сценам, экспо-зоне и записям.",
    price: 12900,
    elevated: true,
    badge: "Популярный",
    iconSvg: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2L15 8.5L22 9.3L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.3L9 8.5L12 2Z"/></svg>`,
    visualHtml: `
      <div class="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-obsidian-950 mt-auto">
        <img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80" alt="Pro Pass" class="w-full h-full object-cover grayscale contrast-125 opacity-85" onerror="this.src='https://placehold.co/480x260/111/FF4D00?text=PRO+PASS'">
        <div class="absolute inset-0 bg-gradient-to-t from-obsidian-950/70 via-transparent to-transparent"></div>
      </div>`
  },
  {
    id: "vip",
    name: "VIP Backstage",
    subtitle: "Первые ряды, закрытый ужин со спикерами, AI-воркшоп и отдельный лаунж.",
    price: 29900,
    elevated: false,
    badge: "12 мест",
    iconSvg: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>`,
    visualHtml: `
      <div class="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-obsidian-950 mt-auto flex items-center justify-center">
        <div class="w-32 h-32 rounded-full" style="background: radial-gradient(circle at 38% 35%, #FFA452 0%, #FF4D00 48%, #2E0900 84%, #090909 100%); box-shadow: 0 0 42px rgba(255,77,0,0.45);"></div>
      </div>`
  }
];

export const SPEAKERS_PAGES = [
  [
    {
      name: "Артём Громов",
      role: "Дизайн-директор · Visual Identity",
      topic: "Типографика и смелые дизайн-системы 2027",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80"
    },
    {
      name: "Вероника Ли",
      role: "Lead Product · Digital Experience",
      topic: "Микроанимации, которые повышают конверсию",
      image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=700&q=80"
    },
    {
      name: "Максим Орлов",
      role: "AI Creative Lead · Motion & 3D",
      topic: "Генеративный продакшн в реальных кампаниях",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80"
    }
  ],
  [
    {
      name: "Дарья Князева",
      role: "Head of Brand · Art Direction",
      topic: "Как строить узнаваемый бренд без шаблонов",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80"
    },
    {
      name: "Илья Соколов",
      role: "Principal Engineer · WebGL",
      topic: "Интерактивный 3D-веб на 60 FPS на смартфонах",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80"
    },
    {
      name: "Елена Маркова",
      role: "Founder · Product Strategy",
      topic: "Экономика дизайн-студий и подписочные модели",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80"
    }
  ]
];

export const PROMO_CODES = {
  EARLY20: { percent: 20, label: "Ранняя птица −20%" },
  MOTION10: { percent: 10, label: "Промокод −10%" }
};

export const WORKSHOP_PRICE = 3500;

export const HERO_SCENES = [
  {
    eyebrow: "18–19 Декабря · Москва · Artplay",
    copy: "Ежегодная конференция, где смелые идеи, дизайн и генеративный AI превращаются в реальные цифровые продукты.",
    speed: 1.0,
    tilt: 0
  },
  {
    eyebrow: "Сцена 02 · Product & Design Systems",
    copy: "Живые разборы дизайн-систем, микроанимаций и интерфейсов, которые кратно повышают конверсию продуктов.",
    speed: 1.25,
    tilt: 0.14
  },
  {
    eyebrow: "Сцена 03 · Motion, 3D & Generative AI",
    copy: "Практические воркшопы по генеративному продакшену, WebGL-сценам и креативным пайплайнам 2026 года.",
    speed: 1.45,
    tilt: -0.12
  }
];
