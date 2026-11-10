// Capa de acceso al contenido. Las páginas solo llaman a estas funciones.
// Con VITE_API_URL definida consulta la API REST de Django; sin ella usa datos
// de ejemplo para poder ver el bosquejo antes de que exista el backend.
import api, { API_URL } from './api';
import * as mock from './mockData';

const useMock = !API_URL;
const delay = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 250));

function notFound() {
  const error = new Error('No encontramos este contenido.');
  error.status = 404;
  return error;
}

async function fromMock(list, slug) {
  if (!slug) return delay(list);
  const item = list.find((entry) => entry.slug === slug);
  if (!item) throw notFound();
  return delay(item);
}

async function get(path, params) {
  const { data } = await api.get(path, { params });
  return data.results ?? data;
}

export function getCategories() {
  return useMock ? fromMock(mock.categories) : get('/api/categories/');
}

export function getMethods() {
  return useMock ? fromMock(mock.methods) : get('/api/methods/');
}

export function getMethod(slug) {
  return useMock ? fromMock(mock.methods, slug) : get(`/api/methods/${slug}/`);
}

export function getVarieties() {
  return useMock ? fromMock(mock.varieties) : get('/api/varieties/');
}

export function getVariety(slug) {
  return useMock ? fromMock(mock.varieties, slug) : get(`/api/varieties/${slug}/`);
}

export function getArticles() {
  return useMock ? fromMock(mock.articles) : get('/api/articles/');
}

export function getRecipe(slug) {
  return useMock ? fromMock(mock.recipes, slug) : get(`/api/recipes/${slug}/`);
}

export async function getRecipes(filters = {}) {
  if (!useMock) return get('/api/recipes/', filters);
  const search = (filters.search || '').trim().toLowerCase();
  const result = mock.recipes.filter(
    (recipe) =>
      (!search || recipe.name.toLowerCase().includes(search)) &&
      (!filters.category || recipe.category === filters.category) &&
      (!filters.method || recipe.method === filters.method) &&
      (!filters.difficulty || recipe.difficulty === filters.difficulty) &&
      (!filters.featured || recipe.featured),
  );
  return delay(result);
}
