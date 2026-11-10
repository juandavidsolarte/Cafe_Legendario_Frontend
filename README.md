# Café Legendario — Frontend

Interfaz de la plataforma educativa Café Legendario: cultura, variedades, métodos de preparación y recetas de café.
El backend (Django + DRF) vive en un repositorio aparte (`cafe-legendario-backend`).

## Tecnologías

React 19, Vite 8, React Router 7, Axios. Estilos con CSS Modules y tokens en `src/styles/global.css`.

## Puesta en marcha

```bash
npm install
cp .env.example .env    # define VITE_API_URL=http://localhost:8000
npm run dev             # http://localhost:5173
npm run build           # genera dist/
```

Si `VITE_API_URL` está vacía, la app usa datos de ejemplo de `src/services/mockData.js`.
Es temporal: se elimina cuando la integración con la API esté terminada.

## Estructura

```
src/
├── assets/images/   # Fotografías
├── components/      # Header, Footer, Logo, RecipeCard, PageIntro, StatusMessage
├── hooks/           # useFetch
├── layouts/         # MainLayout
├── pages/           # Inicio, Cultura, Variedades, Métodos, Recetario y detalles
├── services/        # api.js (Axios), contentService.js, mockData.js
├── styles/          # global.css
└── utils/
```

## Despliegue

Vercel: importar el repositorio y definir la variable `VITE_API_URL` con la URL del backend en Render.
`vercel.json` redirige todas las rutas a `index.html`.
