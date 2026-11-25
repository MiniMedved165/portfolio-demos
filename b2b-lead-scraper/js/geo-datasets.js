export const CITIES = {
  msk: {
    name: "Москва",
    coords: "55.7558° N, 37.6173° E",
    districts: ["ЦАО · Пресня", "Хамовники", "Басманный", "Замоскворечье", "Тверской", "Даниловский"],
    streets: ["ул. Покровка", "ул. Пятницкая", "Ленинградский пр-т", "ул. Большая Никитская", "ул. Мясницкая", "ул. Шаболовка"]
  },
  spb: {
    name: "Санкт-Петербург",
    coords: "59.9311° N, 30.3609° E",
    districts: ["Центральный", "Петроградский", "Василеостровский", "Адмиралтейский", "Московский", "Выборгский"],
    streets: ["Невский пр-т", "ул. Рубинштейна", "Большой пр. П.С.", "наб. реки Мойки", "Лиговский пр-т", "ул. Жуковского"]
  },
  kzn: {
    name: "Казань",
    coords: "55.7961° N, 49.1064° E",
    districts: ["Вахитовский", "Ново-Савиновский", "Приволжский", "Советский", "Московский", "Кировский"],
    streets: ["ул. Баумана", "ул. Кремлёвская", "ул. Пушкина", "пр-т Ямашева", "ул. Чистопольская", "ул. Петербургская"]
  },
  ekb: {
    name: "Екатеринбург",
    coords: "56.8389° N, 60.6057° E",
    districts: ["Центр", "Ленинский", "Верх-Исетский", "Октябрьский", "Кировский", "Академический"],
    streets: ["пр-т Ленина", "ул. Малышева", "ул. Вайнера", "ул. Бориса Ельцина", "ул. Белинского", "ул. Радищева"]
  },
  nsk: {
    name: "Новосибирск",
    coords: "55.0084° N, 82.9357° E",
    districts: ["Центральный", "Железнодорожный", "Заельцовский", "Октябрьский", "Советский", "Ленинский"],
    streets: ["Красный пр-т", "ул. Ленина", "ул. Советская", "ул. Гоголя", "ул. Фрунзе", "Вокзальная магистраль"]
  }
};

export const RUBRICS = {
  coffee: {
    label: "Кофейни и пекарни (HoReCa)",
    short: "Кофейня / Пекарня",
    hours: "07:30 – 22:00",
    companies: [
      { name: "Зерно и Пар", domain: "zerno-par.example.ru", email: "buy@zerno-par.example.ru", rating: 4.9, reviews: 312, tg: true, wa: true },
      { name: "Ростер №4", domain: "roster4.example.ru", email: "coffee@roster4.example.ru", rating: 4.8, reviews: 184, tg: true, wa: false },
      { name: "Пекарня «Тёплая Корка»", domain: "korka-bake.example.ru", email: "supply@korka-bake.example.ru", rating: 4.7, reviews: 245, tg: false, wa: true },
      { name: "КофеБар «Север»", domain: null, email: null, rating: 4.4, reviews: 89, tg: true, wa: false },
      { name: "Эспрессо Мастерская", domain: "espresso-lab.example.ru", email: "hello@espresso-lab.example.ru", rating: 4.9, reviews: 420, tg: true, wa: true },
      { name: "Булочная на Углу", domain: null, email: null, rating: 4.2, reviews: 64, tg: false, wa: true },
      { name: "Флэт & Круассан", domain: "flat-croissant.example.ru", email: "zakup@flat-croissant.example.ru", rating: 4.8, reviews: 198, tg: true, wa: true },
      { name: "Спешелти Дом «Бру»", domain: "brew-house.example.ru", email: "bar@brew-house.example.ru", rating: 4.6, reviews: 152, tg: true, wa: false },
      { name: "Утро Кофе", domain: "utro-coffee.example.ru", email: "info@utro-coffee.example.ru", rating: 4.5, reviews: 117, tg: false, wa: true },
      { name: "Кондитерская «Ваниль»", domain: "vanil-cake.example.ru", email: "orders@vanil-cake.example.ru", rating: 4.7, reviews: 276, tg: true, wa: true },
      { name: "Кофейная точка «Шот»", domain: null, email: null, rating: 4.1, reviews: 43, tg: false, wa: false },
      { name: "Арт-Кофейня «Обжарка»", domain: "obzharka.example.ru", email: "partners@obzharka.example.ru", rating: 4.9, reviews: 368, tg: true, wa: true }
    ]
  },
  horeca: {
    label: "Рестораны и отели",
    short: "Ресторан / Отель",
    hours: "11:00 – 23:30",
    companies: [
      { name: "Бистро «Море и Соль»", domain: "more-sol.example.ru", email: "info@more-sol.example.ru", rating: 4.8, reviews: 510, tg: true, wa: true },
      { name: "Бутик-отель «Атриум»", domain: "atrium-hotel.example.ru", email: "booking@atrium-hotel.example.ru", rating: 4.9, reviews: 640, tg: true, wa: true },
      { name: "Гастробар «Печь»", domain: "pech-bar.example.ru", email: "chef@pech-bar.example.ru", rating: 4.6, reviews: 295, tg: true, wa: false },
      { name: "Остерия «Ла Вита»", domain: "lavita-rest.example.ru", email: "admin@lavita-rest.example.ru", rating: 4.7, reviews: 412, tg: false, wa: true },
      { name: "Апарт-отель «Резиденция»", domain: "rezid-apart.example.ru", email: "ops@rezid-apart.example.ru", rating: 4.5, reviews: 188, tg: true, wa: true },
      { name: "Гриль-хаус «Угли»", domain: null, email: null, rating: 4.3, reviews: 134, tg: false, wa: true },
      { name: "Ресторан «Веранда»", domain: "veranda-food.example.ru", email: "supply@veranda-food.example.ru", rating: 4.8, reviews: 390, tg: true, wa: true },
      { name: "Лаунж-бар «Высота»", domain: "vysota-bar.example.ru", email: "events@vysota-bar.example.ru", rating: 4.4, reviews: 210, tg: true, wa: false },
      { name: "Сити-Отель «Квартал»", domain: "kvartal-stay.example.ru", email: "front@kvartal-stay.example.ru", rating: 4.6, reviews: 324, tg: true, wa: true },
      { name: "Кафе «Сезон»", domain: null, email: null, rating: 4.2, reviews: 98, tg: false, wa: false },
      { name: "Винный бар «Лоза»", domain: "loza-wine.example.ru", email: "hello@loza-wine.example.ru", rating: 4.9, reviews: 455, tg: true, wa: true },
      { name: "Стейк-клуб «Прайм»", domain: "prime-steak.example.ru", email: "zakup@prime-steak.example.ru", rating: 4.7, reviews: 318, tg: true, wa: true }
    ]
  },
  offices: {
    label: "Бизнес-центры и офисы (Клининг)",
    short: "Бизнес-центр / УК",
    hours: "08:00 – 21:00",
    companies: [
      { name: "БЦ «Горизонт Плаза» (Класс A)", domain: "gorizont-bc.example.ru", email: "facility@gorizont-bc.example.ru", rating: 4.7, reviews: 280, tg: true, wa: true },
      { name: "Деловой квартал «Сталь»", domain: "stal-office.example.ru", email: "uk@stal-office.example.ru", rating: 4.6, reviews: 195, tg: true, wa: false },
      { name: "Коворкинг «Точка Сборки»", domain: "tochka-work.example.ru", email: "ops@tochka-work.example.ru", rating: 4.9, reviews: 340, tg: true, wa: true },
      { name: "БЦ «Северная Башня»", domain: "north-tower.example.ru", email: "tender@north-tower.example.ru", rating: 4.5, reviews: 410, tg: false, wa: true },
      { name: "УК «Коммерц Недвижимость»", domain: "kommerc-uk.example.ru", email: "hozo@kommerc-uk.example.ru", rating: 4.3, reviews: 76, tg: true, wa: false },
      { name: "Офисный парк «Атриум»", domain: "atrium-park.example.ru", email: "service@atrium-park.example.ru", rating: 4.8, reviews: 228, tg: true, wa: true },
      { name: "Лофт-центр «Мануфактура»", domain: "manufaktura-bc.example.ru", email: "rent@manufaktura-bc.example.ru", rating: 4.6, reviews: 162, tg: false, wa: true },
      { name: "БЦ «Вектор» (Класс B+)", domain: null, email: null, rating: 4.1, reviews: 94, tg: false, wa: false },
      { name: "Технопарк «Импульс»", domain: "impuls-tech.example.ru", email: "aho@impuls-tech.example.ru", rating: 4.8, reviews: 312, tg: true, wa: true },
      { name: "Смарт-офисы «Платформа»", domain: "platforma-of.example.ru", email: "hello@platforma-of.example.ru", rating: 4.7, reviews: 145, tg: true, wa: true },
      { name: "ДЦ «Меридиан»", domain: null, email: null, rating: 4.2, reviews: 88, tg: false, wa: true },
      { name: "БЦ «Кристалл Холл»", domain: "kristall-bc.example.ru", email: "admin@kristall-bc.example.ru", rating: 4.5, reviews: 204, tg: true, wa: false }
    ]
  },
  clinics: {
    label: "Стоматологии и клиники",
    short: "Медцентр / Стоматология",
    hours: "09:00 – 21:00",
    companies: [
      { name: "Клиника «Дента Эксперт»", domain: "denta-exp.example.ru", email: "info@denta-exp.example.ru", rating: 4.9, reviews: 420, tg: true, wa: true },
      { name: "Центр эстетики «Линия»", domain: "linia-med.example.ru", email: "mkt@linia-med.example.ru", rating: 4.8, reviews: 265, tg: true, wa: true },
      { name: "Стоматология «Белый Кит»", domain: "bely-kit.example.ru", email: "care@bely-kit.example.ru", rating: 4.7, reviews: 190, tg: false, wa: true },
      { name: "Медцентр «Здоровье Плюс»", domain: "zdorovie-p.example.ru", email: "admin@zdorovie-p.example.ru", rating: 4.3, reviews: 310, tg: true, wa: false },
      { name: "Ортодонт-студия «Смайл»", domain: null, email: null, rating: 4.5, reviews: 112, tg: true, wa: true },
      { name: "Клиника «НейроМед»", domain: "neuromed.example.ru", email: "pr@neuromed.example.ru", rating: 4.8, reviews: 248, tg: true, wa: true },
      { name: "Семейная клиника «Опора»", domain: "opora-clinic.example.ru", email: "dir@opora-clinic.example.ru", rating: 4.6, reviews: 176, tg: false, wa: true },
      { name: "Лазерная косметология «Люмен»", domain: "lumen-skin.example.ru", email: "hello@lumen-skin.example.ru", rating: 4.9, reviews: 384, tg: true, wa: true },
      { name: "Дентал-бутик «Кристалл»", domain: "kristall-dent.example.ru", email: "info@kristall-dent.example.ru", rating: 4.4, reviews: 95, tg: false, wa: true },
      { name: "Медицинский кабинет «Доктор»", domain: null, email: null, rating: 4.1, reviews: 54, tg: false, wa: false },
      { name: "Имплант-центр «Профи»", domain: "implant-profi.example.ru", email: "lead@implant-profi.example.ru", rating: 4.8, reviews: 292, tg: true, wa: true },
      { name: "Клиника «Арт-Медика»", domain: "art-medica.example.ru", email: "reception@art-medica.example.ru", rating: 4.7, reviews: 215, tg: true, wa: true }
    ]
  },
  auto: {
    label: "Автосервисы и детейлинг",
    short: "Детейлинг / Автосервис",
    hours: "09:00 – 21:00",
    companies: [
      { name: "Детейлинг-студия «Глянец»", domain: "glyanets-det.example.ru", email: "box@glyanets-det.example.ru", rating: 4.9, reviews: 274, tg: true, wa: true },
      { name: "Автотехцентр «Немецкий Гараж»", domain: "nem-garage.example.ru", email: "service@nem-garage.example.ru", rating: 4.8, reviews: 390, tg: true, wa: true },
      { name: "Студия оклейки «БроняАвто»", domain: "bronya-auto.example.ru", email: "info@bronya-auto.example.ru", rating: 4.7, reviews: 165, tg: true, wa: false },
      { name: "СТО «Мастер Моторс»", domain: null, email: null, rating: 4.2, reviews: 118, tg: false, wa: true },
      { name: "Премиум-детейлинг «Керамика»", domain: "keramika-pro.example.ru", email: "orders@keramika-pro.example.ru", rating: 4.9, reviews: 312, tg: true, wa: true },
      { name: "Тюнинг-ателье «ДрайвЛаб»", domain: "drivelab.example.ru", email: "hello@drivelab.example.ru", rating: 4.6, reviews: 142, tg: true, wa: true },
      { name: "Кузовной центр «Колор»", domain: "kolor-kuzov.example.ru", email: "master@kolor-kuzov.example.ru", rating: 4.5, reviews: 208, tg: false, wa: true },
      { name: "Шинный отель «Протектор»", domain: "protektor.example.ru", email: "tire@protektor.example.ru", rating: 4.4, reviews: 134, tg: false, wa: false },
      { name: "Автомойка-детейлинг «Аква»", domain: null, email: null, rating: 4.3, reviews: 86, tg: true, wa: true },
      { name: "Техцентр «Турбо Сервис»", domain: "turbo-srv.example.ru", email: "sto@turbo-srv.example.ru", rating: 4.7, reviews: 256, tg: true, wa: true },
      { name: "Студия шумоизоляции «Тишина»", domain: "tishina-car.example.ru", email: "auto@tishina-car.example.ru", rating: 4.8, reviews: 189, tg: true, wa: true },
      { name: "Автосервис «Пит-Стоп 24»", domain: "pitstop24.example.ru", email: "info@pitstop24.example.ru", rating: 4.5, reviews: 230, tg: false, wa: true }
    ]
  }
};
