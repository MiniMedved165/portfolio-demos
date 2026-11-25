import { SERVICES, BARBERS, BOOKING_DATES } from "./salon-data.js";
import {
  escapeHtml,
  formatRub,
  subtractTwoHours,
  showToast
} from "./telegram-ui.js";

export function createBotEngine({ session, scheduleBookings, ui, panel }) {
  let bookingCounter = 4092;

  function startBotWelcome() {
    ui.clearChat();
    session.step = "welcome";
    panel.updateStepPills("service");

    ui.appendSystemDivider("Сегодня · @srez_barber_bot");
    panel.recordBotEvent("command", { command: "/start", user_id: 74920144, state: "FSM:idle" });

    ui.appendBotMessage({
      photoUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
      htmlText:
        `<strong>Добро пожаловать в SREZ!</strong> ✂️<br><br>` +
        `Запишу к барберу за 20 секунд без звонков и пришлю напоминание за 2 часа до визита.<br><br>` +
        `Выберите действие:`,
      buttons: [
        [{ label: "✂️ Записаться на стрижку", action: "choose_service", echoText: "Записаться на стрижку" }],
        [
          { label: "💈 Прайс-лист", action: "show_price", echoText: "Прайс-лист" },
          { label: "📍 Адрес и парковка", action: "show_address", echoText: "Адрес и парковка" }
        ],
        [{ label: "📅 Мои записи", action: "my_bookings", echoText: "Мои записи" }]
      ]
    });
  }

  function promptServiceStep() {
    session.step = "service";
    panel.updateStepPills("service");
    panel.recordBotEvent("sendMessage", { fsm_state: "BookingState:select_service", keyboard_items: SERVICES.length });

    const rows = SERVICES.map((s) => [
      {
        label: `${s.shortTitle} · ${formatRub(s.price)} (${s.duration})`,
        action: "pick_service",
        value: s.id,
        echoText: `${s.title} (${formatRub(s.price)})`
      }
    ]);

    ui.appendBotMessage({
      htmlText: `<strong>Шаг 1 из 4 · Выберите услугу</strong><br>Подберём слот точно под длительность работы:`,
      buttons: rows
    });
  }

  function promptBarberStep() {
    session.step = "barber";
    panel.updateStepPills("barber");
    const srv = SERVICES.find((s) => s.id === session.serviceId) || SERVICES[0];
    panel.recordBotEvent("callback_query", { callback_data: `srv:${srv.id}`, next_state: "BookingState:select_barber" });

    const rows = BARBERS.map((b) => [
      {
        label: `💈 ${b.shortName} · ★ ${b.rating} (${b.role.split("·")[0].trim()})`,
        action: "pick_barber",
        value: b.id,
        echoText: `Мастер: ${b.name}`
      }
    ]);
    rows.push([
      { label: "⚡ Любой свободный мастер", action: "pick_barber", value: "artem", echoText: "Любой свободный мастер" },
      { label: "← К услугам", action: "choose_service", echoText: "Назад к услугам" }
    ]);

    ui.appendBotMessage({
      htmlText:
        `Отлично: <strong>${escapeHtml(srv.title)}</strong> (${formatRub(srv.price)}, ${escapeHtml(srv.duration)}).<br><br>` +
        `<strong>Шаг 2 из 4 · К какому мастеру записать?</strong>`,
      buttons: rows
    });
  }

  function promptDateStep(isReschedule = false) {
    session.step = isReschedule ? "reschedule_date" : "date";
    panel.updateStepPills("slot");
    const barber = BARBERS.find((b) => b.id === session.barberId) || BARBERS[0];
    panel.recordBotEvent("callback_query", { callback_data: `barber:${barber.id}`, next_state: "BookingState:select_date" });

    const rows = [];
    for (let i = 0; i < BOOKING_DATES.length; i += 2) {
      const pair = BOOKING_DATES.slice(i, i + 2).map((d) => ({
        label: d.label,
        action: isReschedule ? "reschedule_pick_date" : "pick_date",
        value: d.id,
        echoText: d.label
      }));
      rows.push(pair);
    }
    if (!isReschedule) {
      rows.push([{ label: "← Сменить мастера", action: "back_to_barber", echoText: "Сменить мастера" }]);
    }

    ui.appendBotMessage({
      photoUrl: isReschedule ? null : barber.photo,
      htmlText: isReschedule
        ? `<strong>Выберите новую дату визита</strong> к мастеру ${escapeHtml(barber.shortName)}:`
        : `<strong>${escapeHtml(barber.name)}</strong> · ★ ${escapeHtml(barber.rating)}<br>` +
          `<span class="opacity-75">${escapeHtml(barber.specialty)}</span><br><br>` +
          `<strong>Шаг 3 из 4 · Выберите удобный день:</strong>`,
      buttons: rows
    });
  }

  function promptTimeStep(isReschedule = false) {
    session.step = isReschedule ? "reschedule_time" : "time";
    panel.updateStepPills("slot");
    const dateObj = BOOKING_DATES.find((d) => d.id === session.dateId) || BOOKING_DATES[0];
    const barber = BARBERS.find((b) => b.id === session.barberId) || BARBERS[0];

    const takenTimes = new Set(
      scheduleBookings
        .filter(
          (b) =>
            b.barberId === barber.id &&
            b.dateId === dateObj.id &&
            b.status !== "cancelled" &&
            b.id !== (isReschedule ? session.activeBookingId : "")
        )
        .map((b) => b.time)
    );

    const freeSlots = dateObj.slots.filter((t) => !takenTimes.has(t));
    const rows = [];
    for (let i = 0; i < freeSlots.length; i += 3) {
      rows.push(
        freeSlots.slice(i, i + 3).map((tm) => ({
          label: `🕒 ${tm}`,
          action: isReschedule ? "reschedule_pick_time" : "pick_time",
          value: tm,
          echoText: `Время: ${tm}`
        }))
      );
    }
    rows.push([{ label: "← Другой день", action: isReschedule ? "reschedule_start" : "back_to_date", echoText: "Выбрать другой день" }]);

    ui.appendBotMessage({
      htmlText:
        `Свободные окна у <strong>${escapeHtml(barber.shortName)}</strong> на <strong>${escapeHtml(dateObj.shortLabel)}</strong>:<br>` +
        `<span class="opacity-75">Все слоты синхронизированы с журналом салона</span>`,
      buttons: rows
    });
  }

  function promptContactStep() {
    session.step = "contact";
    const srv = SERVICES.find((s) => s.id === session.serviceId) || SERVICES[0];
    const barber = BARBERS.find((b) => b.id === session.barberId) || BARBERS[0];
    const dateObj = BOOKING_DATES.find((d) => d.id === session.dateId) || BOOKING_DATES[0];

    panel.recordBotEvent("callback_query", {
      callback_data: `slot:${dateObj.id}:${session.time}`,
      next_state: "BookingState:await_contact"
    });

    ui.appendBotMessage({
      htmlText:
        `<strong>Шаг 4 из 4 · Подтверждение записи</strong><br><br>` +
        `• Услуга: <strong>${escapeHtml(srv.title)}</strong> (${formatRub(srv.price)})<br>` +
        `• Мастер: <strong>${escapeHtml(barber.name)}</strong><br>` +
        `• Время: <strong>${escapeHtml(dateObj.shortLabel)}, ${escapeHtml(session.time)}</strong><br><br>` +
        `Нажмите кнопку <strong>«Поделиться контактом»</strong> ниже или напишите ваше имя в поле чата:`,
      buttons: [
        [{ label: "✅ Подтвердить запись (Алексей)", action: "confirm_contact_quick", echoText: "📱 Поделиться контактом: Алексей (+7 999 000-00-00)" }],
        [{ label: "← Изменить время", action: "back_to_time", echoText: "Изменить время" }]
      ]
    });

    ui.setReplyKeyboard([
      {
        label: "📱 Поделиться номером Telegram",
        accent: true,
        onClick: () => {
          ui.removeOldInlineKeyboards();
          ui.setReplyKeyboard([]);
          ui.appendUserMessage("📱 Контакт отправлен: Алексей, +7 (999) 000-00-00");
          finalizeBooking("Алексей", "+7 (999) 000-00-00");
        }
      }
    ]);
  }

  /**
   * Saves the booking into the live schedule, schedules the 2-hour reminder job,
   * notifies the admin panel, and replies with confirmation in Telegram.
   * @param {string} clientName
   * @param {string} clientPhone
   */
  function finalizeBooking(clientName, clientPhone) {
    const srv = SERVICES.find((s) => s.id === session.serviceId) || SERVICES[0];
    const barber = BARBERS.find((b) => b.id === session.barberId) || BARBERS[0];
    const dateObj = BOOKING_DATES.find((d) => d.id === session.dateId) || BOOKING_DATES[0];

    bookingCounter += 1;
    const bookingId = `SRZ-${bookingCounter}`;
    const remindAt = subtractTwoHours(session.time);

    scheduleBookings.unshift({
      id: bookingId,
      clientName,
      clientPhone,
      serviceId: srv.id,
      serviceTitle: srv.title,
      price: srv.price,
      barberId: barber.id,
      barberName: barber.shortName,
      dateId: dateObj.id,
      dateLabel: dateObj.shortLabel,
      time: session.time,
      status: "scheduled",
      isUserDemo: true
    });

    session.activeBookingId = bookingId;
    session.step = "booked";
    panel.updateStepPills("reminder");

    panel.recordBotEvent("booking.created", {
      booking_id: bookingId,
      db_status: "saved_to_postgres",
      calendar_sync: "slot_locked",
      scheduled_reminder_job: {
        engine: "APScheduler",
        trigger_at: `${dateObj.shortLabel} ${remindAt} (-2h before visit)`
      },
      booking: {
        client: clientName,
        service: srv.title,
        barber: barber.name,
        slot: `${dateObj.shortLabel} ${session.time}`,
        price_rub: srv.price
      }
    });

    panel.renderLiveSchedule(bookingId);
    panel.pushAdminNotification(
      `Новая запись #${bookingId}: ${clientName} → ${srv.title} к мастеру ${barber.shortName} (${dateObj.shortLabel}, ${session.time}). Слот закрыт в расписании.`
    );

    ui.botReplyWithTyping(420, () => {
      ui.appendBotMessage({
        htmlText:
          `<strong>Готово! Вы записаны в SREZ</strong> ✓<br><br>` +
          `Номер записи: <strong>#${bookingId}</strong><br>` +
          `✂️ ${escapeHtml(srv.title)} · ${formatRub(srv.price)}<br>` +
          `💈 Мастер: ${escapeHtml(barber.name)}<br>` +
          `📅 ${escapeHtml(dateObj.shortLabel)} в <strong>${escapeHtml(session.time)}</strong><br>` +
          `📍 ул. Большая Никитская, 24<br><br>` +
          `🔔 Я автоматически пришлю напоминание в <strong>${remindAt}</strong> (за 2 часа до визита).<br>` +
          `<span class="opacity-65 text-[11px]">(Демо-режим портфолио Данила Буторова — протестируйте 2-часовое напоминание кнопкой ниже)</span>`,
        buttons: [
          [{ label: `⏩ Проверить напоминание за 2 часа (${remindAt})`, action: "simulate_2h_reminder" }],
          [
            { label: "🔄 Перенести", action: "reschedule_start", echoText: "Перенести запись" },
            { label: "❌ Отменить", action: "cancel_booking", echoText: "Отменить запись" }
          ]
        ]
      });
    });
  }

  /**
   * Simulates the automated 2-hour pre-visit APScheduler reminder message in Telegram.
   */
  function triggerTwoHourReminder() {
    const booking = scheduleBookings.find((b) => b.id === session.activeBookingId && b.status !== "cancelled");
    if (!booking || session.isBotTyping) return;

    const remindTime = subtractTwoHours(booking.time);
    booking.status = "reminded";
    panel.renderLiveSchedule(booking.id);

    panel.recordBotEvent("scheduler.reminder_2h_sent", {
      booking_id: booking.id,
      scheduled_time: remindTime,
      visit_time: booking.time,
      action_buttons: ["confirm_visit", "reschedule", "cancel_visit"]
    });

    ui.removeOldInlineKeyboards();
    ui.appendSystemDivider(`⏩ Прошло время · ${booking.dateLabel}, ${remindTime} (за 2 часа до визита)`);

    ui.botReplyWithTyping(450, () => {
      ui.appendBotMessage({
        timeOverride: remindTime,
        htmlText:
          `🔔 <strong>Напоминание о визите через 2 часа!</strong><br><br>` +
          `Ждём вас сегодня в <strong>${escapeHtml(booking.time)}</strong> в SREZ (Б. Никитская, 24).<br>` +
          `✂️ ${escapeHtml(booking.serviceTitle)} · мастер ${escapeHtml(booking.barberName)}<br><br>` +
          `Подтвердите, пожалуйста, визит — к вашему приходу сварим свежий кофе ☕️`,
        buttons: [
          [{ label: "✅ Да, буду вовремя", action: "confirm_visit_2h", echoText: "Да, буду вовремя!" }],
          [
            { label: "🕒 Перенести время", action: "reschedule_start", echoText: "Нужно перенести время" },
            { label: "❌ Отменить визит", action: "cancel_booking", echoText: "Отменить визит" }
          ]
        ]
      });
      showToast("Отправлено авто-напоминание за 2 часа до визита");
    });
  }

  function handleBotCallback(action, value) {
    if (action === "choose_service") {
      ui.botReplyWithTyping(320, promptServiceStep);
      return;
    }
    if (action === "pick_service") {
      session.serviceId = value;
      ui.botReplyWithTyping(340, promptBarberStep);
      return;
    }
    if (action === "pick_barber") {
      session.barberId = value;
      ui.botReplyWithTyping(360, () => promptDateStep(false));
      return;
    }
    if (action === "back_to_barber") {
      ui.botReplyWithTyping(260, promptBarberStep);
      return;
    }
    if (action === "pick_date") {
      session.dateId = value;
      ui.botReplyWithTyping(320, () => promptTimeStep(false));
      return;
    }
    if (action === "back_to_date") {
      ui.botReplyWithTyping(260, () => promptDateStep(false));
      return;
    }
    if (action === "pick_time") {
      session.time = value;
      ui.botReplyWithTyping(340, promptContactStep);
      return;
    }
    if (action === "back_to_time") {
      ui.botReplyWithTyping(260, () => promptTimeStep(false));
      return;
    }
    if (action === "confirm_contact_quick") {
      finalizeBooking("Алексей", "+7 (999) 000-00-00");
      return;
    }
    if (action === "simulate_2h_reminder") {
      triggerTwoHourReminder();
      return;
    }
    if (action === "confirm_visit_2h") {
      const b = scheduleBookings.find((item) => item.id === session.activeBookingId);
      if (b) {
        b.status = "confirmed";
        panel.renderLiveSchedule(b.id);
        panel.pushAdminNotification(`Клиент ${b.clientName} подтвердил визит #${b.id} (${b.time}) после 2-часового напоминания ✓`);
        panel.recordBotEvent("booking.confirmed_by_client", { booking_id: b.id, status: "confirmed", no_show_risk: "low" });
      }
      ui.botReplyWithTyping(340, () => {
        ui.appendBotMessage({
          htmlText:
            `<strong>Отлично, ждём вас!</strong> ☕️<br><br>` +
            `Мастер ${escapeHtml(b?.barberName || "Артём К.")} уже видит ваше подтверждение в расписании.<br>` +
            `Если задержитесь на 5–10 минут — просто напишите сюда.`,
          buttons: [[{ label: "✂️ Записаться ещё раз", action: "choose_service", echoText: "Новая запись" }]]
        });
      });
      return;
    }
    if (action === "reschedule_start") {
      panel.recordBotEvent("booking.reschedule_started", { booking_id: session.activeBookingId });
      ui.botReplyWithTyping(320, () => promptDateStep(true));
      return;
    }
    if (action === "reschedule_pick_date") {
      session.dateId = value;
      ui.botReplyWithTyping(300, () => promptTimeStep(true));
      return;
    }
    if (action === "reschedule_pick_time") {
      const b = scheduleBookings.find((item) => item.id === session.activeBookingId);
      const dateObj = BOOKING_DATES.find((d) => d.id === session.dateId) || BOOKING_DATES[0];
      if (b) {
        const oldSlot = `${b.dateLabel}, ${b.time}`;
        b.dateId = dateObj.id;
        b.dateLabel = dateObj.shortLabel;
        b.time = value;
        b.status = "scheduled";
        panel.renderLiveSchedule(b.id);
        panel.pushAdminNotification(`Перенос #${b.id}: ${b.clientName} перенёс визит с «${oldSlot}» на «${b.dateLabel}, ${b.time}». Старый слот открыт.`);
        panel.recordBotEvent("booking.rescheduled", {
          booking_id: b.id,
          new_slot: `${b.dateLabel} ${b.time}`,
          reminder_rescheduled_to: subtractTwoHours(b.time)
        });
      }
      const newRemind = subtractTwoHours(value);
      ui.botReplyWithTyping(360, () => {
        ui.appendBotMessage({
          htmlText:
            `<strong>Визит перенесён!</strong> 🔄<br><br>` +
            `Новое время: <strong>${escapeHtml(dateObj.shortLabel)} в ${escapeHtml(value)}</strong><br>` +
            `Прежний слот автоматически освобождён, а напоминание перенесено на <strong>${newRemind}</strong>.`,
          buttons: [[{ label: `⏩ Проверить новое напоминание (${newRemind})`, action: "simulate_2h_reminder" }]]
        });
      });
      return;
    }
    if (action === "cancel_booking") {
      const b = scheduleBookings.find((item) => item.id === session.activeBookingId);
      if (b) {
        b.status = "cancelled";
        panel.renderLiveSchedule(b.id);
        panel.pushAdminNotification(`Отмена #${b.id}: ${b.clientName} отменил запись на ${b.time}. Слот автоматически возвращён в продажу.`);
        panel.recordBotEvent("booking.cancelled", { booking_id: b.id, slot_released: true });
      }
      ui.botReplyWithTyping(340, () => {
        ui.appendBotMessage({
          htmlText:
            `Запись <strong>#${escapeHtml(b?.id || "")}</strong> отменена, время освобождено для других гостей.<br><br>` +
            `Будем рады видеть вас в другой день!`,
          buttons: [[{ label: "✂️ Выбрать другое время", action: "choose_service", echoText: "Выбрать другое время" }]]
        });
      });
      return;
    }
    if (action === "show_price") {
      const list = SERVICES.map((s) => `• ${escapeHtml(s.title)} — <strong>${formatRub(s.price)}</strong> (${escapeHtml(s.duration)})`).join("<br>");
      ui.botReplyWithTyping(300, () => {
        ui.appendBotMessage({
          htmlText: `<strong>Актуальный прайс SREZ:</strong><br><br>${list}`,
          buttons: [[{ label: "✂️ Перейти к записи", action: "choose_service", echoText: "Перейти к записи" }]]
        });
      });
      return;
    }
    if (action === "show_address") {
      ui.botReplyWithTyping(280, () => {
        ui.appendBotMessage({
          htmlText:
            `📍 <strong>г. Москва, ул. Большая Никитская, д. 24</strong><br>` +
            `Ежедневно с 10:00 до 22:00<br><br>` +
            `Для гостей клуба открыт шлагбаум во внутренний двор — номер машины можно написать сюда за 10 минут до приезда.`,
          buttons: [[{ label: "✂️ Записаться на стрижку", action: "choose_service", echoText: "Записаться на стрижку" }]]
        });
      });
      return;
    }
    if (action === "my_bookings") {
      const active = scheduleBookings.find((item) => item.id === session.activeBookingId && item.status !== "cancelled");
      ui.botReplyWithTyping(300, () => {
        if (active) {
          ui.appendBotMessage({
            htmlText:
              `<strong>Ваша активная запись #${escapeHtml(active.id)}:</strong><br>` +
              `${escapeHtml(active.serviceTitle)} · ${escapeHtml(active.barberName)}<br>` +
              `📅 ${escapeHtml(active.dateLabel)} в ${escapeHtml(active.time)}`,
            buttons: [
              [{ label: "⏩ Тест напоминания за 2 часа", action: "simulate_2h_reminder" }],
              [
                { label: "🔄 Перенести", action: "reschedule_start", echoText: "Перенести" },
                { label: "❌ Отменить", action: "cancel_booking", echoText: "Отменить" }
              ]
            ]
          });
        } else {
          ui.appendBotMessage({
            htmlText: `У вас пока нет активных записей. Давайте подберём удобное время!`,
            buttons: [[{ label: "✂️ Записаться сейчас", action: "choose_service", echoText: "Записаться сейчас" }]]
          });
        }
      });
    }
  }

  return {
    startBotWelcome,
    promptBarberStep,
    promptDateStep,
    finalizeBooking,
    triggerTwoHourReminder,
    handleBotCallback
  };
}
