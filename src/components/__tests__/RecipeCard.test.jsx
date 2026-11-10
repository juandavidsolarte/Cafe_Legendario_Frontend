import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import RecipeCard from '../RecipeCard';
import { formatTime } from '../../utils/format';

const recipe = {
  slug: 'capuchino',
  name: 'Capuchino',
  description: 'Espresso con leche texturizada',
  image: 'capuchino.jpg',
  difficulty: 'Media',
  time: 8,
};

describe('RecipeCard', () => {
  // Caso 1: Renderizado envuelto en MemoryRouter
  it('se renderiza correctamente dentro de MemoryRouter', () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={recipe} />
      </MemoryRouter>
    );
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  // Caso 2: Validación del nombre, descripción y etiqueta de dificultad
  it('muestra el nombre, descripción y dificultad de la receta', () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={recipe} />
      </MemoryRouter>
    );
    expect(screen.getByText('Capuchino')).toBeInTheDocument();
    expect(screen.getByText('Espresso con leche texturizada')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
  });

  // Caso 3: Validación del tiempo formateado usando formatTime
  it('muestra el tiempo formateado correctamente con formatTime', () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={recipe} />
      </MemoryRouter>
    );
    expect(screen.getByText(formatTime(recipe.time))).toBeInTheDocument();
  });
});