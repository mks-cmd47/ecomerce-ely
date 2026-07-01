"use client";

import { useState, type SubmitEvent } from "react";
import {
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { createProduct, ProductImage } from "@/lib/firebase/products";
import { deleteCloudinaryImages } from "@/lib/cloudinary/client";

type FormState = {
  name: string;
  category: string;
  description: string;
  stock: string;
  price: string;
};

const initialForm: FormState = {
  name: "",
  category: "",
  description: "",
  stock: "",
  price: "",
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

export default function AddProduct() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const removeImage = async (index: number) => {
    const image = images[index];
    if (!image) {
      return;
    }

    if (image.publicId) {
      try {
        await deleteCloudinaryImages([image.publicId]);
      } catch {
        setError("No se pudo eliminar la imagen de Cloudinary.");
        return;
      }
    }

    setImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const setAsPrimary = (index: number) => {
    if (index === 0) {
      return;
    }

    setImages((current) => {
      const selected = current[index];
      const rest = current.filter((_, imageIndex) => imageIndex !== index);
      return [selected, ...rest];
    });
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (images.length === 0) {
      setError("Sube al menos una imagen para el producto.");
      return;
    }

    const stock = Number(form.stock);
    const price = Number(form.price);

    if (!form.name.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }

    if (!form.category.trim()) {
      setError("La categoria es obligatoria.");
      return;
    }

    if (!form.description.trim()) {
      setError("La descripcion del producto es obligatoria.");
      return;
    }

    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      setError("El stock debe ser un numero entero mayor o igual a 0.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("El precio debe ser un numero mayor a 0.");
      return;
    }

    setIsLoading(true);

    try {
      const productId = await createProduct({
        name: form.name,
        category: form.category,
        description: form.description,
        stock,
        price,
        images,
      });

      setSuccess(`Producto guardado correctamente (ID: ${productId}).`);
      setForm(initialForm);
      setImages([]);
    } catch {
      setError(
        "No se pudo guardar el producto. Revisa Cloudinary, Firestore y las reglas de seguridad.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-black">Agregar producto</h2>
      <p className="mt-1 text-sm text-black/70">
        Las imagenes se suben a Cloudinary y los datos se guardan en Firestore
        (coleccion <code className="text-xs">products</code>). La primera foto
        es la portada del catalogo.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="product-image" className="text-sm font-medium">
            Imagenes del producto
          </label>
          <CldUploadWidget
            uploadPreset="Ecommerce-Ely-Quidel"
            options={{
              sources: ["local"],
              multiple: false,
              resourceType: "image",
            }}
            onSuccess={(result) => {
              const uploadInfo = getCloudinaryUploadInfo(result);
              if (!uploadInfo) {
                return;
              }

              setImages((current) => [...current, uploadInfo]);
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="m-2 rounded bg-gray-800 p-2 text-white hover:bg-gray-700"
              >
                {images.length > 0 ? "Subir mas fotos" : "Subir foto"}
              </button>
            )}
          </CldUploadWidget>

          {images.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {images.map((image, index) => (
                <li
                  key={`${image.publicId ?? image.imageUrl}-${index}`}
                  className="relative overflow-hidden rounded-lg border border-black/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.imageUrl}
                    alt={`Vista previa ${index + 1}`}
                    className="h-28 w-full object-cover"
                  />
                  {index === 0 ? (
                    <span className="absolute left-1 top-1 rounded bg-black/75 px-2 py-0.5 text-xs text-white">
                      Portada
                    </span>
                  ) : null}
                  <div className="flex gap-1 p-1">
                    {index > 0 ? (
                      <button
                        type="button"
                        onClick={() => setAsPrimary(index)}
                        className="flex-1 rounded hover:bg-gray-900 hover:scale-105 transition-all bg-black px-1 py-1 text-xs text-white"
                      >
                        Principal
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void removeImage(index)}
                      className="flex-1 rounded hover:bg-red-400 hover:scale-105 transition-all bg-red-600 px-1 py-1 text-xs text-white"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-black/60">Aun no hay fotos subidas.</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="product-name" className="text-sm font-medium">
            Nombre
          </label>
          <input
            id="product-name"
            type="text"
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="w-full rounded-lg border border-black/20 px-3 py-2 outline-none focus:border-black"
            placeholder="Ej: Bolso rosa"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="product-category" className="text-sm font-medium">
            Categoria
          </label>
          <input
            id="product-category"
            type="text"
            required
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            className="w-full rounded-lg border border-black/20 px-3 py-2 outline-none focus:border-black"
            placeholder="Ej: Bolsos"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="product-description" className="text-sm font-medium">
            Descripcion
          </label>
          <textarea
            id="product-description"
            required
            rows={4}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            className="w-full resize-y rounded-lg border border-black/20 px-3 py-2 outline-none focus:border-black"
            placeholder="Detalles del producto..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="product-stock" className="text-sm font-medium">
              Stock
            </label>
            <input
              id="product-stock"
              type="number"
              min={0}
              step={1}
              required
              value={form.stock}
              onChange={(event) => updateField("stock", event.target.value)}
              className="w-full rounded-lg border border-black/20 px-3 py-2 outline-none focus:border-black"
              placeholder="0"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="product-price" className="text-sm font-medium">
              Precio
            </label>
            <input
              id="product-price"
              type="number"
              min={0.01}
              step={0.01}
              required
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              className="w-full rounded-lg border border-black/20 px-3 py-2 outline-none focus:border-black"
              placeholder="0.00"
            />
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-green-700">{success}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60 sm:w-auto"
        >
          {isLoading ? "Guardando..." : "Guardar producto"}
        </button>
      </form>
    </section>
  );
}
