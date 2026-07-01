"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CldImage } from "next-cloudinary";
import {
  getProductById,
  getProductBySlug,
  getProductImages,
  ProductImage,
  ProductWithId,
} from "@/lib/firebase/products";
import { getProductUrlBySlug } from "@/lib/products/product-url";
import CartFloatingBar from "@/app/components/shop/CartFloatingBar";
import { useCart } from "@/app/components/shop/CartProvider";
import BuyNowModal from "./BuyNowModal";

type ProductDetailViewProps = {
  productSlug: string;
};

function GalleryImage({
  image,
  alt,
  selected,
  onSelect,
}: {
  image: ProductImage;
  alt: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
        selected ? "border-[#845f4a]" : "border-transparent"
      }`}
    >
      {image.publicId ? (
        <CldImage
          src={image.publicId}
          alt={alt}
          fill
          className="object-cover"
          format="auto"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image.imageUrl} alt={alt} className="h-full w-full object-cover" />
      )}
    </button>
  );
}

export default function ProductDetailView({ productSlug }: ProductDetailViewProps) {
  const router = useRouter();
  const { addToCart, user, isAdmin, canShop, authReady } = useCart();

  const [product, setProduct] = useState<ProductWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);
  const [showBuyNow, setShowBuyNow] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      setError(null);

      try {
        const bySlug = await getProductBySlug(productSlug);
        const resolved =
          bySlug ?? (await getProductById(decodeURIComponent(productSlug)));

        if (!resolved) {
          setError("Producto no encontrado.");
          setProduct(null);
          return;
        }

        setProduct(resolved);
        setSelectedImageIndex(0);
        setQuantity(1);
      } catch {
        setError("No se pudo cargar el producto.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productSlug]);

  const canPurchase = Boolean(user) && !isAdmin;
  const detailUrl = getProductUrlBySlug(productSlug);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    const message = addToCart(product, quantity);
    if (message) {
      setCartFeedback(message);
      return;
    }

    setCartFeedback(`"${product.name}" agregado al carrito.`);
    setTimeout(() => setCartFeedback(null), 2500);
  };

  const handleBuy = () => {
    if (!product) {
      return;
    }

    if (!canPurchase) {
      const returnUrl = encodeURIComponent(detailUrl);
      router.push(
        `/login?returnUrl=${returnUrl}&mensaje=inicia-sesion-para-comprar`,
      );
      return;
    }

    setShowBuyNow(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24">
        <p className="px-6 py-10 text-black/70">Cargando producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pb-24">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <p className="text-red-600">{error ?? "Producto no encontrado."}</p>
          <Link href="/productos" className="mt-4 inline-block underline">
            Volver al catalogo
          </Link>
        </div>
      </div>
    );
  }

  const images = getProductImages(product);
  const selectedImage = images[selectedImageIndex] ?? images[0];
  const outOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen pb-24">
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Link
          href="/productos"
          className="text-sm text-black/60 hover:text-black"
        >
          ← Volver al catalogo
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
              {selectedImage?.publicId ? (
                <CldImage
                  src={selectedImage.publicId}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 50vw"
                  className="object-cover"
                  format="auto"
                  quality="auto"
                />
              ) : selectedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedImage.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <GalleryImage
                    key={`${image.publicId ?? image.imageUrl}-${index}`}
                    image={image}
                    alt={`${product.name} ${index + 1}`}
                    selected={index === selectedImageIndex}
                    onSelect={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm uppercase tracking-wide text-[#845f4a]">
                {product.category}
              </p>
              <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
            </div>

            <p className="text-3xl font-bold text-black">
              ${(product.price ?? 0).toFixed(2)}
            </p>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/80 p-3 ring-1 ring-black/10">
                <dt className="text-black/50">Stock</dt>
                <dd className="font-semibold">
                  {outOfStock ? "Agotado" : `${product.stock} unidades`}
                </dd>
              </div>
              <div className="rounded-lg bg-white/80 p-3 ring-1 ring-black/10">
                <dt className="text-black/50">Fotos</dt>
                <dd className="font-semibold">{images.length}</dd>
              </div>
            </dl>

            <div>
              <h2 className="text-sm font-semibold uppercase text-black/50">
                Descripcion
              </h2>
              <p className="mt-2 leading-relaxed text-black/80">
                {product.description}
              </p>
            </div>

            {!outOfStock ? (
              <div>
                <label
                  htmlFor="detail-quantity"
                  className="text-sm font-medium"
                >
                  Cantidad
                </label>
                <input
                  id="detail-quantity"
                  type="number"
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      Math.min(
                        product.stock,
                        Math.max(1, Number(event.target.value) || 1),
                      ),
                    )
                  }
                  className="mt-1 w-full max-w-[8rem] rounded-lg border border-black/20 px-3 py-2"
                />
              </div>
            ) : null}

            {cartFeedback ? (
              <p className="text-sm text-[#845f4a]">{cartFeedback}</p>
            ) : null}

            {isAdmin && authReady ? (
              <p className="rounded-lg bg-[#845f4a]/10 px-4 py-3 text-sm text-[#845f4a] ring-1 ring-[#845f4a]/30">
                Estas en modo <strong>administrador</strong>. Gestiona productos
                en el{" "}
                <Link href="/admin" className="font-medium underline">
                  panel admin
                </Link>
                . La tienda y el carrito son solo para clientes.
              </p>
            ) : null}

            {!canPurchase && !isAdmin && authReady ? (
              <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                Para <strong>comprar</strong> debes{" "}
                <Link
                  href={`/login?returnUrl=${encodeURIComponent(detailUrl)}`}
                  className="font-medium underline"
                >
                  iniciar sesion
                </Link>{" "}
                o{" "}
                <Link
                  href={`/login?returnUrl=${encodeURIComponent(detailUrl)}`}
                  className="font-medium underline"
                >
                  registrarte
                </Link>
                . Como invitado puedes ver el producto y añadirlo al carrito.
              </p>
            ) : null}

            {canShop ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={handleAddToCart}
                  className="flex-1 rounded-lg border border-[#845f4a] bg-white px-4 py-3 font-medium text-[#845f4a] hover:bg-[#845f4a]/10 disabled:opacity-50"
                >
                  Añadir al carrito
                </button>
                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={handleBuy}
                  className="flex-1 rounded-lg bg-[#845f4a] px-4 py-3 font-medium text-white hover:bg-[#845f4a]/90 disabled:opacity-50"
                >
                  {canPurchase ? "Comprar" : "Iniciar sesion para comprar"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {showBuyNow && canPurchase && canShop ? (
        <BuyNowModal
          product={product}
          initialQuantity={quantity}
          onClose={() => setShowBuyNow(false)}
        />
      ) : null}

      {canShop ? <CartFloatingBar /> : null}
    </div>
  );
}
