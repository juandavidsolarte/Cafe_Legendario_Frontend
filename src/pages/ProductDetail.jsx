import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Quantity from '../components/shop/Quantity';
import StatusMessage from '../components/StatusMessage';
import { MAX_PER_LINE, useCart } from '../cart/CartContext';
import useFetch from '../hooks/useFetch';
import { getProduct } from '../services/contentService';
import { formatPrice } from '../utils/format';
import styles from './ProductDetail.module.css';

gsap.registerPlugin(useGSAP);

const FACTS = [
  ['Origen', 'origin'],
  ['Finca', 'farm'],
  ['Variedad', 'variety'],
  ['Proceso', 'process'],
  ['Tostión', 'roast'],
  ['Altitud', 'altitude'],
];

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: product, loading, error } = useFetch(() => getProduct(slug), [slug]);
  const { state } = useLocation();
  const { add } = useCart();
  // La molienda es estado de la página: cambiarla no navega ni recarga.
  const [sku, setSku] = useState(state?.sku ?? null);
  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const root = useRef(null);
  const zoom = useRef(null);

  useEffect(() => {
    setSku(state?.sku ?? null);
    setActive(0);
    setQuantity(1);
  }, [slug, state?.sku]);

  useGSAP(
    () => {
      if (!product || typeof window.matchMedia !== 'function') return undefined;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-detail="info"] > *', { y: 22, autoAlpha: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06 });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [product?.slug] },
  );

  if (loading && !product) return <StatusMessage title="Cargando el producto…" />;
  if (error) {
    return (
      <StatusMessage
        type="error"
        title={error.status === 404 ? 'Este producto no existe o ya no está disponible.' : 'No pudimos cargar el producto.'}
        action={<Link to="/tienda" className="btn btn-ghost">Volver a la tienda</Link>}
      />
    );
  }

  const variant = product.variants.find((item) => item.sku === sku) ?? product.variants[0];
  const image = variant.images[active] ?? variant.images[0];

  // Lupa: la foto se amplía alrededor del punto donde está el cursor.
  const onZoomMove = (event) => {
    const rect = zoom.current.getBoundingClientRect();
    zoom.current.style.setProperty('--zx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    zoom.current.style.setProperty('--zy', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <article ref={root} className={`container ${styles.page}`}>
      <Link to="/tienda" className={styles.back}>Tienda</Link>

      <div className={styles.layout}>
        <div className={styles.gallery}>
          <ul className={styles.thumbs} aria-label="Fotos del producto">
            {variant.images.map((item, index) => (
              <li key={item.src}>
                <button
                  type="button"
                  className={styles.thumb}
                  aria-pressed={index === active}
                  aria-label={index === 0 ? 'Ver el frente de la bolsa' : 'Ver el reverso de la bolsa'}
                  onClick={() => setActive(index)}
                >
                  <img src={item.src} alt="" />
                </button>
              </li>
            ))}
          </ul>
          <div ref={zoom} className={styles.main} onPointerMove={onZoomMove}>
            <img key={image.src} src={image.src} alt={image.alt} width="1280" height="1600" fetchPriority="high" />
          </div>
        </div>

        <div className={styles.info} data-detail="info">
          <h1>{product.name}</h1>
          <p className={styles.price}>{formatPrice(variant.price)}</p>
          <p className="lead">{product.summary}</p>

          <div className={styles.choice}>
            <h2>Molienda</h2>
            <div className={styles.options}>
              {product.variants.map((item) => (
                <button
                  key={item.sku}
                  type="button"
                  className={styles.chip}
                  aria-pressed={item.sku === variant.sku}
                  onClick={() => setSku(item.sku)}
                >
                  {item.grind}
                </button>
              ))}
            </div>
            <p className={styles.hint} aria-live="polite">
              {variant.grindNote}
            </p>
          </div>

          <div className={styles.choice}>
            <h2>Peso</h2>
            <div className={styles.options}>
              <span className={styles.chip} data-selected="true">
                {variant.weight}
              </span>
            </div>
          </div>

          <div className={styles.quantity}>
            <h2>Cantidad</h2>
            <Quantity value={quantity} onChange={setQuantity} max={MAX_PER_LINE} />
          </div>

          <button
            type="button"
            className={`btn btn-primary ${styles.add}`}
            onClick={() => add(variant.sku, quantity)}
            disabled={!variant.available}
          >
            {variant.available ? 'Agregar al carrito' : 'Agotado'}
          </button>

          <section className={styles.sheet} aria-labelledby="ficha">
            <h2 id="ficha">Perfil de taza</h2>
            <p>
              {product.summary} {product.profile}
            </p>
            <dl className={styles.facts}>
              {FACTS.map(([label, key]) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>{product[key]}</dd>
                </div>
              ))}
            </dl>
            <Link to="/recetas" className={styles.more}>Ver recetas con este café</Link>
          </section>
        </div>
      </div>
    </article>
  );
}
