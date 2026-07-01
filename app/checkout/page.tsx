"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type SubmitEvent } from "react";
import CartItemRow from "@/app/components/shop/CartItemRow";
import { useCart } from "@/app/components/shop/CartProvider";
type CheckoutForm = {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
};

const initialForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  address: "",
  phone: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    total,
    itemCount,
    clearCart,
    isAdmin,
    authReady,
    user,
    canShop,
  } = useCart();

  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (authReady && isAdmin) {
      router.replace("/admin");
    }
  }, [authReady, isAdmin, router]);

  const updateField = (field: keyof CheckoutForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isAdmin || itemCount === 0) {
      return;
    }

    setIsSubmitted(true);
    clearCart();
  };

  if (!authReady) {
    return (
      <div className="min-h-screen">
        <p className="px-6 py-10 text-black/70">Cargando...</p>
      </div>
    );
  }

  if (isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/carrito" className="text-sm text-black/60 hover:text-black">
          ← Volver al carrito
        </Link>

        <h2 className="mt-4 text-2xl font-bold">Pago</h2>
        <p className="mt-1 text-sm text-black/70">
          Completa tus datos de envio para finalizar el pedido.
        </p>

        {user ? (
          <p className="mt-2 text-sm text-black/80">
            Cuenta: <strong>{user.email}</strong>
          </p>
        ) : null}

        {isSubmitted ? (
          <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6">
            <p className="font-medium text-green-800">
              Pedido registrado correctamente
            </p>
            <p className="mt-2 text-sm text-green-700">
              Gracias {form.firstName}. Te contactaremos al {form.phone} cuando
              el metodo de pago este configurado.
            </p>
            <Link
              href="/productos"
              className="mt-4 inline-block rounded-lg bg-[#845f4a] px-4 py-2 text-sm text-white"
            >
              Seguir comprando
            </Link>
          </div>
        ) : itemCount === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-black/20 bg-white/60 p-8 text-center">
            <p className="text-black/70">No hay productos para pagar.</p>
            <Link href="/carrito" className="mt-4 inline-block underline">
              Ir al carrito
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-5">
            <section className="lg:col-span-2">
              <h3 className="font-semibold">Resumen del pedido</h3>
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <CartItemRow key={item.productId} item={item} />
                ))}
              </ul>
              <p className="mt-4 text-right text-lg font-bold">
                Total: ${total.toFixed(2)}
              </p>
            </section>

            <section className="lg:col-span-3">
              <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-xl bg-white p-6 ring-1 ring-black/10"
              >
                <h3 className="font-semibold">Datos de envio</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="first-name" className="text-sm font-medium">
                      Nombre
                    </label>
                    <input
                      id="first-name"
                      required
                      value={form.firstName}
                      onChange={(event) =>
                        updateField("firstName", event.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2"
                      placeholder="Ej: Maria"
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="text-sm font-medium">
                      Apellido
                    </label>
                    <input
                      id="last-name"
                      required
                      value={form.lastName}
                      onChange={(event) =>
                        updateField("lastName", event.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2"
                      placeholder="Ej: Lopez"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="text-sm font-medium">
                    Direccion
                  </label>
                  <textarea
                    id="address"
                    required
                    rows={3}
                    value={form.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    className="mt-1 w-full resize-y rounded-lg border border-black/20 px-3 py-2"
                    placeholder="Calle, numero, ciudad, codigo postal..."
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="text-sm font-medium">
                    Numero de celular
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2"
                    placeholder="Ej: +54 11 1234 5678"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium">Metodo de pago</p>
                  <div className="mt-2 min-h-[5rem] rounded-lg border border-dashed border-black/25 bg-neutral-50 px-4 py-6 text-center text-sm text-black/50">
                    Espacio reservado para el metodo de pago.
                    <br />
                    Lo configuraras mas adelante.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canShop}
                  className="w-full rounded-lg bg-[#845f4a] py-3 font-medium text-white hover:bg-[#845f4a]/90 disabled:opacity-50"
                >
                  Confirmar pedido
                </button>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
