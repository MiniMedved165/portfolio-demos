import { CITIES, RUBRICS } from "./geo-datasets.js";
import {
  escapeHtml,
  safeCsvCell,
  getFilteredLeads,
  showToast,
  copyText
} from "./dataset-builder.js";
import { renderKpis, renderRadarMap } from "./radar-ui.js";

export function openCompanyDrawer(state, leadId) {
  const companyDrawer = document.getElementById("company-drawer");
  const drawerContent = document.getElementById("drawer-content");
  const lead = state.leads.find((l) => l.id === leadId);
  if (!lead || !companyDrawer || !drawerContent) return;
  state.activeDrawerLeadId = leadId;

  const metaEl = document.getElementById("drawer-company-meta");
  const nameEl = document.getElementById("drawer-company-name");
  if (metaEl) metaEl.textContent = `${lead.cityName} · ${lead.rubricShort} · ★ ${lead.rating.toFixed(1)}`;
  if (nameEl) nameEl.textContent = lead.name;

  const rawJson = JSON.stringify(
    {
      id: lead.id,
      company: lead.name,
      rubric: lead.rubricShort,
      city: lead.cityName,
      district: lead.district,
      address: lead.address,
      phone: lead.phone,
      website: lead.website,
      email: lead.email,
      messengers: { telegram: lead.telegram, whatsapp: lead.whatsapp },
      rating: lead.rating,
      reviews_count: lead.reviews,
      working_hours: lead.hours,
      sources: lead.sources
    },
    null,
    2
  );

  drawerContent.innerHTML = `
    <div class="p-4 rounded-2xl bg-mapbg-50 border border-mapbg-200 flex flex-col gap-3 text-xs">
      <div class="flex justify-between gap-2">
        <span class="text-forestink-500">Адрес</span>
        <span class="font-semibold text-forestink-900 text-right">${escapeHtml(lead.district)}, ${escapeHtml(lead.address)}</span>
      </div>
      <div class="flex justify-between gap-2 pt-2 border-t border-mapbg-200">
        <span class="text-forestink-500">Телефон</span>
        <span class="font-mono font-bold text-geo-700">${escapeHtml(lead.phone)}</span>
      </div>
      <div class="flex justify-between gap-2 pt-2 border-t border-mapbg-200">
        <span class="text-forestink-500">Сайт</span>
        <span class="font-mono font-semibold text-forestink-900">${escapeHtml(lead.website || "Отсутствует")}</span>
      </div>
      <div class="flex justify-between gap-2 pt-2 border-t border-mapbg-200">
        <span class="text-forestink-500">Email</span>
        <span class="font-mono text-forestink-700">${escapeHtml(lead.email || "Не указан")}</span>
      </div>
      <div class="flex justify-between gap-2 pt-2 border-t border-mapbg-200">
        <span class="text-forestink-500">График работы</span>
        <span class="font-mono text-forestink-900">${escapeHtml(lead.hours)}</span>
      </div>
    </div>

    <div class="rounded-2xl bg-forestink-950 text-white p-4">
      <div class="flex items-center justify-between pb-2 mb-2 border-b border-white/10 font-mono text-[10.5px]">
        <span class="text-geo-500">Сырая структура карточки (JSON)</span>
        <button type="button" id="drawer-copy-lead-json" class="text-white/75 hover:text-white underline underline-offset-4 cursor-pointer">Копировать</button>
      </div>
      <pre id="drawer-lead-pre" class="font-mono text-[10.5px] text-white/85 whitespace-pre-wrap break-words leading-relaxed"></pre>
    </div>
  `;

  const pre = document.getElementById("drawer-lead-pre");
  if (pre) pre.textContent = rawJson;

  document.getElementById("drawer-copy-lead-json")?.addEventListener("click", () => {
    copyText(rawJson, "JSON карточки компании скопирован");
  });

  companyDrawer.classList.add("is-open");
  companyDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

export function closeCompanyDrawer(state) {
  const companyDrawer = document.getElementById("company-drawer");
  state.activeDrawerLeadId = null;
  companyDrawer?.classList.remove("is-open");
  companyDrawer?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

export function renderLeadsTable(state, animateFresh = false) {
  const tbody = document.getElementById("leads-table-body");
  const emptyEl = document.getElementById("leads-empty-state");
  if (!tbody) return;

  const filtered = getFilteredLeads(state);
  renderKpis(state, filtered);
  renderRadarMap(state, filtered, (pinId) => openCompanyDrawer(state, pinId));

  if (!filtered.length) {
    tbody.innerHTML = "";
    emptyEl?.classList.remove("hidden");
    emptyEl?.classList.add("flex");
    return;
  }

  emptyEl?.classList.add("hidden");
  emptyEl?.classList.remove("flex");

  tbody.innerHTML = filtered
    .map((lead) => {
      const isChecked = state.selectedIds.has(lead.id);
      const siteHtml = lead.website
        ? `<div class="flex flex-col gap-0.5">
             <span class="font-mono text-[11.5px] font-semibold text-geo-700 truncate max-w-[200px]">${escapeHtml(lead.website)}</span>
             <span class="font-mono text-[10.5px] text-forestink-400 truncate max-w-[200px]">${escapeHtml(lead.email || "—")}</span>
           </div>`
        : `<span class="inline-flex px-2 py-0.5 rounded-md bg-amberstar-100/70 text-amberstar-500 font-mono text-[10px] font-semibold">Без сайта (лид на разработку)</span>`;

      const sourcesHtml = lead.sources
        .map((src) => {
          const cls =
            src === "2ГИС"
              ? "bg-geo-100 text-geo-700 border-geo-600/20"
              : "bg-amberstar-100 text-amber-800 border-amber-300/60";
          return `<span class="px-2 py-0.5 rounded-md border font-mono text-[9.5px] font-semibold ${cls}">${escapeHtml(src)}</span>`;
        })
        .join("");

      const msgBadges = [
        lead.telegram ? `<span class="px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 font-mono text-[9.5px] font-semibold">TG</span>` : "",
        lead.whatsapp ? `<span class="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[9.5px] font-semibold">WA</span>` : ""
      ]
        .filter(Boolean)
        .join("");

      return `<tr data-lead-row="${escapeHtml(lead.id)}" class="${animateFresh ? "row-fresh" : ""} bg-white hover:bg-mapbg-50/80 transition-colors cursor-pointer">
        <td class="py-3.5 pl-4 pr-2" onclick="event.stopPropagation()">
          <input type="checkbox" data-row-cb="${escapeHtml(lead.id)}" ${isChecked ? "checked" : ""} aria-label="Выбрать ${escapeHtml(lead.name)}" class="lead-row-cb rounded border-mapbg-300 text-geo-600 focus:ring-0 cursor-pointer">
        </td>
        <td class="py-3.5 px-3">
          <div class="font-bold text-[13px] text-forestink-900 leading-snug">${escapeHtml(lead.name)}</div>
          <div class="text-[11px] text-forestink-500 mt-0.5 truncate max-w-[280px]">${escapeHtml(lead.district)} · ${escapeHtml(lead.address)}</div>
        </td>
        <td class="py-3.5 px-3" onclick="event.stopPropagation()">
          <div class="flex flex-col gap-1">
            <button type="button" data-copy-phone="${escapeHtml(lead.phone)}" class="copy-phone-btn text-left font-mono text-xs font-semibold text-forestink-900 hover:text-geo-600 transition-colors cursor-pointer">
              ${escapeHtml(lead.phone)}
            </button>
            <div class="flex items-center gap-1">${msgBadges || `<span class="text-[10px] font-mono text-forestink-400">Только звонок</span>`}</div>
          </div>
        </td>
        <td class="py-3.5 px-3">${siteHtml}</td>
        <td class="py-3.5 px-3 font-mono">
          <div class="inline-flex items-center gap-1 font-bold text-forestink-900">
            <span class="text-amberstar-500">★</span>
            <span>${lead.rating.toFixed(1)}</span>
          </div>
          <div class="text-[10px] text-forestink-400">${lead.reviews} отзывов</div>
        </td>
        <td class="py-3.5 px-3">
          <div class="flex flex-wrap gap-1">${sourcesHtml}</div>
        </td>
        <td class="py-3.5 pl-3 pr-4 text-right">
          <button type="button" data-open-lead="${escapeHtml(lead.id)}" class="text-[11px] font-mono font-semibold text-geo-700 hover:text-forestink-900 cursor-pointer">
            JSON →
          </button>
        </td>
      </tr>`;
    })
    .join("");

  tbody.querySelectorAll(".lead-row-cb").forEach((cb) => {
    cb.addEventListener("change", () => {
      const id = cb.dataset.rowCb;
      if (cb.checked) state.selectedIds.add(id);
      else state.selectedIds.delete(id);
      renderKpis(state, getFilteredLeads(state));
    });
  });

  tbody.querySelectorAll(".copy-phone-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      copyText(btn.dataset.copyPhone, `Телефон скопирован: ${btn.dataset.copyPhone}`);
    });
  });

  tbody.querySelectorAll("tr[data-lead-row]").forEach((tr) => {
    tr.addEventListener("click", () => openCompanyDrawer(state, tr.dataset.leadRow));
  });
}

function getSelectedLeadsForExport(state) {
  return getFilteredLeads(state).filter((l) => state.selectedIds.has(l.id));
}

/**
 * Generates and downloads an Excel-compatible UTF-8 BOM CSV file from checked leads.
 * @param {object} state
 */
export function downloadSelectedCsv(state) {
  const list = getSelectedLeadsForExport(state);
  if (!list.length) {
    showToast("Отметьте хотя бы одну компанию для выгрузки");
    return;
  }

  const headers = [
    "Компания",
    "Рубрика",
    "Город",
    "Район",
    "Адрес",
    "Телефон",
    "Сайт",
    "Email",
    "Telegram",
    "WhatsApp",
    "Рейтинг",
    "Отзывы",
    "Источники"
  ];
  const rows = [headers.join(";")];

  list.forEach((l) => {
    rows.push(
      [
        safeCsvCell(l.name),
        safeCsvCell(l.rubricShort),
        safeCsvCell(l.cityName),
        safeCsvCell(l.district),
        safeCsvCell(l.address),
        safeCsvCell(l.phone),
        safeCsvCell(l.website || ""),
        safeCsvCell(l.email || ""),
        safeCsvCell(l.telegram ? "Да" : "Нет"),
        safeCsvCell(l.whatsapp ? "Да" : "Нет"),
        safeCsvCell(l.rating.toFixed(1)),
        safeCsvCell(l.reviews),
        safeCsvCell(l.sources.join(", "))
      ].join(";")
    );
  });

  const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `b2b-base-${state.city}-${state.rubric}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Выгружено ${list.length} компаний в Excel (CSV)`);
}

export function downloadSelectedJson(state) {
  const list = getSelectedLeadsForExport(state);
  if (!list.length) {
    showToast("Отметьте хотя бы одну компанию для выгрузки");
    return;
  }
  const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `b2b-base-${state.city}-${state.rubric}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Скачан файл JSON (${list.length} компаний)`);
}

export function openCrmExportModal(state) {
  const crmModal = document.getElementById("crm-export-modal");
  const list = getSelectedLeadsForExport(state);
  if (!list.length) {
    showToast("Отметьте хотя бы одну компанию для экспорта");
    return;
  }
  const city = CITIES[state.city];
  const rubric = RUBRICS[state.rubric];

  const batchObj = {
    source: "GEOLEAD B2B Scraper (2GIS + Yandex Maps)",
    query: {
      city: city.name,
      rubric: rubric.label,
      deduplicated: state.dedup
    },
    total_selected: list.length,
    sample_leads: list.slice(0, 3).map((l) => ({
      company: l.name,
      phone: l.phone,
      website: l.website,
      email: l.email,
      address: `${l.district}, ${l.address}`,
      rating: l.rating
    })),
    target_integrations: ["AmoCRM", "Битрикс24", "Google Sheets"],
    timestamp: new Date().toISOString()
  };

  state.lastCrmPayload = JSON.stringify(batchObj, null, 2);
  const pre = document.getElementById("crm-batch-pre");
  const desc = document.getElementById("crm-export-desc");
  if (pre) pre.textContent = state.lastCrmPayload;
  if (desc) {
    desc.textContent = `Это демонстрация портфолио Данила Буторова — данные никуда не передаются. Подготовлен пакет из ${list.length} компаний (${city.name} · ${rubric.label}), готовый к автоматической загрузке в AmoCRM, Битрикс24 или Google Таблицу:`;
  }

  crmModal?.classList.add("is-open");
  crmModal?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

export function closeCrmExportModal() {
  const crmModal = document.getElementById("crm-export-modal");
  crmModal?.classList.remove("is-open");
  crmModal?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
