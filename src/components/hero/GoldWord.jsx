import { useEffect, useId, useRef } from 'react';
import gsap from 'gsap';
import styles from './GoldWord.module.css';

// Columnas de la superficie del líquido: suficientes para una ola suave, baratas de simular.
const COLUMNS = 56;
const BASE_LEVEL = 0.42; // fracción de la altura de la palabra llena de dorado
const HOVER_LEVEL = 0.54;
const BASELINE = 160;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Palabra gigante "Café" rellena de dorado como un líquido.
 * El relleno es una superficie con física de muelles: el cursor la empuja,
 * la inclina hacia él y la ola se propaga y se calma sola.
 */
export default function GoldWord({ text = 'Café' }) {
  const clipId = useId().replace(/:/g, '');
  const svgRef = useRef(null);
  const textRef = useRef(null);
  const liquidRef = useRef(null);
  const hitRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    const textEl = textRef.current;
    const liquid = liquidRef.current;
    if (!svg || !textEl || !liquid) return undefined;

    const box = { x: 0, y: 0, w: 480, h: 200 };
    const heights = new Float32Array(COLUMNS);
    const velocity = new Float32Array(COLUMNS);
    const state = { level: 0, tilt: 0, tiltTarget: 0, hovering: false, lastX: null, lastY: null, time: 0 };
    const reduced = prefersReducedMotion();
    let frame = 0;
    let visible = true;

    const measure = () => {
      if (typeof textEl.getBBox !== 'function') return;
      const b = textEl.getBBox();
      if (!b.width) return;
      const pad = 6;
      box.x = b.x - pad;
      box.y = b.y - pad;
      box.w = b.width + pad * 2;
      // "Café" no tiene descendentes: la caja termina en la línea base, no en el hueco de la fuente.
      box.h = Math.min(b.y + b.height, BASELINE) + pad - box.y;
      svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.w} ${box.h}`);
      const hit = hitRef.current;
      if (hit) {
        hit.setAttribute('x', box.x);
        hit.setAttribute('y', box.y);
        hit.setAttribute('width', box.w);
        hit.setAttribute('height', box.h);
      }
    };

    const draw = () => {
      const surface = box.y + box.h * (1 - state.level);
      const bottom = box.y + box.h;
      const step = box.w / (COLUMNS - 1);
      const ambient = reduced ? 0 : 2.2;
      const points = [];
      for (let i = 0; i < COLUMNS; i += 1) {
        const t = i / (COLUMNS - 1);
        const wave = Math.sin(t * 7 + state.time * 1.6) * ambient + Math.sin(t * 13 - state.time * 1.1) * ambient * 0.5;
        points.push([box.x + i * step, surface + heights[i] - state.tilt * (t - 0.5) * box.h + wave]);
      }
      let d = `M ${box.x} ${bottom} L ${points[0][0]} ${points[0][1]}`;
      for (let i = 1; i < points.length; i += 1) {
        const [px, py] = points[i - 1];
        const [x, y] = points[i];
        d += ` Q ${px} ${py} ${(px + x) / 2} ${(py + y) / 2}`;
      }
      const last = points[points.length - 1];
      d += ` L ${last[0]} ${last[1]} L ${box.x + box.w} ${bottom} Z`;
      liquid.setAttribute('d', d);
    };

    const tick = () => {
      frame = 0;
      state.time += 1 / 60;
      state.tilt += (state.tiltTarget - state.tilt) * 0.08;
      // Ecuación de onda discreta: cada columna vuelve a su sitio y arrastra a sus vecinas.
      for (let i = 0; i < COLUMNS; i += 1) {
        const left = heights[i - 1] ?? heights[i];
        const right = heights[i + 1] ?? heights[i];
        velocity[i] += -heights[i] * 0.025 + (left + right - 2 * heights[i]) * 0.22;
        velocity[i] *= 0.955;
      }
      for (let i = 0; i < COLUMNS; i += 1) heights[i] += velocity[i];
      draw();
      if (visible) frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!reduced && !frame && visible) frame = requestAnimationFrame(tick);
    };

    const toLocal = (event) => {
      const rect = svg.getBoundingClientRect();
      return { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
    };

    const onMove = (event) => {
      const p = toLocal(event);
      const column = Math.round(p.x * (COLUMNS - 1));
      const dx = state.lastX === null ? 0 : p.x - state.lastX;
      const dy = state.lastY === null ? 0 : p.y - state.lastY;
      state.lastX = p.x;
      state.lastY = p.y;
      // El cursor empuja el líquido en la dirección en que se mueve.
      const push = (dy * 1.4 + Math.abs(dx) * 0.6) * box.h * 0.9;
      for (let i = Math.max(0, column - 4); i <= Math.min(COLUMNS - 1, column + 4); i += 1) {
        const falloff = 1 - Math.abs(i - column) / 5;
        velocity[i] += push * falloff * 0.35;
      }
      // La superficie se inclina hacia el cursor, como si lo buscara.
      state.tiltTarget = (p.x - 0.5) * 0.32;
    };

    const onEnter = (event) => {
      state.hovering = true;
      const p = toLocal(event);
      state.lastX = p.x;
      state.lastY = p.y;
      gsap.to(state, { level: HOVER_LEVEL, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    };

    const onLeave = () => {
      state.hovering = false;
      state.tiltTarget = 0;
      state.lastX = null;
      state.lastY = null;
      gsap.to(state, { level: BASE_LEVEL, duration: 0.9, ease: 'power2.inOut', overwrite: 'auto' });
    };

    const onTap = (event) => {
      const p = toLocal(event);
      const column = Math.round(p.x * (COLUMNS - 1));
      velocity[column] -= box.h * 0.06;
    };

    let observer;
    const init = () => {
      measure();
      if (reduced) {
        state.level = BASE_LEVEL;
        draw();
        return;
      }
      // Entrada: la palabra se llena como una taza.
      // Ocurre la primera vez que la palabra entra en pantalla (ahora vive al final de la página).
      let filled = false;
      const fill = () => {
        if (filled) return;
        filled = true;
        gsap.to(state, { level: BASE_LEVEL, duration: 2.2, delay: 0.25, ease: 'power3.out' });
      };
      svg.addEventListener('pointerenter', onEnter);
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerleave', onLeave);
      svg.addEventListener('pointerdown', onTap);
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible) {
            fill();
            start();
          }
        });
        observer.observe(svg);
      }
      if (!observer) fill();
      start();
    };

    draw();
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    let cancelled = false;
    if (fonts?.ready) {
      fonts.ready.then(() => !cancelled && init());
    } else {
      init();
    }
    window.addEventListener('resize', measure);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      gsap.killTweensOf(state);
      window.removeEventListener('resize', measure);
      svg.removeEventListener('pointerenter', onEnter);
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerleave', onLeave);
      svg.removeEventListener('pointerdown', onTap);
    };
  }, []);

  return (
    <svg ref={svgRef} className={styles.word} viewBox="0 0 480 200" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clipId}>
          <text x="0" y={BASELINE} className={styles.glyphs}>
            {text}
          </text>
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <path ref={liquidRef} className={styles.liquid} d="" />
      </g>
      {/* Zona de contacto: toda la caja de la palabra reacciona, no solo el trazo. */}
      <rect ref={hitRef} className={styles.hit} x="0" y="0" width="480" height="200" />
      <text ref={textRef} x="0" y={BASELINE} className={`${styles.glyphs} ${styles.outline}`}>
        {text}
      </text>
    </svg>
  );
}
