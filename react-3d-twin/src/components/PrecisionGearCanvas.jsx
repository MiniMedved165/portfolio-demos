import React, { useEffect, useRef } from "react";

export default function PrecisionGearCanvas({ inspectMode }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const modeRef = useRef(inspectMode);

  useEffect(() => {
    modeRef.current = inspectMode;
  }, [inspectMode]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 640;
    let h = 400;
    let dpr = 1;
    let rafId = null;
    let isVisible = true;

    function resize() {
      const rect = wrap.getBoundingClientRect();
      w = Math.max(280, rect.width);
      h = Math.max(280, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawMachinedGear(cx, cy, pitchR, toothDepth, innerR, teeth, angle, mode) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const outerR = pitchR + toothDepth * 0.5;
      const rootR = pitchR - toothDepth * 0.5;
      const step = (Math.PI * 2) / teeth;

      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a0 = i * step;
        const a1 = a0 + step * 0.18;
        const a2 = a0 + step * 0.34;
        const a3 = a0 + step * 0.62;
        const a4 = a0 + step * 0.78;

        if (i === 0) ctx.moveTo(Math.cos(a0) * rootR, Math.sin(a0) * rootR);
        ctx.lineTo(Math.cos(a1) * rootR, Math.sin(a1) * rootR);
        ctx.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR);
        ctx.lineTo(Math.cos(a3) * outerR, Math.sin(a3) * outerR);
        ctx.lineTo(Math.cos(a4) * rootR, Math.sin(a4) * rootR);
      }
      ctx.closePath();

      ctx.moveTo(innerR, 0);
      ctx.arc(0, 0, innerR, 0, Math.PI * 2, true);

      if (mode === "cad") {
        ctx.fillStyle = "rgba(255,255,255,0.03)";
        ctx.fill("evenodd");
        ctx.strokeStyle = "rgba(255,255,255,0.52)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      } else if (mode === "thermal") {
        const tg = ctx.createRadialGradient(0, 0, innerR * 0.6, 0, 0, outerR);
        tg.addColorStop(0, "#FFD166");
        tg.addColorStop(0.5, "#E04416");
        tg.addColorStop(0.85, "#4A154B");
        tg.addColorStop(1, "#16102A");
        ctx.fillStyle = tg;
        ctx.fill("evenodd");
        ctx.strokeStyle = "rgba(255, 209, 102, 0.55)";
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        const mg = ctx.createLinearGradient(-outerR, -outerR, outerR, outerR);
        mg.addColorStop(0, "#1D1E21");
        mg.addColorStop(0.28, "#7D8088");
        mg.addColorStop(0.46, "#ECEEF2");
        mg.addColorStop(0.62, "#35373C");
        mg.addColorStop(0.82, "#8A8E96");
        mg.addColorStop(1, "#121315");
        ctx.fillStyle = mg;
        ctx.fill("evenodd");
        ctx.strokeStyle = "rgba(255,255,255,0.28)";
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(0, 0, (rootR + innerR) * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = mode === "thermal" ? "rgba(255,240,200,0.45)" : "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.restore();
    }

    function render(nowMs) {
      rafId = null;
      const t = nowMs * 0.001;
      const mode = modeRef.current;

      ctx.clearRect(0, 0, w, h);

      const glow = ctx.createRadialGradient(w * 0.52, h * 0.92, 10, w * 0.52, h * 0.92, w * 0.44);
      glow.addColorStop(0, mode === "cad" ? "rgba(224, 68, 22, 0.25)" : "rgba(255, 86, 20, 0.72)");
      glow.addColorStop(0.55, "rgba(224, 68, 22, 0.16)");
      glow.addColorStop(1, "rgba(17, 17, 17, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const base = Math.min(w, h);
      const t1 = 24;
      const t2 = 16;
      const pitchR1 = base * 0.4;
      const pitchR2 = pitchR1 * (t2 / t1);
      const toothDepth = base * 0.055;
      const meshDist = pitchR1 + pitchR2 + toothDepth * 0.08;
      const meshAngle = -0.58;
      const a1 = t * 0.22;
      const a2 = -a1 * (t1 / t2) + meshAngle * (1 + t1 / t2) + Math.PI / t2;

      ctx.save();
      ctx.translate(w * 0.46, h * 0.54);
      ctx.scale(1, 0.72);
      ctx.rotate(-0.18);
      drawMachinedGear(0, 0, pitchR1, toothDepth, pitchR1 * 0.54, t1, a1, mode);
      drawMachinedGear(
        Math.cos(meshAngle) * meshDist,
        Math.sin(meshAngle) * meshDist,
        pitchR2,
        toothDepth,
        pitchR2 * 0.46,
        t2,
        a2,
        mode
      );
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
      ctx.lineWidth = 1;
      const gx = w * 0.26;
      const gy = h * 0.34;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(gx, gy, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(224, 68, 22, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(gx, gy, 9 + Math.sin(t * 2.5) * 2.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.beginPath();
      ctx.moveTo(w * 0.72, 0);
      ctx.lineTo(w * 0.72, h);
      ctx.stroke();
      ctx.restore();

      if (!prefersReducedMotion && !document.hidden && isVisible) {
        rafId = requestAnimationFrame(render);
      }
    }

    function updatePlayback() {
      const shouldPlay = !document.hidden && isVisible && !prefersReducedMotion;
      if (!shouldPlay && rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (shouldPlay && rafId === null) {
        rafId = requestAnimationFrame(render);
      }
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
        updatePlayback();
      },
      { threshold: 0.02 }
    );
    io.observe(wrap);

    document.addEventListener("visibilitychange", updatePlayback);
    rafId = requestAnimationFrame(render);

    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full h-full min-h-[300px] sm:min-h-[360px] overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
