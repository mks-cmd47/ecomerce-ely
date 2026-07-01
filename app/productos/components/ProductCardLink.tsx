"use client";

import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { getProductImages, ProductWithId } from "@/lib/firebase/products";
import { getProductUrl } from "@/lib/products/product-url";

type ProductCardLinkProps = {
  product: ProductWithId;
};

export default function ProductCardLink({ product }: ProductCardLinkProps) {
  const images = getProductImages(product);
  const cover = images[0];
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={getProductUrl(product)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition hover:border-[#845f4a]/40 hover:shadow-md"
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
        {outOfStock ? (
          <span className="absolute left-2 top-2 rounded bg-black/75 px-2 py-1 text-xs text-white">
            Agotado
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-wide text-[#845f4a]">
          {product.category}
        </p>
        <h3 className="text-lg font-semibold group-hover:text-[#845f4a]">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm text-black/70">
          {product.description}
        </p>
        <p className="mt-auto font-bold">${(product.price ?? 0).toFixed(2)}</p>
        <p className="text-xs text-black/50">Ver detalle →</p>
      </div>
    </Link>
  );
}
