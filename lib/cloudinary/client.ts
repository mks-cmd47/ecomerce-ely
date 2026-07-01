import { auth } from "@/lib/firebase/client";

export async function deleteCloudinaryImages(publicIds: string[]): Promise<void> {
  const uniqueIds = [...new Set(publicIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return;
  }

  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Debes iniciar sesion como admin para eliminar imagenes.");
  }

  const token = await currentUser.getIdToken();
  const response = await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ publicIds: uniqueIds }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      payload?.error ??
        "No se pudieron eliminar las imagenes de Cloudinary.",
    );
  }
}
