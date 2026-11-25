const FINISHES = [
  { id: "boucle", label: "Букле Cream", swatch: "#EDE6DA", delta: 0 },
  { id: "velour", label: "Велюр Graphite", swatch: "#3E3B39", delta: 8000 },
  { id: "leather", label: "Кожа Cognac", swatch: "#8C4A27", delta: 19000 }
];

const PRODUCTS = [
  {
    id: "valencia",
    category: "sofas",
    name: "Диван «Валенсия» Букле",
    price: 149000,
    material: "Итальянское букле, массив дуба",
    leadTime: "В наличии · 3 дня",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "alden",
    category: "chairs",
    name: "Кресло «Альден» Коньяк",
    price: 79900,
    material: "Натуральная кожа анилиновой выделки",
    leadTime: "Под заказ · 10 дней",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "marbella",
    category: "dining",
    name: "Обеденная группа «Марбелья»",
    price: 249900,
    material: "Мрамор Calacatta, брашированная латунь",
    leadTime: "В наличии · 5 дней",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "elara",
    category: "beds",
    name: "Кровать «Элара» с подиумом",
    price: 189900,
    material: "Велюр премиум, ортопедическое основание",
    leadTime: "Под заказ · 14 дней",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "solis-console",
    category: "storage",
    name: "Комод «Солис» Рифлёный",
    price: 94000,
    material: "Шпон американского ореха, латунь",
    leadTime: "В наличии · 4 дня",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "aura-lamp",
    category: "decor",
    name: "Торшер и лампа «Аура»",
    price: 38500,
    material: "Матовое стекло, латунь",
    leadTime: "В наличии · 2 дня",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=700&q=80"
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

function formatRub(val) {
  return `${Math.round(val).toLocaleString("ru-RU")} ₽`;
}

const state = {
  category: "all",
  cart: [],
  favorites: new Set(),
  selectedFinish: {},
  includeAssembly: false
};

function getProductFinish(prodId) {
  const fId = state.selectedFinish[prodId] || "boucle";
  return FINISHES.find((f) => f.id === fId) || FINISHES[0];
}

function renderProducts() {
  const grid = document.getElementById("lux-products-grid");
  if (!grid) return;

  const list =
    state.category === "all"
      ? PRODUCTS.slice(0, 4)
      : PRODUCTS.filter((p) => p.category === state.category);

  grid.innerHTML = list
    .map((p) => {
      const isFav = state.favorites.has(p.id);
      const fin = getProductFinish(p.id);
      const finalPrice = p.price + fin.delta;
      const swatches = FINISHES.map((f) => {
        const active = f.id === fin.id;
        return `<button type="button" data-finish-prod="${p.id}" data-finish-id="${f.id}" title="${escapeHtml(f.label)}" class="finish-swatch-btn w-4 h-4 rounded-full border ${active ? "border-[#E3B873] scale-110 ring-2 ring-[#E3B873]/40" : "border-white/25"} cursor-pointer transition-transform" style="background:${f.swatch}"></button>`;
      }).join("");

      return `<article class="rounded-2xl bg-[#1C1612] border border-[#E3B873]/18 overflow-hidden flex flex-col justify-between group hover:border-[#E3B873]/50 transition-all">
        <div class="relative aspect-[4/3] bg-[#14100D] overflow-hidden">
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-mono text-[#E3B873] border border-white/10">${escapeHtml(p.leadTime)}</span>
          <button type="button" data-fav-id="${p.id}" aria-label="В избранное" class="fav-btn absolute top-3 right-3 w-8 h-8 rounded-full bg-black/55 backdrop-blur-sm border border-white/15 flex items-center justify-center text-xs ${isFav ? "text-[#E3B873]" : "text-white/75"} hover:text-[#E3B873] cursor-pointer">
            ${isFav ? "♥" : "♡"}
          </button>
        </div>
        <div class="p-4 flex flex-col gap-3">
          <div>
            <h3 class="text-sm font-semibold text-[#F5EFE6] truncate">${escapeHtml(p.name)}</h3>
            <div class="text-[11px] text-[#B8A99A] truncate mt-0.5">${escapeHtml(fin.label)} · ${escapeHtml(p.material)}</div>
          </div>
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5">${swatches}</div>
            <span class="text-[10px] font-mono text-[#B8A99A]">0-0-12: ${formatRub(finalPrice / 12)}/мес</span>
          </div>
          <div class="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
            <div class="font-mono text-sm font-bold text-[#E3B873]">${formatRub(finalPrice)}</div>
            <button type="button" data-add-cart="${p.id}" class="add-cart-btn w-9 h-9 rounded-full lux-btn-gold flex items-center justify-center shrink-0 cursor-pointer" title="Добавить в корзину">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </button>
          </div>
        </div>
      </article>`;
    })
    .join("");

  grid.querySelectorAll(".finish-swatch-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedFinish[btn.dataset.finishProd] = btn.dataset.finishId;
      renderProducts();
    });
  });

  grid.querySelectorAll(".add-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const prod = PRODUCTS.find((item) => item.id === btn.dataset.addCart);
      if (!prod) return;
      const fin = getProductFinish(prod.id);
      const cartKey = `${prod.id}:${fin.id}`;
      const existing = state.cart.find((c) => c.cartKey === cartKey);
      if (existing) existing.qty += 1;
      else state.cart.push({ ...prod, cartKey, finishLabel: fin.label, unitPrice: prod.price + fin.delta, qty: 1 });
      updateCartUI();
      openCartDrawer();
    });
  });

  grid.querySelectorAll(".fav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.favId;
      if (state.favorites.has(id)) state.favorites.delete(id);
      else state.favorites.add(id);
      renderProducts();
    });
  });
}

function updateCartUI() {
  const count = state.cart.reduce((acc, i) => acc + i.qty, 0);
  const itemsTotal = state.cart.reduce((acc, i) => acc + i.unitPrice * i.qty, 0);
  const assemblyFee = state.cart.length && state.includeAssembly ? 4500 : 0;
  const total = itemsTotal + assemblyFee;

  const badge = document.getElementById("lux-cart-badge");
  const totalEl = document.getElementById("lux-cart-total");
  const monthlyEl = document.getElementById("lux-cart-monthly");
  const listEl = document.getElementById("lux-cart-items");

  if (badge) badge.textContent = String(count);
  if (totalEl) totalEl.textContent = formatRub(total);
  if (monthlyEl) monthlyEl.textContent = total ? `или ${formatRub(total / 12)} / мес (0-0-12)` : "";

  if (listEl) {
    if (!state.cart.length) {
      listEl.innerHTML = `<div class="py-10 text-center text-xs text-[#B8A99A]">Корзина пока пуста — добавьте предметы из коллекции.</div>`;
    } else {
      listEl.innerHTML = state.cart
        .map(
          (item) => `<div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
            <div class="min-w-0">
              <div class="text-xs font-semibold text-white truncate">${escapeHtml(item.name)}</div>
              <div class="text-[10px] text-[#B8A99A] truncate">${escapeHtml(item.finishLabel)}</div>
              <div class="text-[11px] font-mono text-[#E3B873]">${formatRub(item.unitPrice)} × ${item.qty}</div>
            </div>
            <button type="button" data-remove-key="${escapeHtml(item.cartKey)}" class="remove-cart-btn text-xs text-white/50 hover:text-white cursor-pointer">✕</button>
          </div>`
        )
        .join("");

      listEl.querySelectorAll(".remove-cart-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.cart = state.cart.filter((i) => i.cartKey !== btn.dataset.removeKey);
          updateCartUI();
        });
      });
    }
  }
}

const drawer = document.getElementById("lux-cart-drawer");
function openCartDrawer() {
  drawer?.classList.add("is-open");
  drawer?.setAttribute("aria-hidden", "false");
}
function closeCartDrawer() {
  drawer?.classList.remove("is-open");
  drawer?.setAttribute("aria-hidden", "true");
}

document.getElementById("lux-cart-open")?.addEventListener("click", openCartDrawer);
document.getElementById("lux-cart-close")?.addEventListener("click", closeCartDrawer);
drawer?.addEventListener("click", (e) => {
  if (e.target === drawer) closeCartDrawer();
});

document.getElementById("lux-assembly-cb")?.addEventListener("change", (e) => {
  state.includeAssembly = Boolean(e.target.checked);
  updateCartUI();
});

document.getElementById("lux-checkout-btn")?.addEventListener("click", () => {
  if (!state.cart.length) return;
  const contact = document.getElementById("lux-client-contact")?.value.trim() || "без телефона";
  const msg = document.getElementById("lux-checkout-msg");
  if (msg) {
    msg.textContent = `✓ Смета на ${document.getElementById("lux-cart-total")?.textContent} (${state.cart.length} поз.) передана дизайнеру шоурума (${contact}).`;
    msg.classList.remove("hidden");
  }
});

document.querySelectorAll(".lux-cat-card").forEach((btn) => {
  btn.addEventListener("click", () => {
    const cat = btn.dataset.cat;
    state.category = state.category === cat ? "all" : cat;
    document.querySelectorAll(".lux-cat-card").forEach((c) => {
      c.classList.toggle("is-active", c.dataset.cat === state.category);
    });
    renderProducts();
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
  });
});

renderProducts();
updateCartUI();
