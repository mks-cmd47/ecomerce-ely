"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CartFloatingBar from "@/app/components/shop/CartFloatingBar";
import ProductDetailView from "./components/ProductDetailView";
import ProductosCatalog from "./components/ProductosCatalog";

function ProductosPageContent() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("producto");

  if (productSlug) {
    return <ProductDetailView productSlug={productSlug} />;
  }

  return (
    <div className="min-h-screen pb-24">
      <ProductosCatalog />
      <CartFloatingBar />
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-6 py-10">
          <p className="text-black/70">Cargando tienda...</p>
        </div>
      }
    >
      <ProductosPageContent />
    </Suspense>
  );
}
