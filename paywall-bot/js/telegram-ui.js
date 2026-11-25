import { TARIFFS } from "./club-data.js";
import {
  escapeHtml,
  formatRub,
  getNowTime,
  formatFutureDate,
  generateOneTimeLink,
  showToast,
  logBotApi
} from "./paywall-state.js";
import { updateLifecycleUI } from "./console-ui.js";

export function createPaywallController(state) {
  const chatScrollEl = document.getElementById("tg-chat-scroll");
  const botStatusEl = document.getElementById("tg-bot-status");
  const paySheetEl = document.getElementById("phone-pay-sheet");
  const payConfirmBtn = document.getElementById("pay-sheet-confirm-btn");

  function switchPhoneTab(tab) {
    state.phoneTab = tab;
    const botView = document.getElementById("phone-view-bot");
    const chanView = document.getElementById("phone-view-channel");
    const botBtn = document.getElementById("phone-tab-bot");
    const chanBtn = document.getElementById("phone-tab-channel");

    botView?.classList.toggle("hidden", tab !== "bot");
    botView?.classList.toggle("flex", tab === "bot");
    chanView?.classList.toggle("hidden", tab !== "channel");
    chanView?.classList.toggle("flex", tab === "channel");

    if (botBtn && chanBtn) {
      const isBot = tab === "bot";
      botBtn.className = isBot
        ? "py-1.5 px-2.5 rounded-xl bg-tg-header text-white text-[11.5px] font-semibold flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer transition-all"
        : "py-1.5 px-2.5 rounded-xl bg-transparent text-white/60 hover:text-white text-[11.5px] font-semibold flex items-center justify-center gap-1.5 border border-transparent cursor-pointer transition-all";
      chanBtn.className = !isBot
        ? "py-1.5 px-2.5 rounded-xl bg-tg-header text-white text-[11.5px] font-semibold flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer transition-all"
        : "py-1.5 px-2.5 rounded-xl bg-transparent text-white/60 hover:text-white text-[11.5px] font-semibold flex items-center justify-center gap-1.5 border border-transparent cursor-pointer transition-all";
    }
  }

  function scrollChatDown() {
    if (!chatScrollEl) return;
    requestAnimationFrame(() => {
      chatScrollEl.scrollTop = chatScrollEl.scrollHeight;
    });
  }

  function disableOldKeyboards() {
    chatScrollEl?.querySelectorAll(".tg-inline-kb").forEach((kb) => {
      if (!kb.dataset.keepActive) {
        kb.classList.add("opacity-45", "pointer-events-none");
      }
    });
  }

  function appendUserBubble(text) {
    if (!chatScrollEl) return;
    const wrap = document.createElement("div");
    wrap.className = "tg-msg-enter flex justify-end";
    wrap.innerHTML = `
      <div class="max-w-[82%] rounded-2xl rounded-br-sm px-3.5 py-2 text-[13px] leading-snug bg-tg-user text-white shadow-sm">
        <span>${escapeHtml(text)}</span>
        <span class="ml-2 text-[10px] font-mono text-white/60 align-bottom">${getNowTime()} ✓✓</span>
      </div>`;
    chatScrollEl.appendChild(wrap);
    scrollChatDown();
  }

  function appendDivider(text) {
    if (!chatScrollEl) return;
    const div = document.createElement("div");
    div.className = "tg-msg-enter flex justify-center my-1";
    div.innerHTML = `<span class="px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-[10.5px] font-mono text-white/85">${escapeHtml(text)}</span>`;
    chatScrollEl.appendChild(div);
    scrollChatDown();
  }

  function appendBotBubble({ html, buttons = [], keepActive = false }) {
    if (!chatScrollEl) return;
    const wrap = document.createElement("div");
    wrap.className = "tg-msg-enter flex flex-col items-start gap-1.5 max-w-[93%]";

    const bubble = document.createElement("div");
    bubble.className = "w-full rounded-2xl rounded-bl-sm bg-tg-bot text-white border border-white/[0.06] px-3.5 py-2.5 text-[12.5px] sm:text-[13px] leading-[1.45] shadow-sm";
    bubble.innerHTML = `
      <div>${html}</div>
      <div class="text-right text-[10px] font-mono text-white/45 mt-1">${getNowTime()}</div>
    `;
    wrap.appendChild(bubble);

    if (buttons.length) {
      const kb = document.createElement("div");
      kb.className = "tg-inline-kb w-full flex flex-col gap-1.5";
      if (keepActive) kb.dataset.keepActive = "true";

      buttons.forEach((row) => {
        const rowEl = document.createElement("div");
        rowEl.className = "grid gap-1.5";
        rowEl.style.gridTemplateColumns = `repeat(${row.length}, minmax(0, 1fr))`;

        row.forEach((def) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `px-2.5 py-2.5 rounded-xl text-[12px] font-medium text-center leading-tight transition-colors cursor-pointer ${
            def.primary
              ? "bg-emeraldcap hover:bg-[#0D7550] text-white font-semibold"
              : def.accent
                ? "bg-oxblood hover:bg-oxblood-hover text-white font-semibold"
                : "bg-tg-btn hover:bg-tg-btnHover text-white border border-white/[0.06]"
          }`;
          btn.textContent = def.label;
          btn.addEventListener("click", () => {
            if (state.isTyping) return;
            if (!def.keepKeyboard) disableOldKeyboards();
            if (def.echo) appendUserBubble(def.echo);
            handleBotAction(def.action, def.value);
          });
          rowEl.appendChild(btn);
        });
        kb.appendChild(rowEl);
      });
      wrap.appendChild(kb);
    }

    chatScrollEl.appendChild(wrap);
    scrollChatDown();
  }

  function botThink(delayMs, fn) {
    if (!chatScrollEl) return;
    state.isTyping = true;
    if (botStatusEl) botStatusEl.textContent = "печатает...";

    const typing = document.createElement("div");
    typing.className = "tg-msg-enter flex items-start";
    typing.innerHTML = `
      <div class="px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-tg-bot flex items-center gap-1.5">
        <span class="typing-dot w-1.5 h-1.5 rounded-full bg-tg-blue"></span>
        <span class="typing-dot w-1.5 h-1.5 rounded-full bg-tg-blue"></span>
        <span class="typing-dot w-1.5 h-1.5 rounded-full bg-tg-blue"></span>
      </div>`;
    chatScrollEl.appendChild(typing);
    scrollChatDown();

    setTimeout(() => {
      typing.remove();
      state.isTyping = false;
      if (botStatusEl) botStatusEl.textContent = "бот · онлайн";
      fn();
    }, delayMs);
  }

  function openPaySheet(tariffId) {
    const found = TARIFFS.find((t) => t.id === tariffId) || TARIFFS[0];
    state.selectedTariff = found;
    const titleEl = document.getElementById("pay-sheet-title");
    const priceEl = document.getElementById("pay-sheet-price");
    if (titleEl) titleEl.textContent = `РЕЗЕРВ · ${found.name} (${found.days} дн.)`;
    if (priceEl) priceEl.textContent = formatRub(found.price);
    if (payConfirmBtn) {
      payConfirmBtn.disabled = false;
      payConfirmBtn.textContent = `Оплатить ${formatRub(found.price)} (Тест) →`;
    }
    switchPhoneTab("bot");
    paySheetEl?.classList.add("is-open");
  }

  function closePaySheet() {
    paySheetEl?.classList.remove("is-open");
  }

  function startFreshSession() {
    state.status = "none";
    state.inviteUrl = null;
    state.inviteUses = 0;
    state.inviteRevoked = false;
    state.expiresDateText = "—";
    state.currentDay = 0;
    state.apiEventsLog = [];
    closePaySheet();
    switchPhoneTab("bot");

    if (chatScrollEl) chatScrollEl.innerHTML = "";
    appendDivider("Сегодня · @rezerv_club_bot");
    logBotApi(state, "command:/start", { user_id: 50481922, subscription_status: "none" });
    updateLifecycleUI(state, false);

    appendBotBubble({
      html:
        `<strong>Закрытый клуб «РЕЗЕРВ · Аналитика»</strong> ◆<br><br>` +
        `Здесь выходят макро-брифинги, разборы компаний, Excel-модели и сделки нашего портфеля.<br><br>` +
        `Доступ выдаётся <strong>автоматически за 5 секунд</strong> по одноразовой ссылке сразу после оплаты:`,
      buttons: [
        [{ label: "💳 Выбрать тариф и оплатить", action: "show_tariffs", echo: "Выбрать тариф", primary: true }],
        [
          { label: "📊 Что внутри канала", action: "show_inside", echo: "Что внутри?" },
          { label: "🔑 Мой статус доступа", action: "show_status", echo: "Мой статус" }
        ]
      ]
    });
  }

  function showTariffsInBot() {
    logBotApi(state, "sendMessage", { step: "select_tariff", plans: TARIFFS.map((t) => t.id) });
    const rows = TARIFFS.map((t) => [
      {
        label: `${t.name} · ${formatRub(t.price)} (${t.perMonth})`,
        action: "open_pay_sheet",
        value: t.id,
        echo: `Тариф: ${t.name} (${formatRub(t.price)})`
      }
    ]);

    appendBotBubble({
      html:
        `<strong>Выберите период подписки:</strong><br>` +
        `После оплаты бот проверит транзакцию и сгенерирует персональную ссылку с лимитом <strong>1 активация</strong>:`,
      buttons: rows
    });
  }

  /**
   * Simulates YooKassa webhook confirmation and generates a single-use Telegram invite link.
   */
  function completeTestPayment() {
    if (!payConfirmBtn) return;
    payConfirmBtn.disabled = true;
    payConfirmBtn.textContent = "Проверка платежа в ЮKassa...";

    state.paymentSeq += 1;
    const paymentId = `yk_${state.paymentSeq}_${Date.now().toString(16).slice(-6)}`;

    setTimeout(() => {
      closePaySheet();
      const link = generateOneTimeLink();
      state.status = "invite_issued";
      state.inviteUrl = link;
      state.inviteUses = 0;
      state.inviteRevoked = false;
      state.currentDay = 1;
      state.expiresDateText = formatFutureDate(state.selectedTariff.days);

      logBotApi(state, "webhook:payment.succeeded → createChatInviteLink", {
        payment_id: paymentId,
        provider: state.inPhonePayMethod === "sbp" ? "YooKassa SBP" : "YooKassa Card *0042",
        amount_rub: state.selectedTariff.price,
        telegram_call: {
          method: "createChatInviteLink",
          chat_id: -1002184902311,
          member_limit: 1,
          expire_date: "+24h"
        },
        generated_link: link,
        subscription_valid_until: state.expiresDateText
      });

      updateLifecycleUI(state, true);
      showToast("Оплата проверена — выдана одноразовая ссылка 1/1");

      botThink(360, () => {
        appendBotBubble({
          keepActive: true,
          html:
            `✅ <strong>Оплата ${formatRub(state.selectedTariff.price)} подтверждена!</strong><br>` +
            `Тариф: <strong>${escapeHtml(state.selectedTariff.name)}</strong> (до ${escapeHtml(state.expiresDateText)})<br>` +
            `Чек 54-ФЗ №${state.paymentSeq} отправлен на почту.<br><br>` +
            `🔑 <strong>Ваша одноразовая ссылка-приглашение:</strong><br>` +
            `<code class="text-tg-blue text-[11px] break-all">${escapeHtml(link)}</code><br>` +
            `<span class="text-white/60 text-[11px]">Лимит: строго 1 вход · после активации ссылка сгорает.</span>`,
          buttons: [
            [{ label: "🔓 Войти в закрытый канал (1/1)", action: "activate_invite_link", primary: true, keepKeyboard: true }]
          ]
        });
      });
    }, 680);
  }

  /**
   * Activates the single-use invite link on first click and blocks any subsequent forwarding attempts.
   * @param {boolean} [isFriendLeakTest]
   */
  function activateInviteLink(isFriendLeakTest = false) {
    if (!state.inviteUrl) return;

    if (state.inviteUses >= 1 || state.inviteRevoked) {
      logBotApi(state, "invite_link.rejected", {
        invite_link: state.inviteUrl,
        reason: "INVITE_HASH_EXPIRED (member_limit 1/1 reached)",
        attempt_type: isFriendLeakTest ? "forwarded_to_third_party" : "second_click"
      });
      showToast("⛔ Ссылка недействительна: лимит 1/1 уже исчерпан!");
      appendBotBubble({
        html:
          `🛡️ <strong>Защита от пересылки сработала!</strong><br><br>` +
          `Ссылка <code class="text-[11px] text-rose-300">${escapeHtml(state.inviteUrl)}</code> уже была активирована (1/1) и аннулирована Telegram.<br>` +
          `Посторонний человек не сможет войти по ней в ваш закрытый канал.`
      });
      return;
    }

    state.inviteUses = 1;
    state.inviteRevoked = true;
    state.status = "active";

    logBotApi(state, "chat_member.joined → link_exhausted", {
      chat_id: -1002184902311,
      user_id: 50481922,
      invite_link: state.inviteUrl,
      link_uses: "1 / 1 (revoked)",
      scheduler_jobs: [
        `remind_3d_before: Day ${Math.max(1, state.selectedTariff.days - 3)}`,
        `auto_kick_on_expiry: Day ${state.selectedTariff.days}`
      ]
    });

    updateLifecycleUI(state, true);
    switchPhoneTab("channel");
    showToast("Вы вошли в закрытый канал · Одноразовая ссылка аннулирована (1/1)");
  }

  function simulateExpiryWarning() {
    if (state.status !== "active") return;
    state.status = "warned";
    state.currentDay = Math.max(1, state.selectedTariff.days - 3);
    switchPhoneTab("bot");

    logBotApi(state, "cron:subscription_reminder_3d", {
      user_id: 50481922,
      days_left: 3,
      action: "send_renewal_offer"
    });

    updateLifecycleUI(state, true);
    appendDivider(`⏩ День ${state.currentDay} · Осталось 3 дня до окончания подписки`);

    botThink(350, () => {
      appendBotBubble({
        html:
          `⏳ <strong>Напоминание о подписке</strong><br><br>` +
          `Доступ в закрытый канал «РЕЗЕРВ · Аналитика» заканчивается через <strong>3 дня</strong> (${escapeHtml(state.expiresDateText)}).<br><br>` +
          `Продлите сейчас, чтобы не потерять доступ к разборам и чату:`,
        buttons: [
          [{ label: `🔄 Продлить (${state.selectedTariff.name} · ${formatRub(state.selectedTariff.price)})`, action: "open_pay_sheet", value: state.selectedTariff.id, primary: true }],
          [{ label: "Подождать окончания срока", action: "simulate_auto_kick", echo: "Проверить автоудаление по сроку" }]
        ]
      });
      showToast("Бот отправил предупреждение за 3 дня до конца срока");
    });
  }

  /**
   * Simulates soft removal (banChatMember + unbanChatMember) upon subscription expiration.
   */
  function simulateAutoRemoval() {
    if (state.status !== "active" && state.status !== "warned") return;
    state.status = "expired";
    state.currentDay = state.selectedTariff.days;

    logBotApi(state, "cron:subscription_expired → auto_kick", {
      user_id: 50481922,
      chat_id: -1002184902311,
      telegram_sequence: [
        "banChatMember(chat_id, user_id)",
        "unbanChatMember(chat_id, user_id, only_if_banned=True)"
      ],
      note: "Мягкое удаление: пользователь исключён из канала, но не заблокирован навсегда и сможет вернуться после продления."
    });

    updateLifecycleUI(state, true);
    showToast("Срок истёк: бот автоматически исключил участника из канала");

    appendDivider(`⏩ День ${state.currentDay} · Срок подписки истёк`);
    const postKickHtml = state.phoneTab === "bot"
      ? `🔒 <strong>Срок вашей подписки истёк</strong><br><br>` +
        `Доступ в закрытый канал «РЕЗЕРВ · Аналитика» автоматически приостановлен.<br><br>` +
        `Вы можете вернуться в любой момент — после оплаты бот мгновенно выдаст новую одноразовую ссылку:`
      : `🔒 <strong>Срок вашей подписки истёк</strong><br><br>` +
        `Бот автоматически исключил ваш аккаунт из закрытого канала (без вечного бана). Нажмите ниже, чтобы продлить и вернуться:`;

    const deliver = () => {
      appendBotBubble({
        html: postKickHtml,
        buttons: [
          [{ label: "🔄 Продлить подписку и вернуться", action: "show_tariffs", echo: "Продлить подписку", accent: true }]
        ]
      });
    };

    if (state.phoneTab === "bot") {
      botThink(360, deliver);
    } else {
      deliver();
    }
  }

  function handleBotAction(action, value) {
    if (action === "show_tariffs") {
      botThink(280, showTariffsInBot);
      return;
    }
    if (action === "open_pay_sheet") {
      openPaySheet(value || "m1");
      return;
    }
    if (action === "activate_invite_link") {
      activateInviteLink(false);
      return;
    }
    if (action === "simulate_auto_kick") {
      simulateAutoRemoval();
      return;
    }
    if (action === "show_inside") {
      botThink(280, () => {
        appendBotBubble({
          html:
            `<strong>Что выходит в закрытом канале каждую неделю:</strong><br><br>` +
            `• <strong>Пн:</strong> Макро-брифинг, ОФЗ и валютный рынок<br>` +
            `• <strong>Ср:</strong> Разбор 1–2 компаний с Excel-моделью<br>` +
            `• <strong>Пт:</strong> Голосовой эфир и ответы на вопросы<br><br>` +
            `Попробуйте заглянуть во вкладку <strong>«🔒 РЕЗЕРВ · Канал»</strong> сверху экрана — сейчас посты скрыты до оплаты.`,
          buttons: [[{ label: "💳 Оформить доступ", action: "show_tariffs", echo: "Выбрать тариф", primary: true }]]
        });
      });
      return;
    }
    if (action === "show_status") {
      botThink(260, () => {
        if (state.status === "active" || state.status === "warned") {
          appendBotBubble({
            html:
              `🟢 <strong>Подписка активна</strong><br>` +
              `Тариф: ${escapeHtml(state.selectedTariff.name)} · действует до ${escapeHtml(state.expiresDateText)}<br>` +
              `Статус в канале: Резидент ✓`,
            buttons: [[{ label: "🔓 Открыть закрытый канал", action: "go_channel" }]]
          });
        } else if (state.status === "invite_issued") {
          appendBotBubble({
            html: `🔑 Оплата подтверждена! Ваша одноразовая ссылка готова к входу:`,
            buttons: [[{ label: "🔓 Войти в закрытый канал (1/1)", action: "activate_invite_link", primary: true }]]
          });
        } else {
          appendBotBubble({
            html: `⚪ Активной подписки сейчас нет. Выберите тариф, чтобы получить доступ за 5 секунд:`,
            buttons: [[{ label: "💳 Выбрать тариф", action: "show_tariffs", echo: "Выбрать тариф", primary: true }]]
          });
        }
      });
      return;
    }
    if (action === "go_channel") {
      switchPhoneTab("channel");
    }
  }

  return {
    switchPhoneTab,
    openPaySheet,
    closePaySheet,
    startFreshSession,
    showTariffsInBot,
    completeTestPayment,
    activateInviteLink,
    simulateExpiryWarning,
    simulateAutoRemoval,
    handleBotAction,
    botThink
  };
}
