import { Link, useParams } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';
import useFetch from '../hooks/useFetch';
import { getVariety } from '../services/contentService';
import styles from './Detail.module.css';

export default function VarietyDetail() {
  const { slug } = useParams();
  const { data: variety, loading, error } = useFetch(() => getVariety(slug), [slug]);

  if (loading && !variety) return <StatusMessage title="Cargando la variedad…" />;
  if (error) {
    return (
      <StatusMessage
        type="error"
        title={error.status === 404 ? 'Esta variedad no existe.' : 'No pudimos cargar la variedad.'}
        action={<Link to="/variedades" className="btn btn-ghost">Ver todas las variedades</Link>}
      />
    );
  }

  return (
    <article className="container">
      <Link to="/variedades" className={styles.back}>Variedades</Link>

      <header className={styles.top}>
        <img className={`${styles.photo} ${styles.arch}`} src={variety.image} alt="" />
        <div className={styles.summary}>
          <h1>{variety.name}</h1>
          <p className="lead">{variety.description}</p>
          <dl className={styles.profile}>
            <div>
              <dt>Origen</dt>
              <dd>{variety.origin}</dd>
            </div>
            <div>
              <dt>Perfil de sabor</dt>
              <dd>{variety.flavor}</dd>
            </div>
            <div>
              <dt>Aroma</dt>
              <dd>{variety.aroma}</dd>
            </div>
            <div>
              <dt>Características</dt>
              <dd>{variety.traits.join(', ')}</dd>
            </div>
          </dl>
        </div>
      </header>
    </article>
  );
}
