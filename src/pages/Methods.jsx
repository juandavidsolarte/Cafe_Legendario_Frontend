import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import StatusMessage from '../components/StatusMessage';
import useFetch from '../hooks/useFetch';
import { getMethods } from '../services/contentService';
import { images } from '../services/mockData';
import styles from './Catalog.module.css';

const BREWING_TIPS = [
  {
    title: 'Temperatura del agua',
    tip: 'Mantén el agua entre 90°C y 96°C. Si hierve, déjala reposar 45 segundos antes de verter.',
  },
  {
    title: 'Preinfusión o Bloom',
    tip: 'Vierte el doble de agua respecto al peso del café y espera 30 segundos para liberar el CO2.',
  },
  {
    title: 'Calidad del agua',
    tip: 'El 98% de la taza es agua. Usa agua filtrada con bajo residuo seco para resaltar los aromas.',
  },
];

export default function Methods() {
  const { data, loading, error } = useFetch(getMethods);
  const [activeTip, setActiveTip] = useState(0);

  return (
    <>
      <PageIntro title="Métodos de preparación" image={images.chemex}>
        El mismo café sabe distinto según la molienda, el tiempo y la forma de extraerlo.
      </PageIntro>
      <div className="container">
        {loading && <StatusMessage />}
        {error && (
          <StatusMessage type="error" title="No pudimos cargar los métodos.">
            Revisa tu conexión y recarga la página.
          </StatusMessage>
        )}
        {data && (
          <ul className={styles.rows}>
            {data.map((method) => (
              <li key={method.id} className={styles.row}>
                <img src={method.image} alt="" loading="lazy" />
                <div className={styles.rowCopy}>
                  <h2>{method.name}</h2>
                  <p>{method.summary}</p>
                  <dl className={styles.rowFacts}>
                    <div><dt>Café : agua</dt><dd>{method.ratio}</dd></div>
                    <div><dt>Molienda</dt><dd>{method.grind}</dd></div>
                    <div><dt>Tiempo</dt><dd>{method.time}</dd></div>
                  </dl>
                  <Link to={`/metodos/${method.slug}`} className="btn btn-ghost">
                    Aprender a preparar {method.name}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
        <section style={{ marginTop: '4rem', borderTop: '1px solid var(--line)', paddingTop: '2.5rem' }}>
          <h2 style={{ fontSize: 'var(--step-2)', marginBottom: '0.75rem', color: 'var(--gold)' }}>
            Consejos clave de extracción
          </h2>
          <p style={{ color: 'var(--cream-dim)', marginBottom: '1.25rem', maxWidth: '55ch' }}>
            Ajustes en la temperatura y el vertido transforman las notas aromáticas de cada taza.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {BREWING_TIPS.map((tip, idx) => (
              <button
                key={tip.title}
                type="button"
                onClick={() => setActiveTip(idx)}
                className={`btn ${activeTip === idx ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: 'var(--step--1)', padding: '0.45rem 0.9rem' }}
              >
                {tip.title}
              </button>
            ))}
          </div>
          <div style={{ padding: '1.25rem', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
            <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '0.5rem' }}>{BREWING_TIPS[activeTip].title}</h3>
            <p style={{ margin: 0, color: 'var(--cream-dim)' }}>{BREWING_TIPS[activeTip].tip}</p>
          </div>
        </section>
      </div>
    </>
  );
}
