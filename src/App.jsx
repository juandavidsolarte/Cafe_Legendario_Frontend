import { Route, Routes } from 'react-router-dom';
import { CartProvider } from './cart/CartContext';
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
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderStatus from './pages/OrderStatus';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <CartProvider>
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
          <Route path="tienda/:slug" element={<ProductDetail />} />
          <Route path="carrito" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="pedido/:reference" element={<OrderStatus />} />
          <Route path="terminos" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}
