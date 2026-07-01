import { NextRequest, NextResponse } from "next/server";
import { deleteCloudinaryImages } from "@/lib/cloudinary/server";
import { verifyAdminRequest } from "@/lib/firebase/verify-admin-request";

export async function POST(request: NextRequest) {
  try {
    await verifyAdminRequest(request.headers.get("authorization"));

    const body = (await request.json()) as { publicIds?: string[] };
    const publicIds = Array.isArray(body.publicIds) ? body.publicIds : [];

    if (publicIds.length === 0) {
      return NextResponse.json(
        { error: "No se recibieron publicIds para eliminar." },
        { status: 400 },
      );
    }

    await deleteCloudinaryImages(publicIds);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudieron eliminar las imagenes.";

    const status = message.includes("Token") || message.includes("admin")
      ? 403
      : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
