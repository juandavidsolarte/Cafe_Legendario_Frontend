import { Link } from 'react-router-dom';
import { MAX_PER_LINE, useCart } from '../../cart/CartContext';
import { formatPrice } from '../../utils/format';
import Quantity from './Quantity';
import styles from './CartLines.module.css';

// Líneas del carrito: foto, nombre, presentación, precio, cantidad y quitar.
export default function CartLines({ onNavigate }) {
  const { lines, setQuantity, remove } = useCart();

  return (
    <ul className={styles.lines}>
      {lines.map(({ product, variant, quantity, total }) => (
        <li key={variant.sku} className={styles.line}>
          <Link
            to={`/tienda/${product.slug}`}
            state={{ sku: variant.sku }}
            className={styles.thumb}
            onClick={onNavigate}
            tabIndex={-1}
            aria-hidden="true"
          >
            <img src={variant.images[0]?.src} alt="" loading="lazy" />
          </Link>
          <div className={styles.body}>
            <Link to={`/tienda/${product.slug}`} state={{ sku: variant.sku }} className={styles.name} onClick={onNavigate}>
              {product.name}
            </Link>
            <p className={styles.variant}>
              {variant.grind} / {variant.weight}
            </p>
            <p className={styles.price}>{formatPrice(total)}</p>
          </div>
          <div className={styles.controls}>
            <button type="button" className={styles.remove} onClick={() => remove(variant.sku)}>
              Quitar
              <span className="visually-hidden">
                {' '}
                {product.name} {variant.grind}
              </span>
            </button>
            <Quantity
              value={quantity}
              max={MAX_PER_LINE}
              onChange={(next) => setQuantity(variant.sku, next)}
              label={`Cantidad de ${product.name} ${variant.grind}`}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
