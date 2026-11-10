import { useSearchParams } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import RecipeCard from '../components/RecipeCard';
import StatusMessage from '../components/StatusMessage';
import useFetch from '../hooks/useFetch';
import { getCategories, getMethods, getRecipes } from '../services/contentService';
import { images } from '../services/mockData';
import styles from './Recipes.module.css';

const difficulties = ['Fácil', 'Media', 'Avanzada'];

export default function Recipes() {
  const [params, setParams] = useSearchParams();
  const filters = {
    search: params.get('q') || '',
    category: params.get('categoria') || '',
    method: params.get('metodo') || '',
    difficulty: params.get('dificultad') || '',
  };
  const hasFilters = Object.values(filters).some(Boolean);

  const categories = useFetch(getCategories);
  const methods = useFetch(getMethods);
  const recipes = useFetch(() => getRecipes(filters), [params.toString()]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <>
      <PageIntro title="Recetario" image={images.caramelo}>
        Bebidas calientes, frías y especiales con ingredientes, cantidades y pasos claros.
      </PageIntro>

      <div className="container">
        <form className={styles.filters} role="search" onSubmit={(event) => event.preventDefault()}>
          <label className={styles.search}>
            <span className="visually-hidden">Buscar receta por nombre</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              placeholder="Busca por nombre: latte, cold brew…"
              value={filters.search}
              onChange={(event) => update('q', event.target.value)}
            />
          </label>

          <label className={styles.select}>
            <span>Categoría</span>
            <select value={filters.category} onChange={(event) => update('categoria', event.target.value)}>
              <option value="">Todas</option>
              {categories.data?.map((category) => (
                <option key={category.id} value={category.slug}>{category.name}</option>
              ))}
            </select>
          </label>

          <label className={styles.select}>
            <span>Método</span>
            <select value={filters.method} onChange={(event) => update('metodo', event.target.value)}>
              <option value="">Todos</option>
              {methods.data?.map((method) => (
                <option key={method.id} value={method.slug}>{method.name}</option>
              ))}
            </select>
          </label>

          <fieldset className={styles.chips}>
            <legend>Dificultad</legend>
            {difficulties.map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={filters.difficulty === level}
                onClick={() => update('dificultad', filters.difficulty === level ? '' : level)}
              >
                {level}
              </button>
            ))}
          </fieldset>
        </form>

        <div className={styles.summary} aria-live="polite">
          {recipes.data && (
            <p>
              {recipes.data.length === 1 ? '1 receta' : `${recipes.data.length} recetas`}
              {hasFilters ? ' con estos filtros' : ''}
            </p>
          )}
          {hasFilters && (
            <button type="button" className={styles.clear} onClick={() => setParams({}, { replace: true })}>
              Quitar filtros
            </button>
          )}
        </div>

        {recipes.loading && !recipes.data && <StatusMessage title="Buscando recetas…" />}
        {recipes.error && (
          <StatusMessage type="error" title="No pudimos cargar las recetas.">
            Revisa tu conexión y recarga la página.
          </StatusMessage>
        )}
        {recipes.data?.length === 0 && (
          <StatusMessage
            type="empty"
            title="Ninguna receta coincide."
            action={
              <button type="button" className="btn btn-ghost" onClick={() => setParams({}, { replace: true })}>
                Ver todas las recetas
              </button>
            }
          >
            Prueba con otro nombre o quita alguno de los filtros.
          </StatusMessage>
        )}
        {recipes.data?.length > 0 && (
          <div className={styles.grid}>
            {recipes.data.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
