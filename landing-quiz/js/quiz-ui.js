import { QUIZ_CONFIG, STEP_LABELS } from "./config.js";
import { calculateEstimate, formatRub } from "./calculator.js";

export const quizState = {
  step: 1,
  propertyType: "new_concrete",
  area: QUIZ_CONFIG.defaultArea,
  ceiling: "standard",
  style: "minimalism",
  options: ["design_project"],
  timeline: "month",
  bonus: "discount7",
  channel: "Telegram",
  leadName: "",
  leadPhone: ""
};

const dom = {
  quizStage: document.getElementById("quiz-stage"),
  stepBadge: document.getElementById("quiz-step-badge"),
  stepLabel: document.getElementById("quiz-step-label"),
  progressBar: document.getElementById("quiz-progress-bar"),
  progressText: document.getElementById("quiz-progress-text"),
  prevBtn: document.getElementById("quiz-prev-btn"),
  nextBtn: document.getElementById("quiz-next-btn"),
  nextLabel: document.getElementById("quiz-next-label"),
  navFooter: document.getElementById("quiz-nav-footer"),
  liveTotalEl: document.getElementById("live-total-price"),
  liveOldEl: document.getElementById("live-old-price"),
  livePerSqmEl: document.getElementById("live-per-sqm"),
  liveRoughEl: document.getElementById("live-rough-cost"),
  liveFinishEl: document.getElementById("live-finish-cost"),
  liveOptionsEl: document.getElementById("live-options-cost"),
  liveSavingEl: document.getElementById("live-saving-cost"),
  liveDiscountBadge: document.getElementById("live-discount-badge"),
  liveSummaryTags: document.getElementById("live-summary-tags"),
  liveDurationEl: document.getElementById("live-duration"),
  liveBonusText: document.getElementById("live-bonus-text"),
  liveJumpFinalBtn: document.getElementById("live-jump-final-btn")
};

let displayedTotal = calculateEstimate(quizState).finalTotal;
let priceAnimFrame = null;
let onFormSubmitCallback = null;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function animatePriceTo(target) {
  cancelAnimationFrame(priceAnimFrame);
  const start = displayedTotal;
  const diff = target - start;
  if (Math.abs(diff) < 500) {
    displayedTotal = target;
    if (dom.liveTotalEl) dom.liveTotalEl.textContent = formatRub(target);
    return;
  }
  const startTime = performance.now();
  const duration = 340;

  function tick(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    displayedTotal = Math.round(start + diff * eased);
    if (dom.liveTotalEl) dom.liveTotalEl.textContent = formatRub(displayedTotal);
    if (t < 1) {
      priceAnimFrame = requestAnimationFrame(tick);
    } else {
      displayedTotal = target;
    }
  }
  priceAnimFrame = requestAnimationFrame(tick);
}

export function updateLiveEstimatePanel() {
  const calc = calculateEstimate(quizState);

  animatePriceTo(calc.finalTotal);
  if (dom.liveOldEl) dom.liveOldEl.textContent = formatRub(calc.subtotal);
  if (dom.livePerSqmEl) dom.livePerSqmEl.textContent = `${formatRub(calc.perSqm)} / м²`;
  if (dom.liveRoughEl) dom.liveRoughEl.textContent = formatRub(calc.roughCost);
  if (dom.liveFinishEl) dom.liveFinishEl.textContent = formatRub(calc.finishCost);
  if (dom.liveOptionsEl) dom.liveOptionsEl.textContent = formatRub(calc.optionsCost);
  if (dom.liveSavingEl) dom.liveSavingEl.textContent = `−${formatRub(calc.saving)}`;
  if (dom.liveDiscountBadge) dom.liveDiscountBadge.textContent = `Скидка −${calc.discountPercent}%`;
  if (dom.liveDurationEl) dom.liveDurationEl.textContent = `~${calc.durationMonths} мес`;
  if (dom.liveBonusText) dom.liveBonusText.textContent = calc.bonusObj.title;

  if (dom.liveSummaryTags) {
    const tags = [
      calc.prop.title.split(" ")[0],
      `${quizState.area} м²`,
      calc.styleObj.title.split(" ")[0],
      quizState.options.length ? `+${quizState.options.length} опц.` : "Базовая инженерия"
    ];
    dom.liveSummaryTags.innerHTML = tags
      .map(
        (t) =>
          `<span class="px-2.5 py-1 rounded-full bg-white/10 text-stone-soft text-[10.5px] font-mono">${escapeHtml(t)}</span>`
      )
      .join("");
  }

  if (dom.liveJumpFinalBtn) {
    dom.liveJumpFinalBtn.classList.toggle("hidden", quizState.step === 6);
  }
}

function validateLeadInput(name, contact) {
  if (!name || name.length < 2) {
    return "Укажите ваше имя (минимум 2 символа).";
  }
  if (!contact) {
    return "Укажите телефон или @username в Telegram.";
  }
  const isTelegramHandle = /^@[a-zA-Z0-9_]{3,32}$/.test(contact);
  const digitsCount = contact.replace(/\D/g, "").length;
  if (!isTelegramHandle && digitsCount < 7) {
    return "Введите корректный номер телефона или @username.";
  }
  return "";
}

function renderStepContent() {
  if (quizState.step === 1) {
    return `
      <div class="quiz-step-animate flex flex-col gap-6">
        <div>
          <h3 class="text-xl sm:text-2xl font-extrabold text-ink-primary tracking-tight">
            В каком типе объекта планируется ремонт?
          </h3>
          <p class="text-xs sm:text-sm text-ink-secondary mt-1.5">
            От этого зависит объём черновых работ, демонтажа и состав инженерной части.
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          ${QUIZ_CONFIG.propertyTypes
            .map((p) => {
              const sel = quizState.propertyType === p.id;
              return `<button type="button" data-prop-id="${p.id}" class="quiz-option ${sel ? "is-selected" : ""} text-left p-5 rounded-2xl flex flex-col justify-between gap-4 cursor-pointer">
                <div class="flex items-start justify-between gap-3">
                  <span class="px-2.5 py-0.5 rounded-full bg-stone-soft text-ink-secondary font-mono text-[10px] uppercase tracking-wider">${p.badge}</span>
                  <span class="check-dot w-5 h-5 rounded-full border border-ink-primary/25 flex items-center justify-center text-[10px] font-bold shrink-0">${sel ? "✓" : ""}</span>
                </div>
                <div>
                  <div class="text-sm sm:text-base font-bold text-ink-primary mb-1">${p.title}</div>
                  <p class="text-xs text-ink-secondary leading-relaxed">${p.subtitle}</p>
                </div>
                <div class="pt-3 border-t border-ink-primary/10 font-mono text-[11px] text-terra font-semibold">
                  от ${p.ratePerSqm.toLocaleString("ru-RU")} ₽ / м²
                </div>
              </button>`;
            })
            .join("")}
        </div>
      </div>`;
  }

  if (quizState.step === 2) {
    const sliderPct = ((quizState.area - QUIZ_CONFIG.minArea) / (QUIZ_CONFIG.maxArea - QUIZ_CONFIG.minArea)) * 100;
    return `
      <div class="quiz-step-animate flex flex-col gap-7">
        <div>
          <h3 class="text-xl sm:text-2xl font-extrabold text-ink-primary tracking-tight">
            Укажите ориентировочную площадь квартиры
          </h3>
          <p class="text-xs sm:text-sm text-ink-secondary mt-1.5">
            Двигайте ползунок или выберите быстрый пресет — смета справа пересчитается на лету.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-stone-bg border border-ink-primary/12 flex flex-col gap-5">
          <div class="flex items-baseline justify-between gap-4">
            <span class="text-xs font-mono uppercase tracking-[0.14em] text-ink-muted">Площадь по полу</span>
            <div class="flex items-baseline gap-1.5">
              <span id="area-value-display" class="font-mono text-4xl sm:text-5xl font-bold text-ink-primary tracking-tight">${quizState.area}</span>
              <span class="font-mono text-lg text-terra font-semibold">м²</span>
            </div>
          </div>

          <input
            id="area-range-slider"
            type="range"
            min="${QUIZ_CONFIG.minArea}"
            max="${QUIZ_CONFIG.maxArea}"
            value="${quizState.area}"
            class="arch-slider"
            style="--slider-pct: ${sliderPct}%;"
            aria-label="Площадь квартиры в квадратных метрах"
          >

          <div class="flex items-center justify-between text-[11px] font-mono text-ink-muted">
            <span>${QUIZ_CONFIG.minArea} м²</span>
            <span>120 м²</span>
            <span>${QUIZ_CONFIG.maxArea} м²</span>
          </div>

          <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-ink-primary/10">
            <span class="text-[11px] font-mono text-ink-muted mr-1">Популярные:</span>
            ${QUIZ_CONFIG.areaPresets
              .map(
                (preset) =>
                  `<button type="button" data-area-preset="${preset}" class="area-preset-btn px-3.5 py-1.5 rounded-full text-xs font-mono border transition-all cursor-pointer ${
                    quizState.area === preset
                      ? "bg-ink-primary text-stone-card border-ink-primary"
                      : "bg-stone-card text-ink-secondary border-ink-primary/15 hover:border-ink-primary"
                  }">${preset} м²</button>`
              )
              .join("")}
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <span class="text-xs font-mono uppercase tracking-[0.14em] text-ink-muted">Высота потолков</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${QUIZ_CONFIG.ceilingOptions
              .map((c) => {
                const sel = quizState.ceiling === c.id;
                return `<button type="button" data-ceiling-id="${c.id}" class="quiz-option ${sel ? "is-selected" : ""} px-4 py-3.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer">
                  <span class="text-xs sm:text-sm font-semibold text-ink-primary">${c.label}</span>
                  <span class="check-dot w-5 h-5 rounded-full border border-ink-primary/25 flex items-center justify-center text-[10px] font-bold shrink-0">${sel ? "✓" : ""}</span>
                </button>`;
              })
              .join("")}
          </div>
        </div>
      </div>`;
  }

  if (quizState.step === 3) {
    return `
      <div class="quiz-step-animate flex flex-col gap-6">
        <div>
          <h3 class="text-xl sm:text-2xl font-extrabold text-ink-primary tracking-tight">
            Какой стиль и уровень отделки вам ближе?
          </h3>
          <p class="text-xs sm:text-sm text-ink-secondary mt-1.5">
            Выберите визуальное направление — оно определяет сложность узлов и класс чистовых работ.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${QUIZ_CONFIG.styles
            .map((s) => {
              const sel = quizState.style === s.id;
              return `<button type="button" data-style-id="${s.id}" class="quiz-option ${sel ? "is-selected" : ""} text-left rounded-2xl overflow-hidden flex flex-col cursor-pointer group">
                <div class="relative w-full aspect-[16/9] bg-stone-soft overflow-hidden">
                  <img src="${s.image}" alt="${escapeHtml(s.title)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.src='https://placehold.co/600x340/EAE4D9/151412?text=${encodeURIComponent(s.title)}'">
                  <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-stone-card/90 backdrop-blur-sm font-mono text-[9.5px] uppercase tracking-wider text-ink-primary">${s.tag}</span>
                  <span class="check-dot absolute top-2.5 right-2.5 w-6 h-6 rounded-full border border-white/80 bg-ink-primary/35 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-white">${sel ? "✓" : ""}</span>
                </div>
                <div class="p-4 flex flex-col gap-1">
                  <div class="text-sm font-bold text-ink-primary">${s.title}</div>
                  <p class="text-xs text-ink-secondary leading-relaxed">${s.subtitle}</p>
                </div>
              </button>`;
            })
            .join("")}
        </div>
      </div>`;
  }

  if (quizState.step === 4) {
    return `
      <div class="quiz-step-animate flex flex-col gap-6">
        <div>
          <h3 class="text-xl sm:text-2xl font-extrabold text-ink-primary tracking-tight">
            Какие инженерные системы и опции включить?
          </h3>
          <p class="text-xs sm:text-sm text-ink-secondary mt-1.5">
            Можно выбрать несколько пунктов или пропустить этот шаг, если нужны только базовые работы.
          </p>
        </div>

        <div class="flex flex-col gap-3">
          ${QUIZ_CONFIG.extraOptions
            .map((opt) => {
              const sel = quizState.options.includes(opt.id);
              const estOptPrice = opt.flatPrice + opt.pricePerSqm * quizState.area;
              return `<button type="button" data-opt-id="${opt.id}" class="quiz-option ${sel ? "is-selected" : ""} w-full text-left p-4 rounded-2xl flex items-start sm:items-center justify-between gap-4 cursor-pointer">
                <div class="flex items-start gap-3.5">
                  <span class="check-dot mt-0.5 w-5 h-5 rounded-md border border-ink-primary/25 flex items-center justify-center text-[11px] font-bold shrink-0">${sel ? "✓" : ""}</span>
                  <div>
                    <div class="text-sm font-bold text-ink-primary">${opt.title}</div>
                    <p class="text-xs text-ink-secondary mt-0.5 leading-relaxed">${opt.desc}</p>
                  </div>
                </div>
                <span class="font-mono text-xs font-semibold text-terra whitespace-nowrap shrink-0">+${formatRub(estOptPrice)}</span>
              </button>`;
            })
            .join("")}
        </div>
      </div>`;
  }

  if (quizState.step === 5) {
    return `
      <div class="quiz-step-animate flex flex-col gap-7">
        <div>
          <h3 class="text-xl sm:text-2xl font-extrabold text-ink-primary tracking-tight">
            Когда планируете старт и какой бонус закрепить?
          </h3>
          <p class="text-xs sm:text-sm text-ink-secondary mt-1.5">
            Выбранный бонус автоматически привязывается к вашей смете на 14 дней.
          </p>
        </div>

        <div class="flex flex-col gap-2.5">
          <span class="text-xs font-mono uppercase tracking-[0.14em] text-ink-muted">Планируемый старт работ</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            ${QUIZ_CONFIG.timelines
              .map((t) => {
                const sel = quizState.timeline === t.id;
                return `<button type="button" data-timeline-id="${t.id}" class="quiz-option ${sel ? "is-selected" : ""} px-4 py-3 rounded-xl flex items-center justify-between gap-2 text-left cursor-pointer">
                  <span class="text-xs sm:text-sm font-semibold text-ink-primary">${t.label}</span>
                  <span class="check-dot w-4 h-4 rounded-full border border-ink-primary/25 flex items-center justify-center text-[9px] font-bold shrink-0">${sel ? "✓" : ""}</span>
                </button>`;
              })
              .join("")}
          </div>
        </div>

        <div class="flex flex-col gap-2.5">
          <span class="text-xs font-mono uppercase tracking-[0.14em] text-ink-muted">Выберите ваш бонус</span>
          <div class="grid grid-cols-1 gap-3">
            ${QUIZ_CONFIG.bonuses
              .map((b) => {
                const sel = quizState.bonus === b.id;
                return `<button type="button" data-bonus-id="${b.id}" class="quiz-option ${sel ? "is-selected" : ""} p-4 rounded-2xl flex items-center justify-between gap-4 text-left cursor-pointer">
                  <div class="flex items-center gap-3.5">
                    <span class="check-dot w-5 h-5 rounded-full border border-ink-primary/25 flex items-center justify-center text-[10px] font-bold shrink-0">${sel ? "✓" : ""}</span>
                    <div>
                      <div class="text-sm font-bold text-ink-primary">${b.title}</div>
                      <p class="text-xs text-ink-secondary mt-0.5">${b.subtitle}</p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full bg-terra-soft text-terra font-mono text-[10.5px] font-semibold shrink-0">−${b.discountPercent}%</span>
                </button>`;
              })
              .join("")}
          </div>
        </div>
      </div>`;
  }

  const calc = calculateEstimate(quizState);
  const channels = ["Telegram", "WhatsApp", "Email / PDF"];
  return `
    <div class="quiz-step-animate flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span class="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-sage font-semibold">
            <span>✓</span> Расчёт завершён
          </span>
          <h3 class="text-xl sm:text-2xl font-extrabold text-ink-primary tracking-tight mt-1">
            Куда отправить подробную PDF-смету?
          </h3>
        </div>
        <button id="back-to-steps-btn" type="button" class="text-xs font-mono text-ink-secondary hover:text-terra underline underline-offset-4 cursor-pointer">
          ← Изменить параметры
        </button>
      </div>

      <div class="p-5 rounded-2xl bg-stone-bg border border-terra/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="text-[11px] font-mono uppercase tracking-wider text-ink-muted">${calc.prop.title} · ${quizState.area} м² · ${calc.styleObj.title}</div>
          <div class="text-2xl sm:text-3xl font-mono font-bold text-ink-primary mt-1">${formatRub(calc.finalTotal)}</div>
        </div>
        <div class="flex flex-col sm:items-end gap-1 text-xs font-mono">
          <span class="px-2.5 py-1 rounded-full bg-terra text-white font-semibold w-max">Закреплено: ${calc.bonusObj.title}</span>
          <span class="text-ink-secondary">Срок: ~${calc.durationMonths} мес</span>
        </div>
      </div>

      <form id="quiz-lead-form" class="flex flex-col gap-4" novalidate>
        <div>
          <span class="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-2">Удобный способ получить смету</span>
          <div class="grid grid-cols-3 gap-2">
            ${channels
              .map(
                (ch) =>
                  `<button type="button" data-channel="${ch}" class="channel-btn py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    quizState.channel === ch
                      ? "bg-ink-primary text-stone-card border-ink-primary"
                      : "bg-stone-bg text-ink-secondary border-ink-primary/15 hover:border-ink-primary"
                  }">${ch}</button>`
              )
              .join("")}
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="quiz-name" class="block text-[11px] font-mono uppercase tracking-wider text-ink-secondary mb-1.5">Ваше имя</label>
            <input id="quiz-name" type="text" required maxlength="80" placeholder="Алексей" class="w-full px-4 py-3 rounded-xl bg-stone-bg border border-ink-primary/18 text-ink-primary placeholder-ink-muted text-base sm:text-sm focus:outline-none focus:border-terra focus:ring-0">
          </div>
          <div>
            <label for="quiz-phone" class="block text-[11px] font-mono uppercase tracking-wider text-ink-secondary mb-1.5">Телефон или @username</label>
            <input id="quiz-phone" type="text" required maxlength="80" placeholder="+7 (999) 000-00-00" class="w-full px-4 py-3 rounded-xl bg-stone-bg border border-ink-primary/18 text-ink-primary placeholder-ink-muted text-base sm:text-sm focus:outline-none focus:border-terra focus:ring-0">
          </div>
        </div>

        <p id="quiz-form-error" class="hidden text-xs font-medium text-terra" role="alert"></p>

        <button type="submit" class="btn-terra w-full py-4 px-6 rounded-full text-xs font-bold uppercase tracking-[0.14em] mt-1 cursor-pointer">
          Получить смету и закрепить бонус →
        </button>

        <p class="text-[11px] text-ink-muted text-center">
          Интерактивная демонстрация: ваши данные никуда не передаются, вы сразу увидите готовый формат заявки для Telegram/CRM.
        </p>
      </form>
    </div>`;
}

function bindStepEvents() {
  const stage = dom.quizStage;
  if (!stage) return;

  stage.querySelectorAll("[data-prop-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      quizState.propertyType = btn.dataset.propId;
      renderQuizStep();
    });
  });

  const slider = document.getElementById("area-range-slider");
  const areaDisplay = document.getElementById("area-value-display");
  if (slider) {
    slider.addEventListener("input", () => {
      quizState.area = Number(slider.value);
      const pct = ((quizState.area - QUIZ_CONFIG.minArea) / (QUIZ_CONFIG.maxArea - QUIZ_CONFIG.minArea)) * 100;
      slider.style.setProperty("--slider-pct", `${pct}%`);
      if (areaDisplay) areaDisplay.textContent = quizState.area;

      stage.querySelectorAll(".area-preset-btn").forEach((pb) => {
        const active = Number(pb.dataset.areaPreset) === quizState.area;
        pb.className = `area-preset-btn px-3.5 py-1.5 rounded-full text-xs font-mono border transition-all cursor-pointer ${
          active
            ? "bg-ink-primary text-stone-card border-ink-primary"
            : "bg-stone-card text-ink-secondary border-ink-primary/15 hover:border-ink-primary"
        }`;
      });
      updateLiveEstimatePanel();
    });
  }

  stage.querySelectorAll(".area-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      quizState.area = Number(btn.dataset.areaPreset);
      renderQuizStep();
    });
  });

  stage.querySelectorAll("[data-ceiling-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      quizState.ceiling = btn.dataset.ceilingId;
      renderQuizStep();
    });
  });

  stage.querySelectorAll("[data-style-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      quizState.style = btn.dataset.styleId;
      renderQuizStep();
    });
  });

  stage.querySelectorAll("[data-opt-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.optId;
      if (quizState.options.includes(id)) {
        quizState.options = quizState.options.filter((x) => x !== id);
      } else {
        quizState.options = [...quizState.options, id];
      }
      renderQuizStep();
    });
  });

  stage.querySelectorAll("[data-timeline-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      quizState.timeline = btn.dataset.timelineId;
      renderQuizStep();
    });
  });

  stage.querySelectorAll("[data-bonus-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      quizState.bonus = btn.dataset.bonusId;
      renderQuizStep();
    });
  });

  const backToSteps = document.getElementById("back-to-steps-btn");
  backToSteps?.addEventListener("click", () => {
    quizState.step = 5;
    renderQuizStep();
  });

  stage.querySelectorAll(".channel-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      quizState.channel = btn.dataset.channel;
      renderQuizStep();
    });
  });

  // Значения полей формы устанавливаем через DOM API, чтобы исключить XSS при повторном рендере
  const nameInput = document.getElementById("quiz-name");
  const phoneInput = document.getElementById("quiz-phone");
  const errorBox = document.getElementById("quiz-form-error");

  if (nameInput) {
    nameInput.value = quizState.leadName;
    nameInput.addEventListener("input", () => {
      quizState.leadName = nameInput.value;
      if (errorBox) errorBox.classList.add("hidden");
    });
  }

  if (phoneInput) {
    phoneInput.value = quizState.leadPhone;
    phoneInput.addEventListener("input", () => {
      quizState.leadPhone = phoneInput.value;
      if (errorBox) errorBox.classList.add("hidden");
    });
  }

  const leadForm = document.getElementById("quiz-lead-form");
  leadForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const cleanName = (nameInput?.value || "").trim();
    const cleanPhone = (phoneInput?.value || "").trim();
    const validationError = validateLeadInput(cleanName, cleanPhone);

    if (validationError) {
      if (errorBox) {
        errorBox.textContent = validationError;
        errorBox.classList.remove("hidden");
      }
      if (!cleanName || cleanName.length < 2) {
        nameInput?.focus();
      } else {
        phoneInput?.focus();
      }
      return;
    }

    quizState.leadName = cleanName;
    quizState.leadPhone = cleanPhone;
    if (typeof onFormSubmitCallback === "function") {
      onFormSubmitCallback(quizState);
    }
  });
}

export function renderQuizStep() {
  if (!dom.quizStage) return;

  const isFinal = quizState.step === 6;
  const pct = isFinal ? 100 : Math.round((quizState.step / 5) * 100);

  if (dom.stepBadge) {
    dom.stepBadge.textContent = isFinal ? "Финал · Расчёт готов" : `Шаг 0${quizState.step} / 05`;
  }
  if (dom.stepLabel) {
    dom.stepLabel.textContent = STEP_LABELS[quizState.step] || "";
  }
  if (dom.progressBar) dom.progressBar.style.width = `${pct}%`;
  if (dom.progressText) dom.progressText.textContent = `${pct}%`;

  if (dom.navFooter) {
    dom.navFooter.classList.toggle("hidden", isFinal);
  }
  if (dom.prevBtn) {
    dom.prevBtn.disabled = quizState.step <= 1;
  }
  if (dom.nextLabel) {
    dom.nextLabel.textContent = quizState.step === 5 ? "Показать готовую смету" : "Следующий шаг";
  }

  dom.quizStage.innerHTML = renderStepContent();
  bindStepEvents();
  updateLiveEstimatePanel();
}

export function initQuizUI(onSubmit) {
  onFormSubmitCallback = onSubmit;

  dom.prevBtn?.addEventListener("click", () => {
    if (quizState.step > 1) {
      quizState.step -= 1;
      renderQuizStep();
    }
  });

  dom.nextBtn?.addEventListener("click", () => {
    if (quizState.step < 6) {
      quizState.step += 1;
      renderQuizStep();
    }
  });

  dom.liveJumpFinalBtn?.addEventListener("click", () => {
    quizState.step = 6;
    renderQuizStep();
    document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
  });

  document.querySelectorAll(".preset-load-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      quizState.area = Number(btn.dataset.presetArea || QUIZ_CONFIG.defaultArea);
      quizState.style = btn.dataset.presetStyle || "minimalism";
      quizState.propertyType = btn.dataset.presetType || "new_concrete";
      quizState.step = 6;
      renderQuizStep();
      document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
    });
  });

  renderQuizStep();
}
