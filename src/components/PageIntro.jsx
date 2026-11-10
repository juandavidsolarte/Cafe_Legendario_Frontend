import styles from './PageIntro.module.css';

// Encabezado de las páginas internas: título, texto y foto de fondo opcional.
export default function PageIntro({ title, children, image }) {
  return (
    <section className={styles.intro}>
      {image && <img className={styles.bg} src={image} alt="" />}
      <div className={`container ${styles.content}`}>
        <h1>{title}</h1>
        {children && <p className="lead">{children}</p>}
      </div>
    </section>
  );
}
