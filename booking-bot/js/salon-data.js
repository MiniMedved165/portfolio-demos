export const SERVICES = [
  {
    id: "haircut",
    title: "Мужская стрижка",
    shortTitle: "Мужская стрижка",
    price: 2200,
    duration: "45 мин",
    desc: "Подбор формы под тип лица, стрижка ножницами и машинкой, мытьё головы, укладка."
  },
  {
    id: "combo",
    title: "Стрижка + Борода",
    shortTitle: "Стрижка + Борода",
    price: 3400,
    duration: "75 мин",
    badge: "Хит",
    desc: "Полный комплекс: стрижка, моделирование бороды, окантовка опасной бритвой и горячее полотенце."
  },
  {
    id: "beard",
    title: "Моделирование бороды",
    shortTitle: "Борода",
    price: 1500,
    duration: "30 мин",
    desc: "Чёткий контур, коррекция длины, распаривание горячим полотенцем и уход маслом."
  },
  {
    id: "shave",
    title: "Королевское бритьё",
    shortTitle: "Королевское бритьё",
    price: 1900,
    duration: "45 мин",
    desc: "Классическое влажное бритьё шаветкой с эфирными маслами и охлаждающим компрессом."
  },
  {
    id: "fade",
    title: "Стрижка машинкой / Skin Fade",
    shortTitle: "Skin Fade",
    price: 1800,
    duration: "40 мин",
    desc: "Чистый плавный переход в ноль, контрастная окантовка и стайлинг."
  },
  {
    id: "father_son",
    title: "Отец + Сын",
    shortTitle: "Отец + Сын",
    price: 3800,
    duration: "75 мин",
    desc: "Две стрижки в одно время у наших мастеров. Детям — какао или лимонад в подарок."
  }
];

export const BARBERS = [
  {
    id: "artem",
    name: "Артём Ковалёв",
    shortName: "Артём К.",
    role: "Топ-барбер · 9 лет опыта",
    rating: "5.0",
    specialty: "Классика ножницами, удлинённые формы и архитектура бороды",
    nextSlot: "Сегодня, 16:00",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "denis",
    name: "Денис Волков",
    shortName: "Денис В.",
    role: "Старший барбер · 7 лет опыта",
    rating: "4.9",
    specialty: "Skin Fade, кроп, современные текстурные стрижки",
    nextSlot: "Сегодня, 14:30",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "timur",
    name: "Тимур Рахимов",
    shortName: "Тимур Р.",
    role: "Барбер-стилист · 6 лет опыта",
    rating: "4.9",
    specialty: "Королевское бритьё, опасная бритва и сложные бороды",
    nextSlot: "Завтра, 11:30",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80"
  }
];

export const BOOKING_DATES = [
  { id: "today", label: "Сегодня · 25 ноя", shortLabel: "Сегодня, 25 ноя", slots: ["14:30", "16:00", "17:30", "19:00", "20:30"] },
  { id: "tomorrow", label: "Завтра · 26 ноя", shortLabel: "Завтра, 26 ноя", slots: ["11:00", "12:30", "14:00", "16:00", "18:00", "19:30"] },
  { id: "fri", label: "Пятница · 27 ноя", shortLabel: "Пт, 27 ноя", slots: ["10:30", "13:00", "15:00", "17:00", "19:00", "21:00"] },
  { id: "sat", label: "Суббота · 28 ноя", shortLabel: "Сб, 28 ноя", slots: ["11:30", "13:30", "15:30", "17:30", "19:30"] }
];

export const INITIAL_SCHEDULE_BOOKINGS = [
  {
    id: "SRZ-4088",
    clientName: "Игорь М.",
    clientPhone: "+7 (999) ***-42-11",
    serviceId: "haircut",
    serviceTitle: "Мужская стрижка",
    price: 2200,
    barberId: "artem",
    barberName: "Артём К.",
    dateId: "today",
    dateLabel: "Сегодня, 25 ноя",
    time: "13:00",
    status: "confirmed",
    isUserDemo: false
  },
  {
    id: "SRZ-4091",
    clientName: "Павел Д.",
    clientPhone: "+7 (999) ***-88-04",
    serviceId: "combo",
    serviceTitle: "Стрижка + Борода",
    price: 3400,
    barberId: "denis",
    barberName: "Денис В.",
    dateId: "today",
    dateLabel: "Сегодня, 25 ноя",
    time: "15:30",
    status: "reminded",
    isUserDemo: false
  }
];
