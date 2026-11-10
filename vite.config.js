import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/test/**/*.test.{js,jsx}', 'src/**/__tests__/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      // lcov lo lee SonarQube; text se muestra en la terminal.
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/services/mockData.js', 'src/test/**', 'src/**/__tests__/**'],
    },
  },
});
