import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type WelcomeSettings = {
  title: string;
  paragraph: string;
  imageUrl: string;
  publicId?: string;
  updatedAt?: Timestamp;
};

const WELCOME_DOC_PATH = ["storeSettings", "welcome"] as const;

export const DEFAULT_WELCOME_SETTINGS: WelcomeSettings = {
  title: "Bienvenidos a La Vida es Rosa",
  paragraph:
    "Descubre nuestros productos seleccionados con carino. Explora el catalogo y encuentra algo especial para ti.",
  imageUrl: "",
};

export async function getWelcomeSettings(): Promise<WelcomeSettings> {
  try {
    const snapshot = await getDoc(
      doc(db, WELCOME_DOC_PATH[0], WELCOME_DOC_PATH[1]),
    );

    // Si el documento no existe en la base de datos, usamos los textos por defecto
    if (!snapshot.exists()) {
      return DEFAULT_WELCOME_SETTINGS;
    }

    const data = snapshot.data() as Partial<WelcomeSettings>;

    return {
      title: data.title?.trim() || DEFAULT_WELCOME_SETTINGS.title,
      paragraph: data.paragraph?.trim() || DEFAULT_WELCOME_SETTINGS.paragraph,
      imageUrl: data.imageUrl ?? "",
      ...(data.publicId ? { publicId: data.publicId } : {}),
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    // CAPTURA DE SEGURIDAD: Si Firebase bloquea la lectura por permisos,
    // en lugar de romper la app, atrapamos el error y mostramos los datos por defecto.
    console.error("Error al obtener configuraciones de bienvenida:", error);
    return DEFAULT_WELCOME_SETTINGS;
  }
}

export async function saveWelcomeSettings(
  settings: WelcomeSettings,
): Promise<void> {
  try {
    // Control de seguridad: Evitamos que .trim() falle si los textos vienen vacíos o undefined
    const titleToSave = settings.title
      ? settings.title.trim()
      : DEFAULT_WELCOME_SETTINGS.title;
    const paragraphToSave = settings.paragraph
      ? settings.paragraph.trim()
      : DEFAULT_WELCOME_SETTINGS.paragraph;

    await setDoc(
      doc(db, WELCOME_DOC_PATH[0], WELCOME_DOC_PATH[1]),
      {
        title: titleToSave,
        paragraph: paragraphToSave,
        imageUrl: settings.imageUrl || "",
        ...(settings.publicId ? { publicId: settings.publicId } : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true }, // Mantiene los campos existentes si no se modificaron
    );
  } catch (error) {
    console.error("Error al guardar configuraciones de bienvenida:", error);
    throw error; // Relanzamos el error para que el formulario del panel de administración pueda avisar que falló
  }
}
