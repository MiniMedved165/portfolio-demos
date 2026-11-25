import React from "react";
import { Search, X } from "lucide-react";

export default function CommandSearchModal({
  open,
  onClose,
  searchQuery,
  setSearchQuery,
  searchResults
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Поиск по решениям KORS"
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[#EAEAE7] border border-[#111111]/15 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#111111]/12 bg-white">
          <Search className="w-4 h-4 text-[#666662] shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Найти решение, проект или технологию (например: 3D, IoT)..."
            className="w-full bg-transparent text-base sm:text-sm text-[#111111] placeholder-[#8A8A85] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть поиск"
            className="p-1 text-[#666662] hover:text-[#111111] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
          {searchResults.length ? (
            searchResults.map((res, idx) => (
              <button
                key={idx}
                type="button"
                onClick={res.action}
                className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-white flex items-center justify-between gap-3 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#111111] truncate">{res.title}</div>
                  <div className="text-xs text-[#666662] truncate mt-0.5">{res.subtitle}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#111111]/8 font-mono text-[10px] uppercase text-[#555550] shrink-0">
                  {res.type}
                </span>
              </button>
            ))
          ) : (
            <div className="py-10 text-center text-xs text-[#666662]">Ничего не найдено</div>
          )}
        </div>
      </div>
    </div>
  );
}
