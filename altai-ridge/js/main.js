const RESIDENCES = [
  {
    id: "ridge-150",
    name: "Шале «Катунь 150»",
    area: 150,
    priceMln: 28.5,
    dailyRate: 32000,
    plot: "12 соток · лес у реки"
  },
  {
    id: "ridge-210",
    name: "Резиденция «Белуха 210»",
    area: 210,
    priceMln: 39.0,
    dailyRate: 44000,
    plot: "18 соток · панорама хребта"
  },
  {
    id: "ridge-280",
    name: "Вилла «Гребень 280»",
    area: 280,
    priceMln: 54.0,
    dailyRate: 62000,
    plot: "25 соток · приватный склон"
  }
];

const PLOTS = [
  { id: "L-04", name: "Лот №04 · Шале «Катунь 150»", area: 150, land: 12, view: "У горной реки", price: 28.5, status: "free" },
  { id: "L-07", name: "Лот №07 · Резиденция «Белуха 210»", area: 210, land: 18, view: "Панорама хребта", price: 39.0, status: "free" },
  { id: "L-09", name: "Лот №09 · Шале «Катунь 150»", area: 150, land: 14, view: "Хвойный лес", price: 29.8, status: "booked" },
  { id: "L-12", name: "Лот №12 · Вилла «Гребень 280»", area: 280, land: 25, view: "Приватный склон", price: 54.0, status: "free" },
  { id: "L-15", name: "Лот №15 · Резиденция «Белуха 210»", area: 210, land: 20, view: "Первая линия", price: 42.4, status: "booked" },
  { id: "L-18", name: "Лот №18 · Вилла «Гребень 280»", area: 280, land: 28, view: "Вершина гребня", price: 58.5, status: "free" }
];

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const state = {
  residenceId: "ridge-150",
  occupancy: 68,
  plotFilter: "all"
};

function updateRoiCalculator() {
  const res = RESIDENCES.find((r) => r.id === state.residenceId) || RESIDENCES[0];
  const occ = state.occupancy;

  const grossYear = res.dailyRate * 365 * (occ / 100);
  const netYear = grossYear * 0.72;
  const yieldPct = ((netYear / (res.priceMln * 1000000)) * 100).toFixed(1);
  const paybackYears = (res.priceMln * 1000000 / netYear).toFixed(1);
  const downPaymentMln = (res.priceMln * 0.25).toFixed(2);
  const monthlyInstallment = Math.round(((res.priceMln * 0.75 * 1000000) / 36));

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setText("roi-occ-label", `${occ}% (~${Math.round((365 * occ) / 100)} ночей/год)`);
  setText("roi-price-val", `${res.priceMln.toFixed(1)} млн ₽`);
  setText("roi-rate-val", `${res.dailyRate.toLocaleString("ru-RU")} ₽ / сутки`);
  setText("roi-net-year", `${(netYear / 1000000).toFixed(2)} млн ₽ / год`);
  setText("roi-yield-pct", `${yieldPct}% годовых`);
  setText("roi-payback", `${paybackYears} лет (+ рост капитализации 18%/год)`);
  setText("roi-installment", `ПВ ${downPaymentMln} млн ₽ · от ${monthlyInstallment.toLocaleString("ru-RU")} ₽/мес (рассрочка 0% на 36 мес)`);

  document.querySelectorAll(".residence-tab-btn").forEach((btn) => {
    const active = btn.dataset.resId === state.residenceId;
    btn.className = active
      ? "residence-tab-btn px-4 py-2.5 rounded-xl bg-white text-[#0B0F0D] text-xs font-bold transition-all cursor-pointer"
      : "residence-tab-btn px-4 py-2.5 rounded-xl bg-white/[0.06] text-white/75 hover:bg-white/[0.12] text-xs font-medium border border-white/10 transition-all cursor-pointer";
  });
}

function renderPlots() {
  const grid = document.getElementById("altai-plots-grid");
  if (!grid) return;
  const list = state.plotFilter === "all" ? PLOTS : PLOTS.filter((p) => p.status === state.plotFilter);

  grid.innerHTML = list
    .map((p) => {
      const isFree = p.status === "free";
      return `<article class="ridge-card rounded-2xl p-5 flex flex-col justify-between gap-4">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="font-mono text-[11px] text-white/60">${escapeHtml(p.id)} · ${p.land} соток</span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase ${isFree ? "bg-[#D9F99D]/15 text-[#D9F99D] border border-[#D9F99D]/30" : "bg-amber-500/15 text-amber-300 border border-amber-400/30"}">
              ${isFree ? "Свободен" : "Бронь"}
            </span>
          </div>
          <h3 class="text-sm font-bold text-white">${escapeHtml(p.name)}</h3>
          <div class="text-xs text-white/60 mt-1">${p.area} м² · ${escapeHtml(p.view)}</div>
        </div>
        <div class="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <div class="font-mono text-base font-bold text-white">${p.price.toFixed(1)} млн ₽</div>
          <button type="button" data-plot-book="${escapeHtml(p.name)} (${p.price.toFixed(1)} млн ₽)" class="px-3.5 py-2 rounded-full ${isFree ? "bg-white text-[#0B0F0D] hover:bg-[#D9F99D]" : "bg-white/10 text-white/80 hover:bg-white/20"} text-[11px] font-bold transition-colors cursor-pointer">
            ${isFree ? "Забронировать" : "В лист ожидания"}
          </button>
        </div>
      </article>`;
    })
    .join("");

  grid.querySelectorAll("[data-plot-book]").forEach((btn) => {
    btn.addEventListener("click", () => openLeadModal(btn.dataset.plotBook || ""));
  });
}

document.querySelectorAll(".plot-filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.plotFilter = btn.dataset.plotFilter || "all";
    document.querySelectorAll(".plot-filter-btn").forEach((b) => {
      const active = b.dataset.plotFilter === state.plotFilter;
      b.className = active
        ? "plot-filter-btn px-4 py-2 rounded-full bg-white text-[#0B0F0D] text-xs font-bold cursor-pointer"
        : "plot-filter-btn px-4 py-2 rounded-full bg-white/[0.06] text-white/75 border border-white/10 hover:text-white text-xs font-medium cursor-pointer";
    });
    renderPlots();
  });
});

document.querySelectorAll(".residence-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.residenceId = btn.dataset.resId;
    updateRoiCalculator();
  });
});

document.getElementById("roi-occ-range")?.addEventListener("input", (e) => {
  state.occupancy = Number(e.target.value);
  updateRoiCalculator();
});

const modal = document.getElementById("altai-modal");
const form = document.getElementById("altai-lead-form");
const successBox = document.getElementById("altai-lead-success");
const payloadPre = document.getElementById("altai-lead-json");

function openLeadModal(prefillTopic = "") {
  if (!modal) return;
  const res = RESIDENCES.find((r) => r.id === state.residenceId) || RESIDENCES[0];
  const lotEl = document.getElementById("altai-modal-lot");
  if (lotEl) lotEl.textContent = prefillTopic || `${res.name} · ${res.priceMln} млн ₽`;
  form?.classList.remove("hidden");
  successBox?.classList.add("hidden");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLeadModal() {
  modal?.classList.remove("is-open");
  modal?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-open-altai-modal]").forEach((btn) => {
  btn.addEventListener("click", () => openLeadModal(btn.dataset.openAltaiModal || ""));
});
document.getElementById("altai-modal-close")?.addEventListener("click", closeLeadModal);
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeLeadModal();
});

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("altai-name")?.value.trim() || "";
  const phone = document.getElementById("altai-phone")?.value.trim() || "";
  const errEl = document.getElementById("altai-form-error");

  if (name.length < 2 || phone.replace(/\D/g, "").length < 10) {
    if (errEl) {
      errEl.textContent = "Укажите имя и корректный номер телефона / Telegram.";
      errEl.classList.remove("hidden");
    }
    return;
  }
  errEl?.classList.add("hidden");

  const res = RESIDENCES.find((r) => r.id === state.residenceId) || RESIDENCES[0];
  const lotTopic = document.getElementById("altai-modal-lot")?.textContent || res.name;
  const payload = {
    project: "ALTAI RIDGE",
    client_name: name,
    contact: phone,
    selected_lot: lotTopic,
    estimated_occupancy_pct: state.occupancy,
    crm_pipeline: "Altai_VIP_Sales",
    timestamp: new Date().toISOString()
  };

  if (payloadPre) payloadPre.textContent = JSON.stringify(payload, null, 2);
  const summaryEl = document.getElementById("altai-success-name");
  if (summaryEl) summaryEl.textContent = escapeHtml(name);

  form.classList.add("hidden");
  successBox?.classList.remove("hidden");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLeadModal();
});

updateRoiCalculator();
renderPlots();
