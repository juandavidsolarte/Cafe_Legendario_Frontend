import { useState } from 'react';
import PageIntro from '../components/PageIntro';
import StatusMessage from '../components/StatusMessage';
import useFetch from '../hooks/useFetch';
import { getArticles } from '../services/contentService';
import { images } from '../services/mockData';
import styles from './Catalog.module.css';

const CULTURE_FAQS = [
  {
    q: '¿Por qué Colombia destaca en la producción de café suave?',
    a: 'Por la combinación de altitud, suelos volcánicos, cosecha manual grano a grano y el cultivo de variedades 100% arábica.',
  },
  {
    q: '¿Cuál es la diferencia principal entre café arábica y robusta?',
    a: 'El grano arábica crece a mayor altitud, tiene menor concentración de cafeína y despliega notas aromáticas florales y frutales más complejas.',
  },
  {
    q: '¿Cómo mantener frescos los granos de café en casa?',
    a: 'Almacénalos en un recipiente hermético y opaco a temperatura ambiente, lejos de fuentes de calor, humedad y luz directa.',
  },
];

export default function Culture() {
  const { data, loading, error } = useFetch(getArticles);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq((current) => (current === index ? null : index));
  };

  return (
    <>
      <PageIntro title="Cultura del café" image={images.montana}>
        De una leyenda etíope a las montañas de Colombia: la historia de la bebida más compartida del mundo.
      </PageIntro>
      <div className="container">
        {loading && <StatusMessage />}
        {error && (
          <StatusMessage type="error" title="No pudimos cargar los artículos.">
            Revisa tu conexión y recarga la página.
          </StatusMessage>
        )}
        {data && (
          <div className={styles.culture}>
            <nav className={styles.toc} aria-label="Temas">
              {data.map((article) => (
                <a key={article.id} href={`#${article.slug}`}>{article.topic}</a>
              ))}
            </nav>
            <div className={styles.articles}>
              {data.map((article) => (
                <article key={article.id} id={article.slug} className={styles.article}>
                  <img src={article.image} alt="" loading="lazy" />
                  <div>
                    <p className={styles.topic}>{article.topic}</p>
                    <h2>{article.title}</h2>
                    <p>{article.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
        <section style={{ marginTop: '4rem', borderTop: '1px solid var(--line)', paddingTop: '2.5rem' }}>
          <h2 style={{ fontSize: 'var(--step-2)', marginBottom: '1.25rem', color: 'var(--gold)' }}>
            Preguntas frecuentes sobre la cultura cafetera
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {CULTURE_FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.q} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'space-between', background: 'none', border: 'none', color: 'var(--cream)', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ color: 'var(--gold)', marginLeft: '1rem' }}>{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && <p style={{ margin: 0, padding: '0 1rem 1rem', color: 'var(--cream-dim)' }}>{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
