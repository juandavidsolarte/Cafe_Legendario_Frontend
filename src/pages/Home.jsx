import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import StatusMessage from '../components/StatusMessage';
import useFetch from '../hooks/useFetch';
import { getMethods, getRecipes } from '../services/contentService';
import { images } from '../services/mockData';
import styles from './Home.module.css';

const sections = [
  { to: '/cultura', title: 'Cultura', text: 'Historia, regiones y el café en Colombia.', image: images.montana },
  { to: '/variedades', title: 'Variedades', text: 'Típica, Borbón, Geisha y más.', image: images.granos },
  { to: '/metodos', title: 'Métodos', text: 'Del espresso a la Chemex.', image: images.chemex },
  { to: '/recetas', title: 'Recetario', text: 'Bebidas calientes, frías y especiales.', image: images.caramelo },
];

export default function Home() {
  const recipes = useFetch(() => getRecipes({ featured: true }));
  const methods = useFetch(getMethods);

  return (
    <>
      <section className={styles.hero}>
        <img className={styles.heroPhoto} src={images.espresso} alt="" fetchPriority="high" />
        <p className={styles.giant} aria-hidden="true">
          <span>Ca</span>
          <span>fé</span>
        </p>
        <div className={`container ${styles.heroCopy}`}>
          <h1>El café se aprende taza a taza.</h1>
          <p className="lead">
            Historia, variedades, métodos y recetas para entender lo que hay detrás de cada sorbo.
          </p>
          <div className={styles.actions}>
            <Link to="/recetas" className="btn btn-primary">Ver el recetario</Link>
            <Link to="/cultura" className="btn btn-ghost">Conocer su origen</Link>
          </div>
        </div>
      </section>

      <section className={`container ${styles.block}`} aria-labelledby="explorar">
        <h2 id="explorar" className={styles.heading}>Por dónde empezar</h2>
        <ul className={styles.doors}>
          {sections.map((section) => (
            <li key={section.to}>
              <Link to={section.to} className={styles.door}>
                <span className={styles.arch}>
                  <img src={section.image} alt="" loading="lazy" />
                </span>
                <span className={styles.doorTitle}>{section.title}</span>
                <span className={styles.doorText}>{section.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.culture} aria-labelledby="cultura">
        <img src={images.montana} alt="Cafetal en la montaña al amanecer, con cerezas de café maduras" loading="lazy" />
        <div className={`container ${styles.cultureInner}`}>
          <div className={styles.cultureCopy}>
            <h2 id="cultura">Antes de la taza hubo una montaña.</h2>
            <p>
              Un cafeto tarda unos tres años en dar su primera cosecha. En Colombia, las cordilleras permiten
              recolectar casi todo el año, y más de 500 000 familias viven de ese ciclo.
            </p>
            <Link to="/cultura" className="btn btn-ghost">Leer sobre la cultura del café</Link>
          </div>
        </div>
      </section>

      <section className={`container ${styles.block}`} aria-labelledby="destacadas">
        <div className={styles.headRow}>
          <h2 id="destacadas" className={styles.heading}>Recetas para empezar hoy</h2>
          <Link to="/recetas" className={styles.more}>Ver todas las recetas</Link>
        </div>
        {recipes.loading && <StatusMessage />}
        {recipes.error && (
          <StatusMessage type="error" title="No pudimos cargar las recetas.">
            Revisa tu conexión y recarga la página.
          </StatusMessage>
        )}
        {recipes.data && (
          <div className={styles.recipes}>
            {recipes.data.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </section>

      <section className={`container ${styles.block}`} aria-labelledby="metodos">
        <div className={styles.headRow}>
          <h2 id="metodos" className={styles.heading}>Seis formas de preparar café</h2>
          <Link to="/metodos" className={styles.more}>Ver los métodos</Link>
        </div>
        {methods.loading && <StatusMessage />}
        {methods.error && (
          <StatusMessage type="error" title="No pudimos cargar los métodos.">
            Revisa tu conexión y recarga la página.
          </StatusMessage>
        )}
        {methods.data && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Método</th>
                <th scope="col">Café : agua</th>
                <th scope="col">Molienda</th>
                <th scope="col">Tiempo</th>
              </tr>
            </thead>
            <tbody>
              {methods.data.map((method) => (
                <tr key={method.id}>
                  <th scope="row">
                    <Link to={`/metodos/${method.slug}`}>{method.name}</Link>
                  </th>
                  <td data-label="Café : agua">{method.ratio}</td>
                  <td data-label="Molienda">{method.grind}</td>
                  <td data-label="Tiempo">{method.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className={`container ${styles.closing}`}>
        <img src={images.frio} alt="" loading="lazy" />
        <div className={styles.closingCopy}>
          <h2>¿Qué vas a preparar hoy?</h2>
          <p>Busca por nombre o filtra por método, categoría y dificultad.</p>
          <Link to="/recetas" className="btn btn-primary">Buscar una receta</Link>
        </div>
      </section>
    </>
  );
}
