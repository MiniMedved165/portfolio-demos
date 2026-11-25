import { PRESET_IMAGES } from "./default-data.js";
import {
  clampPrice,
  escapeHtml,
  formatRub,
  persistCmsData,
  resetCmsToDefaults,
  sanitizeImageUrl,
  store
} from "./store.js";
import { showToast } from "./storefront-ui.js";

const cmsBodyEl = document.getElementById("cms-body");
const loginModal = document.getElementById("cms-login-modal");
const loginForm = document.getElementById("cms-login-form");
const loginClose = document.getElementById("cms-login-close");
const cmsCloseBtn = document.getElementById("cms-close-btn");
const cmsMobilePreviewBtn = document.getElementById("cms-mobile-preview-btn");
const cmsResetBtn = document.getElementById("cms-reset-btn");
const floatingCmsBtn = document.getElementById("floating-cms-btn");

let pendingTabAfterLogin = "menu";

export function setCmsTab(tabName) {
  store.activeCmsTab = tabName;
  document.querySelectorAll(".cms-tab-btn").forEach((btn) => {
    const active = btn.dataset.cmsTab === tabName;
    btn.className = active
      ? "cms-tab-btn py-2 px-2 rounded-lg text-[11px] font-mono font-semibold uppercase tracking-wider bg-honey text-cocoa-950 cursor-pointer transition-all"
      : "cms-tab-btn py-2 px-2 rounded-lg text-[11px] font-mono uppercase tracking-wider text-cream-200/70 hover:text-white bg-white/5 cursor-pointer transition-all";
  });
  renderCmsBody();
}

export function openCmsDrawer(tabName) {
  if (tabName) store.activeCmsTab = tabName;
  document.body.classList.add("cms-open");
  floatingCmsBtn?.classList.add("hidden");
  setCmsTab(store.activeCmsTab);
}

export function closeCmsDrawer() {
  document.body.classList.remove("cms-open");
  floatingCmsBtn?.classList.remove("hidden");
}

function openLoginModal() {
  loginModal?.classList.add("is-open");
  loginModal?.setAttribute("aria-hidden", "false");
}

export function closeLoginModal() {
  loginModal?.classList.remove("is-open");
  loginModal?.setAttribute("aria-hidden", "true");
}

export function openCmsFlow(tabName) {
  pendingTabAfterLogin = tabName || store.activeCmsTab;
  if (store.isLoggedIn) {
    openCmsDrawer(pendingTabAfterLogin);
  } else {
    openLoginModal();
  }
}

export function bindOpenCmsButtons(scope) {
  (scope || document).querySelectorAll("[data-open-cms]").forEach((btn) => {
    btn.addEventListener("click", () => openCmsFlow("menu"));
  });
  (scope || document).querySelectorAll("[data-open-cms-tab]").forEach((btn) => {
    btn.addEventListener("click", () => openCmsFlow(btn.dataset.openCmsTab));
  });
}

function handleResetAll() {
  resetCmsToDefaults();
  renderCmsBody();
  showToast("Витрина сброшена к исходным данным");
}

export function renderCmsBody() {
  if (!cmsBodyEl) return;

  if (store.activeCmsTab === "menu") {
    const addFormHtml = store.isAddingItem
      ? `<form id="cms-add-item-form" class="p-4 rounded-2xl bg-cocoa-900 border border-honey/45 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-wider text-honey-light font-semibold">Новое блюдо на витрину</span>
            <button type="button" id="cms-cancel-add" class="text-xs text-cream-200/60 hover:text-white cursor-pointer">Отмена</button>
          </div>
          <input name="title" type="text" required maxlength="140" placeholder="Название (например: Сырники с малиной)" class="w-full px-3 py-2 rounded-xl bg-cocoa-950 border border-white/15 text-xs text-white placeholder-cream-200/40 focus:border-honey focus:ring-0">
          <div class="grid grid-cols-2 gap-2.5">
            <input name="price" type="number" min="1" max="999999" required placeholder="Цена, ₽ (420)" class="w-full px-3 py-2 rounded-xl bg-cocoa-950 border border-white/15 font-mono text-xs text-white placeholder-cream-200/40 focus:border-honey focus:ring-0">
            <input name="weight" type="text" maxlength="40" placeholder="Вес (180 г)" value="180 г" class="w-full px-3 py-2 rounded-xl bg-cocoa-950 border border-white/15 font-mono text-xs text-white placeholder-cream-200/40 focus:border-honey focus:ring-0">
          </div>
          <div class="grid grid-cols-2 gap-2.5">
            <select name="category" class="w-full px-3 py-2 rounded-xl bg-cocoa-950 border border-white/15 text-xs text-white focus:border-honey focus:ring-0">
              <option value="bakery">Выпечка</option>
              <option value="breakfast">Завтраки</option>
              <option value="coffee">Спешелти кофе</option>
              <option value="desserts">Десерты</option>
            </select>
            <input name="badge" type="text" maxlength="40" placeholder="Бейдж (Новинка)" value="Новинка" class="w-full px-3 py-2 rounded-xl bg-cocoa-950 border border-white/15 text-xs text-white placeholder-cream-200/40 focus:border-honey focus:ring-0">
          </div>
          <textarea name="desc" rows="2" maxlength="400" placeholder="Короткое вкусное описание..." class="w-full px-3 py-2 rounded-xl bg-cocoa-950 border border-white/15 text-xs text-white placeholder-cream-200/40 focus:border-honey focus:ring-0 resize-none"></textarea>
          <div>
            <span class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1.5">Выберите фото</span>
            <div class="grid grid-cols-4 gap-2">
              ${PRESET_IMAGES.map(
                (img, i) => `
                <label class="cursor-pointer block">
                  <input type="radio" name="image" value="${escapeHtml(img.url)}" ${i === 0 ? "checked" : ""} class="sr-only peer">
                  <div class="aspect-square rounded-lg overflow-hidden border-2 border-transparent peer-checked:border-honey opacity-70 peer-checked:opacity-100 transition-all">
                    <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.label)}" class="w-full h-full object-cover">
                  </div>
                </label>`
              ).join("")}
            </div>
          </div>
          <button type="submit" class="btn-cms-trigger w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider cursor-pointer">
            + Опубликовать на витрине
          </button>
        </form>`
      : `<button id="cms-open-add-btn" type="button" class="w-full py-3 px-4 rounded-xl border border-dashed border-honey/55 hover:border-honey hover:bg-honey/10 text-honey-light text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer">
          + Добавить новую позицию в меню
        </button>`;

    const itemsHtml = store.data.menu
      .map((item) => {
        const isOpen = store.expandedCmsItemId === item.id;
        return `<div class="rounded-2xl bg-cocoa-900/80 border ${isOpen ? "border-honey/55" : "border-white/10"} overflow-hidden transition-colors">
          <div class="p-3.5 flex items-center justify-between gap-3 cursor-pointer cms-item-header" data-toggle-item="${escapeHtml(item.id)}">
            <div class="flex items-center gap-3 min-w-0">
              <img src="${escapeHtml(sanitizeImageUrl(item.image))}" alt="" class="w-10 h-10 rounded-lg object-cover shrink-0 ${item.visible ? "" : "grayscale opacity-40"}">
              <div class="min-w-0">
                <div class="text-xs font-bold text-white truncate ${item.visible ? "" : "line-through text-cream-200/45"}">${escapeHtml(item.title)}</div>
                <div class="text-[11px] font-mono ${item.visible ? "text-honey-light" : "text-rose-400"}">
                  ${item.visible ? formatRub(item.price) : "Скрыто (Стоп-лист)"}
                </div>
              </div>
            </div>
            <span class="text-xs font-mono text-cream-200/50 shrink-0">${isOpen ? "▲" : "▼"}</span>
          </div>

          ${
            isOpen
              ? `<div class="px-3.5 pb-4 pt-3 border-t border-white/10 flex flex-col gap-3 bg-cocoa-950/60">
                  <div>
                    <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Название блюда</label>
                    <input type="text" maxlength="140" data-edit-id="${escapeHtml(item.id)}" data-field="title" value="${escapeHtml(item.title)}" class="cms-item-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 text-xs text-white focus:border-honey focus:ring-0">
                  </div>
                  <div class="grid grid-cols-2 gap-2.5">
                    <div>
                      <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Цена (₽)</label>
                      <input type="number" min="0" max="999999" data-edit-id="${escapeHtml(item.id)}" data-field="price" value="${clampPrice(item.price)}" class="cms-item-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 font-mono text-xs text-honey-light font-semibold focus:border-honey focus:ring-0">
                    </div>
                    <div>
                      <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Старая цена (₽)</label>
                      <input type="number" min="0" max="999999" data-edit-id="${escapeHtml(item.id)}" data-field="oldPrice" value="${clampPrice(item.oldPrice)}" class="cms-item-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 font-mono text-xs text-cream-200 focus:border-honey focus:ring-0">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2.5">
                    <div>
                      <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Бейдж</label>
                      <input type="text" maxlength="40" data-edit-id="${escapeHtml(item.id)}" data-field="badge" value="${escapeHtml(item.badge)}" placeholder="Без бейджа" class="cms-item-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 text-xs text-white focus:border-honey focus:ring-0">
                    </div>
                    <div>
                      <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Вес / объём</label>
                      <input type="text" maxlength="40" data-edit-id="${escapeHtml(item.id)}" data-field="weight" value="${escapeHtml(item.weight)}" class="cms-item-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 font-mono text-xs text-white focus:border-honey focus:ring-0">
                    </div>
                  </div>
                  <div>
                    <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Описание</label>
                    <textarea rows="2" maxlength="400" data-edit-id="${escapeHtml(item.id)}" data-field="desc" class="cms-item-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 text-xs text-cream-100 focus:border-honey focus:ring-0 resize-none">${escapeHtml(item.desc)}</textarea>
                  </div>
                  <div class="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <label class="inline-flex items-center gap-2 text-xs text-cream-200 cursor-pointer select-none">
                      <input type="checkbox" data-toggle-visible="${escapeHtml(item.id)}" ${item.visible ? "checked" : ""} class="rounded bg-cocoa-950 border-white/25 text-honey focus:ring-0 cursor-pointer">
                      <span>Показывать на витрине</span>
                    </label>
                    <button type="button" data-delete-item="${escapeHtml(item.id)}" class="cms-delete-btn text-[11px] font-mono text-rose-400 hover:text-rose-300 cursor-pointer">Удалить</button>
                  </div>
                </div>`
              : ""
          }
        </div>`;
      })
      .join("");

    cmsBodyEl.innerHTML = `
      <p class="text-[11px] text-cream-200/70 leading-relaxed">
        Меняйте любую цену, название или включайте стоп-лист — витрина и сумма заказа обновляются мгновенно без перезагрузки.
      </p>
      ${addFormHtml}
      <div class="flex flex-col gap-2.5">${itemsHtml}</div>
    `;

    document.getElementById("cms-open-add-btn")?.addEventListener("click", () => {
      store.isAddingItem = true;
      renderCmsBody();
    });

    document.getElementById("cms-cancel-add")?.addEventListener("click", () => {
      store.isAddingItem = false;
      renderCmsBody();
    });

    document.getElementById("cms-add-item-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const newId = `item-${Date.now()}`;
      const newItem = {
        id: newId,
        category: String(fd.get("category") || "bakery"),
        title: String(fd.get("title") || "Новая позиция").trim().slice(0, 140),
        desc: String(fd.get("desc") || "Приготовлено сегодня утром по авторскому рецепту.").trim().slice(0, 400),
        weight: String(fd.get("weight") || "150 г").trim().slice(0, 40),
        price: clampPrice(fd.get("price") || 350),
        oldPrice: 0,
        badge: String(fd.get("badge") || "").trim().slice(0, 40),
        visible: true,
        image: sanitizeImageUrl(fd.get("image"))
      };
      store.data.menu.unshift(newItem);
      store.activeCategory = "all";
      store.isAddingItem = false;
      store.expandedCmsItemId = newId;
      persistCmsData(`card-${newId}`);
      renderCmsBody();
      showToast(`Добавлено на витрину: ${newItem.title}`);
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    cmsBodyEl.querySelectorAll(".cms-item-header").forEach((hdr) => {
      hdr.addEventListener("click", () => {
        const id = hdr.dataset.toggleItem;
        store.expandedCmsItemId = store.expandedCmsItemId === id ? null : id;
        renderCmsBody();
      });
    });

    cmsBodyEl.querySelectorAll(".cms-item-input").forEach((input) => {
      input.addEventListener("input", () => {
        const id = input.dataset.editId;
        const field = input.dataset.field;
        const target = store.data.menu.find((m) => m.id === id);
        if (!target) return;

        target[field] =
          field === "price" || field === "oldPrice" ? clampPrice(input.value) : String(input.value);
        persistCmsData(`card-${id}`);

        const cardWrap = input.closest(".rounded-2xl");
        const hdrTitle = cardWrap?.querySelector(".cms-item-header .font-bold");
        const hdrPrice = cardWrap?.querySelector(".cms-item-header .font-mono");
        if (hdrTitle) hdrTitle.textContent = target.title;
        if (hdrPrice && target.visible) hdrPrice.textContent = formatRub(target.price);
      });
    });

    cmsBodyEl.querySelectorAll("[data-toggle-visible]").forEach((cb) => {
      cb.addEventListener("change", () => {
        const id = cb.dataset.toggleVisible;
        const target = store.data.menu.find((m) => m.id === id);
        if (!target) return;
        target.visible = cb.checked;
        persistCmsData(cb.checked ? `card-${id}` : null);
        renderCmsBody();
        showToast(cb.checked ? "Позиция возвращена на витрину" : "Позиция скрыта в стоп-лист");
      });
    });

    cmsBodyEl.querySelectorAll(".cms-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.deleteItem;
        store.data.menu = store.data.menu.filter((m) => m.id !== id);
        store.cart = store.cart.filter((c) => c.id !== id);
        store.expandedCmsItemId = store.data.menu[0]?.id || null;
        persistCmsData(null);
        renderCmsBody();
        showToast("Позиция удалена из меню");
      });
    });
  } else if (store.activeCmsTab === "texts") {
    const t = store.data.texts;
    cmsBodyEl.innerHTML = `
      <p class="text-[11px] text-cream-200/70 leading-relaxed">
        Редактируйте заголовки, акции, «Хит утра» и адрес — изменения сразу отображаются на странице.
      </p>

      <div class="p-4 rounded-2xl bg-cocoa-900/80 border border-white/10 flex flex-col gap-3">
        <div class="text-[10.5px] font-mono uppercase tracking-wider text-honey-light">Первый экран (Hero)</div>
        <div>
          <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Плашка акции сверху</label>
          <input type="text" data-text-key="heroBadge" data-flash="view-hero-badge" value="${escapeHtml(t.heroBadge)}" class="cms-text-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 text-xs text-white focus:border-honey focus:ring-0">
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Строка 1</label>
            <input type="text" data-text-key="heroLine1" data-flash="view-hero-line1" value="${escapeHtml(t.heroLine1)}" class="cms-text-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 text-xs text-white focus:border-honey focus:ring-0">
          </div>
          <div>
            <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Рукописное слово</label>
            <input type="text" data-text-key="heroScript" data-flash="view-hero-script" value="${escapeHtml(t.heroScript)}" class="cms-text-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 text-xs text-honey-light focus:border-honey focus:ring-0">
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Строка 2</label>
          <input type="text" data-text-key="heroLine2" data-flash="view-hero-line2" value="${escapeHtml(t.heroLine2)}" class="cms-text-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 text-xs text-white focus:border-honey focus:ring-0">
        </div>
        <div>
          <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Подзаголовок</label>
          <textarea rows="3" data-text-key="heroSubtitle" data-flash="view-hero-subtitle" class="cms-text-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 text-xs text-cream-100 focus:border-honey focus:ring-0 resize-none">${escapeHtml(t.heroSubtitle)}</textarea>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-cocoa-900/80 border border-white/10 flex flex-col gap-3">
        <div class="text-[10.5px] font-mono uppercase tracking-wider text-honey-light">Блок «Хит утра»</div>
        <div>
          <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Название блюда</label>
          <input type="text" data-text-key="featuredTitle" data-flash="view-featured-title" value="${escapeHtml(t.featuredTitle)}" class="cms-text-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 text-xs text-white focus:border-honey focus:ring-0">
        </div>
        <div>
          <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Цена (₽)</label>
          <input type="number" min="0" max="999999" data-text-key="featuredPrice" data-flash="view-featured-price" value="${clampPrice(t.featuredPrice)}" class="cms-text-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 font-mono text-xs text-honey-light font-semibold focus:border-honey focus:ring-0">
        </div>
        <div>
          <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Описание</label>
          <textarea rows="3" data-text-key="featuredDesc" data-flash="view-featured-desc" class="cms-text-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 text-xs text-cream-100 focus:border-honey focus:ring-0 resize-none">${escapeHtml(t.featuredDesc)}</textarea>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-cocoa-900/80 border border-white/10 flex flex-col gap-3">
        <div class="text-[10.5px] font-mono uppercase tracking-wider text-honey-light">Манифест и адрес</div>
        <div>
          <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Цитата в тёмном блоке</label>
          <textarea rows="2" data-text-key="manifestoQuote" data-flash="view-manifesto-quote" class="cms-text-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 text-xs text-white focus:border-honey focus:ring-0 resize-none">${escapeHtml(t.manifestoQuote)}</textarea>
        </div>
        <div>
          <label class="block text-[10px] font-mono uppercase text-cream-200/60 mb-1">Адрес и часы работы</label>
          <input type="text" data-text-key="footerAddress" data-flash="view-footer-address" value="${escapeHtml(t.footerAddress)}" class="cms-text-input w-full px-3 py-2 rounded-lg bg-cocoa-950 border border-white/15 text-xs text-white focus:border-honey focus:ring-0">
        </div>
      </div>
    `;

    cmsBodyEl.querySelectorAll(".cms-text-input").forEach((el) => {
      el.addEventListener("input", () => {
        const key = el.dataset.textKey;
        const flashId = el.dataset.flash;
        store.data.texts[key] = key === "featuredPrice" ? clampPrice(el.value) : String(el.value);
        persistCmsData(flashId);
      });
    });
  } else if (store.activeCmsTab === "json") {
    const jsonStr = JSON.stringify(store.data, null, 2);
    cmsBodyEl.innerHTML = `
      <p class="text-[11px] text-cream-200/70 leading-relaxed">
        Так выглядят актуальные данные вашей CMS. В реальном проекте этот JSON синхронизируется с базой данных (PostgreSQL / SQLite / Strapi / Directus) по REST API.
      </p>
      <div class="flex items-center gap-2">
        <button id="cms-copy-json-btn" type="button" class="btn-cms-trigger flex-1 py-2.5 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider cursor-pointer">
          Скопировать JSON
        </button>
        <button id="cms-reset-json-btn" type="button" class="px-4 py-2.5 rounded-xl border border-white/20 hover:border-honey text-[11px] font-mono uppercase text-cream-200 hover:text-honey-light cursor-pointer">
          Сбросить
        </button>
      </div>
      <pre id="cms-json-output" class="p-3.5 rounded-xl bg-black/55 border border-white/10 font-mono text-[10.5px] text-cream-200/85 overflow-x-auto leading-relaxed whitespace-pre-wrap break-words"></pre>
    `;

    const preEl = document.getElementById("cms-json-output");
    if (preEl) preEl.textContent = jsonStr;

    document.getElementById("cms-copy-json-btn")?.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(jsonStr);
        } else {
          const ta = document.createElement("textarea");
          ta.value = jsonStr;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        showToast("JSON-конфиг CMS скопирован");
      } catch {
        showToast("Не удалось скопировать");
      }
    });

    document.getElementById("cms-reset-json-btn")?.addEventListener("click", handleResetAll);
  }
}

export function initCmsPanel() {
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    store.isLoggedIn = true;
    closeLoginModal();
    openCmsDrawer(pendingTabAfterLogin);
    showToast("Вы вошли в гостевую админку");
  });

  loginClose?.addEventListener("click", closeLoginModal);
  loginModal?.addEventListener("click", (e) => {
    if (e.target === loginModal) closeLoginModal();
  });

  cmsCloseBtn?.addEventListener("click", closeCmsDrawer);
  cmsMobilePreviewBtn?.addEventListener("click", closeCmsDrawer);
  cmsResetBtn?.addEventListener("click", handleResetAll);

  document.querySelectorAll(".cms-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => setCmsTab(btn.dataset.cmsTab));
  });
}
