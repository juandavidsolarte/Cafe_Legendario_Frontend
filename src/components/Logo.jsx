import { Link } from 'react-router-dom';
import styles from './Logo.module.css';

export default function Logo() {
  return (
    <Link to="/" className={styles.logo} aria-label="Café Legendario, ir al inicio">
      <svg className={styles.mark} viewBox="0 0 40 40" aria-hidden="true">
        <ellipse cx="20" cy="20" rx="11" ry="16" transform="rotate(24 20 20)" fill="currentColor" />
        <path d="M16.5 6.5c6 6.5-4.5 15.5 4 27" stroke="var(--bg)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </svg>
      <span className={styles.word}>
        Café <em>Legendario</em>
      </span>
    </Link>
  );
}
