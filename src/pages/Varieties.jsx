import { Link } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import StatusMessage from '../components/StatusMessage';
import useFetch from '../hooks/useFetch';
import { getVarieties } from '../services/contentService';
import { images } from '../services/mockData';
import styles from './Catalog.module.css';

export default function Varieties() {
  const { data, loading, error } = useFetch(getVarieties);

  return (
    <>
      <PageIntro title="Variedades de café" image={images.granos}>
        Cada variedad de arábica cambia el sabor, el aroma y la forma en que crece la planta.
      </PageIntro>
      <div className="container">
        {loading && <StatusMessage />}
        {error && (
          <StatusMessage type="error" title="No pudimos cargar las variedades.">
            Revisa tu conexión y recarga la página.
          </StatusMessage>
        )}
        {data && (
          <ul className={styles.arches}>
            {data.map((variety) => (
              <li key={variety.id}>
                <Link to={`/variedades/${variety.slug}`} className={styles.archCard}>
                  <span className={styles.archImg}>
                    <img src={variety.image} alt="" loading="lazy" />
                  </span>
                  <span className={styles.archName}>{variety.name}</span>
                  <span className={styles.archMeta}>{variety.origin}</span>
                  <span className={styles.archFlavor}>{variety.flavor}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
