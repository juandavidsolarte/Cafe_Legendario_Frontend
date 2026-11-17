import { Link } from 'react-router-dom';
import styles from './Terms.module.css';

// Datos del vendedor. Los marcados como pendientes deben completarse antes de vender en línea.
const SELLER = {
  brand: 'Café Legendario',
  legalName: null,
  taxId: null,
  address: null,
  origin: 'San Pablo, Nariño, Colombia',
  phone: '+57 317 573 8277',
  email: 'cafe.especialidad.legendario@gmail.com',
};

const Pending = ({ children }) => <mark className={styles.pending}>{children} (pendiente)</mark>;

const SECTIONS = [
  {
    title: 'Introducción',
    body: (
      <>
        <p>
          Estas condiciones regulan el uso de este sitio web y la compra de productos de {SELLER.brand} a través de él.
          Al usar el sitio o hacer un pedido aceptas estas condiciones. Si no estás de acuerdo, no uses el sitio.
        </p>
        <p>Se aplican las condiciones vigentes en el momento en que haces cada pedido.</p>
      </>
    ),
  },
  {
    title: 'Quién vende',
    body: (
      <>
        <p>
          La venta la realiza {SELLER.legalName ?? <Pending>razón social o nombre del titular</Pending>}, identificado con{' '}
          {SELLER.taxId ?? <Pending>NIT o cédula</Pending>}, bajo la marca {SELLER.brand}.
        </p>
        <ul>
          <li>Domicilio y dirección de notificaciones: {SELLER.address ?? <Pending>dirección</Pending>}</li>
          <li>Origen del café: {SELLER.origin}</li>
          <li>
            Teléfono y WhatsApp: <a href="tel:+573175738277">{SELLER.phone}</a>
          </li>
          <li>
            Correo: <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'Tus datos personales',
    body: (
      <p>
        Usamos los datos que nos das (nombre, documento, dirección, teléfono y correo) solo para gestionar tu pedido,
        entregarlo y atender tus solicitudes, conforme a la Ley 1581 de 2012. Te pedimos autorización expresa en el
        formulario de compra. Puedes consultar, corregir o pedir que eliminemos tus datos escribiendo al correo de
        contacto. Declaras que los datos que entregas son verdaderos.
      </p>
    ),
  },
  {
    title: 'Uso del sitio',
    body: (
      <ul>
        <li>Usa el sitio solo para consultas y pedidos legítimos.</li>
        <li>No hagas pedidos falsos o fraudulentos. Podemos anularlos e informar a las autoridades.</li>
        <li>Danos datos de contacto exactos y avísanos si cambian. Sin ellos no podemos atender el pedido.</li>
      </ul>
    ),
  },
  {
    title: 'Quién puede comprar',
    body: (
      <p>
        Para comprar debes ser mayor de 18 años y tener capacidad legal para contratar. Los menores solo pueden comprar
        representados por quien corresponda según la ley.
      </p>
    ),
  },
  {
    title: 'Productos y disponibilidad',
    body: (
      <>
        <p>
          Vendemos café de especialidad en bolsas de 500 g, en grano o molido. Las fotos y descripciones corresponden al
          producto real; puede haber diferencias menores de color según tu pantalla.
        </p>
        <p>
          Todos los pedidos dependen de que haya existencias. Si un producto se agota después de tu compra, te
          avisaremos y podrás elegir entre el reembolso total, por el mismo medio de pago, o el cambio por otro producto
          de igual valor.
        </p>
      </>
    ),
  },
  {
    title: 'Cómo se hace un pedido',
    body: (
      <>
        <p>
          Añade los productos al carrito, completa tus datos de contacto y entrega, y realiza el pago. Antes de pagar
          verás un resumen con productos, precios y costo de envío para que puedas corregir cualquier error.
        </p>
        <p>
          Después del pago recibirás un correo de confirmación del pedido y otro aviso cuando lo despachemos. Guardamos
          constancia de cada transacción, como exige el artículo 50 de la Ley 1480 de 2011.
        </p>
        <p>
          Si detectas un error en tu pedido después de pagar, escríbenos cuanto antes. Lo corregiremos si aún no ha sido
          despachado.
        </p>
      </>
    ),
  },
  {
    title: 'Precio y pago',
    body: (
      <>
        <p>
          Los precios están en pesos colombianos (COP) e incluyen los impuestos aplicables. El costo de envío se muestra
          por separado antes de pagar. El precio que aplica es el publicado en el momento del pedido.
        </p>
        <p>
          El pago se procesa a través de una pasarela de pagos certificada, en su propio formulario seguro.{' '}
          {SELLER.brand} no recibe ni almacena los datos de tu tarjeta. <Pending>Pasarela y medios de pago</Pending>
        </p>
      </>
    ),
  },
  {
    title: 'Envíos',
    body: (
      <>
        <p>
          Hacemos envíos dentro de Colombia, salvo a zonas sin cobertura de las transportadoras, lo que te informaremos
          antes de finalizar la compra. <Pending>Tiempos de entrega y tarifas por destino</Pending>
        </p>
        <p>
          En todo caso, la entrega se hará dentro de los 30 días calendario siguientes a la compra, como establece el
          artículo 46 de la Ley 1480 de 2011. Si no cumplimos ese plazo, puedes desistir y recibir la devolución total de
          lo pagado.
        </p>
        <p>
          Te enviaremos el número de guía cuando la transportadora recoja el pedido. Eres responsable de darnos una
          dirección y un teléfono correctos.
        </p>
        <p>
          Si la transportadora no logra entregar el pedido tras dos intentos, este vuelve a nosotros. Puedes pedir un
          nuevo envío asumiendo su costo.
        </p>
      </>
    ),
  },
  {
    title: 'Derecho de retracto',
    body: (
      <>
        <p>
          Por ser una venta a distancia, tienes derecho a retractarte dentro de los cinco (5) días hábiles siguientes a
          la entrega, según el artículo 47 de la Ley 1480 de 2011. Para hacerlo, escríbenos y devuelve el producto
          cerrado, sin abrir y en las mismas condiciones en que lo recibiste. El costo de la devolución corre por tu
          cuenta. Te reintegraremos el dinero dentro de los 30 días calendario siguientes.
        </p>
        <p>
          La ley exceptúa de este derecho los bienes perecederos. Una bolsa de café que ya fue abierta no puede
          devolverse por retracto.
        </p>
      </>
    ),
  },
  {
    title: 'Garantía y productos en mal estado',
    body: (
      <p>
        Si el producto llega dañado, abierto, vencido o no corresponde a lo que pediste, escríbenos con una foto dentro
        de los cinco (5) días hábiles siguientes a la entrega. Lo repondremos sin costo o te devolveremos el dinero. Esto
        no limita la garantía legal que te reconoce el Estatuto del Consumidor.
      </p>
    ),
  },
  {
    title: 'Reversión del pago',
    body: (
      <>
        <p>
          Si pagaste con tarjeta u otro medio electrónico, puedes pedir la reversión del pago, conforme al artículo 51 de
          la Ley 1480 de 2011, cuando:
        </p>
        <ul>
          <li>hayas sido víctima de fraude;</li>
          <li>la operación no haya sido solicitada por ti;</li>
          <li>no recibas el producto;</li>
          <li>el producto no corresponda a lo solicitado; o</li>
          <li>el producto sea defectuoso.</li>
        </ul>
        <p>
          Debes presentar la queja ante nosotros y avisar a tu banco dentro de los cinco (5) días hábiles siguientes a
          conocer el hecho.
        </p>
      </>
    ),
  },
  {
    title: 'Propiedad intelectual',
    body: (
      <p>
        La marca, el logotipo, los textos, las fotografías y los videos de este sitio pertenecen a {SELLER.brand} o se
        usan con autorización. No pueden copiarse ni usarse con fines comerciales sin permiso escrito.
      </p>
    ),
  },
  {
    title: 'Cambios en estas condiciones',
    body: (
      <p>
        Podemos actualizar estas condiciones. Los cambios no afectan los pedidos ya realizados. La fecha de la última
        versión aparece al inicio de esta página.
      </p>
    ),
  },
  {
    title: 'Ley aplicable y reclamos',
    body: (
      <p>
        Estas condiciones se rigen por las leyes de Colombia, en especial la Ley 1480 de 2011 (Estatuto del Consumidor) y
        la Ley 1581 de 2012. Para peticiones, quejas o reclamos escríbenos a los canales de contacto. También puedes
        acudir a la Superintendencia de Industria y Comercio.
      </p>
    ),
  },
];

export default function Terms() {
  return (
    <article className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1>Términos y condiciones</h1>
        <p className={styles.meta}>Versión 0.1, noviembre de 2026. Borrador pendiente de revisión legal.</p>
      </header>

      <div className={styles.layout}>
        <nav className={styles.index} aria-label="Contenido">
          <ol>
            {SECTIONS.map((section, index) => (
              <li key={section.title}>
                <a href={`#clausula-${index + 1}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.body}>
          {SECTIONS.map((section, index) => (
            <section key={section.title} id={`clausula-${index + 1}`}>
              <h2>
                {index + 1}. {section.title}
              </h2>
              {section.body}
            </section>
          ))}
          <p className={styles.back}>
            <Link to="/tienda" className="btn btn-ghost">Volver a la tienda</Link>
          </p>
        </div>
      </div>
    </article>
  );
}
