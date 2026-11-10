import { Link, useParams } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import StatusMessage from '../components/StatusMessage';
import useFetch from '../hooks/useFetch';
import { getRecipe, getRecipes } from '../services/contentService';
import { formatTime } from '../utils/format';
import styles from './Detail.module.css';

export default function RecipeDetail() {
  const { slug } = useParams();
  const { data: recipe, loading, error } = useFetch(() => getRecipe(slug), [slug]);
  const related = useFetch(
    () => (recipe ? getRecipes({ category: recipe.category }) : Promise.resolve([])),
    [recipe?.slug],
  );

  if (loading && !recipe) return <StatusMessage title="Cargando la receta…" />;
  if (error) {
    return (
      <StatusMessage
        type="error"
        title={error.status === 404 ? 'Esta receta no existe o ya no está publicada.' : 'No pudimos cargar la receta.'}
        action={<Link to="/recetas" className="btn btn-ghost">Volver al recetario</Link>}
      />
    );
  }

  const others = (related.data || []).filter((item) => item.slug !== recipe.slug).slice(0, 3);

  return (
    <article className="container">
      <Link to="/recetas" className={styles.back}>Recetario</Link>

      <header className={styles.top}>
        <img className={styles.photo} src={recipe.image} alt={recipe.name} />
        <div className={styles.summary}>
          <h1>{recipe.name}</h1>
          <p className="lead">{recipe.description}</p>
          <dl className={styles.facts}>
            <div>
              <dt>Tiempo</dt>
              <dd>{formatTime(recipe.time)}</dd>
            </div>
            <div>
              <dt>Dificultad</dt>
              <dd>{recipe.difficulty}</dd>
            </div>
            <div>
              <dt>Método</dt>
              <dd>
                <Link to={`/metodos/${recipe.method}`}>{recipe.method.replace('-', ' ')}</Link>
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.aside}>
          <h2>Ingredientes</h2>
          <ul className={styles.ingredients}>
            {recipe.ingredients.map((item) => (
              <li key={item.name}>
                <span>{item.name}</span>
                <span>{item.quantity}</span>
              </li>
            ))}
          </ul>
        </aside>

        <section>
          <h2>Preparación</h2>
          <ol className={styles.steps}>
            {recipe.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {recipe.tips && (
            <p className={styles.tip}>
              <strong>Consejo:</strong> {recipe.tips}
            </p>
          )}
        </section>
      </div>

      {others.length > 0 && (
        <section className={styles.related} aria-labelledby="relacionadas">
          <h2 id="relacionadas">Recetas relacionadas</h2>
          <div className={styles.relatedGrid}>
            {others.map((item) => (
              <RecipeCard key={item.id} recipe={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
