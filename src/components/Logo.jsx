import { Link } from 'react-router-dom';
import mark from '../assets/images/logo-cafe-legendario.webp';
import styles from './Logo.module.css';

export default function Logo() {
  return (
    <Link to="/" className={styles.logo} aria-label="Café Legendario, ir al inicio">
      <img className={styles.mark} src={mark} alt="" width="228" height="208" decoding="async" />
      <span className={styles.word}>
        Café <em>Legendario</em>
      </span>
    </Link>
  );
}
