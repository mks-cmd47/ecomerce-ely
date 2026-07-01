"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartFloatingBar() {
  const { itemCount, total, canShop } = useCart();

  if (!canShop || itemCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-3 rounded-full border border-black/10 bg-white px-4 py-3 shadow-lg sm:left-auto sm:right-6 sm:translate-x-0">
      <p className="text-sm">
        <span className="font-semibold">{itemCount}</span> en carrito ·{" "}
        <span className="font-semibold">${total.toFixed(2)}</span>
      </p>
      <Link
        href="/carrito"
        className="shrink-0 rounded-full bg-[#845f4a] px-4 py-2 text-sm font-medium text-white hover:bg-[#845f4a]/90"
      >
        Ver carrito
      </Link>
    </div>
  );
}
