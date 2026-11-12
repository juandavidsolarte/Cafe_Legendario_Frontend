import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { createFrameSequence, posterUrl } from './frameSequence';
import styles from './HeroGrano.module.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAMES = 49;
const HEADER_HEIGHT = 72;
// Deben coincidir con --zoom en HeroGrano.module.css (tamaño del póster inicial).
const ZOOM_WIDE = 0.64;
const ZOOM_NARROW = 0.8;

/**
 * Hero de la página: un grano de café quieto que solo se mueve con el scroll.
 * La sección queda fijada mientras el grano se agrieta, estalla y deja caer el chorro.
 */
export default function HeroGrano() {
  const root = useRef(null);
  const canvas = useRef(null);
  const [painted, setPainted] = useState(false);

  useGSAP(
    () => {
      // jsdom (pruebas) no tiene matchMedia ni canvas: se queda el póster.
      if (typeof window.matchMedia !== 'function' || !canvas.current?.getContext) return undefined;

      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', narrow: '(max-width: 899px)' },
        (context) => {
          const { motion, narrow } = context.conditions;
          if (!motion) return undefined;

          const sequence = createFrameSequence({
            canvas: canvas.current,
            name: 'grano',
            count: FRAMES,
            fit: 'focus',
            focus: 0.42,
            centerY: narrow ? 0.6 : 0.5,
            // Al inicio el grano se ve lejos: el cuadro se dibuja más pequeño y sus bordes se desvanecen.
            zoom: narrow ? ZOOM_NARROW : ZOOM_WIDE,
            feather: 0.12,
            onFirstFrame: () => setPainted(true),
          });
          const startZoom = narrow ? ZOOM_NARROW : ZOOM_WIDE;
          const state = { frame: 0, zoom: startZoom };
          const paint = () => {
            sequence.setZoom(state.zoom);
            sequence.render(state.frame);
          };
          const onResize = () => sequence.resize();

          sequence.resize();
          sequence.loadFirst();
          sequence.loadAll();
          window.addEventListener('resize', onResize);

          gsap
            .timeline({
              scrollTrigger: {
                trigger: root.current,
                start: `top ${HEADER_HEIGHT}px`,
                end: '+=320%',
                pin: true,
                scrub: 0.5,
                anticipatePin: 1,
              },
            })
            .to(state, { frame: FRAMES - 1, snap: 'frame', ease: 'none', duration: 1, onUpdate: paint }, 0)
            // La cámara se acerca mientras el grano estalla: empieza lejos y termina llenando la pantalla,
            // así las mitades salen por los bordes reales y no por el borde del cuadro.
            .to(state, { zoom: 1, ease: 'power1.inOut', duration: 0.42, onUpdate: paint }, 0.1)
            .to('[data-grano="hint"]', { autoAlpha: 0, duration: 0.05, ease: 'none' }, 0.02)
            // El eslogan se va antes de que las mitades del grano crucen el texto.
            .to('[data-grano="slogan"] > span', { autoAlpha: 0, y: -28, duration: 0.16, ease: 'power1.in', stagger: 0.02 }, 0.08);

          return () => {
            window.removeEventListener('resize', onResize);
            sequence.destroy();
          };
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className={styles.hero}>
      <img
        className={`${styles.media} ${styles.poster} ${painted ? styles.posterHidden : ''}`}
        src={posterUrl('grano')}
        alt=""
        fetchPriority="high"
      />
      <canvas ref={canvas} className={styles.media} aria-hidden="true" />

      <h1 className={styles.slogan} data-grano="slogan">
        <span>El aroma que inspira grandes hazañas,</span> <span>para los que hacen historia</span>
      </h1>

      <p className={styles.hint} data-grano="hint" aria-hidden="true">
        Baja para abrir el grano
      </p>
    </section>
  );
}
