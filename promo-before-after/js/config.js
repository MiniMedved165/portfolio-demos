export const SITE_CONFIG = {
  brandName: "KRONOS DETAIL",
  scenarios: [
    {
      id: "polish_ceramic",
      serviceId: "ceramic",
      tabNum: "01",
      tabLabel: "Полировка + 9H",
      indexTag: "КЕЙС 01 · ЛАКОКРАСОЧНОЕ ПОКРЫТИЕ",
      carModel: "Mercedes-Benz S-Class",
      title: "Восстановительная полировка + Керамика 9H",
      desc: "Удалили глубокую «паутинку» после поточных моек, голограммы и белёсый водный камень. Вернули глубину чёрного лака тремя слоями керамики SiO₂.",
      imageUrl: "https://images.pexels.com/photos/18369293/pexels-photo-18369293.jpeg?auto=compress&cs=tinysrgb&w=1400",
      beforeFilterClass: "compare-before-paint",
      afterFilterClass: "compare-after-paint",
      defectOverlayClass: "defect-overlay-paint",
      beforeCallout: "ДО: паутинка, голограммы и окисленный лак (48 GU)",
      afterCallout: "ПОСЛЕ: глубокий чёрный + керамика 9H (97 GU)",
      metric1Label: "Индекс глянца",
      metric1Before: "48",
      metric1After: "97 GU",
      metric2Label: "Гидрофобный угол",
      metric2Value: "115° · 2 дня",
      priceLabel: "от 38 000 ₽",
      works: [
        "3-фазная деконтаминация кузова от битума и металла",
        "Многоступенчатая полировка Rupes без перегрева лака",
        "Нанесение 3 слоёв керамики 9H + ИК-сушка"
      ]
    },
    {
      id: "interior_clean",
      serviceId: "interior",
      tabNum: "02",
      tabLabel: "Химчистка салона",
      indexTag: "КЕЙС 02 · САЛОН И КОЖА NAPPA",
      carModel: "Audi Q8 S-Line",
      title: "Детейлинг-химчистка и консервация кожи",
      desc: "Убрали засаленный налёт, пылевую дымку и пятна на сиденьях, очистили швы и перфорацию, вернули заводской глубокий матовый финиш кожи.",
      imageUrl: "https://images.pexels.com/photos/34695453/pexels-photo-34695453.jpeg?auto=compress&cs=tinysrgb&w=1400",
      beforeFilterClass: "compare-before-interior",
      afterFilterClass: "compare-after-interior",
      defectOverlayClass: "defect-overlay-interior",
      beforeCallout: "ДО: засаленность, пыль в порах и разводы",
      afterCallout: "ПОСЛЕ: чистая матовая кожа Nappa + озонация",
      metric1Label: "Чистота пор кожи",
      metric1Before: "34%",
      metric1After: "99% мат",
      metric2Label: "Озонация салона",
      metric2Value: "Включена · 1 день",
      priceLabel: "от 16 000 ₽",
      works: [
        "Деликатная чистка кожи Nappa и алькантары",
        "Пропитка антистатическим матовым кремом",
        "Озонирование и устранение запахов в воздуховодах"
      ]
    },
    {
      id: "optics_ppf",
      serviceId: "polish",
      tabNum: "03",
      tabLabel: "Оптика и PPF",
      indexTag: "КЕЙС 03 · ОПТИКА И БРОНЕПЛЁНКА",
      carModel: "Mercedes-AMG GT",
      title: "Полировка оптики и оклейка плёнкой PPF",
      desc: "Сняли мутный пожелтевший слой и следы трассового пескоструя с фар, восстановили хрустальную прозрачность и защитили полиуретаном 200 мкм.",
      imageUrl: "https://images.pexels.com/photos/12152821/pexels-photo-12152821.jpeg?auto=compress&cs=tinysrgb&w=1400",
      beforeFilterClass: "compare-before-optics",
      afterFilterClass: "compare-after-optics",
      defectOverlayClass: "defect-overlay-optics",
      beforeCallout: "ДО: помутнение, желтизна и пескоструй (61%)",
      afterCallout: "ПОСЛЕ: хрустальная прозрачность + PPF 200 мкм",
      metric1Label: "Светосила фар",
      metric1Before: "61%",
      metric1After: "99% PPF",
      metric2Label: "Толщина плёнки",
      metric2Value: "200 мкм · 1 день",
      priceLabel: "от 24 000 ₽",
      works: [
        "Шлифовка и прозрачная полировка поликарбоната",
        "Оклейка фар и капота самовосстанавливающейся плёнкой",
        "Гарантия от пожелтения и сколов — 5 лет"
      ]
    },
    {
      id: "wheels_detail",
      serviceId: "wash",
      tabNum: "04",
      tabLabel: "Диски и суппорты",
      indexTag: "КЕЙС 04 · ДИСКИ И ТОРМОЗНАЯ СИСТЕМА",
      carModel: "Спорткупе · Кованые диски",
      title: "Детейлинг дисков, арок и термокерамика",
      desc: "Очистили кованые диски и суппорты со снятием от въевшейся бурой тормозной пыли и битума, покрыли термостойкой керамикой до 800°C.",
      imageUrl: "https://images.pexels.com/photos/31853158/pexels-photo-31853158.jpeg?auto=compress&cs=tinysrgb&w=1400",
      beforeFilterClass: "compare-before-wheels",
      afterFilterClass: "compare-after-wheels",
      defectOverlayClass: "defect-overlay-wheels",
      beforeCallout: "ДО: въевшаяся тормозная пыль, нагар и битум",
      afterCallout: "ПОСЛЕ: чистый металл + термокерамика 800°C",
      metric1Label: "Термозащита",
      metric1Before: "0°C",
      metric1After: "до 800°C",
      metric2Label: "Срок работы",
      metric2Value: "6 часов",
      priceLabel: "от 9 500 ₽",
      works: [
        "Снятие колёс и глубокая чистка внутренних полок",
        "Очистка суппортов, подвески и арок паром",
        "Консервация резины с сатиновым эффектом"
      ]
    }
  ],
  services: [
    {
      id: "wash",
      title: "Комплексная мойка",
      subtitle: "3-фазная детейлинг-мойка и чистота в каждой детали",
      basePrice: 6500,
      duration: "3–4 часа",
      imageUrl: "https://images.pexels.com/photos/7530997/pexels-photo-7530997.jpeg?auto=compress&cs=tinysrgb&w=900"
    },
    {
      id: "interior",
      title: "Химчистка салона",
      subtitle: "Свежесть, озонация и бережный уход за кожей",
      basePrice: 16000,
      duration: "1 день",
      imageUrl: "https://images.pexels.com/photos/6873185/pexels-photo-6873185.jpeg?auto=compress&cs=tinysrgb&w=900"
    },
    {
      id: "polish",
      title: "Полировка кузова",
      subtitle: "Удаление царапин, паутинки и глубокий глянец",
      basePrice: 24000,
      duration: "1–2 дня",
      imageUrl: "https://images.pexels.com/photos/6870296/pexels-photo-6870296.jpeg?auto=compress&cs=tinysrgb&w=900"
    },
    {
      id: "ceramic",
      title: "Нанесение керамики",
      subtitle: "Долговременная защита 9H и гидрофобный эффект",
      basePrice: 38000,
      duration: "2 дня",
      imageUrl: "https://images.pexels.com/photos/14231701/pexels-photo-14231701.jpeg?auto=compress&cs=tinysrgb&w=900"
    }
  ],
  carClasses: [
    { id: "sedan", label: "Седан / Купе", multiplier: 1.0 },
    { id: "crossover", label: "Кроссовер", multiplier: 1.15 },
    { id: "suv", label: "Внедорожник", multiplier: 1.3 },
    { id: "sport", label: "Спорт / Люкс", multiplier: 1.25 }
  ],
  timeSlots: [
    "Сегодня · 16:00",
    "Завтра · 11:00",
    "Завтра · 15:30",
    "Выходные · 12:00"
  ]
};
