import { escapeHtml, getRgbTheme } from "./build-engine.js";

/**
 * Renders layered SVG chassis preview reflecting case, cooling, GPU tier, RAM count, and RGB theme.
 * @param {object} evalData
 * @param {object} buildState
 */
export function renderPcVisualizer(evalData, buildState) {
  const stage = document.getElementById("pc-visualizer-stage");
  const ambientGlow = document.getElementById("rig-ambient-glow");
  const caseLabel = document.getElementById("rig-case-label");
  if (!stage) return;

  const { parts } = evalData;
  const cv = parts.case.visual;
  const rgb = getRgbTheme(buildState);
  const isRgbOn = rgb.id !== "stealth";
  const gpuTier = parts.gpu.tier || 2;
  const coolingType = parts.cooling.coolingType || "aio360";
  const ramSticks = parts.ram.sticks || 2;
  const isPanoramic = cv.style === "panoramic";

  if (caseLabel) caseLabel.textContent = `${cv.label} · ${rgb.name}`;
  if (ambientGlow) {
    ambientGlow.style.background = isRgbOn
      ? `radial-gradient(circle at 50% 45%, ${rgb.primary} 0%, ${rgb.secondary} 52%, transparent 74%)`
      : "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.08) 0%, transparent 70%)";
  }

  const topFansCount = coolingType === "aio360" ? 3 : coolingType === "aio240" ? 2 : 0;
  let topRadiatorSvg = "";
  if (topFansCount > 0) {
    const radWidth = topFansCount === 3 ? 216 : 154;
    const startX = 114;
    topRadiatorSvg += `<rect x="${startX}" y="42" width="${radWidth}" height="14" rx="3" fill="#202028" stroke="#3B3B48" stroke-width="1.2"/>`;
    for (let i = 0; i < topFansCount; i++) {
      const fx = startX + 10 + i * 68;
      topRadiatorSvg += `
        <rect x="${fx}" y="56" width="58" height="12" rx="3" fill="#18181F" stroke="${rgb.primary}" stroke-opacity="${isRgbOn ? "0.75" : "0.2"}" stroke-width="1.2"/>
        <line x1="${fx + 6}" y1="62" x2="${fx + 52}" y2="62" stroke="${rgb.primary}" stroke-opacity="${isRgbOn ? "0.9" : "0.18"}" stroke-width="2" stroke-linecap="round"/>`;
    }
  }

  const frontFansSvg = [96, 162, 228]
    .map(
      (cy) => `
      <g>
        <circle cx="348" cy="${cy}" r="24" fill="#121217" stroke="${rgb.primary}" stroke-opacity="${isRgbOn ? "0.8" : "0.22"}" stroke-width="2"/>
        <g class="pc-fan-blades">
          <path d="M348 ${cy - 18} C354 ${cy - 12}, 354 ${cy - 5}, 348 ${cy} C342 ${cy - 5}, 342 ${cy - 12}, 348 ${cy - 18} Z" fill="${rgb.secondary}" fill-opacity="${isRgbOn ? "0.7" : "0.25"}"/>
          <path d="M366 ${cy} C360 ${cy + 6}, 353 ${cy + 6}, 348 ${cy} C353 ${cy - 6}, 360 ${cy - 6}, 366 ${cy} Z" fill="${rgb.primary}" fill-opacity="${isRgbOn ? "0.7" : "0.25"}"/>
          <path d="M348 ${cy + 18} C342 ${cy + 12}, 342 ${cy + 5}, 348 ${cy} C354 ${cy + 5}, 354 ${cy + 12}, 348 ${cy + 18} Z" fill="${rgb.secondary}" fill-opacity="${isRgbOn ? "0.7" : "0.25"}"/>
          <path d="M330 ${cy} C336 ${cy - 6}, 343 ${cy - 6}, 348 ${cy} C343 ${cy + 6}, 336 ${cy + 6}, 330 ${cy} Z" fill="${rgb.primary}" fill-opacity="${isRgbOn ? "0.7" : "0.25"}"/>
        </g>
        <circle cx="348" cy="${cy}" r="6" fill="#1C1C24" stroke="${rgb.primary}" stroke-opacity="${isRgbOn ? "0.9" : "0.25"}" stroke-width="1.2"/>
      </g>`
    )
    .join("");

  const ramPositions = ramSticks === 4 ? [242, 250, 258, 266] : [248, 260];
  const ramSvg = ramPositions
    .map(
      (rx) => `
      <rect x="${rx}" y="106" width="5" height="58" rx="1.5" fill="#252530" stroke="#3D3D4A" stroke-width="0.8"/>
      <rect x="${rx + 1}" y="108" width="3" height="54" rx="1" fill="url(#rgbGrad)" fill-opacity="${isRgbOn ? "0.95" : "0.18"}"/>`
    )
    .join("");

  let cpuCoolerSvg = "";
  if (coolingType === "air") {
    cpuCoolerSvg = `
      <g>
        <rect x="150" y="102" width="68" height="66" rx="6" fill="#23232C" stroke="#484858" stroke-width="1.6"/>
        <line x1="158" y1="114" x2="210" y2="114" stroke="#3A3A48" stroke-width="2"/>
        <line x1="158" y1="124" x2="210" y2="124" stroke="#3A3A48" stroke-width="2"/>
        <line x1="158" y1="134" x2="210" y2="134" stroke="#3A3A48" stroke-width="2"/>
        <line x1="158" y1="144" x2="210" y2="144" stroke="#3A3A48" stroke-width="2"/>
        <line x1="158" y1="154" x2="210" y2="154" stroke="#3A3A48" stroke-width="2"/>
        <circle cx="164" cy="108" r="2.2" fill="#B87333"/>
        <circle cx="174" cy="108" r="2.2" fill="#B87333"/>
        <circle cx="184" cy="108" r="2.2" fill="#B87333"/>
        <circle cx="194" cy="108" r="2.2" fill="#B87333"/>
        <circle cx="204" cy="108" r="2.2" fill="#B87333"/>
        <rect x="218" y="108" width="10" height="54" rx="2" fill="#18181F" stroke="${rgb.primary}" stroke-opacity="${isRgbOn ? "0.7" : "0.2"}" stroke-width="1.2"/>
      </g>`;
  } else {
    cpuCoolerSvg = `
      <g>
        <path d="M204 128 C238 118, 254 88, 274 62" stroke="#1E1E26" stroke-width="7.5" stroke-linecap="round" fill="none"/>
        <path d="M204 128 C238 118, 254 88, 274 62" stroke="#3A3A4A" stroke-width="1.5" stroke-dasharray="3 3" stroke-linecap="round" fill="none"/>
        <path d="M204 140 C244 134, 266 98, 290 62" stroke="#1E1E26" stroke-width="7.5" stroke-linecap="round" fill="none"/>
        <path d="M204 140 C244 134, 266 98, 290 62" stroke="#3A3A4A" stroke-width="1.5" stroke-dasharray="3 3" stroke-linecap="round" fill="none"/>
        <circle cx="184" cy="136" r="25" fill="#14141A" stroke="url(#rgbGrad)" stroke-width="${isRgbOn ? "3" : "1.6"}"/>
        <circle cx="184" cy="136" r="18" fill="#0B0B0E"/>
        <text x="184" y="135" text-anchor="middle" fill="#FFFFFF" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700">${escapeHtml(parts.cooling.tempLabel)}</text>
        <text x="184" y="145" text-anchor="middle" fill="${rgb.primary}" font-family="JetBrains Mono, monospace" font-size="6.5">CPU AIO</text>
      </g>`;
  }

  const gpuWidth = gpuTier === 1 ? 152 : gpuTier === 2 ? 186 : gpuTier === 3 ? 204 : 216;
  const gpuHeight = gpuTier === 1 ? 30 : gpuTier === 2 ? 36 : gpuTier === 3 ? 42 : 48;
  const gpuLabel = parts.gpu.name.replace("GeForce ", "").split(" ").slice(0, 3).join(" ");

  const gpuSvg = `
    <g>
      <rect x="82" y="198" width="${gpuWidth}" height="${gpuHeight}" rx="5" fill="#1C1C24" stroke="#454556" stroke-width="1.6"/>
      <rect x="82" y="198" width="${gpuWidth}" height="5" rx="2" fill="#2A2A35"/>
      <line x1="94" y1="205" x2="${82 + gpuWidth - 14}" y2="205" stroke="url(#rgbGrad)" stroke-opacity="${isRgbOn ? "0.95" : "0.18"}" stroke-width="${gpuTier >= 3 ? "3" : "2"}" stroke-linecap="round"/>
      <text x="96" y="${198 + gpuHeight / 2 + 5}" fill="#E4E4EE" font-family="JetBrains Mono, monospace" font-size="9.5" font-weight="600">${escapeHtml(gpuLabel)}</text>
      <path d="M${82 + gpuWidth - 36} ${198 + gpuHeight} C${82 + gpuWidth - 34} ${198 + gpuHeight + 22}, ${82 + gpuWidth - 16} ${198 + gpuHeight + 24}, ${82 + gpuWidth - 8} 266" stroke="#2D2D38" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M${82 + gpuWidth - 36} ${198 + gpuHeight} C${82 + gpuWidth - 34} ${198 + gpuHeight + 22}, ${82 + gpuWidth - 16} ${198 + gpuHeight + 24}, ${82 + gpuWidth - 8} 266" stroke="${rgb.primary}" stroke-opacity="${isRgbOn ? "0.45" : "0.1"}" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
    </g>`;

  stage.innerHTML = `
    <svg viewBox="0 0 430 350" fill="none" class="w-full max-w-[400px] h-auto select-none" role="img" aria-label="Визуализация собираемого ПК">
      <defs>
        <linearGradient id="rgbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${rgb.primary}"/>
          <stop offset="100%" stop-color="${rgb.secondary}"/>
        </linearGradient>
        <linearGradient id="glassReflect" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.11"/>
          <stop offset="35%" stop-color="#FFFFFF" stop-opacity="0.02"/>
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
      </defs>

      <ellipse cx="215" cy="334" rx="176" ry="9" fill="#000000" fill-opacity="0.58"/>
      <rect x="66" y="314" width="38" height="14" rx="4" fill="${cv.trim}" stroke="${cv.stroke}" stroke-width="1.2"/>
      <rect x="326" y="314" width="38" height="14" rx="4" fill="${cv.trim}" stroke="${cv.stroke}" stroke-width="1.2"/>

      <rect x="44" y="22" width="342" height="296" rx="18" fill="${cv.shell}" stroke="${cv.stroke}" stroke-width="2.2"/>
      <rect x="60" y="36" width="${isPanoramic ? "318" : "306"}" height="268" rx="11" fill="${cv.interior}" stroke="${cv.stroke}" stroke-opacity="0.7" stroke-width="1.4"/>

      <rect x="92" y="80" width="194" height="184" rx="6" fill="#15151C" stroke="#282834" stroke-width="1.2"/>
      <rect x="102" y="92" width="22" height="74" rx="3" fill="#23232E"/>
      <rect x="130" y="88" width="90" height="12" rx="2.5" fill="#23232E"/>
      <rect x="134" y="176" width="84" height="12" rx="2.5" fill="#242430" stroke="#3A3A48" stroke-width="1"/>
      <text x="176" y="185" text-anchor="middle" fill="#8C8C9E" font-family="JetBrains Mono, monospace" font-size="6.5">${escapeHtml(parts.ssd.name.split(" ")[0] + " ТБ NVMe")}</text>

      <g>
        <circle cx="88" cy="134" r="20" fill="#121217" stroke="${rgb.secondary}" stroke-opacity="${isRgbOn ? "0.75" : "0.2"}" stroke-width="1.8"/>
        <g class="pc-fan-blades-fast">
          <line x1="88" y1="118" x2="88" y2="150" stroke="${rgb.primary}" stroke-opacity="${isRgbOn ? "0.6" : "0.2"}" stroke-width="3" stroke-linecap="round"/>
          <line x1="72" y1="134" x2="104" y2="134" stroke="${rgb.secondary}" stroke-opacity="${isRgbOn ? "0.6" : "0.2"}" stroke-width="3" stroke-linecap="round"/>
        </g>
        <circle cx="88" cy="134" r="5" fill="#1A1A22"/>
      </g>

      ${topRadiatorSvg}
      ${frontFansSvg}
      ${ramSvg}
      ${cpuCoolerSvg}
      ${gpuSvg}

      <path d="M62 268 H326 V294 C326 299 322 303 317 303 H71 C66 303 62 299 62 294 Z" fill="#14141A" stroke="#2B2B36" stroke-width="1.2"/>
      <rect x="84" y="278" width="94" height="15" rx="3" fill="#0E0E12" stroke="#2D2D3A" stroke-width="1"/>
      <text x="131" y="288.5" text-anchor="middle" fill="#B8B8C4" font-family="JetBrains Mono, monospace" font-size="8" font-weight="600">${evalData.psuWatts}W ATX 3.0</text>
      <line x1="202" y1="286" x2="306" y2="286" stroke="url(#rgbGrad)" stroke-opacity="${isRgbOn ? "0.75" : "0.14"}" stroke-width="2.2" stroke-linecap="round"/>

      <path d="M64 40 H240 L110 300 H64 Z" fill="url(#glassReflect)" pointer-events="none"/>
    </svg>
  `;
}
