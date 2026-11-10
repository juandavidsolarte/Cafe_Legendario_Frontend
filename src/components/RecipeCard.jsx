import { Link } from 'react-router-dom';
import { formatTime } from '../utils/format';
import styles from './RecipeCard.module.css';

export default function RecipeCard({ recipe }) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img src={recipe.image} alt="" loading="lazy" />
        <span className={styles.difficulty}>{recipe.difficulty}</span>
      </div>
      <div className={styles.body}>
        <h3>
          <Link to={`/recetas/${recipe.slug}`} className={styles.link}>
            {recipe.name}
          </Link>
        </h3>
        <p>{recipe.description}</p>
        <p className={styles.time}>{formatTime(recipe.time)}</p>
      </div>
    </article>
  );
}
