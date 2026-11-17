// Capa de acceso al contenido. Las páginas solo llaman a estas funciones.
// Con VITE_API_URL definida consulta la API REST de Django; sin ella usa datos
// de ejemplo para poder ver el bosquejo antes de que exista el backend.
import api, { API_URL } from './api';
import * as mock from './mockData';
import { productImages } from './productImages';

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

// ---------- Contenido desde la API ----------
// La API entrega algunos campos con otra forma que los datos de ejemplo; estas funciones
// los dejan iguales para que las páginas no distingan de dónde vienen.
// Si el administrador aún no subió una foto, se usa la foto local del contenido de ejemplo.
const localImage = (list, slug) => list.find((item) => item.slug === slug)?.image ?? mock.images.granos;
const withImage = (list) => (raw) => ({ ...raw, image: raw.image || localImage(list, raw.slug) });

const toMethod = withImage(mock.methods);
const toVariety = withImage(mock.varieties);
const toArticle = (raw) => ({ ...withImage(mock.articles)(raw), topic: raw.topic_label ?? raw.topic });
const toRecipe = (raw) => ({
  ...withImage(mock.recipes)(raw),
  category: raw.category?.slug ?? raw.category,
  difficulty: raw.difficulty_label ?? raw.difficulty,
  time: raw.prep_minutes ?? raw.time,
});

const DIFFICULTY_CODES = { Fácil: 'facil', Media: 'media', Avanzada: 'avanzada' };

/** Traduce los filtros de la página de recetas a los parámetros de la API. */
function recipeParams({ search, category, method, difficulty, featured } = {}) {
  const params = {};
  if (search?.trim()) params.search = search.trim();
  if (category) params.category = category;
  if (method) params.method = method;
  if (difficulty) params.difficulty = DIFFICULTY_CODES[difficulty] ?? difficulty;
  if (featured) params.featured = true;
  return params;
}

export function getCategories() {
  return useMock ? fromMock(mock.categories) : get('/api/categories/');
}

export async function getMethods() {
  return useMock ? fromMock(mock.methods) : (await get('/api/methods/')).map(toMethod);
}

export async function getMethod(slug) {
  return useMock ? fromMock(mock.methods, slug) : toMethod(await get(`/api/methods/${slug}/`));
}

export async function getVarieties() {
  return useMock ? fromMock(mock.varieties) : (await get('/api/varieties/')).map(toVariety);
}

export async function getVariety(slug) {
  return useMock ? fromMock(mock.varieties, slug) : toVariety(await get(`/api/varieties/${slug}/`));
}

export async function getArticles() {
  return useMock ? fromMock(mock.articles) : (await get('/api/articles/')).map(toArticle);
}

// La API y los datos de ejemplo comparten forma; aquí se añaden las fotos y los nombres del frontend.
function toProduct(raw) {
  return {
    ...raw,
    variants: raw.variants.map((variant) => ({
      sku: variant.sku,
      grind: variant.grind,
      grindNote: variant.grind_note,
      weight: variant.weight,
      price: variant.price,
      available: variant.available,
      images: productImages(variant.sku, raw.name, variant.grind, {
        front: variant.image_front,
        back: variant.image_back,
      }),
    })),
  };
}

export async function getProducts() {
  const list = useMock ? await fromMock(mock.products) : await get('/api/products/');
  return list.map(toProduct);
}

export async function getProduct(slug) {
  return toProduct(useMock ? await fromMock(mock.products, slug) : await get(`/api/products/${slug}/`));
}

// ---------- Pedidos ----------
// Solo existen con el backend: sin API no hay dónde registrar un pedido.
export const ordersEnabled = !useMock;

/** Crea el pedido. Solo envía SKU y cantidades: el precio lo calcula el servidor. */
export async function createOrder({ contact, items }) {
  const { data } = await api.post('/api/orders/', {
    contact: {
      email: contact.email,
      first_name: contact.firstName,
      last_name: contact.lastName,
      document_type: contact.documentType,
      document_number: contact.documentNumber,
      phone: contact.phone,
      address: contact.address,
      address_extra: contact.addressExtra || '',
      department: contact.department,
      city: contact.city,
    },
    items,
    accept_terms: true,
  });
  return data;
}

export async function getOrder(reference) {
  const { data } = await api.get(`/api/orders/${encodeURIComponent(reference)}/`);
  return data;
}

export async function getRecipe(slug) {
  return useMock ? fromMock(mock.recipes, slug) : toRecipe(await get(`/api/recipes/${slug}/`));
}

export async function getRecipes(filters = {}) {
  if (!useMock) return (await get('/api/recipes/', recipeParams(filters))).map(toRecipe);
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
