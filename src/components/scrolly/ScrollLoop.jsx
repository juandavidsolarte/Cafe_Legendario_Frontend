import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { createFrameSequence, posterUrl } from './frameSequence';
import styles from './ScrollLoop.module.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FPS = 16;

const smooth = (x) => x * x * (3 - 2 * x);

/**
 * Sección con un clip vertical en bucle y texto al lado.
 * El bucle solo corre mientras la sección está en pantalla.
 *
 * `blend` = 0: el clip ya cierra solo (el último fotograma enlaza con el primero).
 * `blend` > 0: el clip no cierra; sus últimos `blend` fotogramas se disuelven sobre los primeros.
 * Entre fotogramas se mezclan los vecinos para que no se vea a saltos.
 */
export default function ScrollLoop({
  name,
  frames,
  blend = 0,
  ratio = '9 / 16',
  title,
  children,
  to,
  cta,
  side = 'left',
  id,
}) {
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
          count: frames,
          fit: 'contain',
          interpolate: true,
          wrap: blend === 0,
          onFirstFrame: () => setPainted(true),
        });
        const state = { t: 0 };
        const onResize = () => sequence.resize();
        window.addEventListener('resize', onResize);

        const period = blend === 0 ? frames : frames - 1 - blend;
        const draw = () => {
          if (blend === 0) {
            sequence.render(state.t);
            return;
          }
          const main = state.t + blend;
          const over = main - period;
          sequence.render(main, over > 0 ? { frame: over, alpha: smooth(over / blend) } : null);
        };

        const loop = gsap.to(state, {
          t: period,
          duration: period / FPS,
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
    { scope: root, dependencies: [name, frames, blend] },
  );

  return (
    <section ref={root} className={`${styles.section} ${side === 'right' ? styles.right : ''}`} aria-labelledby={id}>
      <div className={styles.media} style={{ aspectRatio: ratio }} aria-hidden="true">
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
