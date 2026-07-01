"use client";

import { CartProvider } from "@/app/components/shop/CartProvider";

export default function ShopProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
