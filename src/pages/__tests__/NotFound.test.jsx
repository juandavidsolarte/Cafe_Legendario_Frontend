import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import NotFound from '../NotFound';

describe('NotFound', () => {
  // Caso 1: Renderizado con MemoryRouter verificando título 'Esta página no existe.'
  it('renderiza con MemoryRouter verificando título "Esta página no existe."', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText('Esta página no existe.')).toBeInTheDocument();
    expect(
      screen.getByText('Revisa la dirección o vuelve al inicio para seguir explorando.')
    ).toBeInTheDocument();
  });

  // Caso 2: Verificación del botón de acción con enlace de retorno al inicio ('/')
  it('verifica el botón de acción con enlace de retorno al inicio ("/")', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const actionButton = screen.getByRole('link', { name: 'Ir al inicio' });
    expect(actionButton).toBeInTheDocument();
    expect(actionButton).toHaveAttribute('href', '/');
    expect(actionButton).toHaveClass('btn', 'btn-primary');
  });
});
