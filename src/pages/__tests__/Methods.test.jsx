import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Methods from '../Methods';

// Mock del hook useFetch para controlar los estados en los tests
vi.mock('../../hooks/useFetch');
import useFetch from '../../hooks/useFetch';

const mockMethods = [
  {
    id: 1,
    slug: 'espresso',
    name: 'Espresso',
    summary: 'Agua caliente a presión atraviesa café molido muy fino.',
    image: 'espresso.jpg',
    ratio: '1 : 2',
    grind: 'Muy fina',
    time: '25–30 s',
  },
  {
    id: 2,
    slug: 'prensa-francesa',
    name: 'Prensa francesa',
    summary: 'Inmersión total y filtro metálico.',
    image: 'prensa.jpg',
    ratio: '1 : 15',
    grind: 'Gruesa',
    time: '4 min',
  },
];

describe('Methods', () => {
  // Caso 1: Renderizado del listado con especificaciones
  it('muestra los métodos con su ratio, molienda y tiempo', () => {
    useFetch.mockReturnValue({ data: mockMethods, loading: false, error: null });

    render(
      <MemoryRouter>
        <Methods />
      </MemoryRouter>
    );

    expect(screen.getByText('Espresso')).toBeInTheDocument();
    expect(screen.getByText('1 : 2')).toBeInTheDocument();
    expect(screen.getByText('Muy fina')).toBeInTheDocument();
    expect(screen.getByText('25–30 s')).toBeInTheDocument();

    expect(screen.getByText('Prensa francesa')).toBeInTheDocument();
    expect(screen.getByText('1 : 15')).toBeInTheDocument();
    expect(screen.getByText('Gruesa')).toBeInTheDocument();
    expect(screen.getByText('4 min')).toBeInTheDocument();
  });

  // Caso 2: Interacción con el carrusel/tabs de BREWING_TIPS
  it('alterna el tip activo al hacer clic en los botones de consejos', async () => {
    useFetch.mockReturnValue({ data: null, loading: false, error: null });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Methods />
      </MemoryRouter>
    );

    // El primer tip está activo por defecto
    expect(screen.getByText('Mantén el agua entre 90°C y 96°C. Si hierve, déjala reposar 45 segundos antes de verter.')).toBeInTheDocument();

    // Clic en el segundo tip
    await user.click(screen.getByRole('button', { name: 'Preinfusión o Bloom' }));
    expect(screen.getByText('Vierte el doble de agua respecto al peso del café y espera 30 segundos para liberar el CO2.')).toBeInTheDocument();

    // Clic en el tercer tip
    await user.click(screen.getByRole('button', { name: 'Calidad del agua' }));
    expect(screen.getByText('El 98% de la taza es agua. Usa agua filtrada con bajo residuo seco para resaltar los aromas.')).toBeInTheDocument();
  });

  // Caso 3: StatusMessage ante fallo de red
  it('muestra un mensaje de error cuando falla la carga de métodos', () => {
    useFetch.mockReturnValue({ data: null, loading: false, error: new Error('Network error') });

    render(
      <MemoryRouter>
        <Methods />
      </MemoryRouter>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('No pudimos cargar los métodos.')).toBeInTheDocument();
    expect(screen.getByText('Revisa tu conexión y recarga la página.')).toBeInTheDocument();
  });
});