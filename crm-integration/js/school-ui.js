import {
  CEFR_LEVELS,
  DIAG_SCENARIOS,
  LIVE_IDIOMS,
  SKILL_BG_CLASSES,
  TRIAL_SLOTS
} from "./school-data.js";
import { escapeHtml } from "./crm-payloads.js";

export function renderIdiomCard(state) {
  const container = document.getElementById("idiom-content");
  if (!container) return;
  const item = LIVE_IDIOMS[state.idiomIdx];
  container.innerHTML = `
    <div class="soft-enter flex flex-col gap-1.5">
      <div class="text-xs text-ink-400 line-through">${escapeHtml(item.textbook)}</div>
      <div class="font-serif italic font-semibold text-2xl leading-tight text-ink-900">«${escapeHtml(item.native)}»</div>
      <div class="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-ink-900/8 text-[11px]">
        <span class="text-ink-600">${escapeHtml(item.meaning)}</span>
        <span class="font-mono text-british-800 shrink-0">${escapeHtml(item.ipa)}</span>
      </div>
    </div>`;
}

export function initSpeechSynthesis(state) {
  document.getElementById("next-idiom-btn")?.addEventListener("click", () => {
    state.idiomIdx = (state.idiomIdx + 1) % LIVE_IDIOMS.length;
    renderIdiomCard(state);
  });

  const speakBtn = document.getElementById("hero-speak-btn");
  const speakLabel = document.getElementById("hero-speak-label");
  let speakResetTimer = null;

  speakBtn?.addEventListener("click", () => {
    const phrase = LIVE_IDIOMS[state.idiomIdx].native;
    speakBtn.classList.add("is-speaking");
    if (speakLabel) speakLabel.textContent = `«${phrase}»`;

    clearTimeout(speakResetTimer);
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(phrase);
        utter.lang = "en-GB";
        utter.rate = 0.94;
        utter.onend = () => {
          speakBtn.classList.remove("is-speaking");
          if (speakLabel) speakLabel.textContent = "Послушать живую речь";
        };
        window.speechSynthesis.speak(utter);
      } catch (err) {
        // Browser speech synthesis unavailable
      }
    }
    speakResetTimer = setTimeout(() => {
      speakBtn.classList.remove("is-speaking");
      if (speakLabel) speakLabel.textContent = "Послушать живую речь";
    }, 2600);
  });
}

export function renderLevelSpread(state, animate = false) {
  const switcher = document.getElementById("cefr-switcher");
  const leftCol = document.getElementById("level-feature-column");
  const grid = document.getElementById("skills-grid");
  const lvl = CEFR_LEVELS[state.activeCefr] || CEFR_LEVELS.A1;

  if (switcher) {
    switcher.innerHTML = Object.values(CEFR_LEVELS)
      .map((item) => {
        const active = item.code === state.activeCefr;
        return `<button type="button" data-cefr="${escapeHtml(item.code)}" class="shrink-0 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-semibold transition-all cursor-pointer ${
          active ? "bg-ink-900 text-white shadow" : "text-ink-600 hover:text-ink-900"
        }">${escapeHtml(item.tabLabel)}</button>`;
      })
      .join("");

    switcher.querySelectorAll("[data-cefr]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeCefr = btn.dataset.cefr;
        renderLevelSpread(state, true);
      });
    });
  }

  if (leftCol) {
    leftCol.innerHTML = `
      <div class="${animate ? "soft-enter" : ""} flex flex-col gap-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <span class="font-mono text-xs text-[#9EE0BE]">${escapeHtml(lvl.ipa)}</span>
            <div class="font-serif font-bold text-6xl sm:text-7xl leading-[0.88] text-white mt-1">${escapeHtml(lvl.code)}</div>
          </div>
          <span class="px-3 py-1 rounded-full bg-white/12 border border-white/15 font-mono text-[10.5px] uppercase tracking-wider text-gallery-bg">
            CEFR Standard
          </span>
        </div>

        <p class="text-sm sm:text-[15px] text-gallery-bg/85 leading-relaxed">
          ${escapeHtml(lvl.subtitle)}
        </p>

        <div class="rounded-2xl bg-british-900/85 border border-white/12 p-4 flex flex-col gap-2.5">
          <div class="text-[10px] font-mono uppercase tracking-wider text-[#9EE0BE]">Пример речи на уровне ${escapeHtml(lvl.code)}</div>
          ${lvl.dialogue
            .map(
              (line) => `
              <div class="flex flex-col gap-0.5">
                <div class="text-sm font-serif italic text-white leading-snug"><span class="font-mono not-italic text-[10px] text-[#9EE0BE] mr-1.5">${escapeHtml(line.who)}:</span>«${escapeHtml(line.en)}»</div>
                <div class="text-[11px] text-gallery-bg/55 pl-5">${escapeHtml(line.ru)}</div>
              </div>`
            )
            .join("")}
        </div>

        <div class="flex flex-col gap-2.5 pt-2 border-t border-white/12">
          <div class="text-[10.5px] font-mono uppercase tracking-wider text-gallery-bg/60">Как понять, что уровень освоен</div>
          <ul class="flex flex-col gap-2 text-xs sm:text-[13px] text-gallery-bg/90 leading-relaxed">
            ${lvl.mastery
              .map(
                (m) =>
                  `<li class="flex items-start gap-2.5"><span class="text-vermilion font-bold mt-0.5">•</span><span>${escapeHtml(m)}</span></li>`
              )
              .join("")}
          </ul>
        </div>
      </div>

      <div class="pt-4 border-t border-white/12 flex items-center justify-between gap-3">
        <span class="text-xs text-gallery-bg/65">Пройти этот уровень с нами</span>
        <button type="button" id="level-enroll-btn" class="px-5 py-2.5 rounded-full bg-gallery-bg hover:bg-white text-ink-900 text-xs font-bold transition-colors cursor-pointer shrink-0">
          Начать ${escapeHtml(lvl.code)} →
        </button>
      </div>
    `;

    document.getElementById("level-enroll-btn")?.addEventListener("click", () => {
      const select = document.getElementById("enroll-level");
      if (select) select.value = lvl.enrollValue;
      document.getElementById("enroll")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (grid) {
    grid.innerHTML = lvl.skills
      .map(
        (sk, i) => `
        <article class="skill-tile ${SKILL_BG_CLASSES[i % SKILL_BG_CLASSES.length]} ${animate ? "soft-enter" : ""} rounded-[22px] p-5 flex flex-col justify-between gap-4">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-mono text-[11px] font-semibold text-ink-400">${escapeHtml(sk.num)}</span>
              <span class="px-2.5 py-0.5 rounded-full bg-white/75 text-[10.5px] font-mono text-british-900 font-medium">${escapeHtml(sk.tag)}</span>
            </div>
            <h3 class="font-serif font-bold text-2xl text-ink-900 leading-none mb-3">${escapeHtml(sk.title)}</h3>
            <ul class="flex flex-col gap-1.5 text-xs sm:text-[13px] text-ink-600 leading-relaxed">
              ${sk.points
                .map(
                  (p) =>
                    `<li class="flex items-start gap-2"><span class="text-british-800 font-bold">–</span><span>${escapeHtml(p)}</span></li>`
                )
                .join("")}
            </ul>
          </div>
        </article>`
      )
      .join("");
  }
}

export function renderDiagnostic(state) {
  const stage = document.getElementById("diag-card-stage");
  const indicator = document.getElementById("diag-step-indicator");
  if (!stage) return;

  if (state.diagStep < DIAG_SCENARIOS.length) {
    const item = DIAG_SCENARIOS[state.diagStep];
    if (indicator) indicator.textContent = `Ситуация ${state.diagStep + 1} / ${DIAG_SCENARIOS.length}`;

    stage.innerHTML = `
      <div class="soft-enter flex flex-col gap-5">
        <div>
          <div class="font-mono text-[11px] uppercase tracking-wider text-british-800 font-semibold mb-1.5">${escapeHtml(item.context)}</div>
          <h3 class="text-lg sm:text-xl font-bold text-ink-900 leading-snug">${escapeHtml(item.prompt)}</h3>
        </div>
        <div class="flex flex-col gap-2.5">
          ${item.options
            .map(
              (opt, idx) => `
              <button type="button" data-diag-opt="${idx}" class="diag-opt-btn group p-4 rounded-2xl bg-white hover:bg-british-800 hover:text-white border border-ink-900/12 text-left transition-all cursor-pointer flex items-center justify-between gap-3">
                <span class="font-serif italic text-lg sm:text-xl font-medium leading-snug">«${escapeHtml(opt.text)}»</span>
                <span class="w-7 h-7 rounded-full bg-gallery-warm group-hover:bg-white/20 text-ink-900 group-hover:text-white flex items-center justify-center text-xs shrink-0 transition-colors">→</span>
              </button>`
            )
            .join("")}
        </div>
      </div>`;

    stage.querySelectorAll(".diag-opt-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const chosen = item.options[Number(btn.dataset.diagOpt)];
        if (chosen) state.diagScore += chosen.score;
        state.diagStep += 1;
        if (state.diagStep >= DIAG_SCENARIOS.length) {
          state.diagResultLevel =
            state.diagScore <= 1 ? "A1 · Начальный" : state.diagScore === 2 ? "A2 · Элементарный" : "B1 · Средний";
          const levelSelect = document.getElementById("enroll-level");
          if (levelSelect) levelSelect.value = state.diagResultLevel;
          const badge = document.getElementById("form-diag-badge");
          if (badge) {
            badge.textContent = `Тест: ${state.diagScore}/3 · ${state.diagResultLevel.split(" ")[0]}`;
            badge.classList.remove("hidden");
          }
        }
        renderDiagnostic(state);
      });
    });
  } else {
    const code = state.diagScore <= 1 ? "A1" : state.diagScore === 2 ? "A2" : "B1";
    if (indicator) indicator.textContent = `Результат · ${state.diagScore} из 3`;
    const advice =
      code === "A1"
        ? "Отличная точка старта! За 3–4 месяца выстроим прочную базу, чтение и первые живые диалоги."
        : code === "A2"
          ? "У вас есть хорошая основа — поможем убрать паузы в речи и уверенно перейти к уровню B1."
          : "Сильный результат! Прокачаем беглость, разговорные идиомы и сложные темы без барьера.";

    stage.innerHTML = `
      <div class="soft-enter flex flex-col gap-5">
        <div class="flex items-start gap-4">
          <span class="w-16 h-16 rounded-2xl bg-british-800 text-white font-serif font-bold text-3xl flex items-center justify-center shrink-0">${code}</span>
          <div>
            <div class="font-mono text-[11px] uppercase tracking-wider text-vermilion font-semibold">Ориентировочный уровень</div>
            <h3 class="text-xl sm:text-2xl font-bold text-ink-900 mt-0.5">${escapeHtml(state.diagResultLevel)} (${state.diagScore}/3)</h3>
            <p class="text-xs sm:text-sm text-ink-600 mt-1.5 leading-relaxed">${escapeHtml(advice)}</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3 pt-2 border-t border-ink-900/10">
          <a href="#enroll" class="btn-british px-6 py-3 rounded-full text-xs font-semibold">Закрепить результат на уроке →</a>
          <button id="diag-restart-btn" type="button" class="btn-ink-outline px-5 py-3 rounded-full text-xs font-medium cursor-pointer">Пройти снова</button>
        </div>
      </div>`;

    document.getElementById("diag-restart-btn")?.addEventListener("click", () => {
      state.diagStep = 0;
      state.diagScore = 0;
      state.diagResultLevel = null;
      document.getElementById("form-diag-badge")?.classList.add("hidden");
      renderDiagnostic(state);
    });
  }
}

export function renderSlots(state) {
  const wrap = document.getElementById("slot-buttons");
  const caption = document.getElementById("selected-slot-caption");
  if (caption) caption.textContent = `Выбран слот: ${state.selectedSlot} (МСК)`;
  if (!wrap) return;

  wrap.innerHTML = TRIAL_SLOTS.map((slot) => {
    const active = slot === state.selectedSlot;
    return `<button type="button" data-slot="${escapeHtml(slot)}" class="slot-btn px-3 py-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer text-center ${
      active
        ? "bg-british-800 text-white border-british-800 shadow-sm font-semibold"
        : "bg-white text-ink-900 border-ink-900/12 hover:border-british-800"
    }">${escapeHtml(slot)}</button>`;
  }).join("");

  wrap.querySelectorAll(".slot-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedSlot = btn.dataset.slot;
      renderSlots(state);
    });
  });
}
