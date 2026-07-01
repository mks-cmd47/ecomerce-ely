"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";
import { saveDirectPurchase } from "@/lib/cart/cart";
import { getProductImages, ProductWithId } from "@/lib/firebase/products";

type BuyNowModalProps = {
  product: ProductWithId;
  initialQuantity?: number;
  onClose: () => void;
};

export default function BuyNowModal({
  product,
  initialQuantity = 1,
  onClose,
}: BuyNowModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const images = getProductImages(product);
  const cover = images[0];
  const total = (product.price ?? 0) * quantity;

  const handleConfirm = () => {
    setError(null);

    if (quantity < 1) {
      setError("La cantidad debe ser al menos 1.");
      return;
    }

    if (quantity > product.stock) {
      setError(`Solo hay ${product.stock} unidades disponibles.`);
      return;
    }

    saveDirectPurchase({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      total,
      purchasedAt: new Date().toISOString(),
    });

    setIsSuccess(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buy-now-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {isSuccess ? (
          <div className="space-y-4 text-center">
            <h2 id="buy-now-title" className="text-xl font-semibold text-green-700">
              Compra directa registrada
            </h2>
            <p className="text-sm text-black/70">
              Pediste <strong>{quantity}</strong> × {product.name} por{" "}
              <strong>${total.toFixed(2)}</strong>. En una version con pagos
              conectarias aqui Stripe o Mercado Pago.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-[#845f4a] px-4 py-2 text-white"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {cover?.publicId ? (
                  <CldImage
                    src={cover.publicId}
                    alt={product.name}
                    fill
                    className="object-cover"
                    format="auto"
                  />
                ) : cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <h2 id="buy-now-title" className="font-semibold">
                  Compra directa
                </h2>
                <p className="text-sm text-black/70">{product.name}</p>
                <p className="mt-1 font-medium">
                  ${(product.price ?? 0).toFixed(2)} c/u
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label htmlFor="buy-quantity" className="text-sm font-medium">
                Cantidad
              </label>
              <input
                id="buy-quantity"
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(event) =>
                  setQuantity(Math.max(1, Number(event.target.value) || 1))
                }
                className="w-full rounded-lg border border-black/20 px-3 py-2"
              />
              <p className="text-sm text-black/60">Stock: {product.stock}</p>
            </div>

            <p className="mt-4 text-lg font-semibold">
              Total: ${total.toFixed(2)}
            </p>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-black/20 px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 rounded-lg bg-black px-4 py-2 text-sm text-white"
              >
                Confirmar compra
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
