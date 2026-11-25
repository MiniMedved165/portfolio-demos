export const PERIODS = {
  weekend: {
    id: "weekend",
    shortLabel: "Выходные",
    label: "Ближайшие выходные (Пт–Вс)",
    datesText: "12–14 декабря",
    nights: 2,
    priceMultiplier: 1.0
  },
  weekdays: {
    id: "weekdays",
    shortLabel: "Будни −20%",
    label: "Будни в лесу (Вт–Чт)",
    datesText: "16–18 декабря",
    nights: 2,
    priceMultiplier: 0.8
  },
  long: {
    id: "long",
    shortLabel: "3 ночи",
    label: "Длинный уикенд (Чт–Вс)",
    datesText: "18–21 декабря",
    nights: 3,
    priceMultiplier: 0.95
  }
};

export const STATUS_META = {
  free: { label: "Свободно", color: "#36B36E", badgeBg: "bg-[#36B36E]/15 text-[#175B36] border-[#36B36E]/35" },
  hold: { label: "Бронь", color: "#E09A43", badgeBg: "bg-[#E09A43]/20 text-[#7A4A10] border-[#E09A43]/40" },
  busy: { label: "Занято", color: "#B6665C", badgeBg: "bg-[#B6665C]/18 text-[#752F28] border-[#B6665C]/35" }
};

export const CABINS = [
  {
    id: "c1",
    number: "№1",
    name: "Классический A-Frame №1",
    zone: "Сосновая опушка",
    area: "42 м²",
    capacity: 4,
    basePrice: 14900,
    features: ["tub", "fireplace"],
    amenities: ["Купель фурако", "Живой камин", "Панорамные окна", "Винил и проектор"],
    desc: "Самый уединённый треугольный домик в северной части бора. Собственная терраса с кедровой купелью и видом на высокие корабельные сосны.",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=85",
    coords: { x: 162, y: 158 },
    availability: { weekend: "free", weekdays: "free", long: "hold" }
  },
  {
    id: "c2",
    number: "№2",
    name: "Хвойный домик №2",
    zone: "Центральный бор",
    area: "38 м²",
    capacity: 2,
    basePrice: 12900,
    features: ["fireplace"],
    amenities: ["Живой камин", "Терраса с гамаком", "Проектор", "Кофемашина"],
    desc: "Камерный домик для двоих с тёплым скандинавским интерьером, антресолью под самой крышей и собственной костровой чашей.",
    image: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=900&q=85",
    coords: { x: 294, y: 128 },
    availability: { weekend: "hold", weekdays: "free", long: "free" }
  },
  {
    id: "c3",
    number: "№3",
    name: "Изумрудный A-Frame №3",
    zone: "Береговая линия",
    area: "48 м²",
    capacity: 4,
    basePrice: 16900,
    features: ["tub", "lake", "fireplace"],
    amenities: ["Вид на озеро", "Купель фурако", "Камин на дровах", "Мангальная зона"],
    desc: "Флагманский домик с прямым видом на лесное озеро и деревянный пирс. Идеален для закатов в горячей купели под звёздами.",
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=85",
    coords: { x: 468, y: 126 },
    availability: { weekend: "free", weekdays: "free", long: "busy" }
  },
  {
    id: "c4",
    number: "№4",
    name: "Прибрежный Барнхаус №4",
    zone: "У воды и пирса",
    area: "56 м²",
    capacity: 4,
    basePrice: 18500,
    features: ["tub", "lake", "sauna"],
    amenities: ["Личная сауна", "Вид на озеро", "Купель фурако", "Полноценная кухня"],
    desc: "Просторный барнхаус на первой линии у воды с собственной мини-сауной внутри и панорамным остеклением в пол.",
    image: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=85",
    coords: { x: 556, y: 196 },
    availability: { weekend: "busy", weekdays: "hold", long: "free" }
  },
  {
    id: "c5",
    number: "№5",
    name: "Кедровый домик №5",
    zone: "Тихая поляна",
    area: "40 м²",
    capacity: 3,
    basePrice: 13900,
    features: ["fireplace"],
    amenities: ["Живой камин", "Своя костровая", "Тёплые полы", "Pet-friendly"],
    desc: "Тёплый дом с ароматом натурального кедра, просторной верандой и отдельной лужайкой — особенно любим гостями с собаками.",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=900&q=85",
    coords: { x: 214, y: 274 },
    availability: { weekend: "free", weekdays: "free", long: "free" }
  },
  {
    id: "c6",
    number: "№6",
    name: "Терракотовый A-Frame №6",
    zone: "Южный склон",
    area: "44 м²",
    capacity: 4,
    basePrice: 15500,
    features: ["tub", "fireplace"],
    amenities: ["Купель фурако", "Винил и проектор", "Камин", "Костровая зона"],
    desc: "Стильный домик с тёплым терракотовым фасадом, большим панорамным окном на закатную сторону и просторной купелью.",
    image: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=900&q=85",
    coords: { x: 230, y: 410 },
    availability: { weekend: "free", weekdays: "free", long: "hold" }
  },
  {
    id: "c7",
    number: "№7",
    name: "Сканди-лофт №7",
    zone: "У сосновой аллеи",
    area: "68 м²",
    capacity: 6,
    basePrice: 21900,
    features: ["tub", "sauna", "fireplace"],
    amenities: ["2 спальни + лофт", "Купель на 6 чел", "Личная сауна", "Большой стол"],
    desc: "Большой семейный дом для компании до 6 гостей: две изолированные спальни, просторная гостиная с камином и большая терраса.",
    image: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=900&q=85",
    coords: { x: 486, y: 416 },
    availability: { weekend: "hold", weekdays: "free", long: "free" }
  },
  {
    id: "c8",
    number: "№8",
    name: "Озёрный A-Frame №8",
    zone: "Южный берег озера",
    area: "46 м²",
    capacity: 4,
    basePrice: 16500,
    features: ["lake", "tub", "fireplace"],
    amenities: ["Выход к озеру", "Купель фурако", "Камин", "Подвесное кресло"],
    desc: "Уединённый уголок в самом конце тропы с прямым спуском к воде и тихой террасой, скрытой ветвями сосен.",
    image: "https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?auto=format&fit=crop&w=900&q=85",
    coords: { x: 616, y: 344 },
    availability: { weekend: "free", weekdays: "busy", long: "free" }
  }
];

/**
 * Escapes HTML special characters to prevent XSS in dynamic templates.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Computes rounded nightly rate for a cabin based on active period multiplier.
 * @param {object} cabin
 * @param {string} activePeriod
 * @returns {number}
 */
export function getNightPrice(cabin, activePeriod) {
  const mult = PERIODS[activePeriod]?.priceMultiplier || 1;
  return Math.round((cabin.basePrice * mult) / 100) * 100;
}

export function getCabinStatus(cabin, activePeriod) {
  return cabin.availability[activePeriod] || "free";
}

export function formatRub(val) {
  return `${Math.round(val).toLocaleString("ru-RU")} ₽`;
}

/**
 * Checks whether a cabin matches active status, feature, and guest count filters.
 * @param {object} cabin
 * @param {object} state
 * @returns {boolean}
 */
export function matchesFilters(cabin, state) {
  const status = getCabinStatus(cabin, state.activePeriod);
  const okStatus = state.statusFilter === "all" || status === state.statusFilter;
  const okFeature = state.featureFilter === "all" || cabin.features.includes(state.featureFilter);
  const okGuests = cabin.capacity >= state.guestCount;
  return okStatus && okFeature && okGuests;
}
