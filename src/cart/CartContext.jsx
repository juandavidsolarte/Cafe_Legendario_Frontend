import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProducts } from '../services/contentService';

const STORAGE_KEY = 'cafe-legendario:carrito';
const MAX_PER_LINE = 20;

// Valor por defecto: permite usar los componentes sin proveedor (pruebas unitarias).
const CartContext = createContext({
  lines: [],
  ready: true,
  count: 0,
  subtotal: 0,
  isOpen: false,
  add: () => {},
  setQuantity: () => {},
  remove: () => {},
  clear: () => {},
  open: () => {},
  close: () => {},
});

function readStored() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.filter((item) => typeof item.sku === 'string' && Number.isInteger(item.quantity) && item.quantity > 0);
  } catch {
    return [];
  }
}

const clamp = (quantity) => Math.max(1, Math.min(MAX_PER_LINE, quantity));

/**
 * Carrito de compras. Solo guarda el SKU y cuántas unidades (en el navegador);
 * el precio se lee siempre del catálogo, nunca de lo guardado.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(readStored);
  const [isOpen, setOpen] = useState(false);
  const [catalog, setCatalog] = useState(null);

  useEffect(() => {
    let active = true;
    getProducts()
      .then((products) => active && setCatalog(products))
      .catch(() => active && setCatalog([]));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Sin almacenamiento disponible el carrito vive solo en esta sesión.
    }
  }, [items]);

  const add = useCallback((sku, quantity = 1) => {
    setItems((current) => {
      const found = current.find((item) => item.sku === sku);
      if (found) {
        return current.map((item) => (item.sku === sku ? { ...item, quantity: clamp(item.quantity + quantity) } : item));
      }
      return [...current, { sku, quantity: clamp(quantity) }];
    });
    setOpen(true);
  }, []);

  const setQuantity = useCallback((sku, quantity) => {
    setItems((current) => current.map((item) => (item.sku === sku ? { ...item, quantity: clamp(quantity) } : item)));
  }, []);

  const remove = useCallback((sku) => {
    setItems((current) => current.filter((item) => item.sku !== sku));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(() => {
    // Mientras el catálogo carga no hay líneas; lo guardado se conserva.
    const lines = items
      .map((item) => {
        for (const product of catalog || []) {
          const variant = product.variants.find((entry) => entry.sku === item.sku);
          if (variant) return { product, variant, quantity: item.quantity, total: variant.price * item.quantity };
        }
        return null;
      })
      .filter(Boolean);
    return {
      lines,
      ready: catalog !== null,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: lines.reduce((sum, line) => sum + line.total, 0),
      isOpen,
      add,
      setQuantity,
      remove,
      clear,
      open,
      close,
    };
  }, [items, catalog, isOpen, add, setQuantity, remove, clear, open, close]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

export { MAX_PER_LINE };
