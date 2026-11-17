import { useMemo, useState } from 'react';
import ProductCard from '../components/shop/ProductCard';
import StatusMessage from '../components/StatusMessage';
import useFetch from '../hooks/useFetch';
import { getProducts } from '../services/contentService';
import styles from './Shop.module.css';

// Cada grupo de filtros lee un campo del producto.
const FILTERS = [
  { key: 'grind', label: 'Molienda' },
  { key: 'cup', label: 'Perfil de taza' },
  { key: 'region', label: 'Origen del café' },
];

const SORTS = {
  nombre: { label: 'Nombre', compare: (a, b) => a.name.localeCompare(b.name, 'es') },
  'precio-menor': { label: 'Precio: menor a mayor', compare: (a, b) => a.price - b.price },
  'precio-mayor': { label: 'Precio: mayor a menor', compare: (a, b) => b.price - a.price },
};

export default function Shop() {
  const { data, loading, error } = useFetch(getProducts);
  const [selected, setSelected] = useState({});
  const [sort, setSort] = useState('nombre');
  // Cada presentación (molienda) se muestra como una tarjeta.
  const products = useMemo(
    () =>
      (data || []).flatMap((product) =>
        product.variants.map((variant) => ({
          product,
          variant,
          key: variant.sku,
          name: `${product.name} ${variant.grind}`,
          price: variant.price,
          grind: variant.grind,
          cup: product.cup,
          region: product.region,
        })),
      ),
    [data],
  );

  const groups = useMemo(
    () =>
      FILTERS.map((filter) => {
        const counts = new Map();
        products.forEach((product) => counts.set(product[filter.key], (counts.get(product[filter.key]) || 0) + 1));
        return { ...filter, options: [...counts.entries()] };
      }),
    [products],
  );

  const visible = useMemo(
    () =>
      products
        .filter((product) => FILTERS.every(({ key }) => !selected[key]?.length || selected[key].includes(product[key])))
        .sort(SORTS[sort].compare),
    [products, selected, sort],
  );

  const toggle = (key, value) =>
    setSelected((current) => {
      const values = current[key] || [];
      return { ...current, [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] };
    });

  const hasFilters = Object.values(selected).some((values) => values.length);

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>Café de Nariño, en grano y molido</h1>

      {loading && <StatusMessage />}
      {error && (
        <StatusMessage type="error" title="No pudimos cargar los productos.">
          Revisa tu conexión y recarga la página.
        </StatusMessage>
      )}

      {data && (
        <div className={styles.layout}>
          <aside className={styles.filters} aria-label="Filtros">
            <div className={styles.filtersHead}>
              <h2>Filtros</h2>
              <button type="button" onClick={() => setSelected({})} disabled={!hasFilters}>
                Limpiar
              </button>
            </div>
            {groups.map((group) => (
              <fieldset key={group.key} className={styles.group}>
                <legend>{group.label}</legend>
                {group.options.map(([value, count]) => (
                  <label key={value} className={styles.option}>
                    <input
                      type="checkbox"
                      checked={selected[group.key]?.includes(value) || false}
                      onChange={() => toggle(group.key, value)}
                    />
                    <span>{value}</span>
                    <span className={styles.amount}>({count})</span>
                  </label>
                ))}
              </fieldset>
            ))}
          </aside>

          <section aria-label="Productos">
            <div className={styles.toolbar}>
              <label className={styles.sort}>
                <span>Ordenar por</span>
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  {Object.entries(SORTS).map(([value, option]) => (
                    <option key={value} value={value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <p role="status">
                {visible.length} {visible.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>

            {visible.length ? (
              <div className={styles.grid}>
                {visible.map((entry) => (
                  <ProductCard key={entry.key} product={entry.product} variant={entry.variant} />
                ))}
              </div>
            ) : (
              <StatusMessage
                type="empty"
                title="Ningún café coincide con esos filtros."
                action={
                  <button type="button" className="btn btn-ghost" onClick={() => setSelected({})}>
                    Ver todos los cafés
                  </button>
                }
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}
