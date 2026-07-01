"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { clearGuestSession, isGuestSession } from "@/lib/guest-session";
import { useCart } from "../components/shop/CartProvider";

const STORE_NAME = "La Vida es Rosa";

export default function Header() {
  const router = useRouter();
  const { itemCount, user, isAdmin, authReady, canShop } = useCart();
  const [isGuest, setIsGuest] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsGuest(isGuestSession());
    } else {
      setIsGuest(false);
    }
  }, [user]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  const handleLogout = async () => {
    await signOut(auth);
    clearGuestSession();
    setIsGuest(false);
    setMenuOpen(false);
    router.refresh();
  };

  const sessionLabel = (() => {
    if (!authReady) {
      return "Cargando...";
    }
    if (isAdmin) {
      return "Admin";
    }
    if (user) {
      return user.email ?? "Usuario";
    }
    if (isGuest) {
      return "Invitado";
    }
    return "Sin sesion";
  })();

  const navLinks = [
    { href: "/home", label: "Inicio" },
    { href: "/productos", label: "Productos" },
    ...(canShop ? [{ href: "/carrito", label: "Ver carrito" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Panel admin" }] : []),
    ...(!user && !isAdmin ? [{ href: "/login", label: "Iniciar sesion" }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 hover:bg-black/5"
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 bg-black" />
              <span className="block h-0.5 w-5 bg-black" />
              <span className="block h-0.5 w-5 bg-black" />
            </span>
          </button>

          <Link
            href="/productos"
            className="truncate font-title font-bold text-center text-lg text-black sm:text-xl"
          >
            {STORE_NAME}
          </Link>

          <div className="flex items-center justify-end gap-2">
            <span
              className={`hidden max-w-[10rem] truncate rounded-full px-2.5 py-1 text-xs font-medium sm:inline-block ${
                isAdmin ? "bg-[#845f4a] text-white" : "bg-black/5 text-black/80"
              }`}
              title={sessionLabel}
            >
              {sessionLabel}
            </span>

            {canShop ? (
              <Link
                href="/carrito"
                className="relative rounded-lg border border-black/15 px-3 py-1.5 text-xs font-medium hover:bg-black/5 sm:text-sm"
              >
                Ver carrito
                {itemCount > 0 ? (
                  <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[#845f4a] px-1.5 text-xs font-bold text-white">
                    {itemCount}
                  </span>
                ) : null}
              </Link>
            ) : null}

            {authReady && (user || isGuest) ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-lg border border-black/15 px-3 py-1.5 text-xs font-medium hover:bg-black/5 sm:inline-block"
              >
                Cerrar sesion
              </button>
            ) : null}
          </div>
        </div>

        <p className="truncate px-4 pb-2 text-center text-xs text-black/60 sm:hidden">
          {sessionLabel}
          {canShop ? (
            <>
              {" · "}
              <Link href="/carrito" className="font-medium underline">
                Ver carrito
                {itemCount > 0 ? ` (${itemCount})` : ""}
              </Link>
            </>
          ) : null}
        </p>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Cerrar menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />

          <nav className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
              <p className="font-semibold">{STORE_NAME}</p>
              <button
                type="button"
                aria-label="Cerrar menu"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-1 text-sm hover:bg-black/5"
              >
                Cerrar
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto p-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm font-medium hover:bg-black/5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t border-black/10 p-4">
              <p className="text-xs text-black/60">Sesion: {sessionLabel}</p>

              {canShop ? (
                <Link
                  href="/carrito"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full rounded-lg border border-black/15 px-4 py-2 text-center text-sm hover:bg-black/5"
                >
                  Ver carrito
                  {itemCount > 0 ? ` (${itemCount})` : ""}
                </Link>
              ) : null}

              {authReady && (user || isGuest) ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg bg-black px-4 py-2 text-sm text-white"
                >
                  Cerrar sesion
                </button>
              ) : null}

              {!user && !isAdmin ? (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full rounded-lg border border-black/15 px-4 py-2 text-center text-sm hover:bg-black/5"
                >
                  Iniciar sesion
                </Link>
              ) : null}
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
