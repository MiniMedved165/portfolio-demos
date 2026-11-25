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
  occupancy: 68
};

function updateRoiCalculator() {
  const res = RESIDENCES.find((r) => r.id === state.residenceId) || RESIDENCES[0];
  const occ = state.occupancy;

  const grossYear = res.dailyRate * 365 * (occ / 100);
  const netYear = grossYear * 0.72;
  const yieldPct = ((netYear / (res.priceMln * 1000000)) * 100).toFixed(1);
  const paybackYears = (res.priceMln * 1000000 / netYear).toFixed(1);

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

  document.querySelectorAll(".residence-tab-btn").forEach((btn) => {
    const active = btn.dataset.resId === state.residenceId;
    btn.className = active
      ? "residence-tab-btn px-4 py-2.5 rounded-xl bg-white text-[#0B0F0D] text-xs font-bold transition-all cursor-pointer"
      : "residence-tab-btn px-4 py-2.5 rounded-xl bg-white/[0.06] text-white/75 hover:bg-white/[0.12] text-xs font-medium border border-white/10 transition-all cursor-pointer";
  });
}

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
  const payload = {
    project: "ALTAI RIDGE",
    client_name: name,
    contact: phone,
    selected_residence: res.name,
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
