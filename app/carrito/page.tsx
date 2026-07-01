"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CartItemRow from "@/app/components/shop/CartItemRow";
import { useCart } from "@/app/components/shop/CartProvider";
export default function CarritoPage() {
  const router = useRouter();
  const {
    items,
    itemCount,
    total,
    removeFromCart,
    updateQuantity,
    canShop,
    authReady,
    isAdmin,
  } = useCart();
  const [quantityError, setQuantityError] = useState<string | null>(null);

  if (!authReady) {
    return (
      <div className="min-h-screen">
        <p className="px-6 py-10 text-black/70">Cargando carrito...</p>
      </div>
    );
  }

  useEffect(() => {
    if (authReady && isAdmin) {
      router.replace("/admin");
    }
  }, [authReady, isAdmin, router]);

  if (isAdmin) {
    return null;
  }

  if (!canShop) {
    return (
      <div className="min-h-screen">
        <main className="mx-auto max-w-3xl px-6 py-10">
          <p className="text-black/70">El carrito no esta disponible.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link
          href="/productos"
          className="text-sm text-black/60 hover:text-black"
        >
          ← Seguir comprando
        </Link>

        <h2 className="mt-4 text-2xl font-bold">Tu carrito</h2>
        <p className="mt-1 text-sm text-black/70">
          Revisa los productos antes de ir al pago.
        </p>

        {itemCount === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-black/20 bg-white/60 p-8 text-center">
            <p className="text-black/70">Tu carrito esta vacio.</p>
            <Link
              href="/productos"
              className="mt-4 inline-block rounded-lg bg-[#845f4a] px-4 py-2 text-sm text-white"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            {quantityError ? (
              <p className="mt-4 text-sm text-red-600">{quantityError}</p>
            ) : null}

            <ul className="mt-6 space-y-4">
              {items.map((item) => (
                <CartItemRow
                  key={item.productId}
                  item={item}
                  editable
                  onRemove={() => removeFromCart(item.productId)}
                  onQuantityChange={(quantity) => {
                    const message = updateQuantity(item.productId, quantity);
                    setQuantityError(message);
                  }}
                />
              ))}
            </ul>

            <div className="mt-8 rounded-xl bg-white p-6 ring-1 ring-black/10">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                className="mt-4 block w-full rounded-lg bg-black py-3 text-center text-white hover:bg-black/90"
              >
                Proceder al pago
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
