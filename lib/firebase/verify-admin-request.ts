import { adminAuth } from "@/lib/firebase/admin";

function getAdminEmailsFromEnv(): string[] {
  const rawAdminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";

  return rawAdminEmails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function verifyAdminRequest(
  authorizationHeader: string | null,
): Promise<{ uid: string; email?: string }> {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new Error("Token de autenticacion requerido.");
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  const decoded = await adminAuth.verifyIdToken(token);
  const hasAdminClaim = decoded.admin === true;
  const userEmail = decoded.email?.toLowerCase();
  const isAdminByEmail = userEmail
    ? getAdminEmailsFromEnv().includes(userEmail)
    : false;

  if (!hasAdminClaim && !isAdminByEmail) {
    throw new Error("Solo administradores pueden realizar esta accion.");
  }

  return {
    uid: decoded.uid,
    email: decoded.email,
  };
}
