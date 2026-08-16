import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { dashboardRouter } from "./routers/dashboard";
import { businessRouter } from "./routers/business";
import { customersRouter } from "./routers/customers";
import { jobsRouter } from "./routers/jobs";
import { quotesRouter } from "./routers/quotes";
import { invoicesRouter } from "./routers/invoices";
import { aiRouter } from "./routers/ai";
import { subscriptionRouter } from "./routers/subscription";
import { upsertUser } from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        await upsertUser({ openId: ctx.user.openId, name: input.name });
        return { success: true };
      }),
  }),
  dashboard: dashboardRouter,
  business: businessRouter,
  customers: customersRouter,
  jobs: jobsRouter,
  quotes: quotesRouter,
  invoices: invoicesRouter,
  ai: aiRouter,
  subscription: subscriptionRouter,
});

export type AppRouter = typeof appRouter;
