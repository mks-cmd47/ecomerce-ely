"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { isAdminUser } from "@/lib/firebase/roles";
import AddProduct from "./components/AddProduct";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const adminUser = await isAdminUser(currentUser);

      if (!adminUser) {
        router.replace("/home");
        return;
      }

      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Dashboard Admin</h1>
            <p className="mt-1 text-sm text-black/70">
              Gestiona el catalogo de La Vida es Rosa.
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm text-black/70 sm:text-right">
              Validando permisos...
            </p>
          ) : null}

          {!isLoading && !user ? (
            <div className="space-y-2 sm:text-right">
              <p className="text-sm">No hay sesion iniciada.</p>
              <Link href="/login" className="text-sm underline">
                Ir a login
              </Link>
            </div>
          ) : null}

          {!isLoading && user ? (
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <p className="text-sm text-black/80">
                Sesion admin activa con:{" "}
                <strong className="text-black">{user.email}</strong>
              </p>
              <Link
                href="/home"
                className="text-sm font-medium underline"
              >
                Ver catalogo en Home
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-black px-4 py-2 text-sm text-white"
              >
                Cerrar sesion
              </button>
            </div>
          ) : null}
        </header>

        {!isLoading && user ? (
          <div className="space-y-6">
            <AddProduct />
          </div>
        ) : null}
      </div>
    </main>
  );
}
