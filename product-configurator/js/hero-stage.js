const HERO_RIGS = [
  {
    presetId: "phantom",
    series: "SERIES 04 · CORE PHANTOM",
    desc: "Индивидуальная сборка игровых и рабочих станций. Подберите корпус, охлаждение и железо в конфигураторе — с мгновенной сметой и проверкой совместимости.",
    btnLabel: "Настроить Core Phantom",
    pinTopTitle: "AIO 360MM LCD",
    pinTopSub: "44°C · 24 dBA",
    pinBotTitle: "RTX 4080 SUPER",
    pinBotSub: "16GB · 142 FPS 2K",
    primaryRgb: "244, 92, 158",
    secondaryRgb: "155, 92, 255",
    rimGrad: "radial-gradient(circle, #F45C9E 0%, #9B5CFF 52%, transparent 74%)",
    imgFilter: "contrast(1.08) saturate(1.06) brightness(0.95)"
  },
  {
    presetId: "arctic",
    series: "SERIES 04 · CORE ARCTIC WHITE",
    desc: "Белоснежный шоу-билд с 64 ГБ DDR5, тихой жидкостной системой 360 мм и идеальной укладкой кабелей в оплётке под игры и 4K-монтаж.",
    btnLabel: "Настроить Core Arctic",
    pinTopTitle: "ARCTIC LIQUID 360",
    pinTopSub: "46°C · 64GB DDR5",
    pinBotTitle: "RTX 4070 TI SUPER",
    pinBotSub: "16GB · 122 FPS 2K",
    primaryRgb: "96, 213, 255",
    secondaryRgb: "59, 130, 246",
    rimGrad: "radial-gradient(circle, #60D5FF 0%, #3B82F6 52%, transparent 74%)",
    imgFilter: "contrast(1.06) saturate(0.88) hue-rotate(210deg) brightness(1.02)"
  },
  {
    presetId: "apex",
    series: "SERIES 04 · CORE APEX WORKSTATION",
    desc: "Бескомпромиссная флагманская станция на RTX 4090 24 ГБ и Ryzen 9 9950X в панорамном корпусе. Создана для 4K Ultra, Blender и локальных нейросетей.",
    btnLabel: "Настроить Core Apex",
    pinTopTitle: "RYZEN 9 9950X",
    pinTopSub: "16 CORES · 96GB RAM",
    pinBotTitle: "RTX 4090 24GB",
    pinBotSub: "4K ULTRA · 1000W PLATINUM",
    primaryRgb: "245, 158, 11",
    secondaryRgb: "244, 92, 158",
    rimGrad: "radial-gradient(circle, #F59E0B 0%, #FB7185 52%, transparent 74%)",
    imgFilter: "contrast(1.1) saturate(1.12) hue-rotate(-28deg) brightness(0.96)"
  }
];

/**
 * Initializes the full-bleed Hero studio canvas stage and 3-rig switcher.
 */
export function initHeroStudioStage() {
  const heroEl = document.getElementById("top");
  const canvas = document.getElementById("hero-studio-bg");
  const pcImg = document.getElementById("hero-pc-visual");
  const rimGlow = document.getElementById("hero-rim-glow");
  if (!heroEl || !canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeRigIdx = 0;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let targetX = 0;
  let targetY = 0;
  let curX = 0;
  let curY = 0;
  let rafId = null;
  let isHeroVisible = true;

  const dust = Array.from({ length: 28 }, (_, i) => ({
    x: ((i * 73) % 100) / 100,
    y: ((i * 41) % 100) / 100,
    r: 0.7 + (i % 3) * 0.55,
    vx: 0.008 + (i % 4) * 0.004,
    phase: i * 0.9
  }));

  function resize() {
    const rect = heroEl.getBoundingClientRect();
    w = Math.max(320, rect.width);
    h = Math.max(420, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function applyHeroRig(idx) {
    activeRigIdx = idx;
    const rig = HERO_RIGS[idx] || HERO_RIGS[0];

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText("hero-series-code", rig.series);
    setText("hero-rig-desc", rig.desc);
    setText("hero-load-active-label", rig.btnLabel);
    setText("hero-pin-top-title", rig.pinTopTitle);
    setText("hero-pin-top-sub", rig.pinTopSub);
    setText("hero-pin-bot-title", rig.pinBotTitle);
    setText("hero-pin-bot-sub", rig.pinBotSub);

    const loadBtn = document.getElementById("hero-load-active-btn");
    if (loadBtn) loadBtn.dataset.loadPreset = rig.presetId;

    if (rimGlow) rimGlow.style.background = rig.rimGrad;
    if (pcImg) pcImg.style.filter = rig.imgFilter;

    document.querySelectorAll(".hero-rig-tab").forEach((tab, i) => {
      const active = i === idx;
      tab.classList.toggle("is-active", active);
      tab.classList.toggle("opacity-60", !active);
      const num = tab.querySelector("span:first-child");
      if (num) {
        num.classList.toggle("text-accent-rose", active);
        num.classList.toggle("text-chrome-500", !active);
      }
    });
  }

  function draw(nowMs) {
    rafId = null;
    const t = nowMs * 0.001;
    const rig = HERO_RIGS[activeRigIdx];
    const isDesktop = window.innerWidth >= 1024;

    curX += (targetX - curX) * 0.05;
    curY += (targetY - curY) * 0.05;

    if (pcImg && isDesktop && !prefersReducedMotion) {
      pcImg.style.transform = `scale(1.04) translate3d(${(curX * -12).toFixed(1)}px, ${(curY * -8).toFixed(1)}px, 0)`;
    }

    ctx.clearRect(0, 0, w, h);

    const cx = isDesktop ? w * 0.68 + curX * 14 : w * 0.5;
    const cy = isDesktop ? h * 0.48 + curY * 10 : h * 0.68;

    ctx.save();
    const beam = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.55);
    beam.addColorStop(0, `rgba(${rig.primaryRgb}, 0.14)`);
    beam.addColorStop(0.45, `rgba(${rig.secondaryRgb}, 0.06)`);
    beam.addColorStop(1, "rgba(13, 13, 16, 0)");
    ctx.fillStyle = beam;
    ctx.fillRect(0, 0, w, h);

    ctx.beginPath();
    ctx.moveTo(cx - w * 0.24, 0);
    ctx.lineTo(cx + w * 0.12, 0);
    ctx.lineTo(cx + w * 0.34, h);
    ctx.lineTo(cx - w * 0.06, h);
    ctx.closePath();
    const shaftGrad = ctx.createLinearGradient(cx, 0, cx, h);
    shaftGrad.addColorStop(0, `rgba(${rig.primaryRgb}, 0.07)`);
    shaftGrad.addColorStop(0.6, `rgba(${rig.secondaryRgb}, 0.03)`);
    shaftGrad.addColorStop(1, "rgba(13, 13, 16, 0)");
    ctx.fillStyle = shaftGrad;
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.045)";
    ctx.lineWidth = 1;
    const r1 = isDesktop ? Math.min(w, h) * 0.34 : w * 0.36;
    const r2 = r1 * 1.32;

    ctx.beginPath();
    ctx.arc(cx, cy, r1, t * 0.12, t * 0.12 + Math.PI * 1.15);
    ctx.stroke();

    ctx.strokeStyle = `rgba(${rig.primaryRgb}, 0.14)`;
    ctx.beginPath();
    ctx.arc(cx, cy, r2, -t * 0.08 + 0.6, -t * 0.08 + 2.1);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
    ctx.beginPath();
    ctx.moveTo(cx - r2 * 1.15, cy);
    ctx.lineTo(cx + r2 * 1.15, cy);
    ctx.stroke();

    dust.forEach((d) => {
      const dx = ((d.x + t * d.vx * 0.18) % 1) * w;
      const dy = d.y * h + Math.sin(t * 0.7 + d.phase) * 14;
      const alpha = 0.08 + 0.16 * (0.5 + 0.5 * Math.sin(t * 1.4 + d.phase));
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(dx, dy, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    if (!prefersReducedMotion && !document.hidden && isHeroVisible) {
      rafId = requestAnimationFrame(draw);
    }
  }

  function updatePlayback() {
    const shouldPlay = !document.hidden && isHeroVisible && !prefersReducedMotion;
    if (!shouldPlay && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (shouldPlay && rafId === null) {
      rafId = requestAnimationFrame(draw);
    }
  }

  document.querySelectorAll(".hero-rig-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      applyHeroRig(Number(tab.dataset.heroRig || 0));
      if (prefersReducedMotion) draw(0);
    });
  });

  heroEl.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      const rect = heroEl.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    },
    { passive: true }
  );

  heroEl.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
  });

  document.addEventListener("visibilitychange", updatePlayback);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        isHeroVisible = entries[0]?.isIntersecting ?? true;
        updatePlayback();
      },
      { threshold: 0.02 }
    ).observe(heroEl);
  }

  resize();
  applyHeroRig(0);
  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(heroEl);
  }
  window.addEventListener("resize", resize);
  rafId = requestAnimationFrame(draw);
}
