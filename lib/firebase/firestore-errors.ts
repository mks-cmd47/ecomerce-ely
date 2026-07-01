import { FirebaseError } from "firebase/app";

export function getFirestoreErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!(error instanceof FirebaseError)) {
    return fallback;
  }

  switch (error.code) {
    case "permission-denied":
      return "Firestore bloqueo la lectura. En Firebase Console, reglas de products: allow read: if true;";
    case "failed-precondition":
      return "Falta un indice en Firestore. Abre el enlace del error en la consola del navegador o usa la consulta sin orden.";
    case "unavailable":
      return "Firestore no esta disponible. Revisa tu conexion e intenta de nuevo.";
    default:
      return fallback;
  }
}
