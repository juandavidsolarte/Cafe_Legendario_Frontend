import { Link } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';

export default function NotFound() {
  return (
    <div className="container">
      <StatusMessage
        type="empty"
        title="Esta página no existe."
        action={<Link to="/" className="btn btn-primary">Ir al inicio</Link>}
      >
        Revisa la dirección o vuelve al inicio para seguir explorando.
      </StatusMessage>
    </div>
  );
}
