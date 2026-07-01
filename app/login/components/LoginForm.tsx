"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { getAuthErrorMessage } from "@/lib/firebase/auth-errors";
import { isAdminUser } from "@/lib/firebase/roles";
import { clearGuestSession, setGuestSession } from "@/lib/guest-session";

type AuthMode = "login" | "register";

function getSafeReturnUrl(returnUrl: string | null): string {
  if (!returnUrl || !returnUrl.startsWith("/")) {
    return "/home";
  }

  return returnUrl;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = getSafeReturnUrl(searchParams.get("returnUrl"));
  const authMessage = searchParams.get("mensaje");
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    setConfirmPassword("");
    setShowPassword(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((visible) => !visible);
  };

  const passwordInputType = showPassword ? "text" : "password";

  const redirectAfterAuth = async (
    user: Awaited<ReturnType<typeof signInWithEmailAndPassword>>["user"],
  ) => {
    clearGuestSession();
    const adminUser = await isAdminUser(user);

    if (adminUser) {
      router.push("/admin");
      return;
    }

    router.push(returnUrl);
  };

  const handleEnterAsGuest = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      setGuestSession();
      router.push("/home");
    } catch {
      setError("No se pudo entrar como invitado. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await redirectAfterAuth(credential.user);
    } catch (loginError) {
      setError(
        getAuthErrorMessage(
          loginError,
          "No se pudo iniciar sesion. Verifica email y contrasena.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await redirectAfterAuth(credential.user);
    } catch (registerError) {
      setError(
        getAuthErrorMessage(
          registerError,
          "No se pudo crear la cuenta. Intenta de nuevo.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-black/10 p-6 shadow-sm bg-[#dfa0aa] text-white">
        <h1 className="text-2xl font-semibold">
          {isLogin ? "Iniciar sesion" : "Crear cuenta"}
        </h1>
        <p className="mt-2 text-sm text-black/70">
          {isLogin
            ? "Ingresa con tu cuenta de La Vida es Rosa"
            : "Registrate para acceder al sitio por primera vez."}
        </p>

        {authMessage === "inicia-sesion-para-comprar" ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
            Debes iniciar sesion o registrarte para completar la compra.
          </p>
        ) : null}

        <div
          role="tablist"
          aria-label="Tipo de acceso"
          className="mt-6 flex rounded-lg border border-black/10 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isLogin}
            onClick={() => switchMode("login")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isLogin
                ? "bg-[#845f4a]  text-white"
                : "bg-transparent hover:text-black"
            }`}
          >
            Iniciar sesion
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isLogin}
            onClick={() => switchMode("register")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              !isLogin
                ? "bg-[#845f4a]  text-white"
                : "bg-transparent hover:text-black"
            }`}
          >
            Registrarse
          </button>
        </div>

        <form
          onSubmit={isLogin ? handleLogin : handleRegister}
          className="mt-6 space-y-4"
        >
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border text-black border-black/20 px-3 py-2 outline-none bg-amber-50 focus:border-black"
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Contrasena
            </label>
            <div className="flex gap-2">
              <input
                id="password"
                type={passwordInputType}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-w-0 flex-1 rounded-lg text-black border border-black/20 px-3 py-2 outline-none bg-amber-50 focus:border-black"
                placeholder="******"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="shrink-0 rounded-lg border border-black/20 px-3 py-2 text-sm font-medium hover:bg-black/5"
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          {!isLogin ? (
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar contrasena
              </label>
              <div className="flex gap-2">
                <input
                  id="confirmPassword"
                  type={passwordInputType}
                  required
                  autoComplete="new-password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="min-w-0 flex-1 text-black rounded-lg border border-black/20 px-3 py-2 outline-none bg-amber-50 focus:border-black"
                  placeholder="******"
                />
              </div>
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[#845f4a] hover:bg-[#845f4a]/80 px-3 py-2 text-white disabled:opacity-60"
          >
            {isLoading
              ? isLogin
                ? "Ingresando..."
                : "Creando cuenta..."
              : isLogin
                ? "Entrar"
                : "Crear cuenta"}
          </button>
        </form>

        <h3 className="text-md m-4 text-center text-black/70">
          ¡¡Hecha un vistazo{" "}
          <span className="font-bold">entrando como invitado</span>!!
        </h3>
        <div className="flex place-items-center justify-center">
          <button
            type="button"
            onClick={handleEnterAsGuest}
            disabled={isLoading}
            className="rounded-lg bg-[#845f4a] px-3 py-2 text-white transition-all hover:bg-[#845f4a]/80 disabled:opacity-60"
          >
            {isLoading ? "Entrando..." : "Entrar como Invitado"}
          </button>
        </div>
      </section>
    </main>
  );
}
