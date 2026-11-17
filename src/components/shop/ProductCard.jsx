import { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCart } from '../../cart/CartContext';
import { formatPrice } from '../../utils/format';
import styles from './ProductCard.module.css';

gsap.registerPlugin(useGSAP);

/**
 * Tarjeta de producto. Con el cursor encima la tarjeta se inclina en 3D hacia el puntero,
 * la foto se acerca y un brillo dorado sigue al cursor. En pantallas táctiles o con
 * movimiento reducido queda estática.
 */
export default function ProductCard({ product, variant }) {
  const label = `${product.name} ${variant.grind === 'Grano' ? 'en grano' : variant.grind.toLowerCase()}`;
  const link = { to: `/tienda/${product.slug}`, state: { sku: variant.sku } };
  const root = useRef(null);
  const { add } = useCart();

  useGSAP(
    () => {
      if (typeof window.matchMedia !== 'function') return undefined;
      const mm = gsap.matchMedia();
      mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const stage = root.current.querySelector('[data-card="stage"]');
        const tilt = root.current.querySelector('[data-card="tilt"]');
        const photo = root.current.querySelector('[data-card="photo"]');
        const glare = root.current.querySelector('[data-card="glare"]');
        const settings = { duration: 0.5, ease: 'power3.out' };

        gsap.set(tilt, { transformPerspective: 900, transformOrigin: '50% 50%' });
        const rotateX = gsap.quickTo(tilt, 'rotationX', settings);
        const rotateY = gsap.quickTo(tilt, 'rotationY', settings);
        const photoX = gsap.quickTo(photo, 'xPercent', settings);
        const photoY = gsap.quickTo(photo, 'yPercent', settings);

        const onMove = (event) => {
          const rect = stage.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          rotateY(x * 12);
          rotateX(-y * 10);
          // La foto se desplaza al contrario: da sensación de profundidad.
          photoX(-x * 4);
          photoY(-y * 4);
          glare.style.setProperty('--x', (x + 0.5) * 100);
          glare.style.setProperty('--y', (y + 0.5) * 100);
        };
        const onEnter = () => {
          gsap.to(photo, { scale: 1.1, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
          gsap.to(glare, { autoAlpha: 1, duration: 0.3, overwrite: 'auto' });
        };
        const onLeave = () => {
          rotateX(0);
          rotateY(0);
          photoX(0);
          photoY(0);
          gsap.to(photo, { scale: 1, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
          gsap.to(glare, { autoAlpha: 0, duration: 0.4, overwrite: 'auto' });
        };

        stage.addEventListener('pointerenter', onEnter);
        stage.addEventListener('pointermove', onMove);
        stage.addEventListener('pointerleave', onLeave);
        return () => {
          stage.removeEventListener('pointerenter', onEnter);
          stage.removeEventListener('pointermove', onMove);
          stage.removeEventListener('pointerleave', onLeave);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <article ref={root} className={styles.card}>
      <Link {...link} className={styles.stage} data-card="stage" aria-label={label}>
        <span className={styles.tilt} data-card="tilt">
          <img
            className={styles.photo}
            data-card="photo"
            src={variant.images[0]?.src}
            alt={variant.images[0]?.alt}
            loading="lazy"
            width="1280"
            height="1600"
          />
          <span className={styles.glare} data-card="glare" aria-hidden="true" />
        </span>
      </Link>
      <div className={styles.info}>
        <h3>
          <Link {...link}>
            {label} {variant.weight}
          </Link>
        </h3>
        <p className={styles.cup}>
          Perfil de taza: <strong>{product.cup}</strong>
        </p>
        <div className={styles.row}>
          <p className={styles.price}>{formatPrice(variant.price)}</p>
          <button type="button" className="btn btn-ghost" onClick={() => add(variant.sku)} disabled={!variant.available}>
            {variant.available ? 'Añadir' : 'Agotado'}
            <span className="visually-hidden"> {label} al carrito</span>
          </button>
        </div>
      </div>
    </article>
  );
}
