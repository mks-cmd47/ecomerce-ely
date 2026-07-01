"use client";

import { useCallback, useEffect, useState } from "react";
import { CldImage } from "next-cloudinary";
import {
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { deleteCloudinaryImages } from "@/lib/cloudinary/client";
import {
  DEFAULT_WELCOME_SETTINGS,
  getWelcomeSettings,
  saveWelcomeSettings,
  WelcomeSettings,
} from "@/lib/firebase/store-settings";
import { ProductImage } from "@/lib/firebase/products";

type WelcomeBannerProps = {
  isAdmin: boolean;
};

function getCloudinaryUploadInfo(result: CloudinaryUploadWidgetResults) {
  if (typeof result.info !== "object" || result.info === null) {
    return null;
  }

  if (
    !("secure_url" in result.info) ||
    typeof result.info.secure_url !== "string"
  ) {
    return null;
  }

  const publicId =
    "public_id" in result.info && typeof result.info.public_id === "string"
      ? result.info.public_id
      : undefined;

  return {
    imageUrl: result.info.secure_url,
    publicId,
  } satisfies ProductImage;
}

export default function WelcomeBanner({ isAdmin }: WelcomeBannerProps) {
  const [settings, setSettings] = useState<WelcomeSettings>(
    DEFAULT_WELCOME_SETTINGS,
  );
  const [draft, setDraft] = useState<WelcomeSettings>(DEFAULT_WELCOME_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getWelcomeSettings();
      setSettings(data);
      setDraft(data);
    } catch {
      setError("No se pudo cargar el mensaje de bienvenida.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!draft.title.trim()) {
      setError("El titulo es obligatorio.");
      return;
    }

    if (!draft.paragraph.trim()) {
      setError("El parrafo de bienvenida es obligatorio.");
      return;
    }

    setIsSaving(true);

    try {
      const previousPublicId = settings.publicId;
      const nextPublicId = draft.publicId;

      await saveWelcomeSettings(draft);

      if (previousPublicId && previousPublicId !== nextPublicId) {
        await deleteCloudinaryImages([previousPublicId]);
      }

      setSettings(draft);
      setIsEditing(false);
      setSuccess("Mensaje de bienvenida actualizado.");
    } catch {
      setError("No se pudo guardar el mensaje de bienvenida.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!draft.publicId) {
      setDraft((current) => ({
        ...current,
        imageUrl: "",
        publicId: undefined,
      }));
      return;
    }

    try {
      await deleteCloudinaryImages([draft.publicId]);
      setDraft((current) => ({
        ...current,
        imageUrl: "",
        publicId: undefined,
      }));
    } catch {
      setError("No se pudo eliminar la imagen de Cloudinary.");
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-black/10 bg-white/70 p-6">
        <p className="text-sm text-black/60">Cargando bienvenida...</p>
      </section>
    );
  }

  if (isAdmin && isEditing) {
    return (
      <section className="rounded-2xl border border-[#845f4a]/30 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Editar bienvenida</h2>
          <button
            type="button"
            onClick={() => {
              setDraft(settings);
              setIsEditing(false);
              setError(null);
              setSuccess(null);
            }}
            className="text-sm text-white bg-red-500 hover:bg-red-500/50 transition-all p-2 rounded-md border-black border"
          >
            Cancelar
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="welcome-image" className="text-sm font-medium p-2">
              Imagen de bienvenida
            </label>
            <CldUploadWidget
              uploadPreset="Ecommerce-Ely-Quidel"
              options={{
                sources: ["local"],
                multiple: false,
                resourceType: "image",
              }}
              onSuccess={async (result) => {
                const uploadInfo = getCloudinaryUploadInfo(result);
                if (!uploadInfo) {
                  return;
                }

                if (draft.publicId && draft.publicId !== settings.publicId) {
                  try {
                    await deleteCloudinaryImages([draft.publicId]);
                  } catch {
                    setError(
                      "No se pudo reemplazar la imagen anterior en Cloudinary.",
                    );
                    return;
                  }
                }

                setDraft((current) => ({
                  ...current,
                  imageUrl: uploadInfo.imageUrl,
                  publicId: uploadInfo.publicId,
                }));
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="rounded-lg bg-gray-800 px-4 py-2 text-sm transition-all text-white hover:bg-gray-700/80"
                >
                  {draft.imageUrl ? "Cambiar imagen" : "Subir imagen"}
                </button>
              )}
            </CldUploadWidget>

            {draft.imageUrl ? (
              <div className="relative mt-2 aspect-[21/9] max-h-56 overflow-hidden rounded-xl bg-neutral-100">
                {draft.publicId ? (
                  <CldImage
                    src={draft.publicId}
                    alt="Vista previa de bienvenida"
                    fill
                    className="object-cover"
                    format="auto"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={draft.imageUrl}
                    alt="Vista previa de bienvenida"
                    className="h-full w-full object-cover "
                  />
                )}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute right-2 top-2 rounded bg-red-600 px-2 py-1 text-xs text-white"
                >
                  Quitar imagen
                </button>
              </div>
            ) : null}
          </div>

          <div className="space-y-1">
            <label htmlFor="welcome-title" className="text-sm font-medium">
              Titulo
            </label>
            <input
              id="welcome-title"
              type="text"
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-black/20 px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="welcome-paragraph" className="text-sm font-medium">
              Parrafo de bienvenida
            </label>
            <textarea
              id="welcome-paragraph"
              rows={4}
              value={draft.paragraph}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  paragraph: event.target.value,
                }))
              }
              className="w-full resize-y rounded-lg border border-black/20 px-3 py-2"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {isSaving ? "Guardando..." : "Guardar bienvenida"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden w-full rounded-2xl bg-white shadow-sm">
      {settings.imageUrl ? (
        <div className="relative w-full h-72 ">
          {settings.publicId ? (
            <CldImage
              src={settings.publicId}
              alt={settings.title}
              fill
              className="object-cover blur-sm bg-no-repeat"
              format="auto"
              priority
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.imageUrl}
              alt={settings.title}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 backdrop-blur-sm flex items-center text-center justify-center">
            <div>
              <h2 className="text-2xl font-bold text-black">
                {settings.title}
              </h2>
              <p className="mt-2 text-black/75">{settings.paragraph}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-3 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          {isAdmin ? (
            <button
              type="button"
              onClick={() => {
                setDraft(settings);
                setIsEditing(true);
                setSuccess(null);
                setError(null);
              }}
              className="shrink-0 rounded-lg border-2 border-black/15 px-4 py-2 text-sm hover:bg-black/5"
            >
              Editar bienvenida
            </button>
          ) : null}
        </div>

        {success ? <p className="text-sm text-green-700">{success}</p> : null}
        {error && !isEditing ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}
      </div>
    </section>
  );
}
