import styles from './Quantity.module.css';

// Selector de cantidad con botones de menos y más.
export default function Quantity({ value, onChange, min = 1, max = 20, label = 'Cantidad' }) {
  return (
    <div className={styles.quantity} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Quitar una unidad">
        <span aria-hidden="true">−</span>
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Añadir una unidad">
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
