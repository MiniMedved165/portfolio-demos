/**
 * Rotates a 3D point around the X and Y axes.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} rx
 * @param {number} ry
 * @returns {[number, number, number]}
 */
export function rotatePt(x, y, z, rx, ry) {
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const y2 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx;
  return [x1, y2, z2];
}

/**
 * Projects a 3D point into 2D canvas coordinates with perspective.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} cx
 * @param {number} cy
 * @param {number} scale
 * @returns {{ x: number, y: number, z: number }}
 */
export function projectPt(x, y, z, cx, cy, scale) {
  const fov = 7.2;
  const dist = fov / (fov - z * 0.55);
  return {
    x: cx + x * scale * dist,
    y: cy + y * scale * dist,
    z
  };
}

/**
 * Generates procedural architectural concrete textures (plain and stenciled).
 * @returns {{ plainTex: HTMLCanvasElement, textTex: HTMLCanvasElement, size: number }}
 */
export function createConcreteFaceTextures() {
  const size = 192;

  function buildBase() {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    if (!ctx) return c;

    const bg = ctx.createLinearGradient(0, 0, size, size);
    bg.addColorStop(0, "#D2D1CD");
    bg.addColorStop(0.5, "#C5C4C0");
    bg.addColorStop(1, "#B8B7B2");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 650; i++) {
      const rx = Math.abs(Math.sin(i * 12.9898 + 1.2) * 43758.5453) % 1;
      const ry = Math.abs(Math.sin(i * 78.233 + 3.7) * 43758.5453) % 1;
      const px = rx * size;
      const py = ry * size;
      const r = 0.6 + (i % 4) * 0.55;
      ctx.fillStyle = i % 3 === 0 ? "rgba(255,255,255,0.22)" : "rgba(38,36,34,0.12)";
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 52; i++) {
      const px = ((i * 67 + 17) % (size - 16)) + 8;
      const py = ((i * 43 + 29) % (size - 16)) + 8;
      const radX = 1.0 + (i % 4) * 0.65;
      const radY = 0.8 + (i % 3) * 0.5;
      ctx.fillStyle = "rgba(26, 25, 24, 0.34)";
      ctx.beginPath();
      ctx.ellipse(px, py, radX, radY, (i % 5) * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(20, 20, 18, 0.2)";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, size - 4, size - 4);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(5, 5, size - 10, size - 10);

    return c;
  }

  const plainTex = buildBase();
  const textTex = buildBase();
  const tctx = textTex.getContext("2d");
  if (tctx) {
    tctx.save();
    tctx.font = '700 20px "JetBrains Mono", monospace';
    tctx.fillStyle = "rgba(17, 17, 17, 0.82)";
    tctx.fillText("ИДЕИ", 22, 58);
    tctx.fillText("ЛЮДИ", 22, 88);
    tctx.fillText("СТРУКТУРЫ", 22, 118);
    tctx.fillStyle = "rgba(224, 68, 22, 0.95)";
    tctx.fillText("РЕЗУЛЬТАТ", 22, 148);
    tctx.fillStyle = "rgba(17, 17, 17, 0.45)";
    tctx.fillRect(22, 162, 34, 2);
    tctx.restore();
  }

  return { plainTex, textTex, size };
}

/**
 * Draws a surface-locked textured quad via 2-triangle affine UV mapping.
 */
export function drawTexturedQuad(ctx, tex, texSize, p0, p1, p2, p3) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.closePath();
  ctx.clip();
  ctx.transform(
    (p1.x - p0.x) / texSize,
    (p1.y - p0.y) / texSize,
    (p2.x - p1.x) / texSize,
    (p2.y - p1.y) / texSize,
    p0.x,
    p0.y
  );
  ctx.drawImage(tex, 0, 0);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.closePath();
  ctx.clip();
  ctx.transform(
    (p2.x - p3.x) / texSize,
    (p2.y - p3.y) / texSize,
    (p3.x - p0.x) / texSize,
    (p3.y - p0.y) / texSize,
    p0.x,
    p0.y
  );
  ctx.drawImage(tex, 0, 0);
  ctx.restore();
}

/**
 * Renders a metallic braided copper tension cable with helical ridges.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {number} thickness
 * @param {boolean} isWireframe
 */
export function drawBraidedCable(ctx, x0, y0, x1, y1, thickness, isWireframe) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const length = Math.hypot(dx, dy);
  if (length < 4) return;
  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.translate(x0, y0);
  ctx.rotate(angle);

  if (isWireframe) {
    ctx.strokeStyle = "#E04416";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    return;
  }

  ctx.fillStyle = "rgba(17, 17, 17, 0.13)";
  ctx.beginPath();
  ctx.roundRect(0, thickness * 0.35, length, thickness * 0.72, thickness * 0.36);
  ctx.fill();

  const cylGrad = ctx.createLinearGradient(0, -thickness / 2, 0, thickness / 2);
  cylGrad.addColorStop(0, "#4F1104");
  cylGrad.addColorStop(0.22, "#DE4114");
  cylGrad.addColorStop(0.46, "#FF9A66");
  cylGrad.addColorStop(0.74, "#A62608");
  cylGrad.addColorStop(1, "#2A0802");

  ctx.fillStyle = cylGrad;
  ctx.beginPath();
  ctx.roundRect(0, -thickness / 2, length, thickness, thickness / 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, -thickness / 2, length, thickness, thickness / 2);
  ctx.clip();

  const step = Math.max(6.5, thickness * 0.74);
  for (let x = -thickness; x < length + thickness; x += step) {
    ctx.strokeStyle = "rgba(28, 5, 1, 0.68)";
    ctx.lineWidth = thickness * 0.2;
    ctx.beginPath();
    ctx.moveTo(x, -thickness * 0.7);
    ctx.lineTo(x + thickness * 0.85, thickness * 0.7);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 212, 182, 0.5)";
    ctx.lineWidth = thickness * 0.11;
    ctx.beginPath();
    ctx.moveTo(x + step * 0.38, -thickness * 0.65);
    ctx.lineTo(x + step * 0.38 + thickness * 0.85, thickness * 0.65);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
}
