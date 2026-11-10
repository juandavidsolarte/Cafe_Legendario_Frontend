import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import RecipeCard from '../components/RecipeCard';

const recipe = {
  slug: 'capuchino',
  name: 'Capuchino',
  description: 'Espresso con leche texturizada',
  image: 'capuchino.jpg',
  difficulty: 'Media',
  time: 8,
};

describe('RecipeCard', () => {
  it('muestra el nombre, la dificultad y el tiempo de la receta', () => {
    render(<RecipeCard recipe={recipe} />, { wrapper: MemoryRouter });

    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('8 min')).toBeInTheDocument();
    expect(screen.getByText('Espresso con leche texturizada')).toBeInTheDocument();
  });

  it('enlaza al detalle de la receta', () => {
    render(<RecipeCard recipe={recipe} />, { wrapper: MemoryRouter });

    expect(screen.getByRole('link', { name: 'Capuchino' })).toHaveAttribute('href', '/recetas/capuchino');
  });
});
