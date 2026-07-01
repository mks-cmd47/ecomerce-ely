import { ProductWithId } from "@/lib/firebase/products";

export function productNameToSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getProductUrl(
  product: Pick<ProductWithId, "id" | "name">,
): string {
  return `/productos?producto=${encodeURIComponent(productNameToSlug(product.name))}`;
}

export function getProductUrlBySlug(slug: string): string {
  return `/productos?producto=${encodeURIComponent(slug)}`;
}
