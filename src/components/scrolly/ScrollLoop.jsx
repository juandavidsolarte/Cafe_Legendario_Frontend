import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { createFrameSequence, posterUrl } from './frameSequence';
import styles from './ScrollLoop.module.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAMES = 49;
// El clip no vuelve nunca a una pose parecida a la inicial (se midió fotograma a fotograma),
// así que el final se disuelve largo y suave sobre el inicio. Se reproduce a los 16 fps
// originales; entre fotogramas se mezclan los vecinos para que no se vea a saltos.
const FPS = 16;
const BLEND = 18;
const PERIOD = FRAMES - 1 - BLEND;

const smooth = (x) => x * x * (3 - 2 * x);

/**
 * Sección con un clip vertical en bucle (chorro o latte) y texto al lado.
 * El bucle solo corre mientras la sección está en pantalla.
 */
export default function ScrollLoop({ name, title, children, to, cta, side = 'left', id }) {
  const root = useRef(null);
  const canvas = useRef(null);
  const [painted, setPainted] = useState(false);

  useGSAP(
    () => {
      if (typeof window.matchMedia !== 'function' || !canvas.current?.getContext) return undefined;

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const sequence = createFrameSequence({
          canvas: canvas.current,
          name,
          count: FRAMES,
          fit: 'contain',
          interpolate: true,
          onFirstFrame: () => setPainted(true),
        });
        const state = { t: 0 };
        const onResize = () => sequence.resize();
        window.addEventListener('resize', onResize);

        const draw = () => {
          const main = state.t + BLEND;
          const over = main - PERIOD;
          sequence.render(main, over > 0 ? { frame: over, alpha: smooth(over / BLEND) } : null);
        };

        const loop = gsap.to(state, {
          t: PERIOD,
          duration: PERIOD / FPS,
          ease: 'none',
          repeat: -1,
          paused: true,
          onUpdate: draw,
        });

        // Descarga los fotogramas poco antes de que la sección entre en pantalla.
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top 200%',
          once: true,
          onEnter: () => {
            sequence.resize();
            sequence.loadAll();
            draw();
          },
        });

        ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
        });

        gsap.from('[data-loop="text"] > *', {
          y: 26,
          autoAlpha: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
        });

        return () => {
          window.removeEventListener('resize', onResize);
          sequence.destroy();
        };
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [name] },
  );

  return (
    <section ref={root} className={`${styles.section} ${side === 'right' ? styles.right : ''}`} aria-labelledby={id}>
      <div className={styles.media} aria-hidden="true">
        <img
          className={`${styles.frame} ${painted ? styles.posterHidden : ''}`}
          src={posterUrl(name)}
          alt=""
          loading="lazy"
        />
        <canvas ref={canvas} className={styles.frame} />
      </div>
      <div className={styles.text} data-loop="text">
        <h2 id={id}>{title}</h2>
        <p>{children}</p>
        {to && (
          <Link to={to} className="btn btn-ghost">
            {cta}
          </Link>
        )}
      </div>
    </section>
  );
}
