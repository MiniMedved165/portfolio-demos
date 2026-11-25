import { SITE_CONFIG } from "./config.js";
import { calculateBookingEstimate, formatRub } from "./booking-logic.js";

export const dom = {
  scenarioTabs: document.getElementById("scenarioTabs"),
  compareStage: document.getElementById("compareStage"),
  beforeClipLayer: document.getElementById("beforeClipLayer"),
  beforeImg: document.getElementById("beforeImg"),
  afterImg: document.getElementById("afterImg"),
  beforeDefectOverlay: document.getElementById("beforeDefectOverlay"),
  beforeCalloutText: document.getElementById("beforeCalloutText"),
  afterCalloutText: document.getElementById("afterCalloutText"),
  curtainDivider: document.getElementById("curtainDivider"),
  curtainHandle: document.getElementById("curtainHandle"),
  beforePctLabel: document.getElementById("beforePctLabel"),
  afterPctLabel: document.getElementById("afterPctLabel"),
  scrollSyncToggleBtn: document.getElementById("scrollSyncToggleBtn"),
  scrollSyncDot: document.getElementById("scrollSyncDot"),
  scrollSyncLabel: document.getElementById("scrollSyncLabel"),
  autoDemoBtn: document.getElementById("autoDemoBtn"),
  autoDemoLabel: document.getElementById("autoDemoLabel"),

  scenarioIndexTag: document.getElementById("scenarioIndexTag"),
  scenarioCarModel: document.getElementById("scenarioCarModel"),
  scenarioTitle: document.getElementById("scenarioTitle"),
  scenarioDesc: document.getElementById("scenarioDesc"),
  metric1Label: document.getElementById("metric1Label"),
  metric1Value: document.getElementById("metric1Value"),
  metric2Label: document.getElementById("metric2Label"),
  metric2Value: document.getElementById("metric2Value"),
  scenarioWorksList: document.getElementById("scenarioWorksList"),
  scenarioPrice: document.getElementById("scenarioPrice"),
  bookCurrentScenarioBtn: document.getElementById("bookCurrentScenarioBtn"),

  servicesGrid: document.getElementById("servicesGrid"),
  carClassGroup: document.getElementById("carClassGroup"),
  bookingServiceGroup: document.getElementById("bookingServiceGroup"),
  timeSlotGroup: document.getElementById("timeSlotGroup"),
  summaryService: document.getElementById("summaryService"),
  summaryClass: document.getElementById("summaryClass"),
  summarySlot: document.getElementById("summarySlot"),
  summaryDuration: document.getElementById("summaryDuration"),
  summaryPrice: document.getElementById("summaryPrice"),
  quickBookingForm: document.getElementById("quickBookingForm"),
  bookingName: document.getElementById("bookingName"),
  bookingPhone: document.getElementById("bookingPhone"),
  bookingCarModel: document.getElementById("bookingCarModel"),
  bookingError: document.getElementById("bookingError"),

  demoModal: document.getElementById("demoModal"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  modalDoneBtn: document.getElementById("modalDoneBtn"),
  tabCrmBtn: document.getElementById("tabCrmBtn"),
  tabJsonBtn: document.getElementById("tabJsonBtn"),
  tabCrmContent: document.getElementById("tabCrmContent"),
  tabJsonContent: document.getElementById("tabJsonContent"),
  crmBookingId: document.getElementById("crmBookingId"),
  crmBookingFields: document.getElementById("crmBookingFields"),
  jsonPayloadOutput: document.getElementById("jsonPayloadOutput"),
  copyJsonBtn: document.getElementById("copyJsonBtn"),
  toastBanner: document.getElementById("toastBanner"),
  toastText: document.getElementById("toastText"),
  mobileMenuBtn: document.getElementById("mobileMenuBtn"),
  mobileMenu: document.getElementById("mobileMenu")
};

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function createFallbackSvg(titleText) {
  const safe = encodeURIComponent(titleText);
  return `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 750'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23161920'/%3E%3Cstop offset='100%25' stop-color='%2308090B'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='750' fill='url(%23bg)'/%3E%3Ccircle cx='600' cy='375' r='190' fill='none' stroke='%23F36B2A' stroke-opacity='0.3' stroke-width='2'/%3E%3Ctext x='600' y='385' text-anchor='middle' fill='%23F4F6F9' font-family='sans-serif' font-size='28'%3E${safe}%3C/text%3E%3C/svg%3E`;
}

let toastTimer = null;

export function showToast(msg) {
  dom.toastText.textContent = msg;
  dom.toastBanner.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dom.toastBanner.classList.remove("show"), 3200);
}

export function applyScenario(index) {
  const sc = SITE_CONFIG.scenarios[index];
  const fallback = createFallbackSvg(sc.title);

  dom.beforeImg.onerror = () => {
    dom.beforeImg.onerror = null;
    dom.beforeImg.src = fallback;
  };
  dom.afterImg.onerror = () => {
    dom.afterImg.onerror = null;
    dom.afterImg.src = fallback;
  };

  dom.beforeImg.src = sc.imageUrl;
  dom.afterImg.src = sc.imageUrl;
  dom.beforeImg.alt = `${sc.carModel} — состояние до детейлинга`;
  dom.afterImg.alt = `${sc.carModel} — результат после детейлинга`;

  dom.beforeImg.className = `w-full h-full object-cover object-center pointer-events-none ${sc.beforeFilterClass}`;
  dom.afterImg.className = `w-full h-full object-cover object-center pointer-events-none ${sc.afterFilterClass}`;
  dom.beforeDefectOverlay.className = `absolute inset-0 pointer-events-none ${sc.defectOverlayClass}`;

  dom.beforeCalloutText.textContent = sc.beforeCallout;
  dom.afterCalloutText.textContent = sc.afterCallout;

  dom.scenarioIndexTag.textContent = sc.indexTag;
  dom.scenarioCarModel.textContent = sc.carModel;
  dom.scenarioTitle.textContent = sc.title;
  dom.scenarioDesc.textContent = sc.desc;

  dom.metric1Label.textContent = sc.metric1Label;
  dom.metric1Value.textContent = "";
  dom.metric1Value.appendChild(document.createTextNode(`${sc.metric1Before} → `));
  dom.metric1Value.appendChild(createEl("span", "text-ember", sc.metric1After));

  dom.metric2Label.textContent = sc.metric2Label;
  dom.metric2Value.textContent = sc.metric2Value;
  dom.scenarioPrice.textContent = sc.priceLabel;

  dom.scenarioWorksList.textContent = "";
  sc.works.forEach((work) => {
    const li = createEl("li", "flex items-start gap-2.5");
    li.appendChild(createEl("span", "text-ember font-mono text-xs mt-0.5", "✓"));
    li.appendChild(createEl("span", "text-pearl/85 leading-snug", work));
    dom.scenarioWorksList.appendChild(li);
  });
}

export function renderScenarioTabs(state, slider) {
  dom.scenarioTabs.textContent = "";
  SITE_CONFIG.scenarios.forEach((sc, idx) => {
    const active = idx === state.activeScenarioIndex;
    const btn = createEl(
      "button",
      `choice-pill text-left px-4 py-3.5 rounded-xl hairline flex items-center justify-between gap-2 ${
        active ? "is-active" : "bg-asphalt text-steel hover:text-white hover:border-white/25"
      }`
    );
    btn.type = "button";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(active));

    const left = createEl("div", "flex items-center gap-2.5 min-w-0");
    left.appendChild(createEl("span", `font-mono text-xs font-semibold ${active ? "text-ember" : "text-steel/70"}`, sc.tabNum));
    left.appendChild(createEl("span", "text-xs sm:text-sm font-medium truncate", sc.tabLabel));

    const dot = createEl("span", `w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-ember" : "bg-white/15"}`);
    btn.append(left, dot);

    btn.addEventListener("click", () => {
      slider.stopAutoDemo();
      state.activeScenarioIndex = idx;
      renderScenarioTabs(state, slider);
      applyScenario(idx);
      if (state.scrollLinked) {
        slider.syncCurtainWithScroll();
      } else {
        slider.setCurtainPosition(50);
      }
    });
    dom.scenarioTabs.appendChild(btn);
  });
}

export function updateBookingSummary(state) {
  const est = calculateBookingEstimate(state.booking);
  dom.summaryService.textContent = est.serviceTitle;
  dom.summaryClass.textContent = est.carClassLabel;
  dom.summarySlot.textContent = est.timeSlot;
  dom.summaryDuration.textContent = `Срок: ${est.duration}`;
  dom.summaryPrice.textContent = formatRub(est.estimatedPrice);
}

export function renderBookingControls(state) {
  dom.carClassGroup.textContent = "";
  SITE_CONFIG.carClasses.forEach((cls) => {
    const active = state.booking.carClassId === cls.id;
    const btn = createEl(
      "button",
      `choice-pill py-2.5 px-3 rounded-xl hairline text-xs font-medium text-center ${
        active ? "is-active" : "bg-carbon text-steel hover:text-white"
      }`,
      cls.label
    );
    btn.type = "button";
    btn.addEventListener("click", () => {
      state.booking.carClassId = cls.id;
      renderBookingControls(state);
      updateBookingSummary(state);
    });
    dom.carClassGroup.appendChild(btn);
  });

  dom.bookingServiceGroup.textContent = "";
  SITE_CONFIG.services.forEach((srv) => {
    const active = state.booking.serviceId === srv.id;
    const btn = createEl(
      "button",
      `choice-pill text-left px-4 py-3 rounded-xl hairline flex items-center justify-between gap-2 ${
        active ? "is-active" : "bg-carbon text-steel hover:text-white"
      }`
    );
    btn.type = "button";
    btn.appendChild(createEl("span", "text-xs sm:text-sm font-medium", srv.title));
    btn.appendChild(createEl("span", `font-mono text-[11px] shrink-0 ${active ? "text-ember" : "text-steel/70"}`, formatRub(srv.basePrice)));
    btn.addEventListener("click", () => {
      state.booking.serviceId = srv.id;
      renderBookingControls(state);
      updateBookingSummary(state);
    });
    dom.bookingServiceGroup.appendChild(btn);
  });

  dom.timeSlotGroup.textContent = "";
  SITE_CONFIG.timeSlots.forEach((slot) => {
    const active = state.booking.timeSlot === slot;
    const btn = createEl(
      "button",
      `choice-pill py-2.5 px-2.5 rounded-xl hairline font-mono text-[11px] text-center ${
        active ? "is-active" : "bg-carbon text-steel hover:text-white"
      }`,
      slot
    );
    btn.type = "button";
    btn.addEventListener("click", () => {
      state.booking.timeSlot = slot;
      renderBookingControls(state);
      updateBookingSummary(state);
    });
    dom.timeSlotGroup.appendChild(btn);
  });
}

export function renderServicesGrid(state) {
  dom.servicesGrid.textContent = "";
  SITE_CONFIG.services.forEach((service) => {
    const card = createEl("article", "service-card group bg-asphalt rounded-2xl hairline overflow-hidden flex flex-col justify-between cursor-pointer");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Выбрать услугу: ${service.title}`);

    const imgWrap = createEl("div", "relative aspect-[16/10] overflow-hidden bg-graphite");
    const img = document.createElement("img");
    img.src = service.imageUrl;
    img.alt = service.title;
    img.loading = "lazy";
    img.className = "service-card-img w-full h-full object-cover object-center transition-transform duration-500";
    img.onerror = () => {
      img.onerror = null;
      img.src = createFallbackSvg(service.title);
    };
    imgWrap.appendChild(img);
    imgWrap.appendChild(createEl("div", "absolute inset-0 bg-gradient-to-t from-asphalt via-transparent to-transparent"));

    const body = createEl("div", "p-5 flex-1 flex flex-col justify-between gap-4");
    const topText = createEl("div");
    topText.appendChild(createEl("h3", "text-base font-semibold text-white group-hover:text-ember transition-colors", service.title));
    topText.appendChild(createEl("p", "text-xs text-steel mt-1.5 leading-relaxed", service.subtitle));

    const bottomRow = createEl("div", "pt-3 hairline-t flex items-center justify-between gap-2");
    bottomRow.appendChild(createEl("span", "font-mono text-xs font-medium text-pearl", `от ${formatRub(service.basePrice)}`));
    bottomRow.appendChild(createEl("span", "service-arrow text-steel transition-all duration-200", "→"));

    body.append(topText, bottomRow);
    card.append(imgWrap, body);

    const selectAndScroll = () => {
      state.booking.serviceId = service.id;
      renderBookingControls(state);
      updateBookingSummary(state);
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
      showToast(`Выбрана услуга: ${service.title}`);
    };

    card.addEventListener("click", selectAndScroll);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectAndScroll();
      }
    });

    dom.servicesGrid.appendChild(card);
  });
}

export function switchModalTab(tab) {
  const isCrm = tab === "crm";
  dom.tabCrmContent.classList.toggle("hidden", !isCrm);
  dom.tabJsonContent.classList.toggle("hidden", isCrm);

  dom.tabCrmBtn.className = `px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
    isCrm ? "border-ember text-ember font-medium" : "border-transparent text-steel hover:text-white"
  }`;
  dom.tabJsonBtn.className = `px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
    !isCrm ? "border-ember text-ember font-medium" : "border-transparent text-steel hover:text-white"
  }`;
}

export function openDemoModal(payload) {
  dom.crmBookingId.textContent = `BOOKING #${payload.bookingId}`;
  dom.crmBookingFields.textContent = "";

  const pairs = [
    ["Клиент", payload.client.name],
    ["Телефон", payload.client.phone],
    ["Автомобиль", `${payload.client.carModel} (${payload.order.carClass})`],
    ["Выбранная услуга", payload.order.serviceTitle],
    ["Слот записи", payload.order.preferredSlot],
    ["Ориентировочная цена", `${formatRub(payload.order.estimatedPriceRub)} (${payload.order.estimatedDuration})`]
  ];

  pairs.forEach(([label, val]) => {
    const item = createEl("div");
    item.appendChild(createEl("dt", "font-mono text-[10px] uppercase tracking-wider text-steel", label));
    item.appendChild(createEl("dd", "text-white font-medium mt-0.5 break-words", val));
    dom.crmBookingFields.appendChild(item);
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
