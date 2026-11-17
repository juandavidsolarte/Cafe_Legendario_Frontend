import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Culture from './pages/Culture';
import Varieties from './pages/Varieties';
import VarietyDetail from './pages/VarietyDetail';
import Methods from './pages/Methods';
import MethodDetail from './pages/MethodDetail';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="cultura" element={<Culture />} />
        <Route path="variedades" element={<Varieties />} />
        <Route path="variedades/:slug" element={<VarietyDetail />} />
        <Route path="metodos" element={<Methods />} />
        <Route path="metodos/:slug" element={<MethodDetail />} />
        <Route path="recetas" element={<Recipes />} />
        <Route path="recetas/:slug" element={<RecipeDetail />} />
        <Route path="tienda" element={<Shop />} />
        <Route path="carrito" element={<Cart />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
