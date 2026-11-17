import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';
import { useCart } from '../cart/CartContext';
import { createOrder, ordersEnabled } from '../services/contentService';
import { formatPrice } from '../utils/format';
import styles from './Checkout.module.css';

const DEPARTMENTS = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá, D. C.', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá',
  'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira',
  'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
  'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada',
];

const DOCUMENTS = ['Cédula de ciudadanía', 'Cédula de extranjería', 'NIT', 'Pasaporte'];

function Field({ label, name, hint, className = '', children, ...input }) {
  return (
    <label className={`${styles.field} ${className}`}>
      <span>
        {label}
        {!input.required && !children && <em> (opcional)</em>}
      </span>
      {children || <input name={name} {...input} />}
      {hint && <small>{hint}</small>}
    </label>
  );
}

/**
 * Paso de datos del pedido. Los datos personales no se guardan en el navegador.
 * Con el backend configurado se envían a la API para registrar el pedido; sin él, se quedan en esta página.
 * El pago no se captura aquí: se hace en el formulario de Wompi.
 */
export default function Checkout() {
  const { lines, ready, count, subtotal } = useCart();
  const [step, setStep] = useState('datos');
  const [contact, setContact] = useState(null);
  const [order, setOrder] = useState(null);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState('');
  const top = useRef(null);

  if (!ready) return <StatusMessage title="Cargando tu pedido…" />;

  if (lines.length === 0) {
    return (
      <StatusMessage
        type="empty"
        title="No hay productos para pagar."
        action={<Link to="/tienda" className="btn btn-primary">Ir a la tienda</Link>}
      >
        Añade un café al carrito para continuar.
      </StatusMessage>
    );
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setContact(data);
    setFailure('');
    if (ordersEnabled) {
      // El servidor registra el pedido y calcula el total; aquí solo van SKU y cantidades.
      setSending(true);
      try {
        setOrder(
          await createOrder({
            contact: data,
            items: lines.map((line) => ({ sku: line.variant.sku, quantity: line.quantity })),
          }),
        );
      } catch (error) {
        const detail = error.response?.data;
        setFailure(
          error.response?.status === 400 && detail
            ? `Revisa los datos del pedido: ${Object.values(detail).flat().join(' ')}`
            : 'No pudimos registrar el pedido. Revisa tu conexión e inténtalo de nuevo.',
        );
        setSending(false);
        return;
      }
      setSending(false);
    }
    setStep('pago');
    top.current?.scrollIntoView({ block: 'start' });
  };

  const payment = order?.payment;
  const total = order?.total ?? subtotal;

  return (
    <div ref={top} className={`container ${styles.page}`}>
      <h1>Finalizar compra</h1>
      <ol className={styles.steps} aria-label="Pasos de la compra">
        <li aria-current={step === 'datos' ? 'step' : undefined}>Datos y entrega</li>
        <li aria-current={step === 'pago' ? 'step' : undefined}>Pago</li>
      </ol>

      <div className={styles.layout}>
        {step === 'datos' ? (
          <form className={styles.form} onSubmit={onSubmit}>
            <fieldset>
              <legend>Contacto</legend>
              <Field
                label="Correo electrónico"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue={contact?.email}
                hint="Aquí te enviaremos la confirmación del pedido."
              />
            </fieldset>

            <fieldset>
              <legend>Entrega</legend>
              <div className={styles.grid}>
                <Field label="Nombre" name="firstName" autoComplete="given-name" required defaultValue={contact?.firstName} />
                <Field label="Apellidos" name="lastName" autoComplete="family-name" required defaultValue={contact?.lastName} />
                <Field label="Tipo de documento" required>
                  <select name="documentType" required defaultValue={contact?.documentType || ''}>
                    <option value="" disabled>
                      Selecciona un tipo
                    </option>
                    {DOCUMENTS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Número de documento"
                  name="documentNumber"
                  inputMode="numeric"
                  required
                  defaultValue={contact?.documentNumber}
                />
                <Field
                  label="Dirección"
                  name="address"
                  autoComplete="address-line1"
                  required
                  className={styles.wide}
                  defaultValue={contact?.address}
                />
                <Field
                  label="Casa, apartamento, etc."
                  name="addressExtra"
                  autoComplete="address-line2"
                  className={styles.wide}
                  defaultValue={contact?.addressExtra}
                />
                <Field label="Departamento" required>
                  <select name="department" autoComplete="address-level1" required defaultValue={contact?.department || ''}>
                    <option value="" disabled>
                      Selecciona un departamento
                    </option>
                    {DEPARTMENTS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Ciudad o municipio" name="city" autoComplete="address-level2" required defaultValue={contact?.city} />
                <Field
                  label="Teléfono"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  className={styles.wide}
                  defaultValue={contact?.phone}
                  hint="Celular colombiano, para coordinar la entrega."
                />
              </div>
            </fieldset>

            <label className={styles.check}>
              <input type="checkbox" name="acceptData" required />
              <span>
                Acepto los <Link to="/terminos">términos y condiciones</Link> y autorizo el tratamiento de mis datos para
                gestionar este pedido.
              </span>
            </label>

            {failure && (
              <p className={styles.failure} role="alert">
                {failure}
              </p>
            )}

            <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={sending}>
              {sending ? 'Registrando el pedido…' : 'Continuar al pago'}
            </button>
          </form>
        ) : (
          <section className={styles.form} aria-labelledby="pago">
            <div className={styles.review}>
              <h2>Entrega</h2>
              <p>
                {contact.firstName} {contact.lastName} · {contact.phone}
                <br />
                {contact.address}
                {contact.addressExtra ? `, ${contact.addressExtra}` : ''}
                <br />
                {contact.city}, {contact.department}
                <br />
                {contact.email}
              </p>
              {!order && (
                <button type="button" className={styles.edit} onClick={() => setStep('datos')}>
                  Cambiar los datos
                </button>
              )}
            </div>

            <div className={styles.payment}>
              <h2 id="pago">Pago</h2>
              {payment ? (
                <>
                  <p>
                    <strong>Pedido {order.reference} registrado.</strong> Falta el pago.
                  </p>
                  <p>
                    Pagarás con tarjeta, PSE o Nequi en el formulario seguro de Wompi (Bancolombia). Los datos de tu
                    tarjeta nunca pasan por este sitio.
                  </p>
                  {/* Enlace a Wompi: lleva la referencia, el monto y la firma; ningún dato personal. */}
                  <a href={payment.checkout_url} className={`btn btn-primary ${styles.submit}`}>
                    Pagar {formatPrice(total)} en Wompi
                  </a>
                </>
              ) : (
                <>
                  <p>
                    <strong>El pago en línea todavía no está activo.</strong>{' '}
                    {order
                      ? `Tu pedido ${order.reference} quedó registrado, pero no se ha cobrado.`
                      : 'Tu pedido no se ha cobrado ni registrado.'}
                  </p>
                  <p>
                    Cuando lo activemos, pagarás con tarjeta, PSE o Nequi en el formulario seguro de Wompi
                    (Bancolombia). Los datos de tu tarjeta nunca pasarán por este sitio.
                  </p>
                  <button type="button" className={`btn btn-primary ${styles.submit}`} disabled>
                    Pagar ahora
                  </button>
                </>
              )}
            </div>
          </section>
        )}

        <aside className={styles.summary} aria-label="Resumen del pedido">
          <ul className={styles.items}>
            {lines.map(({ product, variant, quantity, total }) => (
              <li key={variant.sku}>
                <span className={styles.thumb}>
                  <img src={variant.images[0]?.src} alt="" />
                  <span className={styles.qty} aria-hidden="true">{quantity}</span>
                </span>
                <span className={styles.itemBody}>
                  <strong>{product.name}</strong>
                  <span>
                    {variant.grind} / {variant.weight}
                    <span className="visually-hidden">, {quantity} unidades</span>
                  </span>
                </span>
                <span className={styles.itemPrice}>{formatPrice(total)}</span>
              </li>
            ))}
          </ul>
          <div className={styles.row}>
            <span>
              Subtotal · {count} {count === 1 ? 'producto' : 'productos'}
            </span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className={styles.row}>
            <span>Envío</span>
            <span>{order ? formatPrice(order.shipping) : 'Por confirmar'}</span>
          </div>
          <div className={`${styles.row} ${styles.total}`}>
            <span>Total</span>
            <strong>{formatPrice(total)} COP</strong>
          </div>
          {!order && <Link to="/carrito" className={styles.edit}>Editar el carrito</Link>}
        </aside>
      </div>
    </div>
  );
}
