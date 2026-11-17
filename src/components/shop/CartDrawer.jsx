import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../cart/CartContext';
import { formatPrice } from '../../utils/format';
import CartLines from './CartLines';
import styles from './CartDrawer.module.css';

/**
 * Panel lateral del carrito. Se abre al añadir un producto o desde el icono de la cabecera.
 * Para ir a pagar hay que aceptar los términos y condiciones.
 */
export default function CartDrawer() {
  const { lines, count, subtotal, isOpen, close } = useCart();
  const [accepted, setAccepted] = useState(false);
  const panel = useRef(null);
  const closeButton = useRef(null);
  const returnFocus = useRef(null);
  const titleId = useId();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Al cambiar de página el panel se cierra.
  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return undefined;
    returnFocus.current = document.activeElement;
    closeButton.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;
      // El foco no sale del panel mientras está abierto.
      const focusable = panel.current.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled)');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocus.current?.focus?.();
    };
  }, [isOpen, close]);

  const goToCheckout = () => {
    close();
    navigate('/checkout');
  };

  return (
    <div className={styles.root} data-open={isOpen} inert={!isOpen}>
      <div className={styles.backdrop} onClick={close} aria-hidden="true" />
      <aside ref={panel} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className={styles.head}>
          <h2 id={titleId}>
            Carrito{' '}
            <span className={styles.count}>
              ({count} {count === 1 ? 'artículo' : 'artículos'})
            </span>
          </h2>
          <button ref={closeButton} type="button" className={styles.close} onClick={close} aria-label="Cerrar el carrito">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        {lines.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Tu carrito está vacío.</p>
            <p>Elige tu café en grano o molido.</p>
            <Link to="/tienda" className="btn btn-primary" onClick={close}>
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.scroll}>
              <CartLines onNavigate={close} />
            </div>
            <footer className={styles.foot}>
              <div className={styles.total}>
                <span>Total</span>
                <strong>{formatPrice(subtotal)} COP</strong>
              </div>
              <p className={styles.note}>El envío se calcula en el siguiente paso.</p>
              <label className={styles.accept}>
                <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
                <span>
                  Acepto los{' '}
                  <Link to="/terminos" onClick={close}>
                    términos y condiciones
                  </Link>
                </span>
              </label>
              <button type="button" className={`btn btn-primary ${styles.pay}`} disabled={!accepted} onClick={goToCheckout}>
                Pagar pedido
              </button>
              <Link to="/carrito" className={styles.viewCart} onClick={close}>
                Ver el carrito completo
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
