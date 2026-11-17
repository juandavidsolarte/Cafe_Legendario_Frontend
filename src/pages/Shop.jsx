import { Link } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import StatusMessage from '../components/StatusMessage';
import useFetch from '../hooks/useFetch';
import { getProducts } from '../services/contentService';
import { images } from '../services/mockData';
import mark from '../assets/images/logo-cafe-legendario.webp';
import styles from './Shop.module.css';

const FACTS = [
  ['Origen', 'origin'],
  ['Finca', 'farm'],
  ['Altitud', 'altitude'],
  ['Variedad', 'variety'],
  ['Proceso', 'process'],
  ['Tostión', 'roast'],
  ['Secado', 'drying'],
];

export default function Shop() {
  const { data, loading, error } = useFetch(getProducts);

  return (
    <>
      <PageIntro title="Tienda" image={images.granos}>
        Café de especialidad de San Pablo, Nariño. Estamos preparando la venta en línea.
      </PageIntro>

      <section className={`container ${styles.list}`} aria-label="Productos">
        {loading && <StatusMessage />}
        {error && (
          <StatusMessage type="error" title="No pudimos cargar los productos.">
            Revisa tu conexión y recarga la página.
          </StatusMessage>
        )}
        {data?.map((product) => (
          <article key={product.id} className={styles.product}>
            {/* Aún no hay foto de empaque: se muestra el símbolo de la marca, no una foto simulada. */}
            <div className={styles.media} aria-hidden="true">
              <img src={mark} alt="" loading="lazy" />
            </div>
            <div className={styles.info}>
              <h2>{product.name}</h2>
              <p className="lead">{product.summary}</p>
              <p className={styles.profile}>{product.profile}</p>
              <dl className={styles.facts}>
                {FACTS.map(([label, key]) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>{product[key]}</dd>
                  </div>
                ))}
              </dl>
              <div className={styles.buy}>
                <p className={styles.price}>{product.price ?? 'Precio por confirmar'}</p>
                <button type="button" className="btn btn-primary" disabled={!product.available}>
                  {product.available ? 'Añadir al carrito' : 'Disponible pronto'}
                </button>
              </div>
              <Link to="/recetas" className={styles.more}>Ver recetas con este café</Link>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
