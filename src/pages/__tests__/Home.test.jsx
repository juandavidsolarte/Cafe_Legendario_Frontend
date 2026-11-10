import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '../Home';
import { getMethods, getRecipes } from '../../services/contentService';

vi.mock('../../services/contentService', () => ({
  getRecipes: vi.fn(),
  getMethods: vi.fn(),
}));

const mockRecipes = [
  {
    id: 1,
    slug: 'cafe-campesino',
    name: 'Café Campesino',
    description: 'Café con panela y canela',
    image: 'campesino.jpg',
    difficulty: 'Fácil',
    time: 5,
    featured: true,
  },
  {
    id: 2,
    slug: 'cold-brew',
    name: 'Cold Brew',
    description: 'Extracción lenta en frío',
    image: 'cold-brew.jpg',
    difficulty: 'Media',
    time: 720,
    featured: true,
  },
];

const mockMethods = [
  {
    id: 1,
    slug: 'prensa-francesa',
    name: 'Prensa francesa',
    ratio: '1:15',
    grind: 'Gruesa',
    time: '4 min',
  },
  {
    id: 2,
    slug: 'chemex',
    name: 'Chemex',
    ratio: '1:16',
    grind: 'Media gruesa',
    time: '3:30 min',
  },
];

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRecipes.mockReturnValue(new Promise(() => {}));
    getMethods.mockReturnValue(new Promise(() => {}));
  });

  // Caso 1: Renderizado del hero principal y enlaces a /recetas y /cultura
  it('renderiza el hero principal con sus enlaces a /recetas y /cultura', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /El café se aprende taza a taza/i })
    ).toBeInTheDocument();

    const linkRecetas = screen.getByRole('link', { name: 'Ver el recetario' });
    expect(linkRecetas).toBeInTheDocument();
    expect(linkRecetas).toHaveAttribute('href', '/recetas');

    const linkCultura = screen.getByRole('link', { name: 'Conocer su origen' });
    expect(linkCultura).toBeInTheDocument();
    expect(linkCultura).toHaveAttribute('href', '/cultura');
  });

  // Caso 2: Renderizado de las 4 tarjetas de exploración (Cultura, Variedades, Métodos, Recetario)
  it('renderiza las 4 tarjetas de exploración con sus enlaces respectivos', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const cards = [
      { title: 'Cultura', href: '/cultura' },
      { title: 'Variedades', href: '/variedades' },
      { title: 'Métodos', href: '/metodos' },
      { title: 'Recetario', href: '/recetas' },
    ];

    cards.forEach(({ title, href }) => {
      const titleElement = screen.getByText(title);
      expect(titleElement).toBeInTheDocument();
      const linkElement = titleElement.closest('a');
      expect(linkElement).toHaveAttribute('href', href);
    });
  });

  // Caso 3: Renderizado de recetas destacadas (featured) y métodos recomendados al resolver useFetch
  it('renderiza las recetas destacadas y métodos recomendados al resolver useFetch', async () => {
    getRecipes.mockResolvedValue(mockRecipes);
    getMethods.mockResolvedValue(mockMethods);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(getRecipes).toHaveBeenCalledWith({ featured: true });
    expect(getMethods).toHaveBeenCalled();

    // Recetas destacadas
    expect(await screen.findByText('Café Campesino')).toBeInTheDocument();
    expect(screen.getByText('Cold Brew')).toBeInTheDocument();

    // Métodos recomendados
    expect(await screen.findByText('Prensa francesa')).toBeInTheDocument();
    expect(screen.getByText('Chemex')).toBeInTheDocument();
    expect(screen.getByText('1:15')).toBeInTheDocument();
    expect(screen.getByText('Gruesa')).toBeInTheDocument();
  });
});
