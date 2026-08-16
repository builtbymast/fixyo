import { protectedProcedure, router } from "../_core/trpc";
import { getDashboardStats, getJobsByUserId, getInvoicesByUserId, getQuotesByUserId } from "../db";

export const dashboardRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => {
    return getDashboardStats(ctx.user.id);
  }),

  recentJobs: protectedProcedure.query(async ({ ctx }) => {
    const allJobs = await getJobsByUserId(ctx.user.id);
    return allJobs.slice(0, 5);
  }),

  recentInvoices: protectedProcedure.query(async ({ ctx }) => {
    const allInvoices = await getInvoicesByUserId(ctx.user.id);
    return allInvoices.slice(0, 5);
  }),

  recentQuotes: protectedProcedure.query(async ({ ctx }) => {
    const allQuotes = await getQuotesByUserId(ctx.user.id);
    return allQuotes.slice(0, 5);
  }),
});
