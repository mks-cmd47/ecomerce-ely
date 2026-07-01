"use client";

import { ProductWithId } from "@/lib/firebase/products";
import ProductCardLink from "./ProductCardLink";

type ProductGridProps = {
  products: ProductWithId[];
};

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/20 bg-white/60 p-8 text-center text-black/70">
        No hay productos en esta categoria.
      </p>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCardLink product={product} />
        </li>
      ))}
    </ul>
  );
}
