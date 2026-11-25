import { HERO_SCENES } from "./event-data.js";

/**
 * Paints a tapered volumetric plasma ribbon along a cubic bezier curve.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number[]} pts
 * @param {number} baseWidth
 * @param {number} alphaScale
 */
export function drawGlowingRibbon(ctx, pts, baseWidth, alphaScale) {
  const [x0, y0, cx1, cy1, cx2, cy2, x1, y1] = pts;
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  grad.addColorStop(0, "rgba(255, 68, 0, 0)");
  grad.addColorStop(0.18, `rgba(255, 62, 0, ${0.88 * alphaScale})`);
  grad.addColorStop(0.48, `rgba(255, 138, 36, ${0.98 * alphaScale})`);
  grad.addColorStop(0.76, `rgba(255, 77, 0, ${0.92 * alphaScale})`);
  grad.addColorStop(1, "rgba(255, 68, 0, 0)");

  const coreGrad = ctx.createLinearGradient(x0, y0, x1, y1);
  coreGrad.addColorStop(0, "rgba(255, 245, 224, 0)");
  coreGrad.addColorStop(0.28, `rgba(255, 236, 198, ${0.9 * alphaScale})`);
  coreGrad.addColorStop(0.58, `rgba(255, 255, 248, ${0.98 * alphaScale})`);
  coreGrad.addColorStop(0.84, `rgba(255, 210, 145, ${0.75 * alphaScale})`);
  coreGrad.addColorStop(1, "rgba(255, 245, 224, 0)");

  ctx.save();
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x1, y1);
  ctx.strokeStyle = grad;
  ctx.lineWidth = baseWidth * 3.4;
  ctx.globalAlpha = 0.24 * alphaScale;
  ctx.filter = "blur(14px)";
  ctx.stroke();

  ctx.filter = "blur(4px)";
  ctx.lineWidth = baseWidth * 1.45;
  ctx.globalAlpha = 0.72 * alphaScale;
  ctx.stroke();

  ctx.filter = "none";
  ctx.lineWidth = baseWidth * 0.72;
  ctx.globalAlpha = 0.95 * alphaScale;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.bezierCurveTo(cx1, cy1 - baseWidth * 0.14, cx2, cy2 - baseWidth * 0.14, x1, y1);
  ctx.strokeStyle = coreGrad;
  ctx.lineWidth = Math.max(1.3, baseWidth * 0.24);
  ctx.globalAlpha = 0.92 * alphaScale;
  ctx.stroke();

  ctx.restore();
}

function drawSparkStar(ctx, x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
  ctx.restore();
}

export function initHeroRibbonsEngine() {
  const stage = document.getElementById("hero-visual-stage");
  const backCanvas = document.getElementById("hero-back-canvas");
  const frontCanvas = document.getElementById("hero-front-canvas");
  const subjectImg = document.getElementById("hero-subject-img");
  if (!stage || !backCanvas || !frontCanvas) return;

  const backCtx = backCanvas.getContext("2d");
  const frontCtx = frontCanvas.getContext("2d");
  if (!backCtx || !frontCtx) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeSceneIdx = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let pointerX = 0;
  let pointerY = 0;
  let smoothX = 0;
  let smoothY = 0;
  let rafId = null;
  let isStageVisible = true;

  const embers = Array.from({ length: 26 }, (_, i) => ({
    t: (i / 26) * Math.PI * 2,
    radiusScale: 0.72 + (i % 5) * 0.11,
    size: 1.2 + (i % 3) * 0.9,
    speed: 0.22 + (i % 4) * 0.08,
    yOffset: ((i * 37) % 100 - 50) * 1.4
  }));

  function resizeCanvases() {
    const rect = stage.getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = Math.max(320, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    [backCanvas, frontCanvas].forEach((canvas) => {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    });
    backCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    frontCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function renderFrame(timeMs) {
    rafId = null;
    const isDesktop = window.innerWidth >= 1024;
    const scene = HERO_SCENES[activeSceneIdx];
    const t = timeMs * 0.001 * scene.speed;

    smoothX += (pointerX - smoothX) * 0.06;
    smoothY += (pointerY - smoothY) * 0.06;

    if (subjectImg && isDesktop && !reducedMotion) {
      subjectImg.style.transform = `scale(1.04) translate3d(${(smoothX * -10).toFixed(1)}px, ${(smoothY * -6).toFixed(1)}px, 0)`;
    }

    const cx = isDesktop ? width * 0.72 : width * 0.5;
    const cy = isDesktop ? height * 0.55 : height * 0.54;
    const spanX = isDesktop ? width * 0.28 : width * 0.44;
    const spanY = height * 0.27;
    const wave1 = Math.sin(t * 1.15) * 18;
    const wave2 = Math.cos(t * 0.95) * 14;
    const tiltOffset = scene.tilt * height * 0.35;
    const px = smoothX * 22;
    const py = smoothY * 14;

    backCtx.clearRect(0, 0, width, height);

    backCtx.save();
    for (let i = 0; i < 9; i++) {
      const sy = cy - spanY * 1.15 + i * (spanY * 0.28) + Math.sin(t * 0.6 + i) * 5;
      const len = spanX * (1.25 + (i % 3) * 0.28);
      const sx = cx - len * 0.54 + px * 0.35;
      const g = backCtx.createLinearGradient(sx, sy, sx + len, sy - 24);
      g.addColorStop(0, "rgba(17, 17, 17, 0)");
      g.addColorStop(0.45, `rgba(24, 22, 20, ${0.045 + (i % 3) * 0.02})`);
      g.addColorStop(1, "rgba(17, 17, 17, 0)");
      backCtx.strokeStyle = g;
      backCtx.lineWidth = 6 + (i % 4) * 5;
      backCtx.lineCap = "round";
      backCtx.beginPath();
      backCtx.moveTo(sx, sy + 12);
      backCtx.quadraticCurveTo(cx, sy - 14 + wave2 * 0.3, sx + len, sy - 22);
      backCtx.stroke();
    }
    backCtx.restore();

    drawGlowingRibbon(
      backCtx,
      [
        cx - spanX * 0.98 + px * 0.4,
        cy - spanY * 0.1 + wave1 * 0.6 + tiltOffset,
        cx - spanX * 0.28,
        cy - spanY * 1.05 - wave2,
        cx + spanX * 0.42,
        cy - spanY * 0.88 + wave1,
        cx + spanX * 1.08 + px * 0.5,
        cy - spanY * 0.58 - tiltOffset
      ],
      isDesktop ? 13 : 9,
      0.88
    );

    drawGlowingRibbon(
      backCtx,
      [
        cx - spanX * 0.85,
        cy + spanY * 0.82 - wave2 * 0.5,
        cx - spanX * 0.1,
        cy + spanY * 0.15 + wave1,
        cx + spanX * 0.52,
        cy + spanY * 0.72 - wave1 * 0.4,
        cx + spanX * 1.05,
        cy + spanY * 0.22
      ],
      isDesktop ? 10 : 7,
      0.74
    );

    frontCtx.clearRect(0, 0, width, height);

    drawGlowingRibbon(
      frontCtx,
      [
        cx - spanX * 0.96 + px * 0.8,
        cy + spanY * 0.22 + wave2 + tiltOffset,
        cx - spanX * 0.34,
        cy + spanY * 0.92 + wave1 * 1.1 + py,
        cx + spanX * 0.44,
        cy + spanY * 0.36 - wave2 * 1.1 + py,
        cx + spanX * 1.06 + px,
        cy - spanY * 0.36 - tiltOffset
      ],
      isDesktop ? 16 : 11,
      1.0
    );

    drawGlowingRibbon(
      frontCtx,
      [
        cx - spanX * 0.78 + px * 0.6,
        cy + spanY * 0.48 - wave1 * 0.7,
        cx - spanX * 0.08,
        cy + spanY * 0.12 - wave2 * 0.8,
        cx + spanX * 0.48,
        cy + spanY * 0.66 + wave1 * 0.7,
        cx + spanX * 1.02 + px * 0.7,
        cy + spanY * 0.98
      ],
      isDesktop ? 9.5 : 7,
      0.94
    );

    drawGlowingRibbon(
      frontCtx,
      [
        cx - spanX * 0.65,
        cy + spanY * 0.14 + wave1 * 0.4,
        cx - spanX * 0.12,
        cy + spanY * 0.68 - wave2 * 0.5,
        cx + spanX * 0.42,
        cy + spanY * 0.04 + wave2 * 0.6,
        cx + spanX * 0.95,
        cy - spanY * 0.52
      ],
      isDesktop ? 4.5 : 3.5,
      0.92
    );

    embers.forEach((em) => {
      const angle = em.t + t * em.speed;
      const ex = cx + Math.cos(angle) * spanX * em.radiusScale + px * 0.7;
      const ey = cy + Math.sin(angle * 1.3) * spanY * 0.65 + em.yOffset * 0.45 + py * 0.6;
      const glowAlpha = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(angle * 2.5));

      frontCtx.save();
      frontCtx.beginPath();
      frontCtx.arc(ex, ey, em.size, 0, Math.PI * 2);
      frontCtx.fillStyle = `rgba(255, 164, 72, ${glowAlpha.toFixed(2)})`;
      frontCtx.shadowColor = "#FF4D00";
      frontCtx.shadowBlur = 10;
      frontCtx.fill();
      frontCtx.restore();
    });

    drawSparkStar(frontCtx, cx + spanX * 0.58 + px * 0.3, cy - spanY * 1.22, 6.5, "rgba(17, 17, 17, 0.72)");
    drawSparkStar(frontCtx, cx - spanX * 0.62 - px * 0.2, cy - spanY * 0.65, 4.5, "rgba(255, 77, 0, 0.78)");

    if (!reducedMotion && !document.hidden && isStageVisible) {
      rafId = requestAnimationFrame(renderFrame);
    }
  }

  function updatePlaybackState() {
    const shouldPlay = !document.hidden && isStageVisible && !reducedMotion;
    if (!shouldPlay && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (shouldPlay && rafId === null) {
      rafId = requestAnimationFrame(renderFrame);
    }
  }

  document.addEventListener("visibilitychange", updatePlaybackState);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        isStageVisible = entries[0]?.isIntersecting ?? true;
        updatePlaybackState();
      },
      { threshold: 0.02 }
    ).observe(stage);
  }

  document.querySelectorAll(".hero-scene-dot").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeSceneIdx = Number(btn.dataset.heroScene || 0);
      const sc = HERO_SCENES[activeSceneIdx];
      const eyeEl = document.getElementById("hero-track-eyebrow");
      const copyEl = document.getElementById("hero-track-copy");
      if (eyeEl) eyeEl.textContent = sc.eyebrow;
      if (copyEl) copyEl.textContent = sc.copy;

      document.querySelectorAll(".hero-scene-dot").forEach((b, i) => {
        const active = i === activeSceneIdx;
        b.className = active
          ? "hero-scene-dot font-mono text-[11px] font-bold text-obsidian-900 hover:text-flame transition-colors cursor-pointer"
          : "hero-scene-dot font-mono text-[11px] font-medium text-obsidian-400 hover:text-flame transition-colors cursor-pointer";
      });

      if (reducedMotion) renderFrame(0);
    });
  });

  const heroSection = document.getElementById("top");
  heroSection?.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      const r = heroSection.getBoundingClientRect();
      pointerX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointerY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    },
    { passive: true }
  );

  heroSection?.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
  });

  resizeCanvases();
  if ("ResizeObserver" in window) {
    new ResizeObserver(resizeCanvases).observe(stage);
  }
  window.addEventListener("resize", resizeCanvases);
  rafId = requestAnimationFrame(renderFrame);
}
