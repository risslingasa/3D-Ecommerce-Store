import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  COLOURWAYS,
  getGarmentTitle,
  getProductByCol,
  getSpritePosition,
  RING_PIECES,
  SHEET_URL,
} from '@/src/data/catalog';
import { useStore } from '@/src/context/StoreContext';

const CX = 718;
const CY = 418;
const R = 411;
const DROP = 110;
const S0 = 0.97;
const TILT = 9;
const N = 6;
const STEP = (Math.PI * 2) / N;
const OMEGA = STEP / 4.2;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function isPhonePortrait() {
  return window.innerWidth <= 820 && window.innerHeight >= 521;
}

export function HeroRing() {
  const { totalCount, addToCart, setBagOpen, setMenuOpen, openPdp } = useStore();

  const [pieceRows, setPieceRows] = useState<number[]>(() =>
    RING_PIECES.map((p) => p.startRow)
  );
  const pieceRowsRef = useRef<number[]>(pieceRows);
  pieceRowsRef.current = pieceRows;

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeDot, setActiveDot] = useState<number>(0);
  const [indexNumber, setIndexNumber] = useState<string>('01');
  const [indexKind, setIndexKind] = useState<string>('ROMPER');
  const [addedFeedback, setAddedFeedback] = useState<boolean>(false);

  const heroRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const artRefs = useRef<(HTMLDivElement | null)[]>([]);
  const art2Refs = useRef<(HTMLDivElement | null)[]>([]);
  const shadowRef = useRef<HTMLDivElement | null>(null);
  const dotsRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const bagBtnRef = useRef<HTMLButtonElement | null>(null);
  const badgeRef = useRef<HTMLSpanElement | null>(null);
  const indexNumRef = useRef<HTMLSpanElement | null>(null);

  // Chrome refs for staggered entrance
  const logoRef = useRef<HTMLAnchorElement | null>(null);
  const taglineRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const leftLabelRef = useRef<HTMLDivElement | null>(null);
  const rightLabelRef = useRef<HTMLDivElement | null>(null);
  const vertLabelRef = useRef<HTMLDivElement | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const indexBlockRef = useRef<HTMLDivElement | null>(null);
  const scrollHintRef = useRef<HTMLButtonElement | null>(null);

  // Mutable simulation state (never causes React re-renders per frame)
  const simRef = useRef({
    base: 0,
    fling: 0,
    autoWeight: 1,
    dragging: false,
    wasDrag: false,
    pointerId: -1,
    startX: 0,
    lastX: 0,
    lastMoveTime: 0,
    accumPx: 0,
    velocity: 0,

    // Detail transition
    openIdx: -1,
    detailTarget: 0,
    detailVal: 0,
    detailStartVal: 0,
    detailStartTime: 0,
    detailDuration: 560,
    chosenRingX: CX,

    // Entrance
    entered: 0,
    entranceStarted: false,
    entranceStartTime: 0,
    reducedMotion: false,

    // Swatch scale bounce
    bounceIdx: -1,
    bounceStart: 0,
    bounceDuration: 420,

    // Front piece tracker
    frontIdx: 0,
    swapTimer: 0,
    addedTimer: 0,
    rollTimer: 0,
    currentDisplayNum: '01',
  });

  // Trigger vertical rolling animation on the bottom-left index number
  const rollIndexTo = useCallback((nextNum: string, nextKind: string) => {
    const sim = simRef.current;
    setIndexKind(nextKind);
    if (sim.currentDisplayNum === nextNum) return;
    sim.currentDisplayNum = nextNum;

    const numEl = indexNumRef.current;
    if (!numEl || sim.reducedMotion) {
      setIndexNumber(nextNum);
      return;
    }

    if (sim.rollTimer) {
      window.clearTimeout(sim.rollTimer);
    }

    numEl.style.transition = 'transform 0.7s cubic-bezier(0.65, 0, 0.35, 1)';
    numEl.style.transform = 'translateY(-110%)';

    sim.rollTimer = window.setTimeout(() => {
      setIndexNumber(nextNum);
      numEl.style.transition = 'none';
      numEl.style.transform = 'translateY(110%)';
      // Force layout reflow before sliding back to 0
      void numEl.offsetHeight;
      numEl.style.transition = 'transform 0.7s cubic-bezier(0.65, 0, 0.35, 1)';
      numEl.style.transform = 'translateY(0%)';
    }, 300);
  }, []);

  const openPiece = useCallback(
    (idx: number) => {
      const sim = simRef.current;
      if (sim.openIdx === idx && sim.detailTarget === 1) return;

      const theta = sim.base + idx * STEP;
      sim.chosenRingX = CX + R * Math.sin(theta);
      sim.openIdx = idx;
      sim.detailStartVal = sim.detailVal;
      sim.detailTarget = 1;
      sim.detailStartTime = performance.now();
      sim.detailDuration = sim.reducedMotion ? 1 : 560;
      sim.fling = 0;

      setOpenIndex(idx);
      setAddedFeedback(false);

      const piece = RING_PIECES[idx];
      const product = getProductByCol(piece.col);
      rollIndexTo(String(idx + 1).padStart(2, '0'), product.shortLabel);

      window.setTimeout(() => {
        closeBtnRef.current?.focus({ preventScroll: true });
      }, sim.reducedMotion ? 10 : 280);
    },
    [rollIndexTo]
  );

  const closePiece = useCallback(() => {
    const sim = simRef.current;
    if (sim.openIdx === -1 || sim.detailTarget === 0) return;

    const prevIdx = sim.openIdx;
    sim.detailStartVal = sim.detailVal;
    sim.detailTarget = 0;
    sim.detailStartTime = performance.now();
    sim.detailDuration = sim.reducedMotion ? 1 : 560;

    setOpenIndex(null);
    setAddedFeedback(false);
    rollIndexTo('01', 'ROMPER');

    window.setTimeout(() => {
      itemRefs.current[prevIdx]?.focus({ preventScroll: true });
    }, 50);
  }, [rollIndexTo]);

  // Escape key closes hero product view
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && simRef.current.detailTarget === 1) {
        closePiece();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closePiece]);

  // Entrance sequence + main 60fps animation loop
  useEffect(() => {
    const sim = simRef.current;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    sim.reducedMotion = mq.matches;
    const onMqChange = (ev: MediaQueryListEvent) => {
      sim.reducedMotion = ev.matches;
    };
    mq.addEventListener('change', onMqChange);

    // Chrome elements in exact specification order:
    // logo, tagline, nav, left label, right label, vertical label, ghost, shadow, dots, index, scroll hint
    const chromeEls: Array<{ el: HTMLElement | null; isGhost?: boolean }> = [
      { el: logoRef.current },
      { el: taglineRef.current },
      { el: navRef.current },
      { el: leftLabelRef.current },
      { el: rightLabelRef.current },
      { el: vertLabelRef.current },
      { el: ghostRef.current, isGhost: true },
      { el: shadowRef.current },
      { el: dotsRef.current },
      { el: indexBlockRef.current },
      { el: scrollHintRef.current },
    ];

    if (!sim.reducedMotion) {
      chromeEls.forEach(({ el }) => el?.classList.add('rv'));
    } else {
      sim.entered = 1;
      sim.entranceStarted = true;
    }

    let revealed = false;
    const startEntrance = () => {
      if (revealed) return;
      revealed = true;

      if (sim.reducedMotion) {
        chromeEls.forEach(({ el }) => el?.classList.remove('rv'));
        sim.entered = 1;
        sim.entranceStarted = true;
        return;
      }

      sim.entranceStarted = true;
      sim.entranceStartTime = performance.now() + 300;

      chromeEls.forEach(({ el, isGhost }, order) => {
        if (!el) return;
        const computed = window.getComputedStyle(el).transform;
        const baseTransform = computed && computed !== 'none' ? computed : '';
        const yOffset = isGhost ? 40 : 14;
        const duration = isGhost ? 1400 : 1000;
        const delay = isGhost ? 150 : 80 + 60 * order;

        const anim = el.animate(
          [
            {
              opacity: 0,
              transform: `${baseTransform} translateY(${yOffset}px)`.trim(),
            },
            {
              opacity: 1,
              transform: baseTransform || 'none',
            },
          ],
          {
            duration,
            delay,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'forwards',
          }
        );

        anim.onfinish = () => {
          el.classList.remove('rv');
          anim.cancel();
        };
      });
    };

    // Wait for sprite sheet load with 2.5s failsafe
    const img = new Image();
    img.onload = startEntrance;
    img.onerror = startEntrance;
    img.src = SHEET_URL;
    const failsafeTimer = window.setTimeout(startEntrance, 2500);

    // Core 60fps animation frame loop
    let rafId = 0;
    let lastTs = performance.now();

    const tick = (now: number) => {
      rafId = window.requestAnimationFrame(tick);

      const rawDt = (now - lastTs) / 1000;
      lastTs = now;
      const dt = document.hidden ? 0 : Math.min(0.05, Math.max(0, rawDt));

      // Entrance progress (0..1 over 1.6s after 300ms delay)
      if (!sim.reducedMotion && sim.entranceStarted && sim.entered < 1) {
        const elapsed = now - sim.entranceStartTime;
        sim.entered = clamp(elapsed / 1600, 0, 1);
      }

      // Detail blend interpolation (560ms ease-in-out cubic)
      if (sim.detailVal !== sim.detailTarget) {
        const t = clamp((now - sim.detailStartTime) / sim.detailDuration, 0, 1);
        const eased = easeInOutCubic(t);
        sim.detailVal =
          sim.detailStartVal + (sim.detailTarget - sim.detailStartVal) * eased;
        if (t >= 1) {
          sim.detailVal = sim.detailTarget;
          if (sim.detailTarget === 0) {
            sim.openIdx = -1;
          }
        }
      }

      const d = sim.detailVal;
      const isDetailActive = sim.detailTarget === 1 || d > 0.001;

      // Orbit & fling physics (paused while dragging or in product view)
      if (!sim.dragging && !isDetailActive && dt > 0) {
        if (Math.abs(sim.fling) >= 0.0005) {
          sim.base += sim.fling;
          sim.fling *= Math.pow(0.92, dt * 60);
          if (Math.abs(sim.fling) < 0.0005) {
            sim.fling = 0;
          }
        }
        if (sim.autoWeight < 1) {
          sim.autoWeight = Math.min(1, sim.autoWeight + 0.8 * dt);
        }
        if (!sim.reducedMotion) {
          sim.base += OMEGA * dt * sim.autoWeight;
        }
      }

      // Determine stage pixel scale factor u
      const stageEl = stageRef.current;
      const stageWidth = stageEl ? stageEl.getBoundingClientRect().width : 1440;
      const uPx = stageWidth / 1440;
      const phone = isPhonePortrait();

      const targetX = phone ? 716 : 470;
      const targetY = phone ? 300 : 425;
      const targetScale = phone ? 0.86 : 1.12;

      // Update close button coordinates
      const closeBtn = closeBtnRef.current;
      if (closeBtn) {
        const closeX = (targetX + 205 * targetScale) * uPx;
        const closeY = (targetY - 200 * targetScale) * uPx;
        closeBtn.style.left = `${closeX}px`;
        closeBtn.style.top = `${closeY}px`;
      }

      // Update floor shadow
      const shadowEl = shadowRef.current;
      if (shadowEl && !shadowEl.classList.contains('rv')) {
        const shX = (targetX - CX) * 0.82 * d * uPx;
        const shY = ((targetY - CY) * d - (phone ? 60 * d : 0)) * uPx;
        const shScaleX = 1 - 0.45 * d;
        shadowEl.style.transform = `translate(${shX}px, ${shY}px) scaleX(${shScaleX})`;
      }

      // Fade pagination dots in product view
      const dotsEl = dotsRef.current;
      if (dotsEl && !dotsEl.classList.contains('rv')) {
        dotsEl.style.opacity = String(1 - d);
      }

      // Compute bounce multiplier if active
      let bounceScale = 1;
      if (sim.bounceIdx !== -1) {
        const bt = (now - sim.bounceStart) / sim.bounceDuration;
        if (bt >= 1) {
          sim.bounceIdx = -1;
        } else if (bt >= 0) {
          bounceScale = 1 + 0.035 * Math.sin(Math.PI * bt);
        }
      }

      // Track front-most garment (largest cos θ)
      let bestCos = -2;
      let frontIdx = 0;

      for (let i = 0; i < N; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;

        const theta = sim.base + i * STEP;
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const k = (1 + c) / 2;

        if (c > bestCos) {
          bestCos = c;
          frontIdx = i;
        }

        let x = CX + R * s;
        let y = CY + (1 - k) * DROP;
        let scale = S0 * (0.72 + 0.28 * k);
        let rot = TILT * s;
        let opacity = 1;
        let zIndex = Math.round(k * 100) + 1;
        let pointerEvents: 'auto' | 'none' = 'auto';

        // Apply entrance lift & fade
        if (!sim.reducedMotion && sim.entered < 1) {
          const pieceProgress = clamp(
            (sim.entered * 1600 - (1 - c) * 260) / 1000,
            0,
            1
          );
          const pe = easeOutCubic(pieceProgress);
          y += (1 - pe) * 36;
          scale *= 0.95 + 0.05 * pe;
          opacity *= pe;
        }

        // Apply product view blend
        if (d > 0 && sim.openIdx !== -1) {
          if (i === sim.openIdx) {
            x = x + (targetX - x) * d;
            y = y + (targetY - y) * d;
            scale = scale + (targetScale - scale) * d;
            rot = rot * (1 - d);
            zIndex = 300;
            if (sim.bounceIdx === i) {
              scale *= bounceScale;
            }
          } else {
            const dir = x >= sim.chosenRingX ? 1 : -1;
            x += dir * 240 * d;
            scale *= 1 - 0.45 * d;
            opacity *= Math.max(0, 1 - 1.4 * d);
            pointerEvents = 'none';
          }
        }

        el.style.transform = `translate(${x * uPx}px, ${y * uPx}px) scale(${scale}) rotate(${rot}deg)`;
        el.style.opacity = String(opacity);
        el.style.zIndex = String(zIndex);
        el.style.pointerEvents = pointerEvents;
      }

      if (frontIdx !== sim.frontIdx) {
        sim.frontIdx = frontIdx;
        setActiveDot(frontIdx % 5);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(failsafeTimer);
      mq.removeEventListener('change', onMqChange);
    };
  }, []);

  // Drag & fling pointer handlers on stage + window
  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    const onPointerDown = (e: PointerEvent) => {
      const sim = simRef.current;
      if (e.button !== 0 || sim.detailTarget === 1 || sim.detailVal > 0.01) return;
      // Do not start drag from close button or product panel
      const target = e.target as HTMLElement | null;
      if (target?.closest('.hero-panel') || target?.closest('.hero-close-btn')) {
        return;
      }

      sim.dragging = true;
      sim.wasDrag = false;
      sim.pointerId = e.pointerId;
      sim.startX = e.clientX;
      sim.lastX = e.clientX;
      sim.lastMoveTime = performance.now();
      sim.accumPx = 0;
      sim.velocity = 0;
      sim.fling = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      const sim = simRef.current;
      if (!sim.dragging || e.pointerId !== sim.pointerId) return;

      const stageWidth = stageEl.getBoundingClientRect().width || 1440;
      const scale = stageWidth / 1440;
      const rawDx = e.clientX - sim.lastX;
      const dxDesign = rawDx / scale;
      const now = performance.now();
      const dtMs = Math.max(4, now - sim.lastMoveTime);

      sim.lastX = e.clientX;
      sim.lastMoveTime = now;
      sim.accumPx += Math.abs(dxDesign);

      const dTheta = dxDesign / R;
      sim.base += dTheta;
      const dThetaPerFrame = dTheta * (16.7 / dtMs);
      sim.velocity = 0.6 * sim.velocity + 0.4 * dThetaPerFrame;

      if (!sim.wasDrag && sim.accumPx > 6) {
        sim.wasDrag = true;
        stageEl.classList.add('dragging');
        try {
          stageEl.setPointerCapture(e.pointerId);
        } catch {
          // Ignore capture failures if element detached
        }
      }
    };

    const finishDrag = (e: PointerEvent) => {
      const sim = simRef.current;
      if (!sim.dragging || e.pointerId !== sim.pointerId) return;

      sim.dragging = false;
      stageEl.classList.remove('dragging');
      try {
        if (stageEl.hasPointerCapture(e.pointerId)) {
          stageEl.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore release errors
      }

      if (sim.wasDrag) {
        sim.fling = clamp(sim.velocity, -0.12, 0.12);
        sim.autoWeight = 0;
        // Clear wasDrag on next tick so click handler knows it was a drag
        window.setTimeout(() => {
          sim.wasDrag = false;
        }, 0);
      }
    };

    stageEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);

    return () => {
      stageEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
    };
  }, []);

  // Colourway swatch click with 350ms .art2 cross-fade + 420ms scale bounce
  const handleSelectSwatch = (newRow: number) => {
    if (openIndex === null) return;
    const currentRow = pieceRowsRef.current[openIndex];
    if (currentRow === newRow) return;

    const sim = simRef.current;
    const piece = RING_PIECES[openIndex];
    const artEl = artRefs.current[openIndex];
    const art2El = art2Refs.current[openIndex];
    const nextPos = getSpritePosition(piece.col, newRow);

    setPieceRows((prev) => prev.map((r, i) => (i === openIndex ? newRow : r)));

    if (sim.reducedMotion || !artEl || !art2El) {
      if (artEl) artEl.style.backgroundPosition = nextPos;
      return;
    }

    if (sim.swapTimer) {
      window.clearTimeout(sim.swapTimer);
    }

    art2El.classList.remove('swap');
    art2El.style.opacity = '0';
    art2El.style.backgroundPosition = nextPos;
    void art2El.offsetHeight;
    art2El.classList.add('swap');
    art2El.style.opacity = '1';

    const targetIdx = openIndex;
    sim.swapTimer = window.setTimeout(() => {
      artEl.style.backgroundPosition = nextPos;
      art2El.classList.remove('swap');
      art2El.style.opacity = '0';
      sim.bounceIdx = targetIdx;
      sim.bounceStart = performance.now();
    }, 360);
  };

  // Exact 25-keyframe quadratic Bézier fly-to-bag animation
  const handleHeroAddToBag = () => {
    if (openIndex === null) return;
    const sim = simRef.current;
    const piece = RING_PIECES[openIndex];
    const row = pieceRowsRef.current[openIndex];
    const product = getProductByCol(piece.col);

    // Button feedback: "ADDED TO BAG ✓" for 1.8s
    setAddedFeedback(true);
    if (sim.addedTimer) window.clearTimeout(sim.addedTimer);
    sim.addedTimer = window.setTimeout(() => setAddedFeedback(false), 1800);

    const triggerBagLanding = () => {
      void addToCart(piece.col, row, product.defaultSize, 1);

      if (sim.reducedMotion) return;

      const bagEl = bagBtnRef.current;
      const badgeEl = badgeRef.current;

      bagEl?.animate(
        [
          { transform: 'scale(1) rotate(0deg)' },
          { transform: 'scale(1.28) rotate(-8deg)', offset: 0.35 },
          { transform: 'scale(0.94) rotate(4deg)', offset: 0.7 },
          { transform: 'scale(1) rotate(0deg)' },
        ],
        { duration: 520, easing: 'ease-out' }
      );

      badgeEl?.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.45)', offset: 0.45 },
          { transform: 'scale(1)' },
        ],
        { duration: 420, delay: 60, easing: 'ease-out' }
      );
    };

    const itemEl = itemRefs.current[openIndex];
    const bagEl = bagBtnRef.current;

    if (sim.reducedMotion || !itemEl || !bagEl) {
      triggerBagLanding();
      return;
    }

    const startRect = itemEl.getBoundingClientRect();
    const bagRect = bagEl.getBoundingClientRect();

    const fly = document.createElement('div');
    fly.className = 'fly';
    fly.style.left = `${startRect.left}px`;
    fly.style.top = `${startRect.top}px`;
    fly.style.width = `${startRect.width}px`;
    fly.style.height = `${startRect.height}px`;
    fly.style.backgroundPosition = getSpritePosition(piece.col, row);
    document.body.appendChild(fly);

    const startX = startRect.left;
    const startY = startRect.top;
    const finalScale = Math.max(0.04, (bagRect.width * 0.9) / startRect.width);
    const endX = bagRect.left + bagRect.width / 2 - (startRect.width * finalScale) / 2;
    const endY = bagRect.top + bagRect.height / 2 - (startRect.height * finalScale) / 2;

    const cpX = startX + 0.62 * (endX - startX);
    const cpY = Math.max(0, Math.min(startY, endY) - 0.12 * startRect.height);

    const frames: Keyframe[] = [];
    const steps = 24; // 25 keyframes (0..24)

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      const bx = u * u * startX + 2 * u * t * cpX + t * t * endX;
      const by = u * u * startY + 2 * u * t * cpY + t * t * endY;

      let scale: number;
      if (t <= 0.12) {
        scale = 1 + 0.06 * Math.sin((t / 0.12) * (Math.PI / 2));
      } else {
        const st = (t - 0.12) / 0.88;
        scale = 1.06 + (finalScale - 1.06) * Math.pow(st, 0.55);
      }

      const rot = -14 * Math.sin(Math.PI * t);
      const opacity = t > 0.9 ? 1 - 0.6 * ((t - 0.9) / 0.1) : 1;

      frames.push({
        transform: `translate(${bx - startX}px, ${by - startY}px) scale(${scale}) rotate(${rot}deg)`,
        opacity,
      });
    }

    const anim = fly.animate(frames, {
      duration: 950,
      easing: 'cubic-bezier(0.45, 0, 0.25, 1)',
      fill: 'forwards',
    });

    anim.onfinish = () => {
      fly.remove();
      triggerBagLanding();
    };
  };

  const scrollToCollection = () => {
    const el = document.getElementById('collection');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const activePiece = openIndex !== null ? RING_PIECES[openIndex] : RING_PIECES[0];
  const activeRow = openIndex !== null ? pieceRows[openIndex] : pieceRows[0];
  const activeProduct = getProductByCol(activePiece.col);
  const activeTitle = getGarmentTitle(activePiece.col, activeRow);

  const bagAriaLabel = `Bag, ${totalCount} ${totalCount === 1 ? 'item' : 'items'}`;

  return (
    <section
      ref={heroRef}
      className={`bunto-hero ${openIndex !== null ? 'detail' : ''}`}
      aria-label="BUNTO° Rotating Garment Showcase"
    >
      {/* 1. Logo (top-left) */}
      <a
        ref={logoRef}
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          if (openIndex !== null) closePiece();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="hero-logo"
      >
        BUNTO<sup>°</sup>
      </a>

      {/* 2. Tagline (top-centre) */}
      <div ref={taglineRef} className="hero-tagline caps">
        <div>SOFT THINGS FOR SMALL PEOPLE</div>
        <div>AGES 1–6</div>
      </div>

      {/* 3. Nav (top-right) */}
      <div ref={navRef} className="hero-nav">
        <button
          type="button"
          className="hero-menu-btn"
          onClick={() => setMenuOpen(true)}
        >
          MENU
        </button>
        <button
          ref={bagBtnRef}
          type="button"
          className="hero-bag-btn"
          aria-label={bagAriaLabel}
          onClick={() => setBagOpen(true)}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3.5 5.5h9l-.7 8h-7.6z" />
            <path d="M5.8 5.5V4.4a2.2 2.2 0 0 1 4.4 0v1.1" />
          </svg>
          <span
            ref={badgeRef}
            className={`hero-bag-badge ${totalCount > 0 ? 'visible' : ''}`}
            aria-hidden="true"
          >
            {totalCount}
          </span>
        </button>
      </div>

      {/* 4. Left label */}
      <div ref={leftLabelRef} className="hero-left-label caps">
        THE BASICS — 16 PIECES
      </div>

      {/* 5. Right label */}
      <div ref={rightLabelRef} className="hero-right-label caps">
        <div>ORGANIC COTTON</div>
        <div>KNIT</div>
      </div>

      {/* 6. Vertical label far left */}
      <div ref={vertLabelRef} className="hero-vert-label caps">
        EVERYDAY ESSENTIALS FOR LITTLE EXPLORERS
      </div>

      {/* 7. Bottom-left Index */}
      <div ref={indexBlockRef} className="hero-index">
        <div className="hero-index-num-wrap">
          <span ref={indexNumRef} className="hero-index-num">
            {indexNumber}
          </span>
        </div>
        <div className="hero-index-bar" aria-hidden="true" />
        <div className="hero-index-labels caps">
          <div className="hero-index-label-default">
            <div>{indexKind}</div>
            <div>COLLECTION</div>
          </div>
          <div className="hero-index-label-choose" aria-hidden={openIndex === null}>
            <div>CHOOSE</div>
            <div>A COLOUR</div>
          </div>
        </div>
      </div>

      {/* 8. Bottom-centre Scroll Hint */}
      <button
        ref={scrollHintRef}
        type="button"
        className="hero-scroll-hint"
        onClick={scrollToCollection}
        aria-label="Scroll to explore collection"
      >
        <svg
          viewBox="0 0 11 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5.5 1v13M1.5 10l4 4 4-4" />
        </svg>
        <span className="hero-scroll-hint-text caps">SCROLL TO EXPLORE</span>
      </button>

      {/* Centred 1440u × 900u Stage */}
      <div ref={stageRef} className="hero-stage">
        {/* Ghost word "TINY" */}
        <div ref={ghostRef} className="hero-ghost" aria-hidden="true">
          TINY
        </div>

        {/* Floor shadow */}
        <div ref={shadowRef} className="hero-shadow" aria-hidden="true" />

        {/* Pagination dots */}
        <div ref={dotsRef} className="hero-dots" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((dotIdx) => (
            <span
              key={dotIdx}
              className={`hero-dot ${activeDot === dotIdx ? 'active' : ''}`}
            />
          ))}
        </div>

        {/* Six Garments on the Ring */}
        {RING_PIECES.map((piece, i) => {
          const row = pieceRows[i];
          const label = getGarmentTitle(piece.col, row);
          const product = getProductByCol(piece.col);
          const initPos = getSpritePosition(piece.col, piece.startRow);

          return (
            <div
              key={piece.ringIndex}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              role="button"
              tabIndex={openIndex === null || openIndex === i ? 0 : -1}
              aria-label={label}
              className="hero-item"
              onMouseEnter={() => {
                if (simRef.current.detailTarget === 0) {
                  rollIndexTo(String(i + 1).padStart(2, '0'), product.shortLabel);
                }
              }}
              onMouseLeave={() => {
                if (simRef.current.detailTarget === 0) {
                  rollIndexTo('01', 'ROMPER');
                }
              }}
              onClick={() => {
                if (simRef.current.wasDrag) return;
                if (openIndex === null) {
                  openPiece(i);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (openIndex === null) {
                    openPiece(i);
                  }
                }
              }}
            >
              <div
                ref={(el) => {
                  artRefs.current[i] = el;
                }}
                className="art"
                style={{ backgroundPosition: initPos }}
              />
              <div
                ref={(el) => {
                  art2Refs.current[i] = el;
                }}
                className="art2"
                style={{ backgroundPosition: initPos }}
              />
            </div>
          );
        })}

        {/* Close Button (Product View Only) */}
        <button
          ref={closeBtnRef}
          type="button"
          className="hero-close-btn"
          aria-label="Close"
          tabIndex={openIndex !== null ? 0 : -1}
          onClick={closePiece}
        >
          <svg
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" />
          </svg>
        </button>

        {/* Product Panel (Product View Only) */}
        <div className="hero-panel" aria-hidden={openIndex === null}>
          <div className="hero-panel-cat">{activeProduct.category}</div>
          <h2 className="hero-panel-title">{activeTitle}</h2>
          <p className="hero-panel-desc">{activeProduct.description}</p>
          <div
            className="hero-swatches"
            role="radiogroup"
            aria-label="Colour"
          >
            {COLOURWAYS.map((swatch) => {
              const selected = activeRow === swatch.row;
              return (
                <button
                  key={swatch.name}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={swatch.name}
                  tabIndex={openIndex !== null ? 0 : -1}
                  className="hero-swatch"
                  style={{ backgroundColor: swatch.hex }}
                  onClick={() => handleSelectSwatch(swatch.row)}
                />
              );
            })}
          </div>
          <div className="hero-panel-actions">
            <button
              type="button"
              className="hero-add-btn"
              tabIndex={openIndex !== null ? 0 : -1}
              onClick={handleHeroAddToBag}
            >
              {addedFeedback ? 'ADDED TO BAG ✓' : 'ADD TO BAG →'}
            </button>
            <button
              type="button"
              className="hero-pdp-link"
              tabIndex={openIndex !== null ? 0 : -1}
              onClick={() => openPdp(activePiece.col, activeRow)}
            >
              FULL DETAILS &amp; SIZES
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
