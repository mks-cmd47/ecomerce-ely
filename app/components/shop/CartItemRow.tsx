"use client";

import { CldImage } from "next-cloudinary";
import { CartItem } from "@/lib/cart/cart";

type CartItemRowProps = {
  item: CartItem;
  editable?: boolean;
  onRemove?: () => void;
  onQuantityChange?: (quantity: number) => void;
};

export default function CartItemRow({
  item,
  editable = false,
  onRemove,
  onQuantityChange,
}: CartItemRowProps) {
  return (
    <li className="flex gap-4 rounded-xl border border-black/10 bg-white p-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {item.publicId ? (
          <CldImage
            src={item.publicId}
            alt={item.name}
            fill
            className="object-cover"
            format="auto"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold">{item.name}</p>
        <p className="text-sm text-black/60">
          ${item.price.toFixed(2)} c/u
        </p>

        {editable ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              Cantidad
              <input
                type="number"
                min={1}
                max={item.maxStock}
                value={item.quantity}
                onChange={(event) =>
                  onQuantityChange?.(
                    Math.max(1, Number(event.target.value) || 1),
                  )
                }
                className="w-16 rounded border border-black/20 px-2 py-1"
              />
            </label>
            <button
              type="button"
              onClick={onRemove}
              className="text-sm text-red-600 underline"
            >
              Quitar
            </button>
          </div>
        ) : (
          <p className="mt-1 text-sm text-black/70">Cantidad: {item.quantity}</p>
        )}

        <p className="mt-2 font-medium">
          Subtotal: ${(item.price * item.quantity).toFixed(2)}
        </p>
      </div>
    </li>
  );
}
