"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getFirestoreErrorMessage } from "@/lib/firebase/firestore-errors";
import { getProducts, ProductWithId } from "@/lib/firebase/products";
import ProductGrid from "./ProductGrid";

export default function ProductosCatalog() {
  const searchParams = useSearchParams();
  const categoriaFromUrl = searchParams.get("categoria");

  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState(
    categoriaFromUrl ?? "todas",
  );

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const catalog = await getProducts();
      setProducts(catalog);
    } catch (loadError) {
      console.error("Error al cargar productos:", loadError);
      setError(
        getFirestoreErrorMessage(
          loadError,
          "No se pudieron cargar los productos.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (categoriaFromUrl) {
      setCategoryFilter(categoriaFromUrl);
    }
  }, [categoriaFromUrl]);

  const categories = [
    "todas",
    ...Array.from(new Set(products.map((product) => product.category))),
  ];

  const filteredProducts =
    categoryFilter === "todas"
      ? products
      : products.filter((product) => product.category === categoryFilter);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <section className="mb-8">
        <h2 className="text-xl font-semibold">Catalogo por categorias</h2>
        <p className="mt-1 text-sm text-black/70">
          Haz click en un producto para ver fotos, descripcion y opciones de
          compra.
        </p>

        {categories.length > 1 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setCategoryFilter(category)}
                className={`rounded-full px-3 py-1 text-sm capitalize ${
                  categoryFilter === category
                    ? "bg-[#845f4a] text-white"
                    : "bg-white text-black/80 ring-1 ring-black/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {isLoading ? <p className="text-black/70">Cargando productos...</p> : null}

      {error ? (
        <div className="space-y-3">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={loadProducts}
            className="rounded-lg border border-black/20 px-4 py-2 text-sm"
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {!isLoading && !error ? (
        <ProductGrid products={filteredProducts} />
      ) : null}
    </main>
  );
}
