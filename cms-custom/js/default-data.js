export const STORAGE_KEY = "korka_kofe_cms_demo_v1";

export const PRESET_IMAGES = [
  {
    label: "Круассан",
    url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80"
  },
  {
    label: "Панкейки",
    url: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80"
  },
  {
    label: "Кофе латте",
    url: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80"
  },
  {
    label: "Десерт",
    url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
  }
];

export const DEFAULT_CMS_DATA = {
  texts: {
    heroBadge: "Свежая выпечка с 07:30 · Скидка 15% до 10:00",
    heroLine1: "ВКУСНЫЕ УТРА",
    heroScript: "начинаются",
    heroLine2: "ЗДЕСЬ",
    heroSubtitle:
      "Ремесленные круассаны на сливочном масле, тёплые панкейки с бельгийским шоколадом и кофе свежей обжарки. Попробуйте изменить любой текст или цену через гостевую админку справа!",
    featuredTitle: "БРИОШЬ С СОЛЁНОЙ КАРАМЕЛЬЮ И ПЕКАНОМ",
    featuredDesc:
      "Нежнейшее сливочное тесто на живой закваске, тёплая домашняя карамель с морской солью и хрустящий карамелизированный орех пекан. Выпекаем малыми партиями каждые два часа.",
    featuredPrice: 390,
    manifestoQuote:
      "ЕСТЬ ВЕЩИ, КОТОРЫЕ ОСТАЮТСЯ НАВСЕГДА. НО ЗАВТРАК НЕ ДОЛЖЕН БЫТЬ ОДНОЙ ИЗ НИХ.",
    manifestoNote:
      "Выпекаем с 06:00 каждый день · Этот текст тоже можно отредактировать в админке",
    footerAddress: "г. Москва, ул. Хлебная, д. 12 · Ежедневно 07:30 — 22:00"
  },
  categories: [
    { id: "all", label: "Всё меню" },
    { id: "bakery", label: "Выпечка" },
    { id: "breakfast", label: "Завтраки" },
    { id: "coffee", label: "Спешелти кофе" },
    { id: "desserts", label: "Десерты" }
  ],
  menu: [
    {
      id: "item-1",
      category: "breakfast",
      title: "Панкейки с горячим шоколадом и бананом",
      desc: "Пышные сливочные панкейки, политые тёплым бельгийским ганашем и дроблёным фундуком.",
      weight: "240 г",
      price: 490,
      oldPrice: 560,
      badge: "Хит утра",
      visible: true,
      image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "item-2",
      category: "bakery",
      title: "Миндальный круассан на закваске",
      desc: "Хрустящее слоёное тесто, нежный миндальный франжипан внутри и лепестки жареного миндаля.",
      weight: "135 г",
      price: 340,
      oldPrice: 0,
      badge: "Свежий",
      visible: true,
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "item-3",
      category: "coffee",
      title: "Раф «Пряная карамель и ваниль»",
      desc: "Двойной эспрессо на зерне Эфиопия, натуральные сливки и домашняя бурбонская ваниль.",
      weight: "350 мл",
      price: 360,
      oldPrice: 0,
      badge: "Выбор бариста",
      visible: true,
      image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "item-4",
      category: "breakfast",
      title: "Бельгийская вафля с ягодами и маскарпоне",
      desc: "Воздушная вафля, взбитый крем маскарпоне, свежая голубика, клубника и кленовый сироп.",
      weight: "210 г",
      price: 460,
      oldPrice: 0,
      badge: "Новинка",
      visible: true,
      image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "item-5",
      category: "desserts",
      title: "Шоколадный тарт с морской солью",
      desc: "Песочная основа с какао, плотный ганаш из 70% тёмного шоколада и кристаллы соли Maldon.",
      weight: "140 г",
      price: 410,
      oldPrice: 450,
      badge: "Скидка",
      visible: true,
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "item-6",
      category: "coffee",
      title: "Флэт Уайт на зерне Бразилия",
      desc: "Насыщенный баланс молочного шоколада, жареного ореха и шелковистой микропены.",
      weight: "220 мл",
      price: 290,
      oldPrice: 0,
      badge: "",
      visible: true,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
    }
  ]
};
