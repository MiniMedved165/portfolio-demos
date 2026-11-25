import React, { useState } from "react";
import { Check, Copy, X } from "lucide-react";

export default function ContactBriefModal({
  open,
  submitted,
  formState,
  setFormState,
  lastPayloadJson,
  feedbackUrl,
  onClose,
  onSubmit,
  onCopyJson,
  onValidationError
}) {
  const [validationError, setValidationError] = useState("");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = formState.name.trim();
    const contact = formState.contact.trim();
    const digits = contact.replace(/\D/g, "");
    const validContact = digits.length >= 10 || /^@[a-zA-Z0-9_]{4,32}$/.test(contact);

    if (name.length < 2) {
      const msg = "Укажите ваше имя (минимум 2 символа)";
      setValidationError(msg);
      onValidationError?.(msg);
      return;
    }
    if (!validContact) {
      const msg = "Укажите телефон (от 10 цифр) или @telegram";
      setValidationError(msg);
      onValidationError?.(msg);
      return;
    }
    setValidationError("");
    onSubmit(e);
  };

  return (
    <div
      className="fixed inset-0 z-[75] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-[#EAEAE7] text-[#111111] border border-[#111111]/15 p-6 sm:p-8 shadow-2xl max-h-[90svh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border border-[#111111]/12 hover:bg-[#111111] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#E04416] font-semibold mb-1">
                Инженерный брифинг
              </div>
              <h3 id="contact-modal-title" className="text-2xl font-extrabold tracking-tight">
                Обсудить проект с командой
              </h3>
              <p className="text-xs text-[#555550] mt-1">
                Оставьте контакты — подготовим предварительную архитектуру и расчёт сроков.
              </p>
            </div>

            {validationError && (
              <div className="px-3.5 py-2.5 rounded-lg bg-[#E04416]/12 border border-[#E04416]/40 text-xs font-medium text-[#9B2708]">
                {validationError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#555550] mb-1">Имя</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="Александр"
                  className="w-full px-3.5 py-3 rounded-lg bg-white border border-[#111111]/15 text-base sm:text-sm focus:border-[#E04416] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#555550] mb-1">Компания</label>
                <input
                  type="text"
                  value={formState.company}
                  onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                  placeholder="ООО «ПромТех»"
                  className="w-full px-3.5 py-3 rounded-lg bg-white border border-[#111111]/15 text-base sm:text-sm focus:border-[#E04416] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#555550] mb-1">Телефон / Telegram</label>
                <input
                  type="text"
                  required
                  value={formState.contact}
                  onChange={(e) => setFormState({ ...formState, contact: e.target.value })}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full px-3.5 py-3 rounded-lg bg-white border border-[#111111]/15 font-mono text-base sm:text-sm focus:border-[#E04416] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#555550] mb-1">Направление</label>
                <select
                  value={formState.topic}
                  onChange={(e) => setFormState({ ...formState, topic: e.target.value })}
                  className="w-full px-3.5 py-3 rounded-lg bg-white border border-[#111111]/15 text-base sm:text-sm focus:border-[#E04416] focus:outline-none"
                >
                  <option value="Промышленная автоматизация">Промышленная автоматизация</option>
                  <option value="Умная инфраструктура">Умная инфраструктура</option>
                  <option value="Передовое производство">Передовое производство</option>
                  <option value="Индивидуальный проект">Индивидуальный проект</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#555550] mb-1">Задача</label>
              <textarea
                rows={3}
                value={formState.comment}
                onChange={(e) => setFormState({ ...formState, comment: e.target.value })}
                placeholder="Кратко опишите объект, процессы или желаемый результат..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#111111]/15 text-base sm:text-sm focus:border-[#E04416] focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-[4px] bg-[#111111] hover:bg-[#E04416] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer mt-1"
            >
              Отправить запрос →
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] text-white font-mono text-[10.5px] uppercase tracking-wider w-max">
              <Check className="w-3.5 h-3.5 text-[#E04416]" />
              <span>Интерактивная демонстрация</span>
            </div>

            <h3 className="text-2xl font-extrabold tracking-tight">Запрос сформирован в React</h3>
            <p className="text-xs sm:text-sm text-[#555550] leading-relaxed">
              Это демонстрационный сайт из портфолио Данила Буторова — данные никуда не отправляются. В реальном проекте заявка с параметрами сессии сразу улетает в <strong className="text-[#111111]">CRM / Telegram</strong>:
            </p>

            <div className="rounded-xl bg-[#111111] text-white p-4">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10 font-mono text-[10.5px]">
                <span className="text-[#E04416]">POST /api/leads · JSON Payload</span>
                <button
                  type="button"
                  onClick={() => onCopyJson(lastPayloadJson)}
                  className="inline-flex items-center gap-1 text-white/75 hover:text-white cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Копия</span>
                </button>
              </div>
              <pre className="font-mono text-[11px] text-white/85 whitespace-pre-wrap break-words max-h-48 overflow-y-auto leading-relaxed">
                {lastPayloadJson}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-[4px] border border-[#111111]/20 text-xs font-semibold hover:bg-white cursor-pointer"
              >
                Вернуться на сайт
              </button>
              <a
                href={feedbackUrl}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-[4px] bg-[#E04416] hover:bg-[#CC3A10] text-white text-xs font-bold"
              >
                Заказать такой проект на React →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
