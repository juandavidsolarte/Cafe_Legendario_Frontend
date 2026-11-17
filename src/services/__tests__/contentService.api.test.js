import { beforeEach, describe, expect, it, vi } from 'vitest';

// Con VITE_API_URL definida, contentService consulta la API. Se simula la API con
// respuestas que tienen la misma forma que las de Django.
const get = vi.hoisted(() => vi.fn());
vi.mock('../api', () => ({ default: { get }, API_URL: 'http://api.test' }));

vi.mock('../mockData', () => ({
  images: { granos: 'granos.jpg' },
  recipes: [{ slug: 'cold-brew', image: 'frio.jpg' }],
  methods: [{ slug: 'espresso', image: 'espresso.jpg' }],
  varieties: [{ slug: 'tipica', image: 'montana.jpg' }],
  articles: [{ slug: 'origen', image: 'montana.jpg' }],
  categories: [],
  products: [],
}));

import { getArticles, getMethods, getRecipe, getRecipes, getVarieties } from '../contentService';

const apiRecipe = {
  id: 2,
  slug: 'cold-brew',
  name: 'Cold brew clásico',
  image: null,
  category: { id: 2, slug: 'frias', name: 'Frías' },
  method: 'prensa-francesa',
  difficulty: 'facil',
  difficulty_label: 'Fácil',
  prep_minutes: 960,
  featured: true,
  coffee: { grams: 80, grind: 'Gruesa' },
};

describe('contentService con la API', () => {
  beforeEach(() => get.mockReset());

  it('deja la receta con la forma que usan las páginas', async () => {
    get.mockResolvedValue({ data: apiRecipe });
    const recipe = await getRecipe('cold-brew');
    expect(get).toHaveBeenCalledWith('/api/recipes/cold-brew/', { params: undefined });
    expect(recipe).toMatchObject({
      category: 'frias',
      difficulty: 'Fácil',
      time: 960,
      image: 'frio.jpg',
      coffee: { grams: 80, grind: 'Gruesa' },
    });
  });

  it('traduce los filtros y lee la lista paginada', async () => {
    get.mockResolvedValue({ data: { count: 1, results: [apiRecipe] } });
    const list = await getRecipes({ search: ' cold ', difficulty: 'Fácil', featured: true, category: '' });
    expect(get).toHaveBeenCalledWith('/api/recipes/', {
      params: { search: 'cold', difficulty: 'facil', featured: true },
    });
    expect(list[0].category).toBe('frias');
  });

  it('respeta la foto que suba el administrador', async () => {
    get.mockResolvedValue({ data: [{ slug: 'espresso', image: 'https://cdn.test/espresso.webp' }] });
    const [method] = await getMethods();
    expect(method.image).toBe('https://cdn.test/espresso.webp');
  });

  it('usa una foto local para variedades y artículos sin foto', async () => {
    get.mockResolvedValueOnce({ data: { results: [{ slug: 'tipica', image: null }] } });
    get.mockResolvedValueOnce({ data: [{ slug: 'nuevo', image: null, topic: 'origen', topic_label: 'Origen' }] });
    const [variety] = await getVarieties();
    const [article] = await getArticles();
    expect(variety.image).toBe('montana.jpg');
    expect(article).toMatchObject({ image: 'granos.jpg', topic: 'Origen' });
  });
});
