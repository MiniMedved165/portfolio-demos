import { QUIZ_CONFIG } from "./config.js";

/**
 * Форматирует сумму в рублях по стандарту ru-RU.
 *
 * @param {number} amount Сумма в рублях.
 * @returns {string} Отформатированная строка с символом валюты.
 */
export function formatCurrency(amount) {
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(amount))} ₽`;
}

/**
 * Приводит ввод номера телефона к маске +7 (999) 000-00-00.
 *
 * @param {string} rawValue Сырой ввод пользователя.
 * @returns {string} Отформатированный номер телефона.
 */
export function formatPhoneInput(rawValue) {
  const digits = rawValue.replace(/\D/g, "");
  let normalized = digits;
  if (normalized.startsWith("8")) {
    normalized = "7" + normalized.slice(1);
  } else if (normalized.length > 0 && !normalized.startsWith("7")) {
    normalized = "7" + normalized;
  }
  normalized = normalized.slice(0, 11);

  if (normalized.length === 0) return "";
  let formatted = "+7";
  if (normalized.length > 1) formatted += " (" + normalized.slice(1, 4);
  if (normalized.length >= 4) formatted += ")";
  if (normalized.length > 4) formatted += " " + normalized.slice(4, 7);
  if (normalized.length > 7) formatted += "-" + normalized.slice(7, 9);
  if (normalized.length > 9) formatted += "-" + normalized.slice(9, 11);
  return formatted;
}

/**
 * Рассчитывает смету процедуры банкротства по 127-ФЗ, срок, прогноз списания и скидку.
 * Критерии внесудебного банкротства через МФЦ (0 ₽ судебных расходов):
 * долг 250–500 тыс. ₽, отсутствие имущества, открытые/оконченные ИП в ФССП,
 * отсутствие сделок за 3 года и залоговых кредитов.
 *
 * @param {Object} currentState Текущее состояние ответов квиза.
 * @returns {Object} Итоговая смета, рассрочка, промокод и правовое заключение.
 */
export function calculateEstimate(currentState) {
  const propertyObj =
    QUIZ_CONFIG.propertyOptions.find((p) => p.id === currentState.propertyType) ||
    QUIZ_CONFIG.propertyOptions[0];
  const overdueObj =
    QUIZ_CONFIG.overdueOptions.find((o) => o.id === currentState.overdueStatus) ||
    QUIZ_CONFIG.overdueOptions[2];
  const planObj =
    QUIZ_CONFIG.paymentPlans.find((p) => p.id === currentState.paymentPlan) ||
    QUIZ_CONFIG.paymentPlans[0];
  const urgencyObj =
    QUIZ_CONFIG.urgencyOptions.find((u) => u.id === currentState.urgency) ||
    QUIZ_CONFIG.urgencyOptions[0];

  const isMfcCandidate =
    currentState.debtAmount >= 250000 &&
    currentState.debtAmount <= 500000 &&
    currentState.propertyType === "none" &&
    currentState.overdueStatus === "fssp" &&
    !currentState.hadTransactions &&
    !currentState.debtTypes.includes("secured");

  let baseLegalFee = 128000;
  if (isMfcCandidate) {
    baseLegalFee = 45000;
  } else {
    if (currentState.debtAmount <= 500000) baseLegalFee = 118000;
    else if (currentState.debtAmount <= 1200000) baseLegalFee = 132000;
    else if (currentState.debtAmount <= 2500000) baseLegalFee = 148000;
    else baseLegalFee = 168000;

    currentState.debtTypes.forEach((typeId) => {
      const item = QUIZ_CONFIG.debtTypes.find((t) => t.id === typeId);
      if (item) baseLegalFee += item.feeDelta;
    });

    baseLegalFee += propertyObj.feeDelta;
    baseLegalFee += urgencyObj.feeDelta;
    if (currentState.hadTransactions) {
      baseLegalFee += 19000;
    }
  }

  const completedQuizSteps = Math.min(5, Math.max(1, currentState.visitedSteps.size));
  const quizDiscountPct = completedQuizSteps * QUIZ_CONFIG.discountPerStep;
  const totalDiscountPct = quizDiscountPct + planObj.extraDiscount;
  const discountAmount = Math.round(baseLegalFee * (totalDiscountPct / 100));
  const netLegalFee = baseLegalFee - discountAmount;

  const courtFees = isMfcCandidate
    ? 0
    : QUIZ_CONFIG.statutoryFees.arbitrationDeposit + QUIZ_CONFIG.statutoryFees.publicationsAndPost;

  const totalProjectCost = netLegalFee + courtFees;
  const monthlyPayment = planObj.months > 1 ? Math.round(netLegalFee / planObj.months) : netLegalFee;
  const netClientBenefit = Math.max(0, currentState.debtAmount - totalProjectCost);

  let minMonths = isMfcCandidate ? 6 : 7 + propertyObj.monthsDelta + (currentState.hadTransactions ? 1 : 0);
  minMonths = Math.max(6, minMonths);
  const maxMonths = isMfcCandidate ? 6 : minMonths + 2;
  const durationText = isMfcCandidate ? "6 мес. (фиксировано)" : `${minMonths}–${maxMonths} мес.`;

  let chance = 94 + propertyObj.chanceDelta + overdueObj.chanceDelta;
  if (currentState.hadTransactions) chance -= 5;
  if (currentState.debtTypes.includes("secured")) chance -= 4;
  if (isMfcCandidate) chance = 95;
  chance = Math.min(99, Math.max(82, chance));

  let legalComment = propertyObj.legalNote;
  if (isMfcCandidate) {
    legalComment =
      "Предварительно вы подходите под внесудебное банкротство через МФЦ (0 ₽ судебных расходов) при наличии закрытого производства ФССП по п. 4 ч. 1 ст. 46.";
  } else if (currentState.hadTransactions) {
    legalComment =
      "Сделки с имуществом за последние 3 года требуют правовой экспертизы до подачи в суд — мы включили этот этап в смету для защиты от оспаривания.";
  } else if (currentState.debtTypes.includes("secured")) {
    legalComment =
      "По ипотеке и автокредитам действует особый порядок работы с залоговым кредитором (включая возможность локального мирового соглашения по ипотечному жилью).";
  }

  return {
    isMfcCandidate,
    procedureLabel: isMfcCandidate ? "Внесудебное через МФЦ (127-ФЗ)" : "Судебное банкротство (127-ФЗ)",
    baseLegalFee,
    quizDiscountPct,
    totalDiscountPct,
    discountAmount,
    netLegalFee,
    courtFees,
    totalProjectCost,
    planMonths: planObj.months,
    planLabel: planObj.label,
    monthlyPayment,
    netClientBenefit,
    durationText,
    chance,
    legalComment,
    promoCode: `${QUIZ_CONFIG.promoCodePrefix}-${totalDiscountPct}`
  };
}

/**
 * Формирует структурированный payload заявки для Telegram-бота и CRM.
 *
 * @param {Object} currentState Текущее состояние квиза.
 * @param {Object} estimate Результат calculateEstimate().
 * @param {Object} formData Данные контактной формы (name, phone, channel).
 * @returns {Object} JSON-совместимый объект заявки.
 */
export function buildLeadPayload(currentState, estimate, formData) {
  const selectedDebtLabels = currentState.debtTypes.map((id) => {
    const found = QUIZ_CONFIG.debtTypes.find((t) => t.id === id);
    return found ? found.label : id;
  });
  const propLabel = (QUIZ_CONFIG.propertyOptions.find((p) => p.id === currentState.propertyType) || {}).label || "";
  const overdueLabel = (QUIZ_CONFIG.overdueOptions.find((o) => o.id === currentState.overdueStatus) || {}).label || "";

  return {
    demoMode: true,
    leadId: "DEMO-" + Math.floor(100000 + Math.random() * 900000),
    timestamp: new Date().toISOString(),
    source: "legal-127-quiz/norma-bureau",
    client: {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      preferredChannel: formData.channel
    },
    quizAnswers: {
      debtAmountRub: currentState.debtAmount,
      debtTypes: selectedDebtLabels,
      propertyStatus: propLabel,
      overdueStatus: overdueLabel,
      recentTransactions3Years: currentState.hadTransactions ? "Да, были" : "Нет",
      paymentPlan: estimate.planLabel,
      urgentProtection: currentState.urgency === "urgent_collectors"
    },
    calculatedEstimate: {
      procedure: estimate.procedureLabel,
      chancePercent: estimate.chance,
      legalFeeBeforeDiscountRub: estimate.baseLegalFee,
      discountPercent: estimate.totalDiscountPct,
      discountAmountRub: estimate.discountAmount,
      legalFeeFinalRub: estimate.netLegalFee,
      statutoryCourtFeesRub: estimate.courtFees,
      totalCostRub: estimate.totalProjectCost,
      monthlyInstallmentRub: estimate.planMonths > 1 ? estimate.monthlyPayment : null,
      estimatedDuration: estimate.durationText,
      promoCode: estimate.promoCode
    }
  };
}
