import { SITE_CONFIG } from "./config.js";

/**
 * Округляет сумму до сотен рублей и форматирует по стандарту ru-RU.
 *
 * @param {number} value Исходная сумма.
 * @returns {string} Отформатированная строка с символом рубля.
 */
export function formatRub(value) {
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(value / 100) * 100)} ₽`;
}

/**
 * Форматирует ввод телефона под маску +7 (999) 000-00-00.
 *
 * @param {string} raw Сырой ввод пользователя.
 * @returns {string} Отформатированный номер.
 */
export function formatPhoneInput(raw) {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  else if (digits.length > 0 && !digits.startsWith("7")) digits = "7" + digits;
  digits = digits.slice(0, 11);

  if (!digits.length) return "";
  let res = "+7";
  if (digits.length > 1) res += " (" + digits.slice(1, 4);
  if (digits.length >= 4) res += ")";
  if (digits.length > 4) res += " " + digits.slice(4, 7);
  if (digits.length > 7) res += "-" + digits.slice(7, 9);
  if (digits.length > 9) res += "-" + digits.slice(9, 11);
  return res;
}

/**
 * Рассчитывает ориентировочную стоимость и срок услуги с учётом класса автомобиля.
 *
 * @param {Object} bookingState Выбранные параметры записи.
 * @returns {Object} Итоговая оценка стоимости и сроков.
 */
export function calculateBookingEstimate(bookingState) {
  const service =
    SITE_CONFIG.services.find((s) => s.id === bookingState.serviceId) ||
    SITE_CONFIG.services[3];
  const carClass =
    SITE_CONFIG.carClasses.find((c) => c.id === bookingState.carClassId) ||
    SITE_CONFIG.carClasses[0];
  const estimatedPrice = Math.round((service.basePrice * carClass.multiplier) / 100) * 100;

  return {
    serviceTitle: service.title,
    carClassLabel: carClass.label,
    duration: service.duration,
    estimatedPrice,
    timeSlot: bookingState.timeSlot
  };
}

/**
 * Формирует структурированный JSON-пакет заявки для Telegram-бота и CRM.
 *
 * @param {Object} bookingState Параметры записи.
 * @param {Object} estimate Результат calculateBookingEstimate().
 * @param {Object} formData Данные контактной формы.
 * @returns {Object} Payload заявки.
 */
export function buildBookingPayload(bookingState, estimate, formData) {
  return {
    demoMode: true,
    bookingId: "KD-" + Math.floor(1000 + Math.random() * 9000),
    timestamp: new Date().toISOString(),
    source: "promo-before-after/kronos-detail",
    client: {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      carModel: formData.carModel.trim() || "Не указана (уточнит мастер)"
    },
    order: {
      serviceId: bookingState.serviceId,
      serviceTitle: estimate.serviceTitle,
      carClass: estimate.carClassLabel,
      preferredSlot: estimate.timeSlot,
      estimatedDuration: estimate.duration,
      estimatedPriceRub: estimate.estimatedPrice
    }
  };
}
