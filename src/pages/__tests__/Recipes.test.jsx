import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Recipes from '../Recipes';
import { getCategories, getMethods, getRecipes } from '../../services/contentService';

vi.mock('../../services/contentService', () => ({
  getRecipes: vi.fn(),
  getCategories: vi.fn(),
  getMethods: vi.fn(),
}));

const mockCategories = [
  { id: 1, slug: 'calientes', name: 'Calientes' },
  { id: 2, slug: 'frias', name: 'Frías' },
];

const mockMethods = [
  { id: 1, slug: 'espresso', name: 'Espresso' },
  { id: 2, slug: 'v60', name: 'V60' },
];

const mockRecipes = [
  {
    id: 1,
    slug: 'latte-helado',
    name: 'Latte helado',
    description: 'Espresso con leche fría',
    image: 'latte.jpg',
    difficulty: 'Fácil',
    time: 10,
  },
  {
    id: 2,
    slug: 'capuchino',
    name: 'Capuchino',
    description: 'Espresso con leche texturizada',
    image: 'capuchino.jpg',
    difficulty: 'Media',
    time: 8,
  },
];

// Muestra la query string actual para comprobar los parámetros de la URL.
function LocationDisplay() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

function renderRecipes(url = '/recetas') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Recipes />
      <LocationDisplay />
    </MemoryRouter>,
  );
}

describe('Recipes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCategories.mockResolvedValue(mockCategories);
    getMethods.mockResolvedValue(mockMethods);
    // Simula la API: filtra por nombre según el parámetro de búsqueda.
    getRecipes.mockImplementation(({ search = '' } = {}) =>
      Promise.resolve(mockRecipes.filter((recipe) => recipe.name.toLowerCase().includes(search.toLowerCase()))),
    );
  });

  // Caso 1: Renderizado inicial de los controles de filtro
  it('muestra el campo de búsqueda y los filtros de categoría, método y dificultad', async () => {
    renderRecipes();

    expect(screen.getByRole('searchbox', { name: 'Buscar receta por nombre' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Método' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Dificultad' })).toBeInTheDocument();

    // Las opciones de los selectores llegan desde el servicio
    expect(await screen.findByRole('option', { name: 'Frías' })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'V60' })).toBeInTheDocument();

    for (const level of ['Fácil', 'Media', 'Avanzada']) {
      expect(screen.getByRole('button', { name: level })).toHaveAttribute('aria-pressed', 'false');
    }
  });

  // Caso 2: Filtrado reactivo al escribir en el campo de búsqueda
  it('actualiza el parámetro "q" y vuelve a pedir las recetas al escribir', async () => {
    const user = userEvent.setup();
    renderRecipes();
    await screen.findByText('2 recetas');

    await user.type(screen.getByRole('searchbox', { name: 'Buscar receta por nombre' }), 'latte');

    expect(screen.getByTestId('location-search')).toHaveTextContent('?q=latte');
    expect(getRecipes).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'latte' }));
    expect(await screen.findByText('1 receta con estos filtros')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Capuchino' })).not.toBeInTheDocument();
  });

  // Caso 3: Lista de RecipeCard con datos y mensaje cuando no hay coincidencias
  it('muestra una tarjeta por receta', async () => {
    renderRecipes();

    expect(await screen.findByRole('link', { name: 'Latte helado' })).toHaveAttribute('href', '/recetas/latte-helado');
    expect(screen.getByRole('link', { name: 'Capuchino' })).toHaveAttribute('href', '/recetas/capuchino');
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('muestra el mensaje de lista vacía cuando ninguna receta coincide', async () => {
    renderRecipes('/recetas?q=zzz');

    expect(await screen.findByText('Ninguna receta coincide.')).toBeInTheDocument();
    expect(screen.getByText('Prueba con otro nombre o quita alguno de los filtros.')).toBeInTheDocument();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Ver todas las recetas' })).toBeInTheDocument();
  });
});
