import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

/**
 * The one real authorization check in the app — Server Actions and admin
 * pages call this directly rather than relying on proxy.ts alone, per the
 * Next.js auth guide's "optimistic check in Proxy, secure check close to
 * the data" pattern.
 */
export const verifySession = cache(async (): Promise<{ isAuth: true }> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const valid = token ? await verifySessionToken(token) : false;

  if (!valid) {
    redirect("/admin/login");
  }

  return { isAuth: true };
});
