import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentSnapshot,
  getDoc,
  getDocs,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { productNameToSlug } from "@/lib/products/product-url";

export type ProductImage = {
  imageUrl: string;
  publicId?: string;
};

export type ProductInput = {
  name: string;
  category: string;
  description: string;
  stock: number;
  price: number;
  images: ProductImage[];
};

export type ProductDocument = {
  name: string;
  category: string;
  description: string;
  stock: number;
  price: number;
  images: ProductImage[];
  imageUrl: string;
  publicId?: string;
  createdAt?: Timestamp;
};

export type ProductWithId = ProductDocument & { id: string };

const PRODUCTS_COLLECTION = "products";

export function getProductImages(product: {
  images?: ProductImage[];
  imageUrl: string;
  publicId?: string;
}): ProductImage[] {
  if (product.images?.length) {
    return product.images;
  }

  if (product.imageUrl) {
    return [
      {
        imageUrl: product.imageUrl,
        ...(product.publicId ? { publicId: product.publicId } : {}),
      },
    ];
  }

  return [];
}

function mapProductData(
  id: string,
  data: Partial<ProductDocument>,
): ProductWithId {
  const images = getProductImages({
    images: data.images,
    imageUrl: data.imageUrl ?? "",
    publicId: data.publicId,
  });

  return {
    id,
    name: data.name ?? "",
    category: data.category ?? "",
    description: data.description ?? "",
    stock: typeof data.stock === "number" ? data.stock : 0,
    price: typeof data.price === "number" ? data.price : 0,
    images,
    imageUrl: images[0]?.imageUrl ?? data.imageUrl ?? "",
    publicId: images[0]?.publicId ?? data.publicId,
    createdAt: data.createdAt,
  };
}

function mapProductDoc(productDoc: QueryDocumentSnapshot): ProductWithId {
  return mapProductData(
    productDoc.id,
    productDoc.data() as Partial<ProductDocument>,
  );
}

function mapProductSnapshot(
  productDoc: DocumentSnapshot,
): ProductWithId | null {
  if (!productDoc.exists()) {
    return null;
  }

  return mapProductData(
    productDoc.id,
    productDoc.data() as Partial<ProductDocument>,
  );
}

function sortProductsByDate(products: ProductWithId[]): ProductWithId[] {
  return [...products].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
}

export async function createProduct(input: ProductInput): Promise<string> {
  const cover = input.images[0];

  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    name: input.name.trim(),
    category: input.category.toLowerCase().trim(),
    description: input.description.trim(),
    stock: input.stock,
    price: input.price,
    images: input.images,
    imageUrl: cover.imageUrl,
    ...(cover.publicId ? { publicId: cover.publicId } : {}),
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
}

export async function getProductById(
  productId: string,
): Promise<ProductWithId | null> {
  const snapshot = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));
  return mapProductSnapshot(snapshot);
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithId | null> {
  const normalizedSlug = productNameToSlug(decodeURIComponent(slug));
  const products = await getProducts();

  return (
    products.find(
      (product) => productNameToSlug(product.name) === normalizedSlug,
    ) ?? null
  );
}

export async function getProducts(): Promise<ProductWithId[]> {
  try {
    const productsQuery = query(
      collection(db, PRODUCTS_COLLECTION),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(productsQuery);
    return snapshot.docs.map(mapProductDoc);
  } catch (orderedQueryError) {
    console.warn(
      "No se pudo ordenar por createdAt, usando lectura simple:",
      orderedQueryError,
    );

    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    return sortProductsByDate(snapshot.docs.map(mapProductDoc));
  }
}
