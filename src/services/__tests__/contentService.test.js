import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Mock de mockData ────────────────────────────────────────────────────────
// Se reemplaza ANTES de importar contentService para que `useMock` sea true
// (VITE_API_URL no existe en el entorno de test).
vi.mock('../mockData', () => ({
  categories: [
    { id: 1, slug: 'calientes', name: 'Calientes' },
    { id: 2, slug: 'frias', name: 'Frías' },
    { id: 3, slug: 'especiales', name: 'Especiales' },
  ],
  methods: [
    {
      id: 1,
      slug: 'espresso',
      name: 'Espresso',
      summary: 'Agua caliente a presión atraviesa café molido muy fino.',
    },
    {
      id: 2,
      slug: 'prensa-francesa',
      name: 'Prensa francesa',
      summary: 'Inmersión total y filtro metálico.',
    },
  ],
  // El resto de colecciones que importa contentService
  varieties: [],
  articles: [],
  recipes:  [],
}));

// Silencia el delay de 250 ms para que los tests sean instantáneos
vi.useFakeTimers();

import {
  getCategories,
  getMethod,
} from '../contentService';

// ─── helpers ────────────────────────────────────────────────────────────────
/** Resuelve todas las promesas pendientes y avanza los timers de `delay`. */
async function flush() {
  await Promise.resolve();
  vi.runAllTimers();
  await Promise.resolve();
}

// ────────────────────────────────────────────────────────────────────────────

describe('contentService', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  // ── Caso 1: getCategories() ──────────────────────────────────────────────
  describe('getCategories()', () => {
    it('retorna una promesa', () => {
      const result = getCategories();
      expect(result).toBeInstanceOf(Promise);
      // Evitar unhandled rejection
      result.catch(() => {});
    });

    it('resuelve con el listado completo de categorías', async () => {
      const promise = getCategories();
      await flush();
      const categories = await promise;

      expect(Array.isArray(categories)).toBe(true);
      expect(categories).toHaveLength(3);
    });

    it('cada categoría tiene slug y name', async () => {
      const promise = getCategories();
      await flush();
      const categories = await promise;

      categories.forEach((cat) => {
        expect(cat).toHaveProperty('slug');
        expect(cat).toHaveProperty('name');
      });
    });

    it('incluye la categoría "calientes"', async () => {
      const promise = getCategories();
      await flush();
      const categories = await promise;

      expect(categories.some((c) => c.slug === 'calientes')).toBe(true);
    });
  });

  // ── Caso 2: getMethod(slug) ──────────────────────────────────────────────
  describe('getMethod(slug)', () => {
    it('retorna una promesa', () => {
      const result = getMethod('espresso');
      expect(result).toBeInstanceOf(Promise);
      result.catch(() => {});
    });

    it('resuelve con el método cuyo slug coincide', async () => {
      const promise = getMethod('espresso');
      await flush();
      const method = await promise;

      expect(method).toBeDefined();
      expect(method.slug).toBe('espresso');
      expect(method.name).toBe('Espresso');
    });

    it('resuelve correctamente para "prensa-francesa"', async () => {
      const promise = getMethod('prensa-francesa');
      await flush();
      const method = await promise;

      expect(method.slug).toBe('prensa-francesa');
      expect(method.name).toBe('Prensa francesa');
    });

    it('el item retornado contiene las propiedades esperadas', async () => {
      const promise = getMethod('espresso');
      await flush();
      const method = await promise;

      expect(method).toHaveProperty('id');
      expect(method).toHaveProperty('slug');
      expect(method).toHaveProperty('name');
      expect(method).toHaveProperty('summary');
    });
  });

  // ── Caso 3: rechazo con error 404 cuando el slug no existe ───────────────
  describe('getMethod(slug) — slug inexistente', () => {
    it('rechaza la promesa cuando el slug no existe', async () => {
      const promise = getMethod('slug-que-no-existe');
      await flush();

      await expect(promise).rejects.toThrow();
    });

    it('el error tiene status 404', async () => {
      const promise = getMethod('metodo-fantasma');
      await flush();

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });

    it('el mensaje de error indica contenido no encontrado', async () => {
      const promise = getMethod('inexistente');
      await flush();

      await expect(promise).rejects.toThrow('No encontramos este contenido.');
    });

    it('no resuelve — no devuelve undefined silencioso', async () => {
      let resolved = false;
      const promise = getMethod('no-existe')
        .then(() => { resolved = true; })
        .catch(() => {});

      await flush();
      await promise;

      expect(resolved).toBe(false);
    });
  });
});
