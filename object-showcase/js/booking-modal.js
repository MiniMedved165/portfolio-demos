import { CABINS, PERIODS, formatRub, getNightPrice } from "./cabins-data.js";
import { showToast } from "./inspector-ui.js";

const modal = document.getElementById("booking-modal");
const modalFormView = document.getElementById("booking-form-view");
const modalDemoResult = document.getElementById("booking-demo-result");
const modalBadge = document.getElementById("modal-cabin-badge");
const modalTitle = document.getElementById("booking-modal-title");
const modalSummary = document.getElementById("modal-booking-summary");
const modalTotal = document.getElementById("modal-total-price");
const payloadPre = document.getElementById("booking-payload-pre");

let bookingCabinId = null;
let lastBookingJson = "";

function markFieldInvalid(inputEl, message) {
  if (!inputEl) return;
  inputEl.classList.add("ring-2", "ring-red-600");
  inputEl.focus();
  showToast(message);
  setTimeout(() => {
    inputEl.classList.remove("ring-2", "ring-red-600");
  }, 2200);
}

function isValidContact(contact) {
  const trimmed = String(contact || "").trim();
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 10 || /^@[a-zA-Z0-9_]{4,32}$/.test(trimmed);
}

function copyText(text, successMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(() => {
      showToast("Скопируйте текст вручную");
    });
    return;
  }
  showToast("Скопируйте текст вручную");
}

export function recalcModalTotal(state) {
  const cabin = CABINS.find((c) => c.id === bookingCabinId);
  if (!cabin || !modalTotal) return 0;
  const period = PERIODS[state.activePeriod];
  let sum = getNightPrice(cabin, state.activePeriod) * period.nights;
  document.querySelectorAll(".booking-extra-cb:checked").forEach((cb) => {
    sum += Number(cb.dataset.extraPrice || 0);
  });
  modalTotal.textContent = formatRub(sum);
  return sum;
}

export function openBookingModal(cabinId, state) {
  const cabin = CABINS.find((c) => c.id === cabinId);
  if (!cabin || !modal) return;
  bookingCabinId = cabinId;
  const period = PERIODS[state.activePeriod];

  modalFormView?.classList.remove("hidden");
  modalDemoResult?.classList.add("hidden");
  modalDemoResult?.classList.remove("flex");

  document.querySelectorAll(".booking-extra-cb").forEach((cb) => {
    cb.checked = false;
  });
  if (modalBadge) modalBadge.textContent = `${cabin.number} · ${cabin.zone}`;
  if (modalTitle) modalTitle.textContent = cabin.name;
  if (modalSummary) {
    modalSummary.textContent = `${period.label} (${period.datesText}) · ${state.guestCount} гостя · ${formatRub(getNightPrice(cabin, state.activePeriod))} / ночь`;
  }
  recalcModalTotal(state);

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

export function closeBookingModal() {
  modal?.classList.remove("is-open");
  modal?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

export function initBookingModal(state, onBooked) {
  document.querySelectorAll(".booking-extra-cb").forEach((cb) => {
    cb.addEventListener("change", () => recalcModalTotal(state));
  });

  document.getElementById("cabin-booking-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const cabin = CABINS.find((c) => c.id === bookingCabinId);
    if (!cabin) return;

    const nameInput = document.getElementById("guest-name");
    const contactInput = document.getElementById("guest-phone");
    const guestName = (nameInput?.value || "").trim();
    const guestContact = (contactInput?.value || "").trim();

    if (guestName.length < 2) {
      markFieldInvalid(nameInput, "Укажите ваше имя (минимум 2 символа)");
      return;
    }
    if (!isValidContact(guestContact)) {
      markFieldInvalid(contactInput, "Укажите телефон (от 10 цифр) или @telegram");
      return;
    }

    const period = PERIODS[state.activePeriod];
    const extras = Array.from(document.querySelectorAll(".booking-extra-cb:checked")).map(
      (cb) => cb.dataset.extraName
    );
    const totalRub = recalcModalTotal(state);

    cabin.availability[state.activePeriod] = "hold";
    onBooked();

    const payload = {
      object: {
        id: cabin.id,
        number: cabin.number,
        title: cabin.name,
        zone: cabin.zone,
        new_status_on_map: "Бронь"
      },
      stay: {
        period: period.datesText,
        nights: period.nights,
        guests: state.guestCount,
        night_rate_rub: getNightPrice(cabin, state.activePeriod),
        extras: extras.length ? extras : ["Без доп. опций"],
        total_rub: totalRub
      },
      guest: {
        name: guestName,
        contact: guestContact
      },
      timestamp: new Date().toISOString()
    };

    lastBookingJson = JSON.stringify(payload, null, 2);
    if (payloadPre) payloadPre.textContent = lastBookingJson;

    modalFormView?.classList.add("hidden");
    modalDemoResult?.classList.remove("hidden");
    modalDemoResult?.classList.add("flex");
  });

  document.getElementById("booking-modal-close")?.addEventListener("click", closeBookingModal);
  document.getElementById("booking-result-close")?.addEventListener("click", closeBookingModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeBookingModal();
  });

  document.getElementById("copy-booking-json")?.addEventListener("click", () => {
    if (lastBookingJson) copyText(lastBookingJson, "JSON бронирования скопирован");
  });
}
