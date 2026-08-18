import { ForbiddenError } from "../../shared/_core/errors";
import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { getSupabaseAdmin } from "./supabaseAdmin";

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);
  // GET download links (PDF export) can't set headers -- accept ?token= too.
  const queryToken = req.query.token;
  return typeof queryToken === "string" ? queryToken : null;
}

/**
 * Verifies the Supabase access token on the request, syncing our own
 * `users`/`businesses` rows on a user's first authenticated request
 * (business/trade/phone come from signUp's user_metadata).
 */
export async function authenticateRequest(req: Request): Promise<User> {
  const token = getBearerToken(req);
  if (!token) throw ForbiddenError("Missing authorization token");

  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data.user) throw ForbiddenError("Invalid or expired session");

  const authUser = data.user;
  let user = await db.getUserByAuthId(authUser.id);

  if (!user) {
    const metadata = authUser.user_metadata ?? {};
    user = await db.upsertUserByAuthId({
      authUserId: authUser.id,
      name: (metadata.name as string) ?? authUser.email?.split("@")[0] ?? null,
      email: authUser.email ?? null,
      profilePicture: (metadata.avatar_url as string) ?? null,
      loginMethod: authUser.app_metadata?.provider ?? null,
    });

    const businessName = metadata.businessName as string | undefined;
    if (businessName) {
      const existingBusiness = await db.getBusinessByUserId(user.id);
      if (!existingBusiness) {
        await db.createBusiness({
          userId: user.id,
          businessName,
          tradeType: (metadata.tradeType as string) ?? null,
          phone: (metadata.phone as string) ?? null,
        });
      }
    }
  } else {
    await db.updateUser(user.id, { lastSignedIn: new Date() });
  }

  return user;
}
