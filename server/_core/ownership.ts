// server/_core/ownership.ts
//
// Multi-tenant ownership guard.
//
// Context: `list` and `create` procedures already scope by business
// (db.getBusinessByUserId(ctx.user.id)). But `get` / `update` / `delete`
// procedures act on a bare numeric id with NO ownership check, so any
// authenticated user could read/mutate another tenant's records (IDOR).
//
// This helper closes that gap. Import it in routers.ts and add one line
// to each get/update/delete procedure.

import * as db from "../db";

/**
 * Throw unless `record` is non-null and its `businessId` matches the
 * business belonging to `userId`.
 *
 * Usage inside a protectedProcedure:
 *
 *   const job = await db.getJob(input.id);
 *   await assertBusinessOwnership(ctx.user.id, job, "job");
 *
 * (For `get` procedures, keep the existing `if (!record) return null`
 *  before calling this, so "not found" stays a null while "not yours"
 *  becomes an Unauthorized error.)
 *
 * @param userId  ctx.user.id
 * @param record  the fetched row (must expose `businessId`)
 * @param label   human-readable entity name for the error message
 */
export async function assertBusinessOwnership(
  userId: number,
  record: { businessId?: number | null } | null | undefined,
  label = "record"
): Promise<void> {
  const business = await db.getBusinessByUserId(userId);
  if (!business) {
    throw new Error("Business not found");
  }
  if (!record || record.businessId !== business.id) {
    throw new Error(`Unauthorized: ${label} does not belong to your business`);
  }
}
