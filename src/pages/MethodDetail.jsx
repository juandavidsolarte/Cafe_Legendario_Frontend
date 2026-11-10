import { Link, useParams } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';
import useFetch from '../hooks/useFetch';
import { getMethod } from '../services/contentService';
import styles from './Detail.module.css';

export default function MethodDetail() {
  const { slug } = useParams();
  const { data: method, loading, error } = useFetch(() => getMethod(slug), [slug]);

  if (loading && !method) return <StatusMessage title="Cargando el método…" />;
  if (error) {
    return (
      <StatusMessage
        type="error"
        title={error.status === 404 ? 'Este método no existe.' : 'No pudimos cargar el método.'}
        action={<Link to="/metodos" className="btn btn-ghost">Ver todos los métodos</Link>}
      />
    );
  }

  return (
    <article className="container">
      <Link to="/metodos" className={styles.back}>Métodos</Link>

      <header className={styles.top}>
        <img className={styles.photo} src={method.image} alt={`Preparación con ${method.name}`} />
        <div className={styles.summary}>
          <h1>{method.name}</h1>
          <p className="lead">{method.description}</p>
          <dl className={styles.facts}>
            <div>
              <dt>Tiempo</dt>
              <dd>{method.time}</dd>
            </div>
            <div>
              <dt>Café : agua</dt>
              <dd>{method.ratio}</dd>
            </div>
            <div>
              <dt>Molienda</dt>
              <dd>{method.grind}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.aside}>
          <h2>Herramientas</h2>
          <ul className={styles.ingredients}>
            {method.tools.map((tool) => (
              <li key={tool}>
                <span>{tool}</span>
              </li>
            ))}
          </ul>
        </aside>

        <section>
          <h2>Paso a paso</h2>
          <ol className={styles.steps}>
            {method.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className={styles.tip}>
            <strong>Consejo:</strong> {method.tips}
          </p>
          <Link to={`/recetas?metodo=${method.slug}`} className="btn btn-ghost">
            Recetas con {method.name}
          </Link>
        </section>
      </div>
    </article>
  );
}
