import { Link } from 'react-router-dom';
import Logo from './Logo';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo />
          <p>Café de San Pablo, Nariño, y una guía para prepararlo: de la finca a la taza.</p>
        </div>
        <nav aria-label="Secciones" className={styles.links}>
          <Link to="/tienda">Tienda</Link>
          <Link to="/cultura">Cultura del café</Link>
          <Link to="/variedades">Variedades</Link>
          <Link to="/metodos">Métodos de preparación</Link>
          <Link to="/recetas">Recetario</Link>
          <Link to="/terminos">Términos y condiciones</Link>
        </nav>
      </div>
      <p className={`container ${styles.legal}`}>
        Proyecto académico, Desarrollo de Software II, Universidad del Valle, {new Date().getFullYear()}.
      </p>
    </footer>
  );
}
