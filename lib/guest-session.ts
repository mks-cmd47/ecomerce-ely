/** Clave en sessionStorage para recordar que el usuario eligió modo invitado. */
export const GUEST_SESSION_KEY = "ely-guest-mode";

export function setGuestSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(GUEST_SESSION_KEY, "true");
}

export function clearGuestSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(GUEST_SESSION_KEY);
}

export function isGuestSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(GUEST_SESSION_KEY) === "true";
}
