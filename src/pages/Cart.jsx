import { Link } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import StatusMessage from '../components/StatusMessage';

// Vista del carrito. Todavía no hay compra en línea: muestra el estado vacío real.
export default function Cart() {
  return (
    <>
      <PageIntro title="Carrito">Aquí verás los cafés que elijas cuando abramos la venta en línea.</PageIntro>
      <div className="container">
        <StatusMessage
          type="empty"
          title="Tu carrito está vacío."
          action={<Link to="/tienda" className="btn btn-primary">Ir a la tienda</Link>}
        >
          La compra en línea aún no está disponible.
        </StatusMessage>
      </div>
    </>
  );
}
