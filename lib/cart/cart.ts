import { ProductWithId } from "@/lib/firebase/products";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  publicId?: string;
  quantity: number;
  maxStock: number;
};

export type DirectPurchase = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  purchasedAt: string;
};

const LAST_PURCHASE_KEY = "ely-last-purchase";

export function getCartOwnerId(
  userId: string | null,
  isGuest: boolean,
): string {
  if (userId) {
    return userId;
  }

  if (isGuest) {
    return "guest";
  }

  return "anonymous";
}

function getCartStorageKey(ownerId: string): string {
  return `ely-cart-${ownerId}`;
}

export function productToCartItem(
  product: ProductWithId,
  quantity: number,
): CartItem {
  return {
    productId: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    publicId: product.publicId,
    quantity,
    maxStock: product.stock,
  };
}

export function readCartForOwner(ownerId: string): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = sessionStorage.getItem(getCartStorageKey(ownerId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCartForOwner(ownerId: string, items: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(getCartStorageKey(ownerId), JSON.stringify(items));
}

export function clearCartForOwner(ownerId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(getCartStorageKey(ownerId));
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function saveDirectPurchase(purchase: DirectPurchase): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(LAST_PURCHASE_KEY, JSON.stringify(purchase));
}

export function readLastDirectPurchase(): DirectPurchase | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(LAST_PURCHASE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as DirectPurchase;
  } catch {
    return null;
  }
}
