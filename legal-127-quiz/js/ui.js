import { QUIZ_CONFIG } from "./config.js";
import { calculateEstimate, buildLeadPayload, formatCurrency, formatPhoneInput } from "./calculator.js";

export const dom = {
  stepCounterBadge: document.getElementById("stepCounterBadge"),
  stepCategoryLabel: document.getElementById("stepCategoryLabel"),
  quizProgressBar: document.getElementById("quizProgressBar"),
  quizStepContainer: document.getElementById("quizStepContainer"),
  quizNavFooter: document.getElementById("quizNavFooter"),
  prevStepBtn: document.getElementById("prevStepBtn"),
  nextStepBtn: document.getElementById("nextStepBtn"),
  nextStepBtnText: document.getElementById("nextStepBtnText"),
  stepDots: document.getElementById("stepDots"),
  resetQuizBtn: document.getElementById("resetQuizBtn"),

  estimateProcedureType: document.getElementById("estimateProcedureType"),
  liveChanceValue: document.getElementById("liveChanceValue"),
  liveDiscountBadge: document.getElementById("liveDiscountBadge"),
  liveDiscountBar: document.getElementById("liveDiscountBar"),
  liveDiscountHint: document.getElementById("liveDiscountHint"),
  liveDebtDisplay: document.getElementById("liveDebtDisplay"),
  liveBaseLegalFee: document.getElementById("liveBaseLegalFee"),
  liveNetLegalFee: document.getElementById("liveNetLegalFee"),
  liveCourtFees: document.getElementById("liveCourtFees"),
  liveDuration: document.getElementById("liveDuration"),
  livePaymentLabel: document.getElementById("livePaymentLabel"),
  liveHeadlinePrice: document.getElementById("liveHeadlinePrice"),
  liveNetSavings: document.getElementById("liveNetSavings"),
  liveLegalComment: document.getElementById("liveLegalComment"),

  mobileMonthlyPrice: document.getElementById("mobileMonthlyPrice"),
  mobileMonthlySuffix: document.getElementById("mobileMonthlySuffix"),
  mobileDiscountPct: document.getElementById("mobileDiscountPct"),
  mobileChancePct: document.getElementById("mobileChancePct"),

  casesGrid: document.getElementById("casesGrid"),
  faqContainer: document.getElementById("faqContainer"),

  demoModal: document.getElementById("demoModal"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  modalDoneBtn: document.getElementById("modalDoneBtn"),
  tabCrmBtn: document.getElementById("tabCrmBtn"),
  tabJsonBtn: document.getElementById("tabJsonBtn"),
  tabCrmContent: document.getElementById("tabCrmContent"),
  tabJsonContent: document.getElementById("tabJsonContent"),
  crmLeadId: document.getElementById("crmLeadId"),
  crmLeadFields: document.getElementById("crmLeadFields"),
  jsonPayloadOutput: document.getElementById("jsonPayloadOutput"),
  copyJsonBtn: document.getElementById("copyJsonBtn"),

  toastBanner: document.getElementById("toastBanner"),
  toastText: document.getElementById("toastText"),
  mobileMenuBtn: document.getElementById("mobileMenuBtn"),
  mobileMenu: document.getElementById("mobileMenu")
};

let toastTimer = null;

export function showToast(message) {
  dom.toastText.textContent = message;
  dom.toastBanner.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    dom.toastBanner.classList.remove("show");
  }, 3200);
}

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function updateQuickChipsActive(container, debtAmount) {
  Array.from(container.children).forEach((btn) => {
    const isActive = Number(btn.dataset.value) === debtAmount;
    btn.className = `px-3.5 py-2 text-xs font-mono hairline-all transition-colors ${
      isActive ? "bg-obsidian text-ivory border-obsidian" : "bg-ivory text-obsidian hover:bg-parchment"
    }`;
  });
}

export function updateLiveEstimatePanel(state) {
  const est = calculateEstimate(state);

  dom.estimateProcedureType.textContent = est.procedureLabel;
  dom.liveChanceValue.textContent = `${est.chance}%`;
  dom.liveDiscountBadge.textContent = `${est.totalDiscountPct}% (−${formatCurrency(est.discountAmount)})`;
  dom.liveDiscountBar.style.width = `${Math.min(100, (est.totalDiscountPct / 15) * 100)}%`;

  if (est.quizDiscountPct < 10) {
    dom.liveDiscountHint.textContent = `Пройдите остальные шаги — скидка квиза вырастет с ${est.quizDiscountPct}% до 10%`;
  } else if (state.paymentPlan === "full_payment") {
    dom.liveDiscountHint.textContent = "Максимальная выгода активна: 10% за квиз + 5% за единовременную оплату";
  } else {
    dom.liveDiscountHint.textContent = "Максимальная скидка квиза 10% разблокирована и закреплена за расчётом";
  }

  dom.liveDebtDisplay.textContent = formatCurrency(state.debtAmount);
  dom.liveBaseLegalFee.textContent = formatCurrency(est.baseLegalFee);
  dom.liveNetLegalFee.textContent = formatCurrency(est.netLegalFee);
  dom.liveCourtFees.textContent = est.courtFees === 0 ? "0 ₽ (через МФЦ)" : formatCurrency(est.courtFees);
  dom.liveDuration.textContent = est.durationText;
  dom.liveNetSavings.textContent = "+" + formatCurrency(est.netClientBenefit);
  dom.liveLegalComment.textContent = est.legalComment;

  dom.liveHeadlinePrice.textContent = "";
  if (est.planMonths > 1) {
    dom.livePaymentLabel.textContent = `Платёж в рассрочку (${est.planMonths} мес.)`;
    dom.liveHeadlinePrice.appendChild(document.createTextNode(formatCurrency(est.monthlyPayment)));
    dom.liveHeadlinePrice.appendChild(createEl("span", "font-sans text-sm font-normal text-limestone/65", "/мес"));

    dom.mobileMonthlyPrice.textContent = formatCurrency(est.monthlyPayment);
    dom.mobileMonthlySuffix.textContent = `/ мес (${est.planMonths} мес.)`;
  } else {
    dom.livePaymentLabel.textContent = "Единовременная оплата услуг";
    dom.liveHeadlinePrice.appendChild(document.createTextNode(formatCurrency(est.netLegalFee)));

    dom.mobileMonthlyPrice.textContent = formatCurrency(est.netLegalFee);
    dom.mobileMonthlySuffix.textContent = "единовременно";
  }

  dom.mobileDiscountPct.textContent = `${est.totalDiscountPct}%`;
  dom.mobileChancePct.textContent = `${est.chance}%`;
}

function renderStepDots(currentStep) {
  dom.stepDots.textContent = "";
  for (let i = 1; i <= 5; i++) {
    const dot = createEl(
      "span",
      `h-1.5 transition-all duration-300 ${
        i === currentStep ? "w-6 bg-emeraldDeep" : i < currentStep ? "w-2.5 bg-emeraldDeep/45" : "w-2 bg-obsidian/20"
      }`
    );
    dom.stepDots.appendChild(dot);
  }
}

export function switchModalTab(tab) {
  const isCrm = tab === "crm";
  dom.tabCrmContent.classList.toggle("hidden", !isCrm);
  dom.tabJsonContent.classList.toggle("hidden", isCrm);

  dom.tabCrmBtn.className = `px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
    isCrm ? "border-emeraldDeep text-emeraldDeep font-medium" : "border-transparent text-mutedInk hover:text-obsidian"
  }`;
  dom.tabJsonBtn.className = `px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
    !isCrm ? "border-emeraldDeep text-emeraldDeep font-medium" : "border-transparent text-mutedInk hover:text-obsidian"
  }`;
}

export function openDemoModal(payload) {
  dom.crmLeadId.textContent = `LEAD #${payload.leadId}`;
  dom.crmLeadFields.textContent = "";

  const fields = [
    ["Клиент", payload.client.name],
    ["Контакт", `${payload.client.phone} (${payload.client.preferredChannel})`],
    ["Сумма долга", formatCurrency(payload.quizAnswers.debtAmountRub)],
    ["Процедура", payload.calculatedEstimate.procedure],
    ["Типы долгов", payload.quizAnswers.debtTypes.join(", ")],
    ["Имущество", payload.quizAnswers.propertyStatus],
    [`Гонорар со скидкой ${payload.calculatedEstimate.discountPercent}%`, formatCurrency(payload.calculatedEstimate.legalFeeFinalRub)],
    [
      "Судебные расходы",
      payload.calculatedEstimate.statutoryCourtFeesRub === 0
        ? "0 ₽ (МФЦ)"
        : formatCurrency(payload.calculatedEstimate.statutoryCourtFeesRub)
    ],
    [
      "Рассрочка / оплата",
      payload.calculatedEstimate.monthlyInstallmentRub
        ? `${formatCurrency(payload.calculatedEstimate.monthlyInstallmentRub)} / мес`
        : "Единовременно"
    ],
    ["Промокод и прогноз", `${payload.calculatedEstimate.promoCode} · Шанс ${payload.calculatedEstimate.chancePercent}%`]
  ];

  fields.forEach(([label, value]) => {
    const block = createEl("div");
    block.appendChild(createEl("dt", "font-mono text-[10px] uppercase tracking-wider text-mutedInk", label));
    block.appendChild(createEl("dd", "text-obsidian font-medium mt-0.5 break-words", value));
    dom.crmLeadFields.appendChild(block);
  });

  dom.jsonPayloadOutput.textContent = JSON.stringify(payload, null, 2);
  switchModalTab("crm");

  dom.demoModal.classList.remove("hidden");
  dom.demoModal.classList.add("flex");
  document.body.style.overflow = "hidden";
  dom.closeModalBtn.focus();
}

export function closeDemoModal() {
  dom.demoModal.classList.add("hidden");
  dom.demoModal.classList.remove("flex");
  document.body.style.overflow = "";
}

export function renderQuizStep(state) {
  const meta = QUIZ_CONFIG.stepMeta[state.currentStep - 1];
  const isFinal = state.currentStep === 6;

  dom.stepCounterBadge.textContent = isFinal ? "ИТОГ · СМЕТА" : `ШАГ ${meta.num} / 05`;
  dom.stepCategoryLabel.textContent = meta.category;
  dom.quizProgressBar.style.width = isFinal ? "100%" : `${(state.currentStep / 5) * 100}%`;

  dom.prevStepBtn.disabled = state.currentStep === 1;
  dom.quizNavFooter.classList.toggle("hidden", isFinal);
  dom.nextStepBtnText.textContent = state.currentStep === 5 ? "Получить итоговую смету" : "Следующий шаг";
  renderStepDots(state.currentStep);

  const wrapper = createEl("div", "step-enter space-y-6");

  if (state.currentStep === 1) {
    wrapper.appendChild(createEl("h3", "font-serif text-2xl sm:text-3xl font-semibold text-obsidian", "Какова общая сумма ваших долгов?"));
    wrapper.appendChild(createEl("p", "text-sm text-mutedInk -mt-3", "Сложите ориентировочно все кредиты, карты, микрозаймы, налоги и долги по ЖКХ."));

    const sliderBox = createEl("div", "bg-limestone p-6 hairline-all space-y-5");
    const valueRow = createEl("div", "flex items-baseline justify-between gap-4");
    valueRow.appendChild(createEl("span", "font-mono text-xs uppercase tracking-wider text-mutedInk", "Выбранная сумма"));
    const debtValueLabel = createEl(
      "span",
      "font-serif text-3xl sm:text-4xl font-semibold text-emeraldDeep",
      state.debtAmount >= 5000000 ? "5 000 000+ ₽" : formatCurrency(state.debtAmount)
    );
    valueRow.appendChild(debtValueLabel);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "250000";
    slider.max = "5000000";
    slider.step = "50000";
    slider.value = String(state.debtAmount);
    slider.className = "legal-slider";
    slider.setAttribute("aria-label", "Общая сумма задолженности в рублях");

    const scaleRow = createEl("div", "flex justify-between font-mono text-[11px] text-mutedInk");
    scaleRow.appendChild(createEl("span", "", "250 000 ₽"));
    scaleRow.appendChild(createEl("span", "", "2 500 000 ₽"));
    scaleRow.appendChild(createEl("span", "", "5 000 000+ ₽"));

    const chipsContainer = createEl("div", "flex flex-wrap gap-2.5");
    slider.addEventListener("input", (e) => {
      state.debtAmount = Number(e.target.value);
      debtValueLabel.textContent = state.debtAmount >= 5000000 ? "5 000 000+ ₽" : formatCurrency(state.debtAmount);
      updateLiveEstimatePanel(state);
      updateQuickChipsActive(chipsContainer, state.debtAmount);
    });

    sliderBox.append(valueRow, slider, scaleRow);
    wrapper.appendChild(sliderBox);

    QUIZ_CONFIG.debtQuickChips.forEach((chip) => {
      const btn = createEl("button", "px-3.5 py-2 text-xs font-mono hairline-all transition-colors", chip.label);
      btn.type = "button";
      btn.dataset.value = String(chip.value);
      btn.addEventListener("click", () => {
        state.debtAmount = chip.value;
        slider.value = String(chip.value);
        debtValueLabel.textContent = formatCurrency(chip.value);
        updateLiveEstimatePanel(state);
        updateQuickChipsActive(chipsContainer, state.debtAmount);
      });
      chipsContainer.appendChild(btn);
    });
    updateQuickChipsActive(chipsContainer, state.debtAmount);
    wrapper.appendChild(chipsContainer);
  }

  if (state.currentStep === 2) {
    wrapper.appendChild(createEl("h3", "font-serif text-2xl sm:text-3xl font-semibold text-obsidian", "Какие типы задолженностей нужно списать?"));
    wrapper.appendChild(createEl("p", "text-sm text-mutedInk -mt-3", "Можно выбрать несколько вариантов — это поможет точно учесть сложность работы с кредиторами."));

    const grid = createEl("div", "grid grid-cols-1 sm:grid-cols-2 gap-3");
    QUIZ_CONFIG.debtTypes.forEach((item) => {
      const selected = state.debtTypes.includes(item.id);
      const btn = createEl(
        "button",
        `option-card text-left p-4 hairline-all bg-ivory flex items-start justify-between gap-3 ${selected ? "is-selected" : ""}`
      );
      btn.type = "button";

      const info = createEl("div");
      info.appendChild(createEl("div", "text-sm font-semibold text-obsidian", item.label));
      info.appendChild(createEl("div", "text-xs text-mutedInk mt-1", item.note));

      const check = createEl(
        "span",
        `w-5 h-5 shrink-0 flex items-center justify-center border text-xs ${
          selected ? "bg-emeraldDeep border-emeraldDeep text-ivory" : "border-obsidian/30 text-transparent"
        }`,
        "✓"
      );

      btn.append(info, check);
      btn.addEventListener("click", () => {
        const idx = state.debtTypes.indexOf(item.id);
        if (idx > -1) {
          if (state.debtTypes.length > 1) state.debtTypes.splice(idx, 1);
        } else {
          state.debtTypes.push(item.id);
        }
        renderQuizStep(state);
        updateLiveEstimatePanel(state);
      });
      grid.appendChild(btn);
    });
    wrapper.appendChild(grid);
  }

  if (state.currentStep === 3) {
    wrapper.appendChild(createEl("h3", "font-serif text-2xl sm:text-3xl font-semibold text-obsidian", "Какое имущество есть в собственности?"));
    wrapper.appendChild(createEl("p", "text-sm text-mutedInk -mt-3", "Закон гарантирует защиту единственного жилья. Наличие других активов влияет на стратегию процедуры."));

    const list = createEl("div", "space-y-3");
    QUIZ_CONFIG.propertyOptions.forEach((opt) => {
      const selected = state.propertyType === opt.id;
      const btn = createEl(
        "button",
        `option-card w-full text-left p-4 hairline-all bg-ivory flex items-center justify-between gap-4 ${selected ? "is-selected" : ""}`
      );
      btn.type = "button";

      const info = createEl("div");
      info.appendChild(createEl("div", "text-sm font-semibold text-obsidian", opt.label));
      info.appendChild(createEl("div", "text-xs text-mutedInk mt-0.5", opt.desc));

      const radio = createEl(
        "span",
        `w-5 h-5 rounded-full shrink-0 border flex items-center justify-center ${
          selected ? "border-emeraldDeep" : "border-obsidian/30"
        }`
      );
      if (selected) radio.appendChild(createEl("span", "w-2.5 h-2.5 rounded-full bg-emeraldDeep"));

      btn.append(info, radio);
      btn.addEventListener("click", () => {
        state.propertyType = opt.id;
        renderQuizStep(state);
        updateLiveEstimatePanel(state);
      });
      list.appendChild(btn);
    });
    wrapper.appendChild(list);
  }

  if (state.currentStep === 4) {
    wrapper.appendChild(createEl("h3", "font-serif text-2xl sm:text-3xl font-semibold text-obsidian", "Текущая ситуация с платежами и сделками"));
    wrapper.appendChild(createEl("p", "text-sm text-mutedInk -mt-3", "Укажите статус просрочек и были ли продажи недвижимости или авто за последние 3 года."));

    const grid = createEl("div", "grid grid-cols-1 sm:grid-cols-2 gap-3");
    QUIZ_CONFIG.overdueOptions.forEach((opt) => {
      const selected = state.overdueStatus === opt.id;
      const btn = createEl("button", `option-card text-left p-4 hairline-all bg-ivory ${selected ? "is-selected" : ""}`);
      btn.type = "button";
      btn.appendChild(createEl("div", "text-sm font-semibold text-obsidian", opt.label));
      btn.appendChild(createEl("div", "text-xs text-mutedInk mt-1", opt.desc));

      btn.addEventListener("click", () => {
        state.overdueStatus = opt.id;
        renderQuizStep(state);
        updateLiveEstimatePanel(state);
      });
      grid.appendChild(btn);
    });
    wrapper.appendChild(grid);

    const txBox = createEl("div", "p-4 bg-limestone hairline-all flex flex-col sm:flex-row sm:items-center justify-between gap-4");
    const txText = createEl("div");
    txText.appendChild(createEl("div", "text-sm font-semibold text-obsidian", "Крупные сделки с имуществом за последние 3 года"));
    txText.appendChild(createEl("div", "text-xs text-mutedInk mt-0.5", "Продажа, дарение квартиры, земли или автомобиля"));

    const txBtns = createEl("div", "flex gap-2 shrink-0");
    const btnNo = createEl(
      "button",
      `px-4 py-2 text-xs font-mono hairline-all transition-colors ${
        !state.hadTransactions ? "bg-emeraldDeep text-ivory border-emeraldDeep" : "bg-ivory text-obsidian"
      }`,
      "Не было"
    );
    const btnYes = createEl(
      "button",
      `px-4 py-2 text-xs font-mono hairline-all transition-colors ${
        state.hadTransactions ? "bg-emeraldDeep text-ivory border-emeraldDeep" : "bg-ivory text-obsidian"
      }`,
      "Да, были"
    );
    btnNo.type = "button";
    btnYes.type = "button";

    btnNo.addEventListener("click", () => {
      state.hadTransactions = false;
      renderQuizStep(state);
      updateLiveEstimatePanel(state);
    });
    btnYes.addEventListener("click", () => {
      state.hadTransactions = true;
      renderQuizStep(state);
      updateLiveEstimatePanel(state);
    });

    txBtns.append(btnNo, btnYes);
    txBox.append(txText, txBtns);
    wrapper.appendChild(txBox);
  }

  if (state.currentStep === 5) {
    wrapper.appendChild(createEl("h3", "font-serif text-2xl sm:text-3xl font-semibold text-obsidian", "Выберите комфортный формат оплаты"));
    wrapper.appendChild(createEl("p", "text-sm text-mutedInk -mt-3", "Последний шаг — после него вы увидите полную детализированную смету и сможете закрепить скидку."));

    const planList = createEl("div", "space-y-3");
    QUIZ_CONFIG.paymentPlans.forEach((plan) => {
      const selected = state.paymentPlan === plan.id;
      const btn = createEl(
        "button",
        `option-card w-full text-left p-4 hairline-all bg-ivory flex items-center justify-between gap-4 ${selected ? "is-selected" : ""}`
      );
      btn.type = "button";

      const info = createEl("div");
      const titleRow = createEl("div", "flex items-center gap-2");
      titleRow.appendChild(createEl("span", "text-sm font-semibold text-obsidian", plan.label));
      if (plan.extraDiscount > 0) {
        titleRow.appendChild(createEl("span", "font-mono text-[10px] px-1.5 py-0.5 bg-copper/15 text-copper font-medium", `+${plan.extraDiscount}% скидка`));
      }
      info.appendChild(titleRow);
      info.appendChild(createEl("div", "text-xs text-mutedInk mt-0.5", plan.desc));

      const radio = createEl(
        "span",
        `w-5 h-5 rounded-full shrink-0 border flex items-center justify-center ${
          selected ? "border-emeraldDeep" : "border-obsidian/30"
        }`
      );
      if (selected) radio.appendChild(createEl("span", "w-2.5 h-2.5 rounded-full bg-emeraldDeep"));

      btn.append(info, radio);
      btn.addEventListener("click", () => {
        state.paymentPlan = plan.id;
        renderQuizStep(state);
        updateLiveEstimatePanel(state);
      });
      planList.appendChild(btn);
    });
    wrapper.appendChild(planList);

    const urgWrap = createEl("div", "pt-2");
    urgWrap.appendChild(createEl("div", "font-mono text-[11px] uppercase tracking-wider text-mutedInk mb-2.5", "Срочность подключения юриста"));
    const urgGrid = createEl("div", "grid grid-cols-1 sm:grid-cols-2 gap-3");
    QUIZ_CONFIG.urgencyOptions.forEach((u) => {
      const selected = state.urgency === u.id;
      const btn = createEl(
        "button",
        `option-card text-left px-4 py-3 text-xs font-medium hairline-all bg-ivory ${
          selected ? "is-selected text-emeraldDeep" : "text-obsidian"
        }`,
        u.label
      );
      btn.type = "button";
      btn.addEventListener("click", () => {
        state.urgency = u.id;
        renderQuizStep(state);
        updateLiveEstimatePanel(state);
      });
      urgGrid.appendChild(btn);
    });
    urgWrap.appendChild(urgGrid);
    wrapper.appendChild(urgWrap);
  }

  if (state.currentStep === 6) {
    const est = calculateEstimate(state);

    const headerRow = createEl("div", "flex flex-wrap items-center justify-between gap-3");
    const h3 = createEl("h3", "font-serif text-2xl sm:text-3xl font-semibold text-obsidian", "Ваша персональная смета готова");
    const editBtn = createEl("button", "text-xs font-mono text-emeraldDeep hover:text-copper underline underline-offset-4", "← Изменить ответы");
    editBtn.type = "button";
    editBtn.addEventListener("click", () => {
      state.currentStep = 1;
      renderQuizStep(state);
    });
    headerRow.append(h3, editBtn);
    wrapper.appendChild(headerRow);

    const summaryBox = createEl("div", "bg-limestone p-5 hairline-all space-y-3 text-sm");
    const rows = [
      ["Рекомендуемая процедура", est.procedureLabel],
      [`Гонорар юристов (с учётом скидки ${est.totalDiscountPct}%)`, formatCurrency(est.netLegalFee)],
      ["Судебные расходы по 127-ФЗ", est.courtFees === 0 ? "0 ₽ (МФЦ)" : formatCurrency(est.courtFees)],
      ["Промокод на скидку", est.promoCode]
    ];
    rows.forEach(([label, val]) => {
      const r = createEl("div", "flex items-baseline justify-between gap-4 pb-2 border-b border-obsidian/10 last:border-b-0 last:pb-0");
      r.appendChild(createEl("span", "text-mutedInk", label));
      r.appendChild(createEl("span", "font-mono font-medium text-obsidian text-right", val));
      summaryBox.appendChild(r);
    });
    wrapper.appendChild(summaryBox);

    const form = document.createElement("form");
    form.id = "leadCaptureForm";
    form.className = "space-y-4";
    form.noValidate = true;

    form.appendChild(createEl("div", "text-sm font-semibold text-obsidian", "Закрепите смету и получите PDF-разбор вашего дела (Демо-форма)"));

    const fieldsGrid = createEl("div", "grid grid-cols-1 sm:grid-cols-2 gap-3.5");

    const nameGroup = createEl("div");
    const nameLabel = createEl("label", "block font-mono text-[11px] uppercase tracking-wider text-mutedInk mb-1.5", "Ваше имя *");
    nameLabel.htmlFor = "clientNameInput";
    const nameInput = document.createElement("input");
    nameInput.id = "clientNameInput";
    nameInput.type = "text";
    nameInput.required = true;
    nameInput.maxLength = 60;
    nameInput.placeholder = "Например, Алексей";
    nameInput.className = "w-full px-3.5 py-3 bg-ivory hairline-all text-sm text-obsidian focus:outline-none focus:border-emeraldDeep";
    nameGroup.append(nameLabel, nameInput);

    const phoneGroup = createEl("div");
    const phoneLabel = createEl("label", "block font-mono text-[11px] uppercase tracking-wider text-mutedInk mb-1.5", "Телефон для сметы *");
    phoneLabel.htmlFor = "clientPhoneInput";
    const phoneInput = document.createElement("input");
    phoneInput.id = "clientPhoneInput";
    phoneInput.type = "tel";
    phoneInput.required = true;
    phoneInput.placeholder = "+7 (999) 000-00-00";
    phoneInput.className = "w-full px-3.5 py-3 bg-ivory hairline-all font-mono text-sm text-obsidian focus:outline-none focus:border-emeraldDeep";
    phoneInput.addEventListener("input", (e) => {
      e.target.value = formatPhoneInput(e.target.value);
    });
    phoneGroup.append(phoneLabel, phoneInput);

    fieldsGrid.append(nameGroup, phoneGroup);
    form.appendChild(fieldsGrid);

    const channelWrap = createEl("div");
    channelWrap.appendChild(createEl("div", "font-mono text-[11px] uppercase tracking-wider text-mutedInk mb-2", "Куда отправить расчёт и смету?"));
    const channels = ["Telegram", "WhatsApp", "Звонок юриста"];
    let selectedChannel = "Telegram";
    const channelRow = createEl("div", "grid grid-cols-3 gap-2.5");
    const channelButtons = [];

    channels.forEach((ch) => {
      const b = createEl(
        "button",
        `py-2.5 px-2 text-xs font-medium hairline-all transition-colors ${
          ch === selectedChannel ? "bg-emeraldDeep text-ivory border-emeraldDeep" : "bg-ivory text-obsidian hover:bg-parchment"
        }`,
        ch
      );
      b.type = "button";
      b.addEventListener("click", () => {
        selectedChannel = ch;
        channelButtons.forEach((btn) => {
          const active = btn.textContent === selectedChannel;
          btn.className = `py-2.5 px-2 text-xs font-medium hairline-all transition-colors ${
            active ? "bg-emeraldDeep text-ivory border-emeraldDeep" : "bg-ivory text-obsidian hover:bg-parchment"
          }`;
        });
      });
      channelButtons.push(b);
      channelRow.appendChild(b);
    });
    channelWrap.appendChild(channelRow);
    form.appendChild(channelWrap);

    const formError = createEl("div", "hidden text-xs text-red-700 bg-red-50 border border-red-200 px-3.5 py-2.5");
    form.appendChild(formError);

    const submitBtn = createEl(
      "button",
      "w-full py-4 px-6 bg-emeraldDeep hover:bg-emeraldHover text-ivory text-sm font-medium transition-colors flex items-center justify-center gap-2"
    );
    submitBtn.type = "submit";
    submitBtn.appendChild(document.createTextNode("Получить смету и посмотреть отправку в CRM"));
    submitBtn.appendChild(createEl("span", "", "→"));
    form.appendChild(submitBtn);

    form.appendChild(
      createEl(
        "p",
        "text-[11px] text-mutedInk text-center",
        "Демонстрационная форма: персональные данные не сохраняются на сервере и используются только для предпросмотра заявки."
      )
    );

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameVal = nameInput.value.trim();
      const phoneDigits = phoneInput.value.replace(/\D/g, "");

      if (nameVal.length < 2) {
        formError.textContent = "Пожалуйста, укажите имя (минимум 2 символа).";
        formError.classList.remove("hidden");
        nameInput.focus();
        return;
      }
      if (phoneDigits.length < 11) {
        formError.textContent = "Введите корректный номер телефона в формате +7 (999) 000-00-00 (можно вымышленный для теста).";
        formError.classList.remove("hidden");
        phoneInput.focus();
        return;
      }

      formError.classList.add("hidden");
      const latestEstimate = calculateEstimate(state);
      const payload = buildLeadPayload(state, latestEstimate, {
        name: nameVal,
        phone: phoneInput.value,
        channel: selectedChannel
      });
      state.lastPayload = payload;
      openDemoModal(payload);
    });

    wrapper.appendChild(form);
  }

  dom.quizStepContainer.textContent = "";
  dom.quizStepContainer.appendChild(wrapper);
}

export function renderCases(state) {
  dom.casesGrid.textContent = "";
  QUIZ_CONFIG.cases.forEach((item) => {
    const card = createEl("article", "bg-ivory hairline-all p-6 sm:p-7 flex flex-col justify-between hover:border-emeraldDeep/50 transition-colors");

    const top = createEl("div", "space-y-4");
    const metaRow = createEl("div", "flex items-center justify-between gap-2 text-[11px] font-mono");
    metaRow.appendChild(createEl("span", "text-emeraldDeep font-medium", item.caseNumber));
    metaRow.appendChild(createEl("span", "text-mutedInk", item.duration));

    const amountBlock = createEl("div", "pt-1");
    amountBlock.appendChild(createEl("div", "text-xs text-mutedInk", item.clientRole));
    amountBlock.appendChild(createEl("div", "font-serif text-4xl font-semibold text-obsidian mt-1", item.debtWrittenOff));
    amountBlock.appendChild(createEl("div", "inline-block mt-2 font-mono text-[11px] px-2.5 py-1 bg-emeraldDeep/10 text-emeraldDeep", item.assetSaved));

    const desc = createEl("p", "text-sm text-mutedInk leading-relaxed", item.summary);
    top.append(metaRow, amountBlock, desc);

    const actionBtn = createEl(
      "button",
      "mt-6 pt-4 hairline-t w-full flex items-center justify-between text-xs font-mono uppercase tracking-wider text-obsidian hover:text-emeraldDeep transition-colors"
    );
    actionBtn.type = "button";
    actionBtn.appendChild(createEl("span", "", "Примерить расчёт в квизе"));
    actionBtn.appendChild(createEl("span", "", "↑"));
    actionBtn.addEventListener("click", () => {
      Object.assign(state, {
        debtAmount: item.preset.debtAmount,
        debtTypes: [...item.preset.debtTypes],
        propertyType: item.preset.propertyType,
        overdueStatus: item.preset.overdueStatus,
        hadTransactions: item.preset.hadTransactions,
        paymentPlan: item.preset.paymentPlan,
        urgency: item.preset.urgency,
        currentStep: 6,
        visitedSteps: new Set([1, 2, 3, 4, 5])
      });
      renderQuizStep(state);
      updateLiveEstimatePanel(state);
      document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
      showToast(`Загружен расчёт по кейсу: ${item.debtWrittenOff}`);
    });

    card.append(top, actionBtn);
    dom.casesGrid.appendChild(card);
  });
}

export function renderFaq() {
  dom.faqContainer.textContent = "";
  QUIZ_CONFIG.faqs.forEach((item, index) => {
    const wrap = createEl("div", "faq-item py-5");
    wrap.dataset.open = index === 0 ? "true" : "false";

    const btn = createEl("button", "w-full flex items-center justify-between gap-4 text-left group");
    btn.type = "button";
    btn.setAttribute("aria-expanded", index === 0 ? "true" : "false");
    btn.appendChild(createEl("span", "text-base sm:text-lg font-medium text-obsidian group-hover:text-emeraldDeep transition-colors", item.q));
    btn.appendChild(createEl("span", "faq-icon font-mono text-2xl leading-none text-emeraldDeep shrink-0", "+"));

    const content = createEl("div", "faq-content");
    const inner = createEl("div", "faq-inner");
    inner.appendChild(createEl("p", "pt-3 pr-8 text-sm sm:text-base text-mutedInk leading-relaxed", item.a));
    content.appendChild(inner);

    btn.addEventListener("click", () => {
      const isOpen = wrap.dataset.open === "true";
      wrap.dataset.open = isOpen ? "false" : "true";
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });

    wrap.append(btn, content);
    dom.faqContainer.appendChild(wrap);
  });
}
