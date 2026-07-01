"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { isAdminUser } from "@/lib/firebase/roles";
import { isGuestSession } from "@/lib/guest-session";
import {
  CartItem,
  clearCartForOwner,
  getCartItemCount,
  getCartOwnerId,
  getCartTotal,
  productToCartItem,
  readCartForOwner,
  writeCartForOwner,
} from "@/lib/cart/cart";
import { ProductWithId } from "@/lib/firebase/products";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  user: User | null;
  isAdmin: boolean;
  canShop: boolean;
  authReady: boolean;
  addToCart: (product: ProductWithId, quantity: number) => string | null;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => string | null;
  clearCart: () => void;
  isReady: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

function mergeCartItem(items: CartItem[], item: CartItem): CartItem[] {
  const existing = items.find((entry) => entry.productId === item.productId);

  if (!existing) {
    return [...items, item];
  }

  const nextQuantity = existing.quantity + item.quantity;
  if (nextQuantity > item.maxStock) {
    return items;
  }

  return items.map((entry) =>
    entry.productId === item.productId
      ? { ...entry, quantity: nextQuantity }
      : entry,
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [cartOwnerId, setCartOwnerId] = useState<string | null>(null);

  const itemsRef = useRef<CartItem[]>([]);
  const cartOwnerRef = useRef<string | null>(null);
  const isAdminRef = useRef(false);

  itemsRef.current = items;
  isAdminRef.current = isAdmin;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const guest = !currentUser && isGuestSession();
      const nextOwnerId = getCartOwnerId(currentUser?.uid ?? null, guest);
      const previousOwnerId = cartOwnerRef.current;
      const adminUser = currentUser ? await isAdminUser(currentUser) : false;

      if (
        previousOwnerId &&
        previousOwnerId !== nextOwnerId &&
        !isAdminRef.current
      ) {
        writeCartForOwner(previousOwnerId, itemsRef.current);
      }

      cartOwnerRef.current = nextOwnerId;
      setCartOwnerId(nextOwnerId);
      setUser(currentUser);
      setIsAdmin(adminUser);
      setAuthReady(true);

      if (adminUser) {
        setItems([]);
        clearCartForOwner(nextOwnerId);
      } else {
        setItems(readCartForOwner(nextOwnerId));
      }

      setIsReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isReady || !cartOwnerId || isAdmin) {
      return;
    }

    writeCartForOwner(cartOwnerId, items);
  }, [items, isReady, cartOwnerId, isAdmin]);

  const canShop = authReady && !isAdmin;

  const addToCart = useCallback(
    (product: ProductWithId, quantity: number) => {
      if (!canShop) {
        return isAdmin
          ? "Los administradores gestionan productos desde el panel admin, no desde la tienda."
          : "Espera a que cargue la sesion.";
      }

      if (quantity < 1) {
        return "La cantidad debe ser al menos 1.";
      }

      if (quantity > product.stock) {
        return `Solo hay ${product.stock} unidades en stock.`;
      }

      let errorMessage: string | null = null;

      setItems((current) => {
        const existing = current.find(
          (entry) => entry.productId === product.id,
        );
        const nextQuantity = (existing?.quantity ?? 0) + quantity;

        if (nextQuantity > product.stock) {
          errorMessage = `Solo hay ${product.stock} unidades en stock.`;
          return current;
        }

        return mergeCartItem(current, productToCartItem(product, quantity));
      });

      return errorMessage;
    },
    [canShop, isAdmin],
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      if (!canShop) {
        return;
      }

      setItems((current) =>
        current.filter((item) => item.productId !== productId),
      );
    },
    [canShop],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (!canShop) {
        return "No puedes modificar el carrito en este momento.";
      }

      if (quantity < 1) {
        return "La cantidad debe ser al menos 1.";
      }

      let errorMessage: string | null = null;

      setItems((current) => {
        const item = current.find((entry) => entry.productId === productId);
        if (!item) {
          return current;
        }

        if (quantity > item.maxStock) {
          errorMessage = `Solo hay ${item.maxStock} unidades en stock.`;
          return current;
        }

        return current.map((entry) =>
          entry.productId === productId ? { ...entry, quantity } : entry,
        );
      });

      return errorMessage;
    },
    [canShop],
  );

  const clearCart = useCallback(() => {
    if (!cartOwnerId) {
      setItems([]);
      return;
    }

    setItems([]);
    clearCartForOwner(cartOwnerId);
  }, [cartOwnerId]);

  const value = useMemo(
    () => ({
      items,
      itemCount: canShop ? getCartItemCount(items) : 0,
      total: canShop ? getCartTotal(items) : 0,
      user,
      isAdmin,
      canShop,
      authReady,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isReady,
    }),
    [
      items,
      user,
      isAdmin,
      canShop,
      authReady,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isReady,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider.");
  }

  return context;
}
