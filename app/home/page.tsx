"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { getFirestoreErrorMessage } from "@/lib/firebase/firestore-errors";
import { getProducts, ProductWithId } from "@/lib/firebase/products";
import { isAdminUser } from "@/lib/firebase/roles";
import ProductCatalog from "./components/ProductCatalog";
import WelcomeBanner from "./components/WelcomeBanner";

export default function HomePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setIsProductsLoading(true);
    setProductsError(null);

    try {
      const catalog = await getProducts();
      setProducts(catalog);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProductsError(
        getFirestoreErrorMessage(
          error,
          "No se pudieron cargar los productos desde Firestore.",
        ),
      );
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const adminUser = await isAdminUser(currentUser);
        setIsAdmin(adminUser);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleProductDeleted = (productId: string) => {
    setProducts((current) =>
      current.filter((product) => product.id !== productId),
    );
  };

  return (
    <div>
      <WelcomeBanner isAdmin={isAdmin} />

      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <section>
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-3xl p-4 text-center font-semibold">
                Productos
              </h2>
              <p className="mt-1 text-sm text-center text-black/60">
                Haz click en un producto para ver el detalle.
              </p>
            </div>
          </div>

          {isProductsLoading ? (
            <p className="mt-6 text-black/70">Cargando catalogo...</p>
          ) : null}

          {productsError ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-red-600">{productsError}</p>
              <button
                type="button"
                onClick={loadProducts}
                className="rounded-lg border border-black/20 px-4 py-2 text-sm hover:bg-black/5"
              >
                Reintentar carga
              </button>
            </div>
          ) : null}

          {!isProductsLoading && !productsError ? (
            <ProductCatalog
              products={products}
              isAdmin={isAdmin}
              onProductDeleted={handleProductDeleted}
            />
          ) : null}
        </section>
      </main>
    </div>
  );
}
