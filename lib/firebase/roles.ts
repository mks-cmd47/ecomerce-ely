import { User } from "firebase/auth";

function getAdminEmailsFromEnv(): string[] {
  const rawAdminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";

  return rawAdminEmails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdminUser(user: User): Promise<boolean> {
  const tokenResult = await user.getIdTokenResult(true);
  const hasAdminClaim = tokenResult.claims.admin === true;

  if (hasAdminClaim) {
    return true;
  }

  const userEmail = user.email?.toLowerCase();
  if (!userEmail) {
    return false;
  }

  const adminEmails = getAdminEmailsFromEnv();
  return adminEmails.includes(userEmail);
}
