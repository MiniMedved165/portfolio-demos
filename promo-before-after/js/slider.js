/**
 * Управляет интерактивной шторкой «До / После» (Pointer Events, Scroll-Sync, Auto-Demo, клавиатура).
 */
export function createComparisonSlider({ dom, state, showToast }) {
  function setCurtainPosition(percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    state.sliderPercent = clamped;
    const rightInset = 100 - clamped;
    dom.beforeClipLayer.style.clipPath = `inset(0 ${rightInset}% 0 0)`;
    dom.curtainDivider.style.left = `${clamped}%`;

    const roundedBefore = Math.round(clamped);
    const roundedAfter = 100 - roundedBefore;
    dom.beforePctLabel.textContent = `${roundedBefore}%`;
    dom.afterPctLabel.textContent = `${roundedAfter}%`;
    dom.curtainHandle.setAttribute("aria-valuenow", String(roundedBefore));
  }

  function updateScrollSyncUI() {
    if (state.scrollLinked) {
      dom.scrollSyncToggleBtn.className =
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono hairline bg-emerald-500/10 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/20 transition-colors";
      dom.scrollSyncDot.className = "w-1.5 h-1.5 rounded-full bg-emerald-400";
      dom.scrollSyncLabel.textContent = "Скролл-шторка: ВКЛ";
    } else {
      dom.scrollSyncToggleBtn.className =
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono hairline bg-asphalt text-steel hover:text-white hover:border-white/25 transition-colors";
      dom.scrollSyncDot.className = "w-1.5 h-1.5 rounded-full bg-steel/60";
      dom.scrollSyncLabel.textContent = "Скролл-шторка: ручной";
    }
  }

  /**
   * Проецирует вертикальную позицию блока сравнения на ширину шторки (от 84% «ДО» к 16% «ПОСЛЕ»).
   */
  function syncCurtainWithScroll() {
    if (!state.scrollLinked || state.isDragging || state.autoDemoRaf) return;
    const rect = dom.compareStage.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;

    const startPoint = viewportH * 0.88;
    const endPoint = viewportH * 0.14 - rect.height * 0.25;
    const rawProgress = (startPoint - rect.top) / (startPoint - endPoint);
    const progress = Math.max(0, Math.min(1, rawProgress));

    setCurtainPosition(84 - progress * 68);
  }

  function stopAutoDemo() {
    if (state.autoDemoRaf) {
      cancelAnimationFrame(state.autoDemoRaf);
      state.autoDemoRaf = null;
      dom.autoDemoLabel.textContent = "Авто-демо";
    }
  }

  function setScrollLinked(enabled) {
    state.scrollLinked = enabled;
    updateScrollSyncUI();
    if (enabled) {
      stopAutoDemo();
      syncCurtainWithScroll();
    }
  }

  // Синусоидальное движение шторки вокруг центра (12%..88%)
  function startAutoDemo() {
    if (state.autoDemoRaf) {
      stopAutoDemo();
      return;
    }
    setScrollLinked(false);
    dom.autoDemoLabel.textContent = "Стоп";
    const startTime = performance.now();
    const duration = 3400;

    function animate(now) {
      const elapsed = (now - startTime) % duration;
      const progress = elapsed / duration;
      const pos = 50 + Math.sin(progress * Math.PI * 2) * 38;
      setCurtainPosition(pos);
      state.autoDemoRaf = requestAnimationFrame(animate);
    }
    state.autoDemoRaf = requestAnimationFrame(animate);
  }

  function init() {
    const updateFromClientX = (clientX) => {
      const rect = dom.compareStage.getBoundingClientRect();
      if (!rect.width) return;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setCurtainPosition(pct);
    };

    dom.compareStage.addEventListener("pointerdown", (e) => {
      stopAutoDemo();
      setScrollLinked(false);
      state.isDragging = true;
      dom.compareStage.classList.add("is-dragging");
      if (dom.compareStage.setPointerCapture) {
        dom.compareStage.setPointerCapture(e.pointerId);
      }
      updateFromClientX(e.clientX);
    });

    dom.compareStage.addEventListener("pointermove", (e) => {
      if (!state.isDragging) return;
      updateFromClientX(e.clientX);
    });

    const endDrag = () => {
      state.isDragging = false;
      dom.compareStage.classList.remove("is-dragging");
    };

    dom.compareStage.addEventListener("pointerup", endDrag);
    dom.compareStage.addEventListener("pointercancel", endDrag);

    dom.curtainHandle.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        stopAutoDemo();
        setScrollLinked(false);
        setCurtainPosition(state.sliderPercent - 5);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stopAutoDemo();
        setScrollLinked(false);
        setCurtainPosition(state.sliderPercent + 5);
      } else if (e.key === "Home") {
        e.preventDefault();
        stopAutoDemo();
        setScrollLinked(false);
        setCurtainPosition(0);
      } else if (e.key === "End") {
        e.preventDefault();
        stopAutoDemo();
        setScrollLinked(false);
        setCurtainPosition(100);
      }
    });

    document.querySelectorAll(".snap-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        stopAutoDemo();
        setScrollLinked(false);
        setCurtainPosition(Number(btn.dataset.snap));
      });
    });

    dom.scrollSyncToggleBtn.addEventListener("click", () => {
      setScrollLinked(!state.scrollLinked);
      showToast(state.scrollLinked ? "Шторка снова реагирует на прокрутку" : "Включён ручной режим шторки");
    });

    dom.autoDemoBtn.addEventListener("click", startAutoDemo);

    const onScroll = () => {
      if (!state.scrollLinked || state.scrollRafPending) return;
      state.scrollRafPending = true;
      requestAnimationFrame(() => {
        state.scrollRafPending = false;
        syncCurtainWithScroll();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }

  return {
    init,
    setCurtainPosition,
    updateScrollSyncUI,
    syncCurtainWithScroll,
    stopAutoDemo
  };
}
