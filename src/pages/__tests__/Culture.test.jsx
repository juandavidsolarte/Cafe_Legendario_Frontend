import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Culture from '../Culture';

// Mock del hook useFetch para controlar los estados en las pruebas
vi.mock('../../hooks/useFetch');
import useFetch from '../../hooks/useFetch';

const mockArticles = [
  {
    id: 1,
    slug: 'origen-del-cafe',
    title: 'El pastor y las cabras inquietas',
    topic: 'Origen',
    body: 'La leyenda cuenta que en Etiopía un pastor llamado Kaldi notó que sus cabras no dormían tras comer los frutos rojos.',
    image: 'origen.jpg',
  },
  {
    id: 2,
    slug: 'historia-europa',
    title: 'De los monasterios a las cafeterías de Europa',
    topic: 'Historia',
    body: 'Desde el mar Rojo hasta Yemen, el café llegó a los puertos italianos y transformó la vida social europea.',
    image: 'historia.jpg',
  },
];

describe('Culture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Caso 1: Renderizado de la sección de artículos y tabla de contenidos con datos cargados ───
  describe('Caso 1: Renderizado de la sección de artículos y tabla de contenidos con datos cargados', () => {
    it('renderiza la tabla de contenidos (nav) con enlaces ancla a cada artículo', () => {
      useFetch.mockReturnValue({ data: mockArticles, loading: false, error: null });

      render(
        <MemoryRouter>
          <Culture />
        </MemoryRouter>
      );

      const nav = screen.getByRole('navigation', { name: 'Temas' });
      expect(nav).toBeInTheDocument();

      const linkOrigen = screen.getByRole('link', { name: 'Origen' });
      expect(linkOrigen).toBeInTheDocument();
      expect(linkOrigen).toHaveAttribute('href', '#origen-del-cafe');

      const linkHistoria = screen.getByRole('link', { name: 'Historia' });
      expect(linkHistoria).toBeInTheDocument();
      expect(linkHistoria).toHaveAttribute('href', '#historia-europa');
    });

    it('renderiza los artículos con título, tema, cuerpo e imagen correspondiente', () => {
      useFetch.mockReturnValue({ data: mockArticles, loading: false, error: null });

      const { container } = render(
        <MemoryRouter>
          <Culture />
        </MemoryRouter>
      );

      mockArticles.forEach((article) => {
        expect(
          screen.getByRole('heading', { level: 2, name: article.title })
        ).toBeInTheDocument();
        expect(screen.getByText(article.body)).toBeInTheDocument();

        const articleElement = container.querySelector(`article#${article.slug}`);
        expect(articleElement).toBeInTheDocument();

        const img = articleElement.querySelector('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', article.image);
      });
    });
  });

  // ─── Caso 2: Expansión y colapso interactivo de preguntas y respuestas en la sección FAQ ───────
  describe('Caso 2: Expansión y colapso interactivo de preguntas y respuestas en la sección FAQ', () => {
    it('muestra las preguntas de FAQ con respuestas inicialmente colapsadas', () => {
      useFetch.mockReturnValue({ data: mockArticles, loading: false, error: null });

      render(
        <MemoryRouter>
          <Culture />
        </MemoryRouter>
      );

      const faqButtons = screen.getAllByRole('button');
      expect(faqButtons).toHaveLength(3);

      faqButtons.forEach((btn) => {
        expect(btn).toHaveAttribute('aria-expanded', 'false');
      });

      expect(
        screen.queryByText(/Por la combinación de altitud, suelos volcánicos/i)
      ).not.toBeInTheDocument();
    });

    it('expande y colapsa una respuesta al hacer clic en la pregunta', async () => {
      useFetch.mockReturnValue({ data: mockArticles, loading: false, error: null });
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Culture />
        </MemoryRouter>
      );

      const faq1Button = screen.getByRole('button', {
        name: /¿Por qué Colombia destaca en la producción de café suave\?/i,
      });

      // 1. Clic para expandir
      await user.click(faq1Button);
      expect(faq1Button).toHaveAttribute('aria-expanded', 'true');
      expect(
        screen.getByText(/Por la combinación de altitud, suelos volcánicos/i)
      ).toBeInTheDocument();

      // 2. Segundo clic para colapsar
      await user.click(faq1Button);
      expect(faq1Button).toHaveAttribute('aria-expanded', 'false');
      expect(
        screen.queryByText(/Por la combinación de altitud, suelos volcánicos/i)
      ).not.toBeInTheDocument();
    });

    it('alterna la pregunta activa cerrando la anterior al hacer clic en otra', async () => {
      useFetch.mockReturnValue({ data: mockArticles, loading: false, error: null });
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Culture />
        </MemoryRouter>
      );

      const faq1Button = screen.getByRole('button', {
        name: /¿Por qué Colombia destaca en la producción de café suave\?/i,
      });
      const faq2Button = screen.getByRole('button', {
        name: /¿Cuál es la diferencia principal entre café arábica y robusta\?/i,
      });

      // Abrir FAQ 1
      await user.click(faq1Button);
      expect(faq1Button).toHaveAttribute('aria-expanded', 'true');
      expect(
        screen.getByText(/Por la combinación de altitud, suelos volcánicos/i)
      ).toBeInTheDocument();

      // Abrir FAQ 2: debe abrir FAQ 2 y cerrar FAQ 1
      await user.click(faq2Button);
      expect(faq1Button).toHaveAttribute('aria-expanded', 'false');
      expect(faq2Button).toHaveAttribute('aria-expanded', 'true');
      expect(
        screen.queryByText(/Por la combinación de altitud, suelos volcánicos/i)
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(/El grano arábica crece a mayor altitud/i)
      ).toBeInTheDocument();
    });
  });

  // ─── Caso 3: Renderizado de componente StatusMessage en estados loading y error ────────────────
  describe('Caso 3: Renderizado de componente StatusMessage en estados loading y error', () => {
    it('muestra el componente StatusMessage en estado loading', () => {
      useFetch.mockReturnValue({ data: null, loading: true, error: null });

      render(
        <MemoryRouter>
          <Culture />
        </MemoryRouter>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Preparando el contenido…')).toBeInTheDocument();
      expect(screen.queryByRole('navigation', { name: 'Temas' })).not.toBeInTheDocument();
    });

    it('muestra el componente StatusMessage con mensaje de alerta en estado error', () => {
      useFetch.mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Error al cargar artículos'),
      });

      render(
        <MemoryRouter>
          <Culture />
        </MemoryRouter>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('No pudimos cargar los artículos.')).toBeInTheDocument();
      expect(
        screen.getByText('Revisa tu conexión y recarga la página.')
      ).toBeInTheDocument();
      expect(screen.queryByRole('navigation', { name: 'Temas' })).not.toBeInTheDocument();
    });
  });
});
