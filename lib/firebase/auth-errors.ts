import { FirebaseError } from "firebase/app";

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof FirebaseError)) {
    return fallback;
  }

  switch (error.code) {
    case "auth/email-already-in-use":
      return "Este email ya esta registrado. Inicia sesion o usa otro email.";
    case "auth/weak-password":
      return "La contrasena debe tener al menos 6 caracteres.";
    case "auth/invalid-email":
      return "El email no es valido.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "No se pudo iniciar sesion. Verifica email y contrasena.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera un momento e intenta de nuevo.";
    default:
      return fallback;
  }
}
