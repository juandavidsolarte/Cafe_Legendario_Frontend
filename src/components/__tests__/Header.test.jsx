import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Header from '../Header';

describe('Header', () => {
  // Caso 1: Renderizado del logotipo y de los enlaces de navegación (Cultura, Variedades, Métodos, Recetario)
  describe('Caso 1: Renderizado del logotipo y de los enlaces de navegación', () => {
    it('renderiza el logotipo con enlace al inicio', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      const logo = screen.getByRole('link', { name: /café legendario/i });
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('href', '/');
    });

    it('renderiza la barra de navegación con los enlaces requeridos', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      const nav = screen.getByRole('navigation', { name: 'Principal' });
      expect(nav).toBeInTheDocument();

      const expectedLinks = [
        { name: 'Cultura', href: '/cultura' },
        { name: 'Variedades', href: '/variedades' },
        { name: 'Métodos', href: '/metodos' },
        { name: 'Recetario', href: '/recetas' },
      ];

      expectedLinks.forEach(({ name, href }) => {
        const link = screen.getByRole('link', { name });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', href);
      });
    });
  });

  // Caso 2: Apertura y cierre del menú móvil mediante botón toggle actualizando aria-expanded
  describe('Caso 2: Apertura y cierre del menú móvil mediante botón toggle', () => {
    it('alterna el estado de aria-expanded y data-open al hacer clic en el botón toggle', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      const toggleButton = screen.getByRole('button', { name: /abrir menú/i });
      const nav = screen.getByRole('navigation', { name: 'Principal' });

      // Estado inicial: cerrado
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      expect(nav).toHaveAttribute('data-open', 'false');

      // Primer clic: abrir menú
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Cerrar menú')).toBeInTheDocument();
      expect(nav).toHaveAttribute('data-open', 'true');

      // Segundo clic: cerrar menú
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByText('Abrir menú')).toBeInTheDocument();
      expect(nav).toHaveAttribute('data-open', 'false');
    });
  });

  // Caso 3: Cierre automático del menú móvil al detectar cambio de ruta (pathname)
  describe('Caso 3: Cierre automático del menú móvil al detectar cambio de ruta (pathname)', () => {
    it('cierra el menú móvil al hacer clic en un enlace de navegación', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/']}>
          <Header />
        </MemoryRouter>
      );

      const toggleButton = screen.getByRole('button', { name: /abrir menú/i });
      const nav = screen.getByRole('navigation', { name: 'Principal' });

      // Abrir menú
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      expect(nav).toHaveAttribute('data-open', 'true');

      // Navegar a otra ruta mediante el enlace de Cultura
      const culturaLink = screen.getByRole('link', { name: 'Cultura' });
      await user.click(culturaLink);

      // Se cierra automáticamente tras el cambio de ruta
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      expect(nav).toHaveAttribute('data-open', 'false');
    });

    it('cierra el menú móvil cuando cambia el pathname mediante navegación externa', async () => {
      const user = userEvent.setup();

      function AppWithNavigation() {
        const navigate = useNavigate();
        return (
          <>
            <Header />
            <button type="button" onClick={() => navigate('/variedades')}>
              Navegar a otra ruta
            </button>
          </>
        );
      }

      render(
        <MemoryRouter initialEntries={['/']}>
          <AppWithNavigation />
        </MemoryRouter>
      );

      const toggleButton = screen.getByRole('button', { name: /abrir menú/i });
      const externalNavButton = screen.getByRole('button', { name: 'Navegar a otra ruta' });

      // Abrir menú
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      // Navegar a otra ruta
      await user.click(externalNavButton);

      // Se cierra automáticamente al actualizarse el pathname
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  // Comportamiento de scroll
  describe('Comportamiento de scroll', () => {
    it('aplica o remueve la clase solid según la posición del scroll', () => {
      const { container } = render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      const header = container.querySelector('header');

      // Scroll > 24px activa la clase solid
      act(() => {
        window.scrollY = 50;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(header.className).toMatch(/solid/);

      // Scroll <= 24px remueve la clase solid
      act(() => {
        window.scrollY = 0;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(header.className).not.toMatch(/solid/);
    });
  });
});
