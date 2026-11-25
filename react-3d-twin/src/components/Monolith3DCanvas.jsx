import React, { useEffect, useRef } from "react";
import {
  createConcreteFaceTextures,
  drawBraidedCable,
  drawTexturedQuad,
  projectPt,
  rotatePt
} from "../utils/canvas3d.js";

const BLOCK_DEFS = [
  { id: "ltf", sx: -1, sy: -1, sz: 1, dim: 0.91, hasText: false },
  { id: "rtf", sx: 1, sy: -1, sz: 1, dim: 0.93, hasText: true },
  { id: "lbf", sx: -1, sy: 1, sz: 1, dim: 0.92, hasText: false },
  { id: "rbf", sx: 1, sy: 1, sz: 1, dim: 0.90, hasText: false },
  { id: "ltb", sx: -1, sy: -1, sz: -1, dim: 0.92, hasText: false },
  { id: "rtb", sx: 1, sy: -1, sz: -1, dim: 0.90, hasText: false },
  { id: "lbb", sx: -1, sy: 1, sz: -1, dim: 0.91, hasText: false },
  { id: "rbb", sx: 1, sy: 1, sz: -1, dim: 0.92, hasText: false }
];

const UNIT_VERTS = [
  [-0.5, -0.5, 0.5],
  [0.5, -0.5, 0.5],
  [0.5, 0.5, 0.5],
  [-0.5, 0.5, 0.5],
  [-0.5, -0.5, -0.5],
  [0.5, -0.5, -0.5],
  [0.5, 0.5, -0.5],
  [-0.5, 0.5, -0.5]
];

const FACE_DEFS = [
  { idx: [0, 1, 2, 3], name: "front", normal: [0, 0, 1] },
  { idx: [5, 4, 7, 6], name: "back", normal: [0, 0, -1] },
  { idx: [1, 5, 6, 2], name: "right", normal: [1, 0, 0] },
  { idx: [4, 0, 3, 7], name: "left", normal: [-1, 0, 0] },
  { idx: [4, 5, 1, 0], name: "top", normal: [0, -1, 0] },
  { idx: [3, 2, 6, 7], name: "bottom", normal: [0, 1, 0] }
];

const CABLE_DEFS = [
  { blockId: "ltf", localSocket: [-0.45, -0.25, 0.25], edge: [-0.18, -0.15], thickness: 10.5 },
  { blockId: "rtb", localSocket: [0.1, -0.45, -0.1], edge: [0.64, -0.18], thickness: 9.5 },
  { blockId: "rtf", localSocket: [0.22, -0.46, 0.22], edge: [0.84, -0.16], thickness: 10.0 },
  { blockId: "rbf", localSocket: [0.46, 0.12, 0.24], edge: [1.16, 0.56], thickness: 11.0 },
  { blockId: "lbf", localSocket: [-0.36, 0.28, 0.45], edge: [-0.12, 1.15], thickness: 11.5 },
  { blockId: "lbb", localSocket: [-0.15, 0.45, -0.2], edge: [0.34, 1.16], thickness: 9.5 }
];

const LIGHT_DIR = (() => {
  const lx = -0.45;
  const ly = -0.66;
  const lz = 0.6;
  const len = Math.hypot(lx, ly, lz);
  return [lx / len, ly / len, lz / len];
})();

export default function Monolith3DCanvas({ viewMode, onToggleMode }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const modeRef = useRef(viewMode);
  const renderOnceRef = useRef(null);
  const dragRef = useRef({
    dragging: false,
    lastX: 0,
    lastY: 0,
    baseRotY: -0.62,
    baseRotX: 0.34,
    velY: 0,
    velX: 0,
    hoverX: 0,
    hoverY: 0,
    smoothHoverX: 0,
    smoothHoverY: 0,
    explode: 0
  });

  useEffect(() => {
    modeRef.current = viewMode;
    renderOnceRef.current?.();
  }, [viewMode]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { plainTex, textTex, size: texSize } = createConcreteFaceTextures();

    let width = 600;
    let height = 560;
    let dpr = 1;
    let rafId = null;
    let isVisible = true;

    function resize() {
      const rect = container.getBoundingClientRect();
      width = Math.max(300, rect.width);
      height = Math.max(340, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (prefersReducedMotion) render(performance.now());
    }

    function drawConcreteBlock(block, rx, ry, cx, cy, scale, isWireframe) {
      const worldVerts = UNIT_VERTS.map(([vx, vy, vz]) => {
        const lx = block.cx + vx * block.dim;
        const ly = block.cy + vy * block.dim;
        const lz = block.cz + vz * block.dim;
        const rotated = rotatePt(lx, ly, lz, rx, ry);
        return { raw: rotated, proj: projectPt(rotated[0], rotated[1], rotated[2], cx, cy, scale) };
      });

      FACE_DEFS.forEach((f) => {
        const v0 = worldVerts[f.idx[0]];
        const v1 = worldVerts[f.idx[1]];
        const v2 = worldVerts[f.idx[2]];
        const v3 = worldVerts[f.idx[3]];

        const cross2D =
          (v1.proj.x - v0.proj.x) * (v2.proj.y - v0.proj.y) -
          (v1.proj.y - v0.proj.y) * (v2.proj.x - v0.proj.x);

        if (!isWireframe && cross2D <= 0) return;

        const [nx, ny, nz] = rotatePt(f.normal[0], f.normal[1], f.normal[2], rx, ry);
        const dot = Math.max(-1, Math.min(1, nx * LIGHT_DIR[0] + ny * LIGHT_DIR[1] + nz * LIGHT_DIR[2]));
        const lightFactor = 0.5 + dot * 0.5;

        const p0 = v0.proj;
        const p1 = v1.proj;
        const p2 = v2.proj;
        const p3 = v3.proj;

        if (isWireframe) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fillStyle = "rgba(17, 17, 17, 0.03)";
          ctx.fill();
          ctx.strokeStyle = cross2D > 0 ? "rgba(17, 17, 17, 0.58)" : "rgba(17, 17, 17, 0.14)";
          ctx.lineWidth = cross2D > 0 ? 1.15 : 0.7;
          ctx.stroke();
          ctx.restore();
          return;
        }

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fillStyle = "#C2C1BD";
        ctx.fill();
        ctx.restore();

        const useText = block.hasText && (f.name === "right" || f.name === "front");
        const activeTex = block.hasText && f.name === "right" ? textTex : plainTex;
        drawTexturedQuad(ctx, activeTex, texSize, p0, p1, p2, p3);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();

        if (lightFactor < 0.56) {
          ctx.fillStyle = `rgba(18, 18, 17, ${((0.58 - lightFactor) * 1.15).toFixed(3)})`;
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(252, 250, 246, ${((lightFactor - 0.56) * 0.65).toFixed(3)})`;
          ctx.fill();
        }

        ctx.strokeStyle = lightFactor > 0.54 ? "rgba(255,255,255,0.42)" : "rgba(17,17,17,0.38)";
        ctx.lineWidth = useText ? 1.25 : 1.05;
        ctx.stroke();
        ctx.restore();
      });
    }

    function render(nowMs) {
      rafId = null;
      const t = nowMs * 0.001;
      const st = dragRef.current;
      const mode = modeRef.current;
      const isWireframe = mode === "wireframe";
      const targetExplode = mode === "exploded" ? 0.34 : 0.03;

      st.explode += (targetExplode - st.explode) * 0.1;

      if (!st.dragging) {
        st.baseRotY += st.velY;
        st.baseRotX = Math.max(-0.88, Math.min(0.92, st.baseRotX + st.velX));
        st.velY *= 0.92;
        st.velX *= 0.92;

        if (!prefersReducedMotion && Math.abs(st.velY) < 0.0008) {
          st.baseRotY += 0.0014;
        }
      }

      st.smoothHoverX += (st.hoverX - st.smoothHoverX) * 0.06;
      st.smoothHoverY += (st.hoverY - st.smoothHoverY) * 0.06;

      const rx = st.baseRotX - st.smoothHoverY * 0.14;
      const ry = st.baseRotY + st.smoothHoverX * 0.18;

      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.52;
      const cy = height * 0.49 + (prefersReducedMotion ? 0 : Math.sin(t * 1.1) * 4);
      const scale = Math.min(width, height) * 0.235;
      const thicknessScale = width < 480 ? 0.72 : 1;

      ctx.save();
      const shadowGrad = ctx.createRadialGradient(
        width * 0.52,
        height * 0.5 + scale * 1.56,
        10,
        width * 0.52,
        height * 0.5 + scale * 1.56,
        scale * 1.65
      );
      shadowGrad.addColorStop(0, "rgba(17, 17, 17, 0.15)");
      shadowGrad.addColorStop(1, "rgba(17, 17, 17, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(width * 0.52, height * 0.5 + scale * 1.56, scale * 1.65, scale * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const gap = 0.5 + st.explode;
      const blockMap = {};
      const renderQueue = [];

      BLOCK_DEFS.forEach((b) => {
        const bx = b.sx * gap;
        const by = b.sy * gap;
        const bz = b.sz * gap;
        const [rcx, rcy, rcz] = rotatePt(bx, by, bz, rx, ry);
        const blockObj = { ...b, cx: bx, cy: by, cz: bz, rotCenter: [rcx, rcy, rcz] };
        blockMap[b.id] = blockObj;
        renderQueue.push({ kind: "block", z: rcz, data: blockObj });
      });

      if (st.explode > 0.08) {
        renderQueue.push({ kind: "core", z: 0, r: scale * (0.35 + st.explode * 0.65) });
      }

      CABLE_DEFS.forEach((cable) => {
        const parent = blockMap[cable.blockId];
        if (!parent) return;
        const sx = parent.cx + cable.localSocket[0] * parent.dim;
        const sy = parent.cy + cable.localSocket[1] * parent.dim;
        const sz = parent.cz + cable.localSocket[2] * parent.dim;
        const [rsx, rsy, rsz] = rotatePt(sx, sy, sz, rx, ry);
        const projSocket = projectPt(rsx, rsy, rsz, cx, cy, scale);

        renderQueue.push({
          kind: "cable",
          z: rsz + (rsz >= parent.rotCenter[2] ? 0.35 : -0.45),
          x0: cable.edge[0] * width,
          y0: cable.edge[1] * height,
          x1: projSocket.x,
          y1: projSocket.y,
          thickness: cable.thickness * thicknessScale,
          showSocketCap: rsz > -0.15
        });
      });

      renderQueue.sort((a, b) => a.z - b.z);

      renderQueue.forEach((item) => {
        if (item.kind === "core") {
          ctx.save();
          const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, item.r * 1.9);
          g.addColorStop(0, "rgba(255, 200, 128, 0.95)");
          g.addColorStop(0.4, "rgba(224, 68, 22, 0.85)");
          g.addColorStop(1, "rgba(224, 68, 22, 0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, item.r * 1.9, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (item.kind === "block") {
          drawConcreteBlock(item.data, rx, ry, cx, cy, scale, isWireframe);
        } else if (item.kind === "cable") {
          if (!isWireframe && item.showSocketCap) {
            ctx.save();
            ctx.fillStyle = "rgba(18, 16, 14, 0.85)";
            ctx.beginPath();
            ctx.arc(item.x1, item.y1, item.thickness * 0.68, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          drawBraidedCable(ctx, item.x0, item.y0, item.x1, item.y1, item.thickness, isWireframe);
        }
      });

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

    renderOnceRef.current = () => {
      if (prefersReducedMotion) render(performance.now());
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
        updatePlayback();
      },
      { threshold: 0.02 }
    );
    io.observe(container);

    document.addEventListener("visibilitychange", updatePlayback);
    rafId = requestAnimationFrame(render);

    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const handlePointerDown = (e) => {
    dragRef.current.dragging = true;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    dragRef.current.velX = 0;
    dragRef.current.velY = 0;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current.hoverX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    dragRef.current.hoverY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    if (dragRef.current.dragging) {
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      const dRotY = dx * 0.008;
      const dRotX = dy * 0.007;
      dragRef.current.baseRotY += dRotY;
      dragRef.current.baseRotX = Math.max(-0.88, Math.min(0.92, dragRef.current.baseRotX + dRotX));
      dragRef.current.velY = dRotY * 0.7;
      dragRef.current.velX = dRotX * 0.7;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      renderOnceRef.current?.();
    }
  };

  const handlePointerUp = () => {
    dragRef.current.dragging = false;
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        dragRef.current.dragging = false;
        dragRef.current.hoverX = 0;
        dragRef.current.hoverY = 0;
      }}
      className="relative w-full h-full min-h-[370px] sm:min-h-[470px] lg:min-h-[580px] cursor-grab active:cursor-grabbing select-none touch-none"
      aria-label="Интерактивный 3D-монолит — перетащите для вращения"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleMode();
        }}
        title="Переключить режим 3D-структуры"
        className="absolute top-[50%] left-[52%] -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-black/48 hover:bg-[#E04416] backdrop-blur-sm text-white font-mono text-[11px] tracking-[0.18em] transition-colors cursor-pointer border border-white/15"
      >
        {"{ K }"}
      </button>
    </div>
  );
}
