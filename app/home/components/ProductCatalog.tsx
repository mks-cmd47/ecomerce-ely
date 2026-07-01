"use client";

import Link from "next/link";
import { useState } from "react";
import { CldImage } from "next-cloudinary";
import {
  deleteProduct,
  getProductImages,
  ProductImage,
  ProductWithId,
} from "@/lib/firebase/products";
import { deleteCloudinaryImages } from "@/lib/cloudinary/client";
import { getProductUrl } from "@/lib/products/product-url";

type ProductCatalogProps = {
  products: ProductWithId[];
  isAdmin?: boolean;
  onProductDeleted: (productId: string) => void;
};

function ProductImageThumb({
  image,
  alt,
}: {
  image: ProductImage;
  alt: string;
}) {
  if (image.publicId) {
    return (
      <CldImage
        src={image.publicId}
        alt={alt}
        width={80}
        height={80}
        className="h-16 w-16 shrink-0 rounded-md object-cover"
        format="auto"
        quality="auto"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.imageUrl}
      alt={alt}
      className="h-16 w-16 shrink-0 rounded-md object-cover"
    />
  );
}

export default function ProductCatalog({
  products,
  isAdmin = false,
  onProductDeleted,
}: ProductCatalogProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (product: ProductWithId) => {
    const confirmed = window.confirm(
      `Eliminar "${product.name}" del catalogo? Esta accion no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    setDeleteError(null);
    setDeletingId(product.id);

    try {
      const images = getProductImages(product);
      const publicIds = images
        .map((image) => image.publicId)
        .filter((publicId): publicId is string => Boolean(publicId));

      if (publicIds.length > 0) {
        await deleteCloudinaryImages(publicIds);
      }

      await deleteProduct(product.id);
      onProductDeleted(product.id);
    } catch {
      setDeleteError(
        "No se pudo eliminar el producto. Revisa Firestore y Cloudinary.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (products.length === 0) {
    return (
      <p className="mt-4 text-black/70">
        Aun no hay productos publicados.
        {isAdmin ? " Agrega el primero desde el panel de admin." : null}
      </p>
    );
  }

  return (
    <>
      {deleteError ? (
        <p className="mt-4 text-sm text-red-600">{deleteError}</p>
      ) : null}

      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const images = getProductImages(product);
          const cover = images[0];
          const gallery = images.slice(1);
          const isDeleting = deletingId === product.id;

          return (
            <li
              key={product.id}
              className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm"
            >
              <Link
                href={getProductUrl(product)}
                className="group block transition hover:bg-black/[0.02]"
              >
                <div className="relative aspect-square bg-neutral-100">
                  {cover?.publicId ? (
                    <CldImage
                      src={cover.publicId}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition group-hover:scale-[1.02]"
                      format="auto"
                      quality="auto"
                    />
                  ) : cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-black/50">
                      Sin imagen
                    </div>
                  )}
                </div>

                {gallery.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto border-t border-black/5 p-2">
                    {gallery.map((image, index) => (
                      <ProductImageThumb
                        key={`${image.publicId ?? image.imageUrl}-${index}`}
                        image={image}
                        alt={`${product.name} ${index + 2}`}
                      />
                    ))}
                  </div>
                ) : null}

                <div className="space-y-2 p-4">
                  <p className="text-xs uppercase tracking-wide text-black/50">
                    {product.category}
                  </p>
                  <h3 className="font-semibold group-hover:text-[#845f4a]">
                    {product.name}
                  </h3>
                  <p className="line-clamp-2 text-sm text-black/70">
                    {product.description}
                  </p>
                  <p className="font-medium">
                    ${(product.price ?? 0).toFixed(2)}{" "}
                    <span className="text-sm font-normal text-black/60">
                      · Stock: {product.stock}
                      {images.length > 1 ? ` · ${images.length} fotos` : null}
                    </span>
                  </p>
                  <p className="text-xs text-[#845f4a]">Ver producto →</p>
                </div>
              </Link>

              {isAdmin ? (
                <div className="border-t border-black/5 p-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(product)}
                    disabled={isDeleting}
                    className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                  >
                    {isDeleting ? "Eliminando..." : "Eliminar producto"}
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
