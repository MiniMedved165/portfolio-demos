import { CABINS, PERIODS, matchesFilters } from "./cabins-data.js";
import { renderSvgMapPlots, renderTableRows } from "./map-renderer.js";
import { renderFilterBar, renderInspectorCard, renderAvailableCards, showToast } from "./inspector-ui.js";
import { openBookingModal, closeBookingModal, initBookingModal } from "./booking-modal.js";

const state = {
  activePeriod: "weekend",
  guestCount: 2,
  statusFilter: "all",
  featureFilter: "all",
  selectedCabinId: "c1",
  viewMode: "map"
};

function selectCabin(cabinId, animateInspector = true) {
  state.selectedCabinId = cabinId;
  renderSvgMapPlots(state, (id) => selectCabin(id, true));
  renderInspectorCard(state, animateInspector, {
    onOpenBooking: (id) => openBookingModal(id, state),
    onStateChange: renderAll
  });
  renderTableRows(state, (id) => selectCabin(id, true));
}

function renderAll() {
  renderFilterBar(state, renderAll);
  renderSvgMapPlots(state, (id) => selectCabin(id, true));
  renderInspectorCard(state, false, {
    onOpenBooking: (id) => openBookingModal(id, state),
    onStateChange: renderAll
  });
  renderTableRows(state, (id) => selectCabin(id, true));
  renderAvailableCards(state, {
    onBookCabin: (id) => {
      state.selectedCabinId = id;
      renderSvgMapPlots(state, (cid) => selectCabin(cid, true));
      renderInspectorCard(state, false, {
        onOpenBooking: (cid) => openBookingModal(cid, state),
        onStateChange: renderAll
      });
      openBookingModal(id, state);
    },
    onShowOnMap: (id) => {
      selectCabin(id, true);
      document.getElementById("masterplan")?.scrollIntoView({ behavior: "smooth" });
    }
  });
}

document.getElementById("booking-period-select")?.addEventListener("change", (e) => {
  state.activePeriod = e.target.value;
  renderAll();
});

document.getElementById("booking-guests-select")?.addEventListener("change", (e) => {
  state.guestCount = Number(e.target.value || 2);
  renderAll();
});

document.getElementById("booking-bar-apply")?.addEventListener("click", () => {
  state.statusFilter = "free";
  const firstMatch = CABINS.find((c) => matchesFilters(c, state));
  if (firstMatch) state.selectedCabinId = firstMatch.id;
  renderAll();
  document.getElementById("masterplan")?.scrollIntoView({ behavior: "smooth" });
  showToast(`Подобраны свободные домики на ${PERIODS[state.activePeriod].datesText}`);
});

const toggleViewBtn = document.getElementById("toggle-view-mode");
const mapViewEl = document.getElementById("territory-map-view");
const listViewEl = document.getElementById("territory-list-view");

toggleViewBtn?.addEventListener("click", () => {
  state.viewMode = state.viewMode === "map" ? "list" : "map";
  mapViewEl?.classList.toggle("hidden", state.viewMode !== "map");
  listViewEl?.classList.toggle("hidden", state.viewMode !== "list");
  toggleViewBtn.textContent = state.viewMode === "map" ? "Таблица ☰" : "На карте ⌖";
});

const heroMainPhoto = document.getElementById("hero-main-photo");
const heroThumbs = document.querySelectorAll(".hero-thumb");
heroThumbs.forEach((btn) => {
  btn.addEventListener("click", () => {
    const url = btn.dataset.heroPhoto;
    if (!url || !heroMainPhoto) return;
    heroMainPhoto.style.opacity = "0.4";
    setTimeout(() => {
      heroMainPhoto.src = url;
      heroMainPhoto.style.opacity = "1";
    }, 160);
    heroThumbs.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("border-birch-100", active);
      b.classList.toggle("border-transparent", !active);
      b.classList.toggle("opacity-80", !active);
    });
  });
});

const mobileBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
mobileBtn?.addEventListener("click", () => {
  const next = mobileBtn.getAttribute("aria-expanded") !== "true";
  mobileMenu?.classList.toggle("is-open", next);
  mobileBtn.setAttribute("aria-expanded", String(next));
});
document.querySelectorAll(".mobile-link").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu?.classList.remove("is-open");
    mobileBtn?.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeBookingModal();
    mobileMenu?.classList.remove("is-open");
    mobileBtn?.setAttribute("aria-expanded", "false");
  }
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if ("IntersectionObserver" in window && !prefersReducedMotion) {
  document.documentElement.classList.add("js-motion");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll(".reveal-el").forEach((el) => observer.observe(el));
}

initBookingModal(state, renderAll);
renderAll();
