const DRINKS = [
  {
    id: "iced-caramel",
    name: "Айс Карамель Латте",
    desc: "Мягкий эспрессо с солёной карамелью, льдом и холодным молоком.",
    price: 340,
    volume: "350 мл",
    tag: "Хит лета",
    img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "cappuccino",
    name: "Капучино",
    desc: "Классический баланс двойного эспрессо и шёлковой молочной пенки.",
    price: 290,
    volume: "250 мл",
    tag: "Классика",
    img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "mocha",
    name: "Шоколадный Мокко",
    desc: "Горячий эспрессо с бельгийским тёмным шоколадом и сливками.",
    price: 320,
    volume: "300 мл",
    tag: "Десертный",
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "espresso",
    name: "Эспрессо",
    desc: "Насыщенный чистый шот 100% арабики Эфиопия Гуджи с ореховой крема.",
    price: 220,
    volume: "60 мл",
    tag: "Спешелти",
    img: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=600&q=80"
  }
];

const EXTRA_DRINKS = [
  {
    id: "raf-lavender",
    name: "Лавандовый Раф",
    desc: "Нежные сливки, натуральный сироп горной лаванды и эспрессо.",
    price: 360,
    volume: "300 мл",
    tag: "Авторский",
    img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "matcha-tonic",
    name: "Матча Эспрессо Тоник",
    desc: "Освежающий микс тоника, церемониальной матчи и цитруса.",
    price: 350,
    volume: "330 мл",
    tag: "Тонизирующий",
    img: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80"
  }
];

const state = {
  cart: [{ id: "iced-caramel", qty: 1 }],
  showAll: false,
  pickupSlot: "Через 15 минут"
};

const fmtRub = (v) => new Intl.NumberFormat("ru-RU").format(v) + " ₽";
const allDrinks = () => (state.showAll ? [...DRINKS, ...EXTRA_DRINKS] : DRINKS);

function renderDrinks() {
  const grid = document.getElementById("bh-drinks-grid");
  if (!grid) return;

  grid.innerHTML = allDrinks()
    .map(
      (item) => `
      <article class="bh-drink-card rounded-2xl overflow-hidden flex flex-col justify-between">
        <div>
          <div class="relative h-48 overflow-hidden bg-[#150F0C]">
            <img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105">
            <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-sm text-[10px] font-mono text-[#E0B790] border border-[#C6976E]/25">${item.tag}</span>
          </div>
          <div class="p-4">
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <h3 class="text-sm font-bold text-white">${item.name}</h3>
              <span class="text-[10px] font-mono text-[#BFA997]">${item.volume}</span>
            </div>
            <p class="text-xs text-[#BFA997] leading-relaxed">${item.desc}</p>
          </div>
        </div>
        <div class="px-4 pb-4 pt-2 flex items-center justify-between border-t border-white/5">
          <span class="font-mono text-base font-bold text-white">${fmtRub(item.price)}</span>
          <button type="button" class="bh-add-btn w-9 h-9 rounded-full bg-[#C6976E]/15 hover:bg-[#C6976E] text-[#E0B790] hover:text-[#16100C] border border-[#C6976E]/35 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors" data-add="${item.id}" aria-label="Добавить ${item.name}">+</button>
        </div>
      </article>`
    )
    .join("");
}

function updateCartUI() {
  const catalog = [...DRINKS, ...EXTRA_DRINKS];
  const badge = document.getElementById("bh-cart-badge");
  const list = document.getElementById("bh-cart-items");
  const totalEl = document.getElementById("bh-cart-total");

  const count = state.cart.reduce((s, x) => s + x.qty, 0);
  if (badge) badge.textContent = String(count);

  let sum = 0;
  if (list) {
    if (!state.cart.length) {
      list.innerHTML = '<div class="text-xs text-[#BFA997] py-6 text-center">Добавьте напиток из меню для предзаказа ко времени.</div>';
    } else {
      list.innerHTML = state.cart
        .map((entry) => {
          const d = catalog.find((x) => x.id === entry.id);
          if (!d) return "";
          sum += d.price * entry.qty;
          return `
            <div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
              <div>
                <div class="text-xs font-semibold text-white">${d.name}</div>
                <div class="text-[11px] font-mono text-[#C6976E]">${fmtRub(d.price)} × ${entry.qty}</div>
              </div>
              <div class="flex items-center gap-1.5">
                <button type="button" class="bh-qty-btn w-6 h-6 rounded bg-white/10 text-xs text-white cursor-pointer" data-qty="-1" data-id="${d.id}">−</button>
                <button type="button" class="bh-qty-btn w-6 h-6 rounded bg-white/10 text-xs text-white cursor-pointer" data-qty="1" data-id="${d.id}">+</button>
              </div>
            </div>`;
        })
        .join("");
    }
  }
  if (totalEl) totalEl.textContent = fmtRub(sum);
}

function toggleDrawer(open) {
  const drawer = document.getElementById("bh-order-drawer");
  if (!drawer) return;
  drawer.classList.toggle("is-open", open);
  drawer.setAttribute("aria-hidden", String(!open));
}

document.addEventListener("DOMContentLoaded", () => {
  renderDrinks();
  updateCartUI();

  document.getElementById("bh-drinks-grid")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const id = btn.dataset.add;
    const found = state.cart.find((x) => x.id === id);
    if (found) found.qty += 1;
    else state.cart.push({ id, qty: 1 });
    updateCartUI();
    toggleDrawer(true);
  });

  document.getElementById("bh-cart-items")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-qty]");
    if (!btn) return;
    const id = btn.dataset.id;
    const delta = Number(btn.dataset.qty);
    const found = state.cart.find((x) => x.id === id);
    if (!found) return;
    found.qty += delta;
    if (found.qty <= 0) state.cart = state.cart.filter((x) => x.id !== id);
    updateCartUI();
  });

  document.getElementById("bh-toggle-menu")?.addEventListener("click", (e) => {
    state.showAll = !state.showAll;
    e.currentTarget.textContent = state.showAll ? "Скрыть доп. позиции ↑" : "Открыть полное меню →";
    renderDrinks();
  });

  document.getElementById("bh-open-order")?.addEventListener("click", () => toggleDrawer(true));
  document.getElementById("bh-open-order-hero")?.addEventListener("click", () => toggleDrawer(true));
  document.getElementById("bh-close-order")?.addEventListener("click", () => toggleDrawer(false));

  document.querySelectorAll("[data-slot]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.pickupSlot = btn.dataset.slot;
      document.querySelectorAll("[data-slot]").forEach((b) => b.classList.remove("border-[#C6976E]", "bg-[#C6976E]/20", "text-white"));
      btn.classList.add("border-[#C6976E]", "bg-[#C6976E]/20", "text-white");
    });
  });

  document.getElementById("bh-order-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const guest = document.getElementById("bh-guest-name")?.value.trim() || "Гость";
    const status = document.getElementById("bh-order-status");
    const total = document.getElementById("bh-cart-total")?.textContent || "0 ₽";
    if (status) {
      status.classList.remove("hidden");
      status.textContent = `✓ Предзаказ на ${total} принят для ${guest} (${state.pickupSlot}). Уведомление отправлено бариста в Telegram.`;
    }
  });

  document.getElementById("bh-newsletter-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("bh-newsletter-email");
    const msg = document.getElementById("bh-newsletter-msg");
    if (!input || !msg) return;
    msg.classList.remove("hidden");
    msg.textContent = `✓ Промокод WELCOME15 отправлен на ${input.value.trim()}`;
    input.value = "";
  });
});
