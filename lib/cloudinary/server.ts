import { v2 as cloudinary } from "cloudinary";

function configureCloudinary() {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ??
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Faltan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

export async function deleteCloudinaryImages(
  publicIds: string[],
): Promise<void> {
  const uniqueIds = [...new Set(publicIds.map((id) => id.trim()).filter(Boolean))];

  if (uniqueIds.length === 0) {
    return;
  }

  const client = configureCloudinary();
  await client.api.delete_resources(uniqueIds, { resource_type: "image" });
}
