import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { HttpError } from "../../shared/_core/errors";
import { authenticateRequest } from "./auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures -- a missing token
    // is expected on every anonymous request. Anything else (misconfigured
    // Supabase admin client, DB failure, etc.) is unexpected: log it, since
    // this catch would otherwise hide it completely.
    const isMissingToken = error instanceof HttpError && error.statusCode === 403 &&
      error.message === "Missing authorization token";
    if (!isMissingToken) {
      console.error("[Auth] createContext failed to authenticate:", error);
    }
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
