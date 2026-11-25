import { escapeHtml, formatRub, persistCmsData, sanitizeImageUrl, store } from "./store.js";

const toastEl = document.getElementById("app-toast");
const toastTextEl = document.getElementById("app-toast-text");
let toastTimer = null;

export function showToast(msg) {
  if (!toastEl || !toastTextEl) return;
  toastTextEl.textContent = msg;
  toastEl.classList.remove("opacity-0", "translate-y-3", "pointer-events-none");
  toastEl.classList.add("opacity-100", "translate-y-0");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.add("opacity-0", "translate-y-3", "pointer-events-none");
    toastEl.classList.remove("opacity-100", "translate-y-0");
  }, 2300);
}

export function flashElement(flashTargetId) {
  if (!flashTargetId) return;
  const el = document.getElementById(flashTargetId);
  if (el) {
    el.classList.remove("cms-flash");
    void el.offsetWidth;
    el.classList.add("cms-flash");
  }
}

export function renderStorefrontTexts() {
  const t = store.data.texts;
  const map = {
    "view-hero-badge": t.heroBadge,
    "view-hero-line1": t.heroLine1,
    "view-hero-script": t.heroScript,
    "view-hero-line2": t.heroLine2,
    "view-hero-subtitle": t.heroSubtitle,
    "view-featured-title": t.featuredTitle,
    "view-featured-desc": t.featuredDesc,
    "view-featured-price": formatRub(t.featuredPrice),
    "view-manifesto-quote": t.manifestoQuote,
    "view-manifesto-note": t.manifestoNote,
    "view-footer-address": t.footerAddress
  };

  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

function renderCategoryTabs() {
  const tabsEl = document.getElementById("menu-category-tabs");
  if (!tabsEl) return;

  const visibleMenu = store.data.menu.filter((item) => item.visible);

  tabsEl.innerHTML = store.data.categories
    .map((cat) => {
      const count =
        cat.id === "all"
          ? visibleMenu.length
          : visibleMenu.filter((i) => i.category === cat.id).length;
      const active = store.activeCategory === cat.id;
      return `<button type="button" data-cat-id="${escapeHtml(cat.id)}" class="menu-cat-btn shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
        active
          ? "bg-cocoa-900 text-cream-50 border-cocoa-900 shadow-sm"
          : "bg-cream-50 text-cocoa-900 border-cocoa-900/15 hover:border-cocoa-600"
      }">
        <span>${escapeHtml(cat.label)}</span>
        <span class="px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
          active ? "bg-white/15 text-honey-light" : "bg-cream-200 text-muted"
        }">${count}</span>
      </button>`;
    })
    .join("");

  tabsEl.querySelectorAll(".menu-cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      store.activeCategory = btn.dataset.catId || "all";
      renderCategoryTabs();
      renderStorefrontMenu();
    });
  });
}

export function renderStorefrontMenu(callbacks = {}) {
  const gridEl = document.getElementById("storefront-menu-grid");
  const counterEl = document.getElementById("menu-visible-counter");
  if (!gridEl) return;

  renderCategoryTabs();

  const visibleItems = store.data.menu.filter(
    (item) => item.visible && (store.activeCategory === "all" || item.category === store.activeCategory)
  );
  const hiddenCount = store.data.menu.filter((item) => !item.visible).length;

  if (counterEl) {
    counterEl.textContent = `На витрине: ${visibleItems.length}${hiddenCount ? ` · В стоп-листе: ${hiddenCount}` : ""}`;
  }

  if (!visibleItems.length) {
    gridEl.innerHTML = `
      <div class="col-span-full p-10 rounded-3xl bg-cream-50 border border-cocoa-900/12 text-center flex flex-col items-center gap-3">
        <span class="text-2xl text-cocoa-600">✦</span>
        <div class="font-display font-bold uppercase text-xl text-cocoa-900">В этой категории сейчас нет активных позиций</div>
        <p class="text-xs text-muted max-w-md">Вы можете вернуть позиции из стоп-листа или добавить новое блюдо в гостевой админке.</p>
        <button type="button" data-open-cms-tab="menu" class="btn-caramel px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer mt-1">Открыть админку ⚙</button>
      </div>`;
    if (typeof callbacks.onBindCmsButtons === "function") {
      callbacks.onBindCmsButtons(gridEl);
    }
    return;
  }

  gridEl.innerHTML = visibleItems
    .map((item) => {
      const hasOld = Number(item.oldPrice) > Number(item.price);
      const safeBadge = item.badge
        ? `<span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-cocoa-900/88 backdrop-blur-sm text-honey-light font-mono text-[10px] uppercase tracking-wider shadow">${escapeHtml(item.badge)}</span>`
        : "";
      const oldPriceHtml = hasOld
        ? `<span class="text-xs font-mono text-muted line-through">${formatRub(item.oldPrice)}</span>`
        : "";

      return `<article id="card-${escapeHtml(item.id)}" class="group rounded-[24px] bg-cream-50 border border-cocoa-900/12 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_-22px_rgba(46,23,12,0.28)]">
        <div>
          <div class="relative aspect-[16/10] bg-cream-300 overflow-hidden">
            <img src="${escapeHtml(sanitizeImageUrl(item.image))}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onerror="this.src='https://placehold.co/700x440/3E2012/FAF5EC?text=KORKA+%26+KOFE'">
            ${safeBadge}
            <button type="button" data-quick-edit="${escapeHtml(item.id)}" title="Изменить эту позицию в CMS" class="quick-edit-btn opacity-0 group-hover:opacity-100 focus:opacity-100 absolute top-3 right-3 px-2.5 py-1 rounded-full bg-honey text-cocoa-950 font-mono text-[10px] font-bold uppercase tracking-wider shadow transition-opacity cursor-pointer">
              ✎ Править
            </button>
          </div>

          <div class="p-5 flex flex-col gap-2">
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-bold text-base sm:text-[17px] text-cocoa-900 leading-snug">${escapeHtml(item.title)}</h3>
              <span class="text-[11px] font-mono text-muted shrink-0 mt-0.5">${escapeHtml(item.weight)}</span>
            </div>
            <p class="text-xs text-muted leading-relaxed line-clamp-2">${escapeHtml(item.desc)}</p>
          </div>
        </div>

        <div class="px-5 pb-5 pt-3 border-t border-cocoa-900/10 flex items-center justify-between gap-3 mt-auto">
          <div class="flex items-baseline gap-2">
            <span class="font-display font-bold text-2xl text-cocoa-900">${formatRub(item.price)}</span>
            ${oldPriceHtml}
          </div>
          <button type="button" data-add-cart="${escapeHtml(item.id)}" class="add-cart-btn btn-caramel px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer shrink-0">
            + В заказ
          </button>
        </div>
      </article>`;
    })
    .join("");

  gridEl.querySelectorAll(".add-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.addCart, 1));
  });

  gridEl.querySelectorAll(".quick-edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (typeof callbacks.onQuickEdit === "function") {
        callbacks.onQuickEdit(btn.dataset.quickEdit);
      }
    });
  });
}

export function addToCart(itemId, qty) {
  const existing = store.cart.find((c) => c.id === itemId);
  if (existing) {
    existing.qty += qty;
  } else {
    store.cart.push({ id: itemId, qty });
  }
  updateCartUI();
  showToast("Добавлено в предзаказ");
}

function resolveCartProduct(id) {
  if (id === "featured-brioche") {
    return {
      title: store.data.texts.featuredTitle,
      price: Number(store.data.texts.featuredPrice) || 0
    };
  }
  const found = store.data.menu.find((m) => m.id === id);
  return found ? { title: found.title, price: Number(found.price) || 0 } : null;
}

export function updateCartUI() {
  const cartCountBadge = document.getElementById("cart-count-badge");
  const cartListEl = document.getElementById("cart-items-list");
  const cartTotalEl = document.getElementById("cart-total-sum");
  const cartFooterEl = document.getElementById("cart-footer");

  const totalQty = store.cart.reduce((acc, c) => acc + c.qty, 0);
  if (cartCountBadge) cartCountBadge.textContent = String(totalQty);

  if (!cartListEl || !cartTotalEl) return;

  if (!store.cart.length) {
    cartListEl.innerHTML = `<p class="text-xs text-muted py-6 text-center">Пока пусто. Добавьте выпечку или кофе из меню — цены в заказе автоматически синхронизируются с CMS.</p>`;
    cartTotalEl.textContent = "0 ₽";
    cartFooterEl?.classList.add("opacity-50", "pointer-events-none");
    return;
  }

  cartFooterEl?.classList.remove("opacity-50", "pointer-events-none");
  let totalSum = 0;

  cartListEl.innerHTML = store.cart
    .map((entry) => {
      const prod = resolveCartProduct(entry.id);
      if (!prod) return "";
      const lineSum = prod.price * entry.qty;
      totalSum += lineSum;
      return `<div class="p-3.5 rounded-2xl bg-cream-200/70 border border-cocoa-900/10 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="text-xs sm:text-sm font-bold text-cocoa-900 truncate">${escapeHtml(prod.title)}</div>
          <div class="text-[11px] font-mono text-muted">${formatRub(prod.price)} × ${entry.qty}</div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="font-mono text-sm font-bold text-cocoa-900">${formatRub(lineSum)}</span>
          <button type="button" data-remove-cart="${escapeHtml(entry.id)}" class="w-7 h-7 rounded-full border border-cocoa-900/15 hover:bg-cocoa-900 hover:text-white text-xs cursor-pointer">✕</button>
        </div>
      </div>`;
    })
    .join("");

  cartTotalEl.textContent = formatRub(totalSum);

  cartListEl.querySelectorAll("[data-remove-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      store.cart = store.cart.filter((c) => c.id !== btn.dataset.removeCart);
      updateCartUI();
    });
  });
}

export function initCartControls() {
  const featuredQtyVal = document.getElementById("featured-qty-val");
  const cartModal = document.getElementById("cart-modal");

  document.getElementById("featured-qty-minus")?.addEventListener("click", () => {
    store.featuredQty = Math.max(1, store.featuredQty - 1);
    if (featuredQtyVal) featuredQtyVal.textContent = String(store.featuredQty);
  });

  document.getElementById("featured-qty-plus")?.addEventListener("click", () => {
    store.featuredQty = Math.min(20, store.featuredQty + 1);
    if (featuredQtyVal) featuredQtyVal.textContent = String(store.featuredQty);
  });

  document.getElementById("featured-add-btn")?.addEventListener("click", () => {
    addToCart("featured-brioche", store.featuredQty);
  });

  document.getElementById("open-cart-btn")?.addEventListener("click", () => {
    updateCartUI();
    cartModal?.classList.add("is-open");
    cartModal?.setAttribute("aria-hidden", "false");
  });

  function closeCartModal() {
    cartModal?.classList.remove("is-open");
    cartModal?.setAttribute("aria-hidden", "true");
  }

  document.getElementById("cart-close-btn")?.addEventListener("click", closeCartModal);
  cartModal?.addEventListener("click", (e) => {
    if (e.target === cartModal) closeCartModal();
  });

  document.getElementById("cart-demo-submit")?.addEventListener("click", () => {
    store.cart = [];
    updateCartUI();
    closeCartModal();
    showToast("Демо-заказ оформлен! (Цены взяты из вашей CMS)");
  });

  return { closeCartModal };
}
