import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StatusMessage from '../StatusMessage';

describe('StatusMessage', () => {
  // ─── Caso 1: modo loading ─────────────────────────────────────────────────
  describe('modo loading', () => {
    it('renderiza con role="status"', () => {
      render(<StatusMessage type="loading" />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('muestra el spinner (aria-hidden)', () => {
      const { container } = render(<StatusMessage type="loading" />);

      // El spinner es un <span aria-hidden="true">, no aparece en el árbol accesible.
      // Lo buscamos directamente en el DOM.
      const spinner = container.querySelector('[aria-hidden="true"]');
      expect(spinner).toBeInTheDocument();
    });

    it('usa el texto por defecto cuando no se pasa title', () => {
      render(<StatusMessage type="loading" />);

      expect(
        screen.getByText('Preparando el contenido…')
      ).toBeInTheDocument();
    });

    it('muestra el title personalizado cuando se pasa', () => {
      render(<StatusMessage type="loading" title="Cargando recetas…" />);

      expect(screen.getByText('Cargando recetas…')).toBeInTheDocument();
    });
  });

  // ─── Caso 2: modo error ───────────────────────────────────────────────────
  describe('modo error', () => {
    it('renderiza con role="alert"', () => {
      render(<StatusMessage type="error" title="Algo salió mal" />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('muestra el title del error', () => {
      render(<StatusMessage type="error" title="No se pudo cargar" />);

      expect(screen.getByText('No se pudo cargar')).toBeInTheDocument();
    });

    it('NO incluye spinner en modo error', () => {
      const { container } = render(
        <StatusMessage type="error" title="Error" />
      );

      expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    });
  });

  // ─── Caso 3: children y botón de acción opcional ──────────────────────────
  describe('children y acción opcional', () => {
    it('renderiza el texto children cuando se proporciona', () => {
      render(
        <StatusMessage type="error" title="Error">
          Intenta recargar la página.
        </StatusMessage>
      );

      expect(
        screen.getByText('Intenta recargar la página.')
      ).toBeInTheDocument();
    });

    it('NO renderiza párrafo de children si no se pasa', () => {
      render(<StatusMessage type="error" title="Error sin detalle" />);

      // Solo debe existir el <p> del title, no un segundo párrafo.
      const paragraphs = screen.getAllByRole('paragraph');
      expect(paragraphs).toHaveLength(1);
    });

    it('renderiza el botón de acción cuando se pasa la prop action', () => {
      const boton = (
        <button type="button">Reintentar</button>
      );

      render(
        <StatusMessage type="error" title="Fallo de red" action={boton} />
      );

      expect(
        screen.getByRole('button', { name: 'Reintentar' })
      ).toBeInTheDocument();
    });

    it('NO renderiza botón de acción si la prop action está ausente', () => {
      render(<StatusMessage type="error" title="Sin acción" />);

      expect(screen.queryByRole('button')).toBeNull();
    });

    it('renderiza children Y acción juntos correctamente', () => {
      const boton = <button type="button">Volver al inicio</button>;

      render(
        <StatusMessage type="error" title="Página no encontrada" action={boton}>
          El recurso solicitado no existe.
        </StatusMessage>
      );

      expect(
        screen.getByText('El recurso solicitado no existe.')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Volver al inicio' })
      ).toBeInTheDocument();
    });
  });
});
