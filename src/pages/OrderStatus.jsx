import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';
import { useCart } from '../cart/CartContext';
import useFetch from '../hooks/useFetch';
import { getOrder } from '../services/contentService';
import { formatPrice } from '../utils/format';
import styles from './OrderStatus.module.css';

const MESSAGES = {
  approved: {
    title: 'Pago recibido. Tu café va en camino.',
    text: 'Te avisaremos al correo cuando despachemos el pedido.',
  },
  pending: {
    title: 'Estamos esperando la confirmación del pago.',
    text: 'Puede tardar unos minutos. Recarga esta página para ver el estado actualizado.',
  },
  declined: { title: 'El pago fue rechazado.', text: 'No se hizo ningún cobro. Puedes intentarlo de nuevo.' },
  voided: { title: 'El pago fue anulado.', text: 'No se hizo ningún cobro.' },
  error: { title: 'Hubo un error con el pago.', text: 'No se hizo ningún cobro. Puedes intentarlo de nuevo.' },
};

/** Página a la que vuelve el cliente después de pagar en Wompi. */
export default function OrderStatus() {
  const { reference } = useParams();
  const { data: order, loading, error } = useFetch(() => getOrder(reference), [reference]);
  const { clear } = useCart();

  // Con el pago aprobado el carrito ya cumplió su función.
  useEffect(() => {
    if (order?.status === 'approved') clear();
  }, [order?.status, clear]);

  if (loading && !order) return <StatusMessage title="Consultando tu pedido…" />;
  if (error) {
    return (
      <StatusMessage
        type="error"
        title={error.response?.status === 404 ? 'No encontramos ese pedido.' : 'No pudimos consultar el pedido.'}
        action={<Link to="/tienda" className="btn btn-ghost">Volver a la tienda</Link>}
      />
    );
  }

  const message = MESSAGES[order.status] ?? MESSAGES.pending;

  return (
    <div className={`container ${styles.page}`}>
      <p className={styles.reference}>Pedido {order.reference}</p>
      <h1 role="status">{message.title}</h1>
      <p className="lead">{message.text}</p>

      <ul className={styles.items}>
        {order.items.map((item) => (
          <li key={`${item.name}-${item.presentation}`}>
            <span>
              {item.quantity} × {item.name} · {item.presentation}
            </span>
            <span>{formatPrice(item.line_total)}</span>
          </li>
        ))}
        <li>
          <span>Envío</span>
          <span>{formatPrice(order.shipping)}</span>
        </li>
        <li className={styles.total}>
          <span>Total</span>
          <strong>{formatPrice(order.total)} COP</strong>
        </li>
      </ul>

      <Link to={order.status === 'approved' ? '/recetas' : '/carrito'} className="btn btn-primary">
        {order.status === 'approved' ? 'Ver recetas para tu café' : 'Volver al carrito'}
      </Link>
    </div>
  );
}
