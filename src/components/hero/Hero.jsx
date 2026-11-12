import { lazy, Suspense, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import GoldWord from './GoldWord';
import { images } from '../../services/mockData';
import styles from './Hero.module.css';

// La escena 3D (three.js) se descarga aparte, solo cuando el navegador puede mostrarla.
const CoffeeScene = lazy(() => import('./CoffeeScene'));

gsap.registerPlugin(ScrollTrigger, useGSAP);

function canRender3D() {
  if (typeof window === 'undefined' || !window.WebGLRenderingContext) return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function Hero() {
  const root = useRef(null);
  const [use3D] = useState(canRender3D);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // three.js solo se descarga cuando la sección se acerca a la pantalla.
  const [near, setNear] = useState(false);
  const showScene = use3D && near && !failed;

  useGSAP(
    () => {
      if (typeof window.matchMedia !== 'function') return undefined;
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 250%',
        once: true,
        onEnter: () => setNear(true),
      });
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({
            defaults: { duration: 0.8, ease: 'power3.out' },
            scrollTrigger: { trigger: root.current, start: 'top 65%', once: true },
          })
          .from('[data-hero="title"]', { y: 28, autoAlpha: 0 }, 0.1)
          .from('[data-hero="lead"]', { y: 22, autoAlpha: 0 }, '<0.09')
          .from('[data-hero="actions"] > *', { y: 18, autoAlpha: 0, stagger: 0.08 }, '<0.09');
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className={styles.hero} aria-labelledby="cierre">
      <div className={styles.stage} aria-hidden="true">
        <img
          className={`${styles.photo} ${ready ? styles.photoHidden : ''}`}
          src={images.espresso}
          alt=""
          loading="lazy"
        />
        {showScene && (
          <div className={`${styles.canvas} ${ready ? styles.canvasReady : ''}`}>
            <Suspense fallback={null}>
              <CoffeeScene eventSource={root} onReady={() => setReady(true)} onFail={() => setFailed(true)} />
            </Suspense>
          </div>
        )}
      </div>

      <div className={`container ${styles.copy}`}>
        <div className={styles.word}>
          <GoldWord />
        </div>
        <h2 id="cierre" data-hero="title">El café se aprende taza a taza.</h2>
        <p className="lead" data-hero="lead">
          Historia, variedades, métodos y recetas para entender lo que hay detrás de cada sorbo.
        </p>
        <div className={styles.actions} data-hero="actions">
          <Link to="/recetas" className="btn btn-primary">Ver el recetario</Link>
          <Link to="/cultura" className="btn btn-ghost">Conocer su origen</Link>
        </div>
      </div>

      {showScene && ready && <p className={styles.hint}>Arrastra la taza para girarla. Un clic la revuelve.</p>}
    </section>
  );
}
