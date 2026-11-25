import { QUIZ_CONFIG } from "./config.js";

/**
 * Рассчитывает детальную смету и ориентировочный срок ремонта.
 * Базовая стоимость вычисляется по формуле:
 *   area * ratePerSqm * ceilingMultiplier * styleMultiplier
 * и распределяется на черновые (roughShare) и чистовые работы.
 * Дополнительные опции суммируются как (flatPrice + pricePerSqm * area),
 * после чего к итоговой сумме применяется скидка выбранного бонуса.
 *
 * @param {Object} currentState Текущее состояние ответов квиза.
 * @returns {Object} Разбивка стоимости, скидка, цена за м² и срок в месяцах.
 */
export function calculateEstimate(currentState) {
  const prop = QUIZ_CONFIG.propertyTypes.find((p) => p.id === currentState.propertyType) || QUIZ_CONFIG.propertyTypes[0];
  const ceil = QUIZ_CONFIG.ceilingOptions.find((c) => c.id === currentState.ceiling) || QUIZ_CONFIG.ceilingOptions[0];
  const styleObj = QUIZ_CONFIG.styles.find((s) => s.id === currentState.style) || QUIZ_CONFIG.styles[0];
  const bonusObj = QUIZ_CONFIG.bonuses.find((b) => b.id === currentState.bonus) || QUIZ_CONFIG.bonuses[0];

  const baseTotal = currentState.area * prop.ratePerSqm * ceil.multiplier * styleObj.multiplier;
  const roughCost = Math.round(baseTotal * prop.roughShare);
  const finishCost = Math.round(baseTotal - roughCost);

  let optionsCost = 0;
  currentState.options.forEach((optId) => {
    const opt = QUIZ_CONFIG.extraOptions.find((o) => o.id === optId);
    if (opt) {
      optionsCost += opt.flatPrice + opt.pricePerSqm * currentState.area;
    }
  });
  optionsCost = Math.round(optionsCost);

  const subtotal = roughCost + finishCost + optionsCost;
  const discountPercent = bonusObj.discountPercent;
  const saving = Math.round(subtotal * (discountPercent / 100));
  const finalTotal = subtotal - saving;
  const perSqm = Math.round(finalTotal / Math.max(1, currentState.area));

  const rawMonths = (1.6 + currentState.area / 36) * prop.durationFactor + currentState.options.length * 0.15;
  const durationMonths = Math.max(1.5, Math.round(rawMonths * 2) / 2);

  return {
    prop,
    ceil,
    styleObj,
    bonusObj,
    roughCost,
    finishCost,
    optionsCost,
    subtotal,
    discountPercent,
    saving,
    finalTotal,
    perSqm,
    durationMonths
  };
}

/**
 * Форматирует число в строку с разделителями разрядов и символом валюты.
 *
 * @param {number} num Сумма в рублях.
 * @returns {string} Отформатированная цена.
 */
export function formatRub(num) {
  return `${Math.round(num).toLocaleString("ru-RU")} ${QUIZ_CONFIG.currency}`;
}
