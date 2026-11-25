/**
 * Escapes HTML special characters to prevent XSS in dynamic markup.
 * @param {unknown} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatRub(val) {
  return `${Math.round(val).toLocaleString("ru-RU")} ₽`;
}

export function getNowTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function subtractTwoHours(timeStr) {
  const [hh, mm] = String(timeStr || "16:00").split(":").map(Number);
  const h2 = (hh - 2 + 24) % 24;
  return `${String(h2).padStart(2, "0")}:${String(mm || 0).padStart(2, "0")}`;
}

let toastTimer = null;

export function showToast(msg) {
  const toastEl = document.getElementById("club-toast");
  const toastText = document.getElementById("club-toast-text");
  if (!toastEl || !toastText) return;
  toastText.textContent = msg;
  toastEl.classList.remove("opacity-0", "translate-y-2", "pointer-events-none");
  toastEl.classList.add("opacity-100", "translate-y-0");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.add("opacity-0", "translate-y-2", "pointer-events-none");
    toastEl.classList.remove("opacity-100", "translate-y-0");
  }, 2300);
}

export function copyToClipboard(text, message) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(
      () => showToast(message),
      () => showToast("Скопируйте значение вручную")
    );
    return;
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast(message);
  } catch {
    showToast("Скопируйте значение вручную");
  }
}

export function createTelegramUI(session, onCallback) {
  const chatScrollEl = document.getElementById("tg-chat-scroll");
  const replyKbEl = document.getElementById("tg-reply-keyboard");
  const botStatusEl = document.getElementById("tg-bot-status");

  function scrollChatToBottom() {
    if (!chatScrollEl) return;
    requestAnimationFrame(() => {
      chatScrollEl.scrollTop = chatScrollEl.scrollHeight;
    });
  }

  function removeOldInlineKeyboards() {
    chatScrollEl?.querySelectorAll(".tg-inline-kb").forEach((kb) => {
      kb.classList.add("opacity-45", "pointer-events-none");
    });
  }

  function setReplyKeyboard(buttons = []) {
    if (!replyKbEl) return;
    if (!buttons.length) {
      replyKbEl.innerHTML = "";
      replyKbEl.classList.add("hidden");
      return;
    }
    replyKbEl.classList.remove("hidden");
    replyKbEl.innerHTML = buttons
      .map(
        (b, i) => `
        <button type="button" data-reply-idx="${i}" class="tg-reply-btn flex-1 min-w-[140px] py-2.5 px-3 rounded-xl ${
          b.accent
            ? "bg-cognac hover:bg-cognac-hover text-white font-semibold"
            : "bg-white/12 hover:bg-white/20 text-white font-medium"
        } text-xs transition-colors cursor-pointer">
          ${escapeHtml(b.label)}
        </button>`
      )
      .join("");

    replyKbEl.querySelectorAll(".tg-reply-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = buttons[Number(btn.dataset.replyIdx)];
        if (item && typeof item.onClick === "function") item.onClick();
      });
    });
  }

  function appendUserMessage(text) {
    if (!chatScrollEl) return;
    const isDark = session.tgDarkTheme;
    const wrap = document.createElement("div");
    wrap.className = "tg-msg-enter flex justify-end";
    wrap.innerHTML = `
      <div class="max-w-[82%] rounded-2xl rounded-br-sm px-3.5 py-2 text-[13px] leading-snug shadow-sm ${
        isDark ? "bg-tg-user text-white" : "bg-[#EFFDDE] text-[#141917]"
      }">
        <span>${escapeHtml(text)}</span>
        <span class="inline-flex items-center gap-1 ml-2 text-[10px] ${
          isDark ? "text-white/60" : "text-[#4FAE4E]"
        } font-mono align-bottom">${getNowTimeStr()} ✓✓</span>
      </div>`;
    chatScrollEl.appendChild(wrap);
    scrollChatToBottom();
  }

  function appendSystemDivider(label) {
    if (!chatScrollEl) return;
    const div = document.createElement("div");
    div.className = "tg-msg-enter flex justify-center my-1";
    div.innerHTML = `<span class="px-3 py-1 rounded-full bg-black/35 backdrop-blur-sm text-[10.5px] font-mono text-white/85">${escapeHtml(label)}</span>`;
    chatScrollEl.appendChild(div);
    scrollChatToBottom();
  }

  function appendBotMessage({ htmlText, photoUrl, buttons = [], timeOverride = null }) {
    if (!chatScrollEl) return;
    const isDark = session.tgDarkTheme;
    const wrap = document.createElement("div");
    wrap.className = "tg-msg-enter flex flex-col items-start gap-1.5 max-w-[92%]";

    const photoBlock = photoUrl
      ? `<div class="w-full h-32 rounded-t-2xl overflow-hidden bg-black/20">
           <img src="${escapeHtml(photoUrl)}" alt="" class="w-full h-full object-cover object-top" onerror="this.style.display='none'">
         </div>`
      : "";

    const bubble = document.createElement("div");
    bubble.className = `w-full rounded-2xl rounded-bl-sm overflow-hidden shadow-sm ${
      isDark ? "bg-tg-bot text-white border border-white/[0.05]" : "bg-white text-[#141917] border border-black/[0.06]"
    }`;

    bubble.innerHTML = `
      ${photoBlock}
      <div class="px-3.5 py-2.5 text-[12.5px] sm:text-[13px] leading-[1.45]">
        <div>${htmlText}</div>
        <div class="text-right text-[10px] font-mono mt-1 ${isDark ? "text-white/45" : "text-black/40"}">
          ${escapeHtml(timeOverride || getNowTimeStr())}
        </div>
      </div>`;

    wrap.appendChild(bubble);

    if (buttons.length) {
      const kb = document.createElement("div");
      kb.className = "tg-inline-kb w-full flex flex-col gap-1.5";
      buttons.forEach((row) => {
        const rowEl = document.createElement("div");
        rowEl.className = "grid gap-1.5";
        rowEl.style.gridTemplateColumns = `repeat(${row.length}, minmax(0, 1fr))`;

        row.forEach((btnDef) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `tg-inline-btn px-2.5 py-2.5 rounded-xl text-[12px] font-medium text-center leading-tight cursor-pointer ${
            isDark
              ? "bg-tg-btn/95 hover:bg-tg-btnHover text-white border border-white/[0.06]"
              : "bg-black/55 hover:bg-black/70 text-white backdrop-blur-sm"
          }`;
          btn.textContent = btnDef.label;
          btn.addEventListener("click", () => {
            if (session.isBotTyping) return;
            removeOldInlineKeyboards();
            setReplyKeyboard([]);
            if (btnDef.echoText) appendUserMessage(btnDef.echoText);
            onCallback(btnDef.action, btnDef.value);
          });
          rowEl.appendChild(btn);
        });
        kb.appendChild(rowEl);
      });
      wrap.appendChild(kb);
    }

    chatScrollEl.appendChild(wrap);
    scrollChatToBottom();
  }

  function botReplyWithTyping(delayMs, callback) {
    if (!chatScrollEl) return;
    session.isBotTyping = true;
    if (botStatusEl) botStatusEl.textContent = "печатает...";

    const typingEl = document.createElement("div");
    typingEl.id = "tg-typing-bubble";
    typingEl.className = "tg-msg-enter flex items-start";
    typingEl.innerHTML = `
      <div class="px-3.5 py-2.5 rounded-2xl rounded-bl-sm ${
        session.tgDarkTheme ? "bg-tg-bot" : "bg-white"
      } flex items-center gap-1.5">
        <span class="typing-dot w-1.5 h-1.5 rounded-full bg-tg-blue"></span>
        <span class="typing-dot w-1.5 h-1.5 rounded-full bg-tg-blue"></span>
        <span class="typing-dot w-1.5 h-1.5 rounded-full bg-tg-blue"></span>
      </div>`;
    chatScrollEl.appendChild(typingEl);
    scrollChatToBottom();

    setTimeout(() => {
      typingEl.remove();
      session.isBotTyping = false;
      if (botStatusEl) botStatusEl.textContent = "бот · онлайн";
      callback();
    }, delayMs);
  }

  function clearChat() {
    if (chatScrollEl) chatScrollEl.innerHTML = "";
    setReplyKeyboard([]);
  }

  return {
    appendUserMessage,
    appendSystemDivider,
    appendBotMessage,
    botReplyWithTyping,
    removeOldInlineKeyboards,
    setReplyKeyboard,
    clearChat,
    chatScrollEl
  };
}
