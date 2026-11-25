/**
 * Fleet catalog cards with geometric SVG schematics.
 */
export const FLEET_DATA = [
  {
    id: "gazel",
    name: "Фургон / Газель Next",
    badge: "Город и экспресс",
    capacity: "1.5 – 2.5 т",
    volume: "16 – 22 м³",
    pallets: "6–8 паллет",
    price: "от 1 150 ₽/час",
    dims: "4.2 × 2.1 × 2.2 м",
    svg: `
      <svg viewBox="0 0 280 110" class="w-full h-24 text-ink-900" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <path d="M24 78 H210 L236 78 C242 78 246 74 246 68 V54 L224 34 H184 V78" />
        <rect x="24" y="24" width="160" height="54" rx="4" fill="#EEF3FF" stroke="#0044FF" />
        <path d="M192 40 H218 L234 54 H192 V40 Z" fill="#FFFFFF" />
        <circle cx="72" cy="82" r="11" fill="#FFFFFF" stroke="#0E1116" stroke-width="2.2" />
        <circle cx="72" cy="82" r="4" fill="#0E1116" />
        <circle cx="212" cy="82" r="11" fill="#FFFFFF" stroke="#0E1116" stroke-width="2.2" />
        <circle cx="212" cy="82" r="4" fill="#0E1116" />
        <line x1="24" y1="14" x2="184" y2="14" stroke="#8992A3" stroke-dasharray="3 3" stroke-width="1.2" />
        <text x="104" y="11" text-anchor="middle" font-size="9" font-family="JetBrains Mono" fill="#5A6270" stroke="none">4.2 м · 16–22 м³</text>
      </svg>`
  },
  {
    id: "solo5",
    name: "Одиночка с гидробортом",
    badge: "Складская логистика",
    capacity: "5 – 10 т",
    volume: "36 – 45 м³",
    pallets: "15–18 паллет",
    price: "от 44 ₽/км",
    dims: "7.2 × 2.45 × 2.5 м",
    svg: `
      <svg viewBox="0 0 280 110" class="w-full h-24 text-ink-900" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <rect x="18" y="20" width="174" height="58" rx="4" fill="#F2F4F8" stroke="#0E1116" />
        <path d="M192 32 H234 L250 52 V78 H192 V32 Z" />
        <path d="M202 38 H228 L240 52 H202 V38 Z" fill="#FFFFFF" />
        <path d="M14 78 H18 V58" stroke="#0044FF" stroke-width="2.4" />
        <circle cx="62" cy="82" r="11" fill="#FFFFFF" stroke="#0E1116" stroke-width="2.2" />
        <circle cx="158" cy="82" r="11" fill="#FFFFFF" stroke="#0E1116" stroke-width="2.2" />
        <circle cx="226" cy="82" r="11" fill="#FFFFFF" stroke="#0E1116" stroke-width="2.2" />
        <text x="105" y="12" text-anchor="middle" font-size="9" font-family="JetBrains Mono" fill="#5A6270" stroke="none">7.2 м · Гидроборт 1.5 т</text>
      </svg>`
  },
  {
    id: "euro20",
    name: "Еврофура 20т (Тент / Штора)",
    badge: "Магистрали РФ",
    capacity: "до 20 т",
    volume: "82 – 92 м³",
    pallets: "33 европаллета",
    price: "от 58 ₽/км",
    dims: "13.6 × 2.48 × 2.7 м",
    svg: `
      <svg viewBox="0 0 280 110" class="w-full h-24 text-ink-900" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <rect x="14" y="18" width="186" height="58" rx="3" fill="#EEF3FF" stroke="#0044FF" />
        <line x1="76" y1="18" x2="76" y2="76" stroke="#0044FF" stroke-opacity="0.3" stroke-width="1.2" />
        <line x1="138" y1="18" x2="138" y2="76" stroke="#0044FF" stroke-opacity="0.3" stroke-width="1.2" />
        <path d="M206 28 H246 L262 50 V76 H206 V28 Z" />
        <path d="M214 34 H240 L252 50 H214 V34 Z" fill="#FFFFFF" />
        <circle cx="48" cy="82" r="9.5" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <circle cx="72" cy="82" r="9.5" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <circle cx="96" cy="82" r="9.5" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <circle cx="192" cy="82" r="9.5" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <circle cx="242" cy="82" r="9.5" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <text x="107" y="11" text-anchor="middle" font-size="9" font-family="JetBrains Mono" fill="#0044FF" stroke="none">13.6 м · 33 европаллета</text>
      </svg>`
  },
  {
    id: "ref",
    name: "Рефрижератор 20т (FRC)",
    badge: "Терморежим -20…+12°C",
    capacity: "до 20 т",
    volume: "86 м³",
    pallets: "33 европаллета",
    price: "от 69 ₽/км",
    dims: "13.4 × 2.46 × 2.6 м",
    svg: `
      <svg viewBox="0 0 280 110" class="w-full h-24 text-ink-900" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <rect x="14" y="18" width="186" height="58" rx="3" fill="#F2F4F8" stroke="#0E1116" />
        <rect x="184" y="22" width="14" height="24" rx="2" fill="#0044FF" stroke="#0044FF" />
        <path d="M206 28 H246 L262 50 V76 H206 V28 Z" />
        <path d="M214 34 H240 L252 50 H214 V34 Z" fill="#FFFFFF" />
        <circle cx="48" cy="82" r="9.5" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <circle cx="72" cy="82" r="9.5" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <circle cx="96" cy="82" r="9.5" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <circle cx="192" cy="82" r="9.5" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <circle cx="242" cy="82" r="9.5" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <text x="102" y="50" text-anchor="middle" font-size="11" font-weight="700" font-family="JetBrains Mono" fill="#0044FF" stroke="none">-20°C … +12°C</text>
      </svg>`
  },
  {
    id: "tral",
    name: "Низкорамный трал",
    badge: "Негабаритные грузы",
    capacity: "до 65 т",
    volume: "Спецплощадка",
    pallets: "Длина до 16 м",
    price: "по расчёту маршрута",
    dims: "Погрузочная высота 0.6 м",
    svg: `
      <svg viewBox="0 0 280 110" class="w-full h-24 text-ink-900" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 70 H148 L170 46 H204 V56 H172 L152 76 H16 V70 Z" fill="#EEF3FF" stroke="#0044FF" />
        <rect x="46" y="42" width="76" height="28" rx="3" fill="#0E1116" fill-opacity="0.08" stroke="#0E1116" stroke-dasharray="4 3" />
        <path d="M206 28 H246 L262 50 V76 H206 V28 Z" />
        <path d="M214 34 H240 L252 50 H214 V34 Z" fill="#FFFFFF" />
        <circle cx="34" cy="82" r="8" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <circle cx="54" cy="82" r="8" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <circle cx="74" cy="82" r="8" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <circle cx="94" cy="82" r="8" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <circle cx="192" cy="82" r="9.5" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <circle cx="242" cy="82" r="9.5" fill="#FFFFFF" stroke="#0E1116" stroke-width="2" />
        <text x="84" y="34" text-anchor="middle" font-size="9" font-family="JetBrains Mono" fill="#5A6270" stroke="none">Спецтехника до 65 т</text>
      </svg>`
  }
];
