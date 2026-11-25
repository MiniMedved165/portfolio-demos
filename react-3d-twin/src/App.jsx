import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Box,
  Cpu,
  Layers,
  Menu,
  Play,
  Plus,
  Search,
  X
} from "lucide-react";
import {
  KEY_METRICS,
  PARTNER_AVATARS,
  PROJECTS_ARCHIVE,
  SOLUTIONS_DATA
} from "./data/catalog.js";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Monolith3DCanvas from "./components/Monolith3DCanvas.jsx";
import PrecisionGearCanvas from "./components/PrecisionGearCanvas.jsx";
import CommandSearchModal from "./components/CommandSearchModal.jsx";
import SolutionInspectorModal from "./components/SolutionInspectorModal.jsx";
import ContactBriefModal from "./components/ContactBriefModal.jsx";

export default function App() {
  const [monolithMode, setMonolithMode] = useState("solid");
  const [gearMode, setGearMode] = useState("optical");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSolution, setActiveSolution] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [showreelOpen, setShowreelOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [formState, setFormState] = useState({
    name: "",
    company: "",
    contact: "",
    topic: "Промышленная автоматизация",
    comment: ""
  });
  const [lastPayloadJson, setLastPayloadJson] = useState("");

  const portfolioUrls = (typeof window !== "undefined" && window.__PORTFOLIO_URLS__) || {};
  const portfolioListUrl = portfolioUrls.list || "../portfolio.html";
  const feedbackUrl = portfolioUrls.feedback || "../index.html#feedback";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setActiveSolution(null);
        setContactOpen(false);
        setShowreelOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2400);
  };

  const cycleMonolithMode = () => {
    const order = ["solid", "exploded", "wireframe"];
    const next = order[(order.indexOf(monolithMode) + 1) % order.length];
    setMonolithMode(next);
  };

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const items = [
      ...SOLUTIONS_DATA.map((s) => ({
        type: "Решение",
        title: s.title,
        subtitle: s.category,
        action: () => {
          setSearchOpen(false);
          setActiveSolution(s);
        }
      })),
      ...PROJECTS_ARCHIVE.map((p) => ({
        type: p.code,
        title: p.title,
        subtitle: `${p.location} · ${p.impact}`,
        action: () => {
          setSearchOpen(false);
          const matched = SOLUTIONS_DATA.find((s) => s.id === p.solutionId);
          if (matched) setActiveSolution(matched);
        }
      }))
    ];
    if (!q) return items;
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.subtitle.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const openContactWithTopic = (topic) => {
    if (topic) setFormState((prev) => ({ ...prev, topic }));
    setContactSubmitted(false);
    setActiveSolution(null);
    setContactOpen(true);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const payload = {
      source: "KORS Engineering Systems (React 3D SPA)",
      client: {
        name: formState.name.trim(),
        company: formState.company.trim() || "Не указана",
        contact: formState.contact.trim()
      },
      inquiry: {
        direction: formState.topic,
        comment: formState.comment.trim() || "—",
        active_3d_mode: monolithMode,
        telemetry_mode: gearMode
      },
      timestamp: new Date().toISOString()
    };
    setLastPayloadJson(JSON.stringify(payload, null, 2));
    setContactSubmitted(true);
  };

  const copyText = (text, label) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        triggerToast(label);
      }).catch(() => {
        triggerToast("Скопируйте значение вручную");
      });
      return;
    }
    triggerToast("Скопируйте значение вручную");
  };

  return (
    <div className="min-h-screen bg-[#EAEAE7] text-[#111111] font-sans antialiased selection:bg-[#E04416] selection:text-white overflow-x-clip">
      <div className="brutalist-grain fixed inset-0 z-50 pointer-events-none opacity-[0.028]" aria-hidden="true" />

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#EAEAE7]/92 backdrop-blur-md border-b border-[#111111]/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3 group shrink-0">
            <svg className="w-11 h-5 text-[#111111]" viewBox="0 0 68 24" fill="none" aria-hidden="true">
              <path d="M2 22V2H7V10.5L15.5 2H22L12.5 11.5L22.5 22H16L7 12.8V22H2Z" fill="currentColor" />
              <path d="M25 12C25 6.4 29.3 2 35 2H42V7H35.2C32.2 7 30 9.1 30 12C30 14.9 32.2 17 35.2 17H42V22H35C29.3 22 25 17.6 25 12Z" fill="currentColor" />
              <path d="M46 22V2H60.5C64.4 2 67 4.4 67 8C67 11.2 64.9 13.4 61.5 13.9L67.5 22H61.5L56.1 14.4H51V22H46ZM51 10H59.5C61.1 10 62 9.2 62 8C62 6.8 61.1 6 59.5 6H51V10Z" fill="#E04416" />
            </svg>
            <div className="hidden sm:flex flex-col leading-[1.1] font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#666662]">
              <span>Инженерные</span>
              <span>решения</span>
            </div>
          </a>

          <nav aria-label="Основная навигация" className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#52524E]">
            <a href="#solutions" className="hover:text-[#111111] transition-colors">Решения</a>
            <a href="#precision" className="hover:text-[#111111] transition-colors">Технологии</a>
            <a href="#impact" className="hover:text-[#111111] transition-colors">Проекты</a>
            <a href="#footer" className="hover:text-[#111111] transition-colors">Контакты</a>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Поиск по решениям (Ctrl+K)"
              className="w-9 h-9 rounded-full border border-[#111111]/15 hover:border-[#111111] bg-[#EAEAE7]/70 flex items-center justify-center text-[#111111] transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => openContactWithTopic("Промышленная автоматизация")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] hover:bg-[#E04416] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              <span>Связаться</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Меню"
              className="md:hidden w-9 h-9 rounded-full border border-[#111111]/18 flex items-center justify-center text-[#111111] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#EAEAE7] border-b border-[#111111]/15 px-5 py-5 shadow-xl flex flex-col gap-3 text-sm font-medium">
            <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="py-1.5 border-b border-[#111111]/10">Решения</a>
            <a href="#precision" onClick={() => setMobileMenuOpen(false)} className="py-1.5 border-b border-[#111111]/10">Технологии и точность</a>
            <a href="#impact" onClick={() => setMobileMenuOpen(false)} className="py-1.5 border-b border-[#111111]/10">Проекты и вклад</a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openContactWithTopic("Промышленная автоматизация");
              }}
              className="mt-1 py-3 rounded-full bg-[#111111] text-white text-xs font-semibold"
            >
              Обсудить проект →
            </button>
          </div>
        )}
      </header>

      <section id="top" className="relative pt-24 sm:pt-28 lg:pt-20 pb-8 lg:pb-0 overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center lg:min-h-[660px]">
            <div className="lg:col-span-5 relative z-20 flex flex-col items-start py-4 lg:py-12">
              <div className="w-full max-w-[300px] flex items-center gap-3 mb-7 sm:mb-9">
                <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#555550] leading-[1.35]">
                  <div>Инженерия</div>
                  <div>нового</div>
                  <div>поколения</div>
                </div>
                <span className="flex-1 h-px bg-[#111111]/25" />
                <span className="font-mono text-[10.5px] font-semibold text-[#111111]">/ 01</span>
              </div>

              <h1 className="font-extrabold uppercase tracking-[-0.04em] leading-[0.94] text-[38px] sm:text-[52px] xl:text-[62px] text-[#111111] mb-5 select-none">
                <span className="block">СТРУКТУРЫ,</span>
                <span className="block">ДВИГАЮЩИЕ</span>
                <span className="block text-[#94948F]">МИР ВПЕРЁД</span>
              </h1>

              <p className="text-sm sm:text-[15px] text-[#4E4E4A] leading-[1.58] max-w-[360px] mb-7">
                Проектируем и внедряем интеллектуальные промышленные системы, 3D-двойники и автоматизацию для устойчивого будущего.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-9 sm:mb-12">
                <a
                  href="#solutions"
                  className="inline-flex items-center gap-3 px-6 py-3.5 rounded-[4px] bg-[#111111] hover:bg-[#E04416] text-white text-xs font-semibold tracking-wide transition-colors"
                >
                  <span>Изучить решения</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setShowreelOpen(true)}
                  className="group inline-flex items-center gap-3 text-xs font-semibold text-[#111111] hover:text-[#E04416] transition-colors cursor-pointer"
                >
                  <span className="w-10 h-10 rounded-full border border-[#111111]/28 group-hover:border-[#E04416] group-hover:bg-[#E04416] group-hover:text-white flex items-center justify-center transition-all">
                    <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                  </span>
                  <span className="text-left leading-tight">
                    Смотреть<br />шоурил
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3.5 pt-2">
                <div className="flex -space-x-2">
                  {PARTNER_AVATARS.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover grayscale contrast-125 border-2 border-[#EAEAE7]"
                    />
                  ))}
                </div>
                <div className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#585854] leading-snug">
                  <div>Нам доверяют 250+</div>
                  <div>глобальных партнёров</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 relative z-10 flex flex-col items-center">
              <ErrorBoundary fallbackText="3D-монолит временно недоступен">
                <Monolith3DCanvas viewMode={monolithMode} onToggleMode={cycleMonolithMode} />
              </ErrorBoundary>

              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#111111]/8 backdrop-blur-md border border-[#111111]/12 -mt-6 mb-4 lg:mb-6 relative z-20">
                {[
                  { id: "solid", label: "Монолит", icon: Box },
                  { id: "exploded", label: "Взрыв-схема", icon: Layers },
                  { id: "wireframe", label: "CAD-сетка", icon: Cpu }
                ].map((m) => {
                  const Icon = m.icon;
                  const active = monolithMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMonolithMode(m.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[10.5px] transition-all cursor-pointer ${
                        active
                          ? "bg-[#111111] text-white font-semibold shadow-sm"
                          : "text-[#4D4D49] hover:text-[#111111]"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="hidden xl:flex flex-col items-center gap-3 absolute right-0 top-10 pointer-events-none select-none">
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#666662] text-right leading-[1.4]">
                  <div>Листайте</div>
                  <div>для деталей</div>
                </div>
                <span className="w-px h-14 bg-[#111111]/25" />
                <span className="w-2 h-2 rounded-full bg-[#E04416]" />
              </div>

              <div className="hidden xl:block absolute right-0 bottom-8 font-mono text-[9.5px] uppercase tracking-[0.15em] text-[#555550] text-right leading-[1.35] pointer-events-none">
                <div>Больше чем</div>
                <div>инженерия</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="precision" className="relative z-20 px-0 sm:px-4 lg:px-6">
        <div className="max-w-[1400px] mx-auto relative">
          <div className="hidden lg:block absolute top-0 left-[29%] w-24 h-7 bg-[#EAEAE7] rounded-b-[20px] z-30 pointer-events-none" aria-hidden="true" />

          <div className="relative bg-[#111111] text-white sm:rounded-[26px] overflow-hidden shadow-[0_32px_70px_-28px_rgba(17,17,17,0.45)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-4 p-6 sm:p-10 lg:p-12 flex flex-col justify-between gap-8 relative z-20">
                <div>
                  <div className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.18em] mb-6">
                    <span className="text-[#E04416] font-bold">/ 02</span>
                    <span className="text-white/50">Наш фокус</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-white mb-5">
                    ТОЧНОСТЬ<br />В КАЖДОЙ<br />ДЕТАЛИ
                  </h2>

                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-[240px]">
                    Передовые технологии.<br />
                    Инженерная экспертиза.<br />
                    Измеримый результат.
                  </p>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/40 flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-[#E04416]" />
                      <span>Режим сканирования узла</span>
                    </span>
                    <div className="inline-flex flex-wrap gap-1.5">
                      {[
                        { id: "optical", label: "Оптика" },
                        { id: "thermal", label: "Тепловизор" },
                        { id: "cad", label: "CAD-сетка" }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setGearMode(tab.id)}
                          className={`px-3 py-1.5 rounded-[4px] font-mono text-[10.5px] border transition-colors cursor-pointer ${
                            gearMode === tab.id
                              ? "bg-[#E04416] border-[#E04416] text-white font-semibold"
                              : "bg-white/[0.04] border-white/12 text-white/65 hover:text-white"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openContactWithTopic("Аудит и цифровой двойник")}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-[#E04416] transition-colors w-max cursor-pointer"
                  >
                    <span>Наш подход</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 relative border-y lg:border-y-0 lg:border-x border-white/10 min-h-[290px] sm:min-h-[360px]">
                <ErrorBoundary fallbackText="Модуль шестерён временно недоступен">
                  <PrecisionGearCanvas inspectMode={gearMode} />
                </ErrorBoundary>

                <div className="absolute bottom-5 left-5 font-mono text-[10px] text-white/65 leading-snug pointer-events-none">
                  <div>55.7558° N</div>
                  <div>37.6173° E</div>
                </div>

                <div className="absolute top-5 right-5 px-2.5 py-1 rounded bg-black/55 backdrop-blur-sm border border-white/12 font-mono text-[10px] text-white/80 pointer-events-none">
                  {gearMode === "thermal"
                    ? "ΔT: 64.2°C · NORMAL"
                    : gearMode === "cad"
                      ? "TOLERANCE: ±0.012 mm"
                      : "TORQUE: 480 N·m · 60 FPS"}
                </div>
              </div>

              <div className="lg:col-span-3 p-6 sm:p-10 flex flex-col justify-center">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-7">
                  {KEY_METRICS.map((m, idx) => (
                    <div
                      key={m.label}
                      className={`flex items-start justify-between gap-3 ${
                        idx !== KEY_METRICS.length - 1 ? "lg:pb-6 lg:border-b lg:border-white/10" : ""
                      }`}
                    >
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{m.value}</div>
                        <div className="text-[11px] sm:text-xs text-white/50 mt-0.5">{m.label}</div>
                      </div>
                      <span className="hidden lg:block w-5 h-px bg-white/25 mt-3.5 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="py-16 sm:py-24 px-4 sm:px-8">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-4 flex flex-col items-start lg:sticky lg:top-28">
            <div className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.18em] mb-5">
              <span className="text-[#E04416] font-bold">/ 03</span>
              <span className="text-[#666662]">Направления</span>
            </div>

            <h2 className="text-3xl sm:text-[40px] font-extrabold uppercase tracking-[-0.035em] leading-[0.98] text-[#111111] mb-4">
              РЕШЕНИЯ<br />ДЛЯ СЛОЖНЫХ<br />ЗАДАЧ
            </h2>

            <p className="text-sm text-[#555550] leading-relaxed max-w-xs mb-7">
              От концепции и 3D-моделирования до промышленного запуска — создаём комплексные системы под ключ.
            </p>

            <button
              type="button"
              onClick={() => setActiveSolution(SOLUTIONS_DATA[0])}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-[4px] border border-[#111111]/28 hover:bg-[#111111] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Изучить архитектуру</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {SOLUTIONS_DATA.map((sol) => (
              <article
                key={sol.id}
                onClick={() => setActiveSolution(sol)}
                className="group rounded-[14px] bg-[#DFDFDC] hover:bg-[#D7D7D3] border border-[#111111]/8 overflow-hidden flex flex-col justify-between min-h-[390px] sm:min-h-[420px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-24px_rgba(17,17,17,0.22)] cursor-pointer"
              >
                <div className="p-5 sm:p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between text-[#111111]">
                    <span className="font-mono text-xs font-medium text-[#555550]">{sol.num}</span>
                    <Plus className="w-4 h-4 text-[#111111]/60 group-hover:rotate-90 group-hover:text-[#E04416] transition-all duration-300" />
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-[19px] font-bold text-[#111111] leading-snug mb-2">
                      {sol.title}
                    </h3>
                    <p className="text-xs text-[#555550] leading-relaxed">
                      {sol.shortDesc}
                    </p>
                  </div>

                  <span className="w-9 h-9 rounded-full border border-[#111111]/25 group-hover:bg-[#111111] group-hover:border-[#111111] group-hover:text-white flex items-center justify-center transition-colors mt-1">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>

                <div className="relative h-44 w-full overflow-hidden bg-[#1D1D1D] mt-auto">
                  <img
                    src={sol.image}
                    alt={sol.title}
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/600x400/181818/EAEAE7?text=${sol.num}`;
                    }}
                  />
                  <span className="absolute bottom-0 right-4 w-10 h-1 bg-[#E04416]" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="impact" className="border-t border-[#111111]/10">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-4 relative min-h-[340px] sm:min-h-[420px] bg-[#1C1D1F] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80"
              alt="Бруталистская архитектура и промышленный дизайн"
              className="w-full h-full object-cover grayscale contrast-125 brightness-90"
            />
            <div
              className="absolute bottom-0 left-[38%] w-16 h-48 opacity-85 mix-blend-screen pointer-events-none"
              style={{ background: "linear-gradient(180deg, rgba(224,68,22,0) 0%, #E04416 65%, #FF9642 100%)" }}
            />
            <div
              className="hidden lg:block absolute inset-y-0 right-0 w-28 bg-[#EAEAE7] pointer-events-none"
              style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
            />
            <div className="absolute top-8 left-7 font-mono text-[10px] uppercase tracking-[0.16em] text-white/85 leading-relaxed">
              <div>Создано</div>
              <div>для задач</div>
              <div>будущего</div>
            </div>
          </div>

          <div className="lg:col-span-4 p-8 sm:p-12 flex flex-col justify-between gap-8 bg-[#EAEAE7]">
            <div>
              <div className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.18em] mb-6">
                <span className="text-[#E04416] font-bold">/ 04</span>
                <span className="text-[#666662]">Реальный вклад</span>
              </div>

              <h2 className="text-3xl sm:text-[42px] font-extrabold uppercase tracking-[-0.035em] leading-[0.95] text-[#111111] mb-5">
                <span className="block">ЛЮДИ</span>
                <span className="block">ИДЕИ</span>
                <span className="block text-[#94948F]">ПРОГРЕСС</span>
              </h2>

              <p className="text-xs sm:text-sm text-[#555550] leading-relaxed max-w-xs mb-7">
                Работаем напрямую с амбициозными промышленными командами, превращая сложные инженерные вызовы в надёжные системы.
              </p>

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-[4px] border border-[#111111]/25 hover:bg-[#111111] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Смотреть проекты</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-5 border-t border-[#111111]/12 flex flex-col gap-2">
              {PROJECTS_ARCHIVE.slice(0, 2).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    const matched = SOLUTIONS_DATA.find((s) => s.id === p.solutionId);
                    if (matched) setActiveSolution(matched);
                  }}
                  className="group flex items-center justify-between gap-2 text-left text-xs py-1 hover:text-[#E04416] transition-colors cursor-pointer"
                >
                  <span className="font-medium truncate">
                    <span className="font-mono text-[10px] text-[#7A7A75] mr-2">{p.code}</span>
                    {p.title}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-45 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>

          <div id="footer" className="lg:col-span-4 flex flex-col justify-between bg-[#EAEAE7] border-t lg:border-t-0 lg:border-l border-[#111111]/10">
            <div
              onClick={() => openContactWithTopic("Индивидуальный проект")}
              className="group relative bg-[#E04416] hover:bg-[#CC3A10] text-white p-8 sm:p-10 min-h-[220px] flex flex-col justify-between transition-colors cursor-pointer overflow-hidden"
            >
              <div className="absolute top-1/2 left-10 -translate-y-1/2 pointer-events-none opacity-35">
                <span className="block w-8 h-px bg-[#111111]" />
                <span className="block w-px h-8 bg-[#111111] mx-auto -mt-4" />
              </div>

              <div className="ml-auto max-w-[190px] relative z-10">
                <div className="font-mono text-sm sm:text-base font-bold uppercase tracking-[0.06em] leading-snug text-[#111111]">
                  СОЗДАДИМ<br />ПРОЕКТ<br />БУДУЩЕГО
                </div>
              </div>

              <div className="ml-auto pt-6 relative z-10">
                <span className="w-10 h-10 rounded-full border border-[#111111]/45 group-hover:bg-[#111111] group-hover:text-white text-[#111111] flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="p-8 sm:p-10 grid grid-cols-2 gap-6 text-xs">
              <div className="flex flex-col gap-3">
                <div className="font-extrabold text-sm tracking-tight text-[#111111]">
                  KORS <span className="text-[#E04416]">.</span>
                </div>
                <div className="flex flex-col gap-1.5 text-[#555550]">
                  <a href="#solutions" className="hover:text-[#111111] transition-colors">Решения</a>
                  <a href="#precision" className="hover:text-[#111111] transition-colors">Технологии</a>
                  <a href="#impact" className="hover:text-[#111111] transition-colors">Проекты</a>
                  <button
                    type="button"
                    onClick={() => openContactWithTopic("Партнёрство")}
                    className="text-left hover:text-[#111111] transition-colors cursor-pointer"
                  >
                    Связаться
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#7A7A75]">Контакты</span>
                  <a href="tel:+79990000000" className="font-mono font-semibold text-[#111111] hover:text-[#E04416]">
                    +7 (999) 000-00-00
                  </a>
                  <a href="mailto:systems@example.ru" className="font-mono text-[#555550] hover:text-[#111111]">
                    systems@example.ru
                  </a>
                </div>
                <div className="text-[10.5px] font-mono text-[#7A7A75]">
                  © 2026 ООО «КОРС Системы»<br />ИНН 0000000000
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111111] text-white border-t border-white/10 px-4 sm:px-8 py-4">
          <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <p className="text-white/70">
              Демо-проект из портфолио <strong className="text-white">Данила Буторова</strong> · Реализую такое же интерактивное React-решение с 3D-визуализацией под ваш бизнес.
            </p>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={portfolioListUrl}
                className="px-4 py-1.5 rounded-full border border-white/20 hover:border-white text-white/85 hover:text-white transition-colors"
              >
                ← Вернуться в портфолио
              </a>
              <a
                href={feedbackUrl}
                className="px-4 py-1.5 rounded-full bg-[#E04416] hover:bg-[#FF5B29] text-white font-semibold transition-colors"
              >
                Заказать такой сайт →
              </a>
            </div>
          </div>
        </div>
      </section>

      <CommandSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
      />

      <SolutionInspectorModal
        solution={activeSolution}
        onClose={() => setActiveSolution(null)}
        onRequestTopic={openContactWithTopic}
      />

      {showreelOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowreelOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Шоурил KORS 2026"
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl bg-[#111111] text-white border border-white/12 p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowreelOpen(false)}
              aria-label="Закрыть"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-[#E04416] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#E04416] mb-2">
              KORS SHOWREEL 2026 · DIGITAL TWIN DEMO
            </div>
            <h3 className="text-2xl font-extrabold mb-4">Инженерные системы в реальном времени</h3>

            <div className="rounded-xl overflow-hidden border border-white/12 bg-black mb-5">
              <ErrorBoundary fallbackText="Шоурил временно недоступен">
                <PrecisionGearCanvas inspectMode="thermal" />
              </ErrorBoundary>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-white/70">
              <span>Интерактивный рендер на базе React + HTML5 Canvas (60 FPS без тяжёлых видеофайлов)</span>
              <button
                type="button"
                onClick={() => {
                  setShowreelOpen(false);
                  openContactWithTopic("Индивидуальный проект");
                }}
                className="px-5 py-2.5 rounded-full bg-[#E04416] hover:bg-[#FF5B29] text-white font-semibold cursor-pointer"
              >
                Обсудить задачу →
              </button>
            </div>
          </div>
        </div>
      )}

      <ContactBriefModal
        open={contactOpen}
        submitted={contactSubmitted}
        formState={formState}
        setFormState={setFormState}
        lastPayloadJson={lastPayloadJson}
        feedbackUrl={feedbackUrl}
        onClose={() => setContactOpen(false)}
        onSubmit={handleContactSubmit}
        onCopyJson={(json) => copyText(json, "JSON-пакет скопирован")}
        onValidationError={triggerToast}
      />

      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-[85] px-4 py-2.5 rounded-full bg-[#111111] text-white border border-white/15 text-xs font-mono shadow-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E04416]" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
