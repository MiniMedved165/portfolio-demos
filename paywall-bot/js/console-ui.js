import { CHANNEL_POSTS } from "./club-data.js";
import { escapeHtml } from "./paywall-state.js";

export function renderPrivateChannelView(state) {
  const scrollEl = document.getElementById("tg-channel-scroll");
  const overlayEl = document.getElementById("channel-lock-overlay");
  const lockIcon = document.getElementById("lock-overlay-icon");
  const lockTitle = document.getElementById("lock-overlay-title");
  const lockDesc = document.getElementById("lock-overlay-desc");
  const lockCta = document.getElementById("lock-overlay-cta");
  const tabLock = document.getElementById("channel-tab-lock-icon");
  const hdrLock = document.getElementById("channel-header-lock");
  const subEl = document.getElementById("channel-members-sub");

  const hasAccess = state.status === "active" || state.status === "warned";

  if (tabLock) tabLock.textContent = hasAccess ? "🔓" : "🔒";
  if (hdrLock) hdrLock.textContent = hasAccess ? "🔓" : "🔒";
  if (subEl) {
    subEl.textContent = hasAccess
      ? "1 481 подписчик · вы в закрытом канале"
      : "1 480 подписчиков · закрытый канал";
  }

  if (scrollEl) {
    scrollEl.innerHTML = CHANNEL_POSTS.map(
      (post) => `
      <article class="rounded-2xl bg-tg-bot border border-white/[0.06] p-3.5 text-white shadow-sm ${hasAccess ? "" : "gated-blur"}">
        <div class="font-mono text-[9.5px] uppercase tracking-wider text-emeraldcap-light mb-1.5">${escapeHtml(post.issue)}</div>
        <h4 class="text-[13.5px] font-bold leading-snug mb-1.5">${escapeHtml(post.title)}</h4>
        <p class="text-[12px] text-white/80 leading-relaxed mb-2.5">${escapeHtml(post.body)}</p>
        <div class="flex items-center justify-between pt-2 border-t border-white/8 text-[10px] font-mono text-white/50">
          <span class="text-[#F2A6B0]">${escapeHtml(post.metric)}</span>
          <span>👁 ${escapeHtml(post.views)} · ${escapeHtml(post.time)}</span>
        </div>
      </article>`
    ).join("");
  }

  if (overlayEl) {
    overlayEl.classList.toggle("hidden", hasAccess);
    overlayEl.classList.toggle("flex", !hasAccess);

    if (state.status === "expired") {
      if (lockIcon) lockIcon.textContent = "⛔";
      if (lockTitle) lockTitle.textContent = "Доступ приостановлен — срок истёк";
      if (lockDesc) {
        lockDesc.textContent =
          "Бот автоматически удалил аккаунт из закрытого канала по истечении оплаченного периода. Продлите подписку в боте, чтобы получить новую ссылку.";
      }
      if (lockCta) lockCta.textContent = "Продлить подписку в боте →";
    } else if (state.status === "invite_issued") {
      if (lockIcon) lockIcon.textContent = "🔗";
      if (lockTitle) lockTitle.textContent = "Одноразовая ссылка уже ждёт в боте";
      if (lockDesc) {
        lockDesc.textContent =
          "Оплата прошла успешно! Вернитесь в чат с ботом и нажмите на выданную ссылку-приглашение (1/1), чтобы открыть канал.";
      }
      if (lockCta) lockCta.textContent = "Открыть ссылку в боте →";
    } else {
      if (lockIcon) lockIcon.textContent = "🔒";
      if (lockTitle) lockTitle.textContent = "Доступ только для резидентов";
      if (lockDesc) {
        lockDesc.textContent =
          "Это закрытый канал. Оформите тестовую подписку в @rezerv_club_bot и перейдите по персональной одноразовой ссылке.";
      }
      if (lockCta) lockCta.textContent = "Перейти в @rezerv_club_bot →";
    }
  }
}

export function updateLifecycleUI(state, flashConsole = false) {
  const stageMap = {
    none: "pay",
    invite_issued: "invite",
    active: "active",
    warned: "expire",
    expired: "expire"
  };
  const order = ["pay", "invite", "active", "expire"];
  const currentKey = stageMap[state.status] || "pay";
  const curIdx = order.indexOf(currentKey);

  document.querySelectorAll(".life-step").forEach((el) => {
    const idx = order.indexOf(el.dataset.lifeStep);
    if (idx === curIdx) {
      el.className = "life-step px-3 py-2.5 rounded-xl bg-slateink-900 text-paper-50 border border-slateink-900 transition-all shadow-sm";
    } else if (idx < curIdx) {
      el.className = "life-step px-3 py-2.5 rounded-xl bg-oxblood-soft text-oxblood border border-oxblood/30 transition-all";
    } else {
      el.className = "life-step px-3 py-2.5 rounded-xl bg-paper-50 text-slateink-600 border border-slateink-900/12 transition-all";
    }
  });

  const badgeEl = document.getElementById("member-status-badge");
  const expEl = document.getElementById("member-expiry-label");
  const linkEl = document.getElementById("invite-url-display");
  const limitPill = document.getElementById("invite-limit-pill");
  const leakBtn = document.getElementById("test-leak-btn");
  const warnBtn = document.getElementById("warp-warn-btn");
  const kickBtn = document.getElementById("warp-kick-btn");
  const dayCounter = document.getElementById("sim-day-counter");
  const hintEl = document.getElementById("timewarp-hint");

  if (badgeEl) {
    if (state.status === "none") {
      badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-slateink-400"></span><span class="text-paper-200/75">Нет активной подписки</span>`;
    } else if (state.status === "invite_issued") {
      badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span><span class="text-sky-300">Оплачено · Ссылка выдана</span>`;
    } else if (state.status === "active") {
      badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emeraldcap-light animate-pulse"></span><span class="text-emeraldcap-light">Резидент · Доступ открыт ✓</span>`;
    } else if (state.status === "warned") {
      badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span><span class="text-amber-300">Активен · Осталось 3 дня</span>`;
    } else if (state.status === "expired") {
      badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-400"></span><span class="text-rose-300">Исключён по сроку (Expired)</span>`;
    }
  }

  if (expEl) {
    expEl.textContent =
      state.status === "none"
        ? "— (выберите тариф в боте)"
        : state.status === "expired"
          ? `Истёк (${state.selectedTariff.name})`
          : `${state.selectedTariff.name} · до ${state.expiresDateText}`;
  }

  if (linkEl && limitPill && leakBtn) {
    if (!state.inviteUrl) {
      linkEl.textContent = "Ожидает подтверждения оплаты...";
      linkEl.className = "font-mono text-xs text-paper-200/50 truncate";
      limitPill.textContent = "Не создана";
      limitPill.className = "px-2 py-0.5 rounded-full bg-white/10 font-mono text-[10px] text-paper-200/70";
      leakBtn.disabled = true;
    } else if (state.inviteUses === 0 && !state.inviteRevoked) {
      linkEl.textContent = state.inviteUrl;
      linkEl.className = "font-mono text-xs text-emeraldcap-light truncate";
      limitPill.textContent = "Активна: 0 / 1";
      limitPill.className = "px-2 py-0.5 rounded-full bg-emerald-500/20 font-mono text-[10px] text-emerald-300";
      leakBtn.disabled = true;
    } else {
      linkEl.textContent = state.inviteUrl;
      linkEl.className = "font-mono text-xs text-rose-300/75 line-through truncate";
      limitPill.textContent = "Аннулирована (1 / 1)";
      limitPill.className = "px-2 py-0.5 rounded-full bg-rose-500/20 font-mono text-[10px] text-rose-300";
      leakBtn.disabled = false;
    }
  }

  if (dayCounter) {
    dayCounter.textContent =
      state.status === "none"
        ? "День 0"
        : `День ${state.currentDay} из ${state.selectedTariff.days}`;
  }

  const isInsideChannel = state.status === "active" || state.status === "warned";
  if (warnBtn) warnBtn.disabled = state.status !== "active";
  if (kickBtn) kickBtn.disabled = !isInsideChannel;

  if (hintEl) {
    if (state.status === "none") {
      hintEl.textContent =
        "Оформите тестовую подписку в боте справа и войдите в канал по одноразовой ссылке — после этого разблокируются кнопки напоминания и автоудаления.";
    } else if (state.status === "invite_issued") {
      hintEl.textContent =
        "Оплата проверена! Нажмите на одноразовую ссылку в сообщении бота справа, чтобы войти в закрытый канал (лимит 1/1 сразу сработает).";
    } else if (state.status === "active") {
      hintEl.textContent =
        "Вы внутри закрытого канала! Ссылка уже аннулирована (проверьте «Тест пересылки другу»), а ниже можно промотать время к концу подписки.";
    } else if (state.status === "warned") {
      hintEl.textContent =
        "Бот отправил предупреждение за 3 дня до конца подписки. Теперь нажмите «Срок истёк: автоудаление», чтобы увидеть исключение из канала.";
    } else if (state.status === "expired") {
      hintEl.textContent =
        "Cron-задача выполнила мягкое удаление (banChatMember + unbanChatMember): доступ к каналу снова закрыт, а бот предложил продлить подписку.";
    }
  }

  if (flashConsole) {
    const card = document.getElementById("access-console-card");
    if (card) {
      card.classList.remove("status-flash");
      void card.offsetWidth;
      card.classList.add("status-flash");
    }
  }

  renderPrivateChannelView(state);
}
