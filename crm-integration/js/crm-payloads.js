/**
 * Escapes HTML special characters to prevent XSS when inserting user-controlled text into templates.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatRub(val) {
  return `${Math.round(val).toLocaleString("ru-RU")} ₽`;
}

/**
 * Normalizes a phone number or Telegram handle to a stable deduplication key.
 * @param {string} raw
 * @returns {string}
 */
export function normalizeContactKey(raw) {
  const cleaned = String(raw || "").trim().toLowerCase();
  const digits = cleaned.replace(/\D/g, "");
  return digits.length >= 6 ? digits : cleaned || "79990000000";
}

export function getCurrentUtm() {
  const params = new URLSearchParams(window.location.search);
  const sanitize = (v, fallback) =>
    String(v || fallback)
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .trim()
      .slice(0, 64);
  return {
    utm_source: sanitize(params.get("utm_source"), "yandex"),
    utm_medium: sanitize(params.get("utm_medium"), "cpc"),
    utm_campaign: sanitize(params.get("utm_campaign"), "sayso_english_search"),
    utm_term: sanitize(params.get("utm_term"), "школа_английского_вводный")
  };
}

/**
 * Builds request/response payloads and API log steps for AmoCRM API v4 or Bitrix24 REST.
 * @param {object} lead
 * @param {"amocrm"|"bitrix24"} provider
 * @param {{ contactId: number, alreadyExists: boolean, dealId: number, taskId: number, contactKey: string }} meta
 * @returns {{ requestObj: object, responseObj: object, tags: string[], steps: Array<object>, utm: object }}
 */
export function buildCrmSimulation(lead, provider, meta) {
  const { contactId, alreadyExists, dealId, taskId, contactKey } = meta;
  const nowIso = new Date().toISOString();
  const utm = getCurrentUtm();
  const tags = [
    lead.level.split(" ")[0],
    lead.slot,
    lead.testResult ? `Тест ${lead.testResult}` : "Заявка с сайта"
  ];
  const isAmo = provider === "amocrm";

  const requestObj = isAmo
    ? {
        endpoint: "POST /api/v4/leads/complex",
        headers: { Authorization: "Bearer <OAUTH2_ACCESS_TOKEN>", "Content-Type": "application/json" },
        body: [
          {
            name: `Вводный урок (${lead.slot}): ${lead.program} — ${lead.name}`,
            price: lead.budget,
            pipeline_id: 7420192,
            status_id: 61820410,
            responsible_user_id: 1094281,
            _embedded: {
              tags: tags.map((t) => ({ name: t })),
              contacts: [
                alreadyExists
                  ? { id: contactId }
                  : {
                      first_name: lead.name,
                      custom_fields_values: [
                        { field_code: "PHONE", values: [{ value: lead.phone, enum_code: "MOB" }] },
                        ...(lead.email ? [{ field_code: "EMAIL", values: [{ value: lead.email, enum_code: "WORK" }] }] : [])
                      ]
                    }
              ]
            },
            custom_fields_values: [
              { field_name: "Уровень CEFR", values: [{ value: lead.level }] },
              { field_name: "Желаемый слот", values: [{ value: lead.slot }] },
              { field_name: "Формат", values: [{ value: lead.format }] },
              { field_name: "UTM Source", values: [{ value: utm.utm_source }] }
            ]
          }
        ]
      }
    : {
        endpoint: "POST /rest/1/<WEBHOOK_TOKEN>/crm.deal.add.json",
        headers: { "Content-Type": "application/json" },
        body: {
          fields: {
            TITLE: `Вводный урок (${lead.slot}): ${lead.program} — ${lead.name}`,
            CATEGORY_ID: 2,
            STAGE_ID: "C2:NEW",
            OPPORTUNITY: lead.budget,
            CURRENCY_ID: "RUB",
            CONTACT_ID: contactId,
            ASSIGNED_BY_ID: 14,
            SOURCE_ID: "WEB",
            UF_CRM_CEFR_LEVEL: lead.level,
            UF_CRM_TRIAL_SLOT: lead.slot,
            UF_CRM_STUDY_FORMAT: lead.format,
            COMMENTS: lead.comment || "Заявка с сайта SAYSO.",
            UTM_SOURCE: utm.utm_source,
            UTM_MEDIUM: utm.utm_medium,
            UTM_CAMPAIGN: utm.utm_campaign
          },
          params: { REGISTER_SONET_EVENT: "Y" }
        }
      };

  const responseObj = isAmo
    ? {
        http_status: 201,
        crm: "AmoCRM API v4",
        lead_id: dealId,
        contact_id: contactId,
        duplicate_prevented: alreadyExists,
        pipeline: "Продажи · Основная воронка",
        stage: "Назначен вводный урок",
        trial_slot: lead.slot,
        auto_task_id: taskId,
        telegram_alert: "delivered",
        created_at: nowIso
      }
    : {
        http_status: 200,
        crm: "Битрикс24 REST API",
        result: dealId,
        contact_id: contactId,
        duplicate_prevented: alreadyExists,
        stage: "C2:NEW (Назначен вводный урок)",
        trial_slot: lead.slot,
        activity_id: taskId,
        time: { duration: 0.132, date_finish: nowIso }
      };

  const steps = [
    {
      delay: 40,
      method: "CHECK",
      color: "text-sky-300",
      text: `Валидация формы, слота «${lead.slot}» и UTM (${utm.utm_source}/${utm.utm_medium})`,
      status: "OK · 14 ms"
    },
    {
      delay: 230,
      method: "GET",
      color: "text-amber-300",
      text: isAmo
        ? `/api/v4/contacts?query=${contactKey} → ${alreadyExists ? `найден #${contactId} (без дубля)` : `создаём #${contactId}`}`
        : `/rest/crm.duplicate.findbycomm → ${alreadyExists ? `найден #${contactId} (без дубля)` : `создан #${contactId}`}`,
      status: "200 OK · 86 ms"
    },
    {
      delay: 460,
      method: "POST",
      color: "text-emerald-400",
      text: isAmo
        ? `/api/v4/leads/complex → создана сделка #${dealId} (${formatRub(lead.budget)})`
        : `/rest/crm.deal.add.json → создана сделка #${dealId} (${formatRub(lead.budget)})`,
      status: isAmo ? "201 Created · 131 ms" : "200 OK · 119 ms"
    },
    {
      delay: 700,
      method: "POST",
      color: "text-[#F7B5A9]",
      text: isAmo
        ? `/api/v4/tasks → задача #${taskId} методисту А. Волковой на слот «${lead.slot}»`
        : `/rest/crm.activity.todo.add → дело #${taskId} на слот «${lead.slot}»`,
      status: "200 OK · 64 ms"
    },
    {
      delay: 920,
      method: "HOOK",
      color: "text-[#9EE0BE]",
      text: `Telegram Bot API → карточка сделки #${dealId} доставлена в чат школы`,
      status: "Delivered · 43 ms"
    }
  ];

  return { requestObj, responseObj, tags, steps, utm };
}
