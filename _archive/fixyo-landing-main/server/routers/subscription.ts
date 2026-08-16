import { protectedProcedure, router } from "../_core/trpc";
import { getSubscriptionByUserId } from "../db";

export const subscriptionRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const sub = await getSubscriptionByUserId(ctx.user.id);
    return sub ?? { plan: "free" as const, status: "active" as const, currentPeriodEnd: null, cancelAtPeriodEnd: false };
  }),
});
