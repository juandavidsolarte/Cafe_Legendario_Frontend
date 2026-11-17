import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../cart/CartContext';
import Logo from './Logo';
import styles from './Header.module.css';

const links = [
  { to: '/tienda', label: 'Tienda' },
  { to: '/cultura', label: 'Cultura' },
  { to: '/variedades', label: 'Variedades' },
  { to: '/metodos', label: 'Métodos' },
  { to: '/recetas', label: 'Recetario' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { count, open: openCart } = useCart();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled || open ? styles.solid : ''}`}>
      <div className={`container ${styles.bar}`}>
        <Logo />
        <div className={styles.tools}>
          <button
            type="button"
            className={styles.cart}
            onClick={openCart}
            aria-label={count ? `Abrir el carrito, ${count} ${count === 1 ? 'artículo' : 'artículos'}` : 'Abrir el carrito'}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" />
              <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
            </svg>
            {count > 0 && (
              <span key={count} className={styles.badge} aria-hidden="true">
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="menu-principal"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="visually-hidden">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
            <span className={styles.burger} data-open={open} aria-hidden="true" />
          </button>
        </div>
        <nav id="menu-principal" className={styles.nav} data-open={open} aria-label="Principal">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
