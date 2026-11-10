import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PageIntro from '../PageIntro';

describe('PageIntro', () => {
  // Caso 1: Renderizado del título principal (h1)
  describe('Caso 1: Renderizado del título principal (h1)', () => {
    it('renderiza el título principal dentro de un encabezado h1', () => {
      const testTitle = 'Nuestras Recetas';
      render(<PageIntro title={testTitle} />);

      const heading = screen.getByRole('heading', { level: 1, name: testTitle });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
      expect(heading).toHaveTextContent(testTitle);
    });
  });

  // Caso 2: Renderizado del párrafo lead descriptivo
  describe('Caso 2: Renderizado del párrafo lead descriptivo', () => {
    it('renderiza el párrafo con clase lead cuando se proporciona children', () => {
      const description = 'Descubre las mejores recetas y métodos para preparar café en casa.';
      const { container } = render(
        <PageIntro title="Recetas">{description}</PageIntro>
      );

      const paragraph = screen.getByText(description);
      expect(paragraph).toBeInTheDocument();
      expect(paragraph.tagName).toBe('P');
      expect(paragraph).toHaveClass('lead');
      expect(container.querySelector('p.lead')).toBeInTheDocument();
    });

    it('no renderiza el párrafo lead si no se proporciona children', () => {
      const { container } = render(<PageIntro title="Recetas" />);

      expect(container.querySelector('p.lead')).toBeNull();
      expect(container.querySelector('p')).toBeNull();
    });
  });

  // Caso 3: Renderizado condicional de la imagen de fondo con atributo src
  describe('Caso 3: Renderizado condicional de la imagen de fondo con atributo src', () => {
    it('renderiza la imagen de fondo con el atributo src correcto cuando se pasa la prop image', () => {
      const imageUrl = '/assets/images/recetas.jpeg';
      const { container } = render(
        <PageIntro title="Recetas" image={imageUrl} />
      );

      const imageElement = container.querySelector('img');
      expect(imageElement).toBeInTheDocument();
      expect(imageElement).toHaveAttribute('src', imageUrl);
      expect(imageElement).toHaveAttribute('alt', '');
    });

    it('no renderiza la imagen de fondo cuando la prop image no está presente', () => {
      const { container } = render(<PageIntro title="Recetas" />);

      const imageElement = container.querySelector('img');
      expect(imageElement).toBeNull();
    });
  });
});
