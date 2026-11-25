import React from "react";
import { Check, X } from "lucide-react";

export default function SolutionInspectorModal({ solution, onClose, onRequestTopic }) {
  if (!solution) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sol-modal-title"
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#EAEAE7] border border-[#111111]/15 p-6 sm:p-8 shadow-2xl max-h-[90svh] overflow-y-auto"
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

        <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-wider text-[#E04416] font-semibold mb-2">
          <span>/ {solution.num}</span>
          <span>·</span>
          <span>{solution.category}</span>
        </div>

        <h3 id="sol-modal-title" className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight mb-2 pr-8">
          {solution.title}
        </h3>
        <p className="text-sm text-[#555550] leading-relaxed mb-6">{solution.shortDesc}</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {solution.metrics.map((m) => (
            <div key={m.label} className="p-3.5 rounded-xl bg-white border border-[#111111]/10">
              <div className="font-mono text-xl sm:text-2xl font-bold text-[#111111]">{m.value}</div>
              <div className="text-[11px] text-[#666662] mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-xl bg-[#111111] text-white mb-6">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#E04416] mb-3">
            Архитектура внедрения
          </div>
          <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-white/85">
            {solution.architecture.map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#E04416] shrink-0 mt-0.5" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {solution.stack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 rounded-full bg-white border border-[#111111]/12 font-mono text-[11px] text-[#333330]"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#111111]/12">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-[4px] border border-[#111111]/20 text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
          >
            Закрыть
          </button>
          <button
            type="button"
            onClick={() => onRequestTopic(solution.title)}
            className="px-6 py-3 rounded-[4px] bg-[#111111] hover:bg-[#E04416] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Запросить техпредложение →
          </button>
        </div>
      </div>
    </div>
  );
}
