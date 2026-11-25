import {
  CABINS,
  PERIODS,
  STATUS_META,
  escapeHtml,
  formatRub,
  getCabinStatus,
  getNightPrice
} from "./cabins-data.js";

const toastEl = document.getElementById("forest-toast");
const toastText = document.getElementById("forest-toast-text");
let toastTimer = null;

export function showToast(msg) {
  if (!toastEl || !toastText) return;
  toastText.textContent = msg;
  toastEl.classList.remove("opacity-0", "translate-y-2", "pointer-events-none");
  toastEl.classList.add("opacity-100", "translate-y-0");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.add("opacity-0", "translate-y-2", "pointer-events-none");
    toastEl.classList.remove("opacity-100", "translate-y-0");
  }, 2300);
}

export function renderFilterBar(state, onStateChange) {
  const freeCount = CABINS.filter((c) => getCabinStatus(c, state.activePeriod) === "free").length;
  const holdCount = CABINS.filter((c) => getCabinStatus(c, state.activePeriod) === "hold").length;
  const busyCount = CABINS.filter((c) => getCabinStatus(c, state.activePeriod) === "busy").length;

  const elFree = document.getElementById("stat-free");
  const elHold = document.getElementById("stat-hold");
  const elBusy = document.getElementById("stat-busy");
  const heroCounter = document.getElementById("hero-free-counter");
  if (elFree) elFree.textContent = String(freeCount);
  if (elHold) elHold.textContent = String(holdCount);
  if (elBusy) elBusy.textContent = String(busyCount);
  if (heroCounter) {
    heroCounter.textContent = `Свободно ${freeCount} из ${CABINS.length} домиков · ${PERIODS[state.activePeriod].datesText}`;
  }

  const statusItems = [
    { key: "all", label: `Все (${CABINS.length})` },
    { key: "free", label: "Только свободные", dot: "#36B36E" },
    { key: "hold", label: "На брони", dot: "#E09A43" },
    { key: "busy", label: "Занято", dot: "#B6665C" }
  ];

  const statusWrap = document.getElementById("map-status-filters");
  if (statusWrap) {
    statusWrap.innerHTML = statusItems
      .map((s) => {
        const active = state.statusFilter === s.key;
        return `<button type="button" data-status-filter="${escapeHtml(s.key)}" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
          active
            ? "bg-birch-100 text-pine-900"
            : "bg-pine-950/55 text-birch-100/80 hover:bg-pine-950 hover:text-white border border-birch-100/12"
        }">
          ${s.dot ? `<span class="w-2 h-2 rounded-full" style="background:${s.dot}"></span>` : ""}
          <span>${escapeHtml(s.label)}</span>
        </button>`;
      })
      .join("");

    statusWrap.querySelectorAll("[data-status-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.statusFilter = btn.dataset.statusFilter;
        onStateChange();
      });
    });
  }

  const featureItems = [
    { key: "all", label: "Любые опции" },
    { key: "tub", label: "С купелью" },
    { key: "lake", label: "У озера" },
    { key: "sauna", label: "С сауной" }
  ];

  const featWrap = document.getElementById("map-feature-filters");
  if (featWrap) {
    featWrap.innerHTML = featureItems
      .map((f) => {
        const active = state.featureFilter === f.key;
        return `<button type="button" data-feature-filter="${escapeHtml(f.key)}" class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
          active
            ? "bg-pine-600 text-white border border-birch-100/35"
            : "bg-transparent text-birch-100/75 hover:text-white border border-birch-100/15"
        }">${escapeHtml(f.label)}</button>`;
      })
      .join("");

    featWrap.querySelectorAll("[data-feature-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.featureFilter = btn.dataset.featureFilter;
        onStateChange();
      });
    });
  }

  const periodWrap = document.getElementById("map-period-pills");
  if (periodWrap) {
    periodWrap.innerHTML = Object.values(PERIODS)
      .map((p) => {
        const active = state.activePeriod === p.id;
        return `<button type="button" data-period-pill="${escapeHtml(p.id)}" class="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
          active ? "bg-birch-100 text-pine-900" : "text-birch-100/75 hover:text-white"
        }">${escapeHtml(p.shortLabel)}</button>`;
      })
      .join("");

    periodWrap.querySelectorAll("[data-period-pill]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activePeriod = btn.dataset.periodPill;
        const topSelect = document.getElementById("booking-period-select");
        if (topSelect) topSelect.value = state.activePeriod;
        onStateChange();
        showToast(`Обновлено наличие: ${PERIODS[state.activePeriod].datesText}`);
      });
    });
  }
}

export function renderInspectorCard(state, animate, { onOpenBooking, onStateChange }) {
  const cardEl = document.getElementById("cabin-inspector");
  if (!cardEl) return;

  const cabin = CABINS.find((c) => c.id === state.selectedCabinId) || CABINS[0];
  const status = getCabinStatus(cabin, state.activePeriod);
  const meta = STATUS_META[status];
  const period = PERIODS[state.activePeriod];
  const nightPrice = getNightPrice(cabin, state.activePeriod);
  const totalStay = nightPrice * period.nights;
  const canBook = status === "free";

  cardEl.innerHTML = `
    <div class="${animate ? "inspector-swap" : ""} flex flex-col gap-4">
      <div class="relative aspect-[16/10] rounded-2xl overflow-hidden bg-pine-950">
        <img src="${escapeHtml(cabin.image)}" alt="${escapeHtml(cabin.name)}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/700x440/123124/F2ECDC?text=${encodeURIComponent(cabin.number)}'">
        <span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-birch-100/95 backdrop-blur-sm border text-[11px] font-bold flex items-center gap-1.5 ${meta.badgeBg}">
          <span class="w-2 h-2 rounded-full" style="background:${meta.color}"></span>
          <span>${escapeHtml(meta.label)} · ${escapeHtml(period.datesText)}</span>
        </span>
        <span class="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-pine-950/80 backdrop-blur-sm text-birch-100 font-mono text-[10.5px]">
          ${escapeHtml(cabin.area)} · до ${cabin.capacity} гостей
        </span>
      </div>

      <div>
        <div class="text-[11px] font-mono uppercase tracking-[0.14em] text-pine-600 mb-0.5">${escapeHtml(cabin.zone)}</div>
        <h3 class="font-display font-bold uppercase text-2xl sm:text-[26px] text-pine-900 leading-tight">${escapeHtml(cabin.name)}</h3>
        <p class="text-xs sm:text-[13px] text-pine-700 leading-relaxed mt-2">${escapeHtml(cabin.desc)}</p>
      </div>

      <div class="flex flex-wrap gap-1.5">
        ${cabin.amenities
          .map(
            (a) =>
              `<span class="px-2.5 py-1 rounded-full bg-birch-50 border border-pine-900/12 text-[11px] font-medium text-pine-800">✦ ${escapeHtml(a)}</span>`
          )
          .join("")}
      </div>
    </div>

    <div class="pt-4 border-t border-pine-900/12 flex flex-col gap-3.5 mt-auto">
      <div class="flex items-end justify-between gap-3">
        <div>
          <div class="text-[11px] text-pine-600 font-medium">${escapeHtml(formatRub(nightPrice))} × ${period.nights} ночи</div>
          <div class="font-display font-bold text-3xl text-pine-900 leading-none mt-0.5">${escapeHtml(formatRub(totalStay))}</div>
        </div>
        <span class="text-[11px] font-mono text-pine-600 text-right">${escapeHtml(period.shortLabel)}</span>
      </div>

      ${
        canBook
          ? `<button type="button" id="inspector-book-btn" class="btn-pine w-full py-3.5 px-5 rounded-full text-xs font-bold uppercase tracking-[0.12em] cursor-pointer">
              Забронировать ${escapeHtml(cabin.number)} →
            </button>`
          : `<div class="flex flex-col gap-2">
              <div class="p-3 rounded-xl bg-birch-200/80 text-xs text-pine-800 text-center font-medium">
                ${status === "hold" ? "Домик временно удерживается гостем на эти даты." : "На выбранные даты домик уже занят."}
              </div>
              <button type="button" id="inspector-switch-dates-btn" class="w-full py-3 px-4 rounded-full border border-pine-900/25 hover:bg-pine-900 hover:text-birch-100 text-pine-900 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
                Посмотреть свободные даты
              </button>
            </div>`
      }
    </div>
  `;

  document.getElementById("inspector-book-btn")?.addEventListener("click", () => onOpenBooking(cabin.id));
  document.getElementById("inspector-switch-dates-btn")?.addEventListener("click", () => {
    const nextFreePeriod = Object.keys(PERIODS).find((p) => cabin.availability[p] === "free");
    if (nextFreePeriod) {
      state.activePeriod = nextFreePeriod;
      const topSelect = document.getElementById("booking-period-select");
      if (topSelect) topSelect.value = state.activePeriod;
      onStateChange();
      showToast(`${cabin.number} свободен на ${PERIODS[state.activePeriod].datesText}`);
    } else {
      state.statusFilter = "free";
      const firstFree = CABINS.find((c) => getCabinStatus(c, state.activePeriod) === "free");
      if (firstFree) state.selectedCabinId = firstFree.id;
      onStateChange();
    }
  });
}

export function renderAvailableCards(state, { onBookCabin, onShowOnMap }) {
  const gridEl = document.getElementById("available-cabins-grid");
  if (!gridEl) return;

  const period = PERIODS[state.activePeriod];
  const freeCabins = CABINS.filter((c) => getCabinStatus(c, state.activePeriod) === "free").slice(0, 4);
  const list = freeCabins.length ? freeCabins : CABINS.slice(0, 4);

  gridEl.innerHTML = list
    .map((c) => {
      const nightPrice = getNightPrice(c, state.activePeriod);
      return `<article class="group rounded-[24px] bg-birch-100 text-pine-900 p-3 flex flex-col justify-between gap-3.5 shadow-[0_22px_50px_-24px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:-translate-y-1">
        <div>
          <div class="relative aspect-[4/4.3] rounded-[18px] overflow-hidden bg-pine-950 mb-3.5">
            <img src="${escapeHtml(c.image)}" alt="${escapeHtml(c.name)}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onerror="this.src='https://placehold.co/600x650/123124/F2ECDC?text=${encodeURIComponent(c.number)}'">
            <span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-birch-100/95 text-pine-900 text-[10.5px] font-bold shadow">
              Свободен ${escapeHtml(period.datesText)}
            </span>
          </div>
          <div class="px-1.5">
            <div class="font-display font-bold uppercase text-lg text-pine-900 leading-tight">${escapeHtml(c.name)}</div>
            <div class="flex items-center justify-between text-xs text-pine-700 mt-1">
              <span>${escapeHtml(c.zone)} · до ${c.capacity} чел.</span>
              <span class="font-mono font-bold text-pine-900">${escapeHtml(formatRub(nightPrice))}</span>
            </div>
          </div>
        </div>

        <div class="px-1.5 pb-1 flex items-center gap-2">
          <button type="button" data-card-book="${escapeHtml(c.id)}" class="btn-pine flex-1 py-2.5 px-4 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer">
            Забронировать
          </button>
          <button type="button" data-card-map="${escapeHtml(c.id)}" title="Показать на плане" class="w-9 h-9 rounded-full border border-pine-900/20 hover:bg-pine-900 hover:text-birch-100 flex items-center justify-center text-xs transition-colors cursor-pointer shrink-0">
            ⌖
          </button>
        </div>
      </article>`;
    })
    .join("");

  gridEl.querySelectorAll("[data-card-book]").forEach((btn) => {
    btn.addEventListener("click", () => onBookCabin(btn.dataset.cardBook));
  });

  gridEl.querySelectorAll("[data-card-map]").forEach((btn) => {
    btn.addEventListener("click", () => onShowOnMap(btn.dataset.cardMap));
  });
}
