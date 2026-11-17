import { Link } from 'react-router-dom';
import CartLines from '../components/shop/CartLines';
import StatusMessage from '../components/StatusMessage';
import { useCart } from '../cart/CartContext';
import { formatPrice } from '../utils/format';
import styles from './Cart.module.css';

// Vista completa del carrito.
export default function Cart() {
  const { lines, count, subtotal } = useCart();

  return (
    <div className={`container ${styles.page}`}>
      <h1>Carrito</h1>
      {lines.length === 0 ? (
        <StatusMessage
          type="empty"
          title="Tu carrito está vacío."
          action={<Link to="/tienda" className="btn btn-primary">Ir a la tienda</Link>}
        >
          Elige tu café en grano o molido.
        </StatusMessage>
      ) : (
        <div className={styles.layout}>
          <CartLines />
          <aside className={styles.summary} aria-label="Resumen del pedido">
            <div className={styles.row}>
              <span>
                Subtotal · {count} {count === 1 ? 'producto' : 'productos'}
              </span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.row}>
              <span>Envío</span>
              <span>Se calcula con la ciudad</span>
            </div>
            <div className={`${styles.row} ${styles.total}`}>
              <span>Total</span>
              <strong>{formatPrice(subtotal)} COP</strong>
            </div>
            <Link to="/checkout" className={`btn btn-primary ${styles.pay}`}>
              Pagar pedido
            </Link>
            <Link to="/tienda" className={styles.keep}>Seguir comprando</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
