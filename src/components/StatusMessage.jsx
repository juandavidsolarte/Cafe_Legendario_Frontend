import styles from './StatusMessage.module.css';

// Estados compartidos de carga, error y vacío.
export default function StatusMessage({ type = 'loading', title, children, action }) {
  if (type === 'loading') {
    return (
      <div className={styles.box} role="status">
        <span className={styles.spinner} aria-hidden="true" />
        <p>{title || 'Preparando el contenido…'}</p>
      </div>
    );
  }

  return (
    <div className={styles.box} role={type === 'error' ? 'alert' : 'status'}>
      <p className={styles.title}>{title}</p>
      {children && <p className={styles.text}>{children}</p>}
      {action}
    </div>
  );
}
