import { Link } from 'react-router-dom';
import Logo from './Logo';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo />
          <p>Una guía abierta para aprender del café: de la finca a la taza, sin registros ni compras.</p>
        </div>
        <nav aria-label="Secciones" className={styles.links}>
          <Link to="/cultura">Cultura del café</Link>
          <Link to="/variedades">Variedades</Link>
          <Link to="/metodos">Métodos de preparación</Link>
          <Link to="/recetas">Recetario</Link>
        </nav>
      </div>
      <p className={`container ${styles.legal}`}>
        Proyecto académico, Desarrollo de Software II, Universidad del Valle, {new Date().getFullYear()}.
      </p>
    </footer>
  );
}
