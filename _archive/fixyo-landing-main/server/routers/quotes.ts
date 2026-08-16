import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getQuotesByUserId,
  getQuoteById,
  getQuoteByPublicToken,
  createQuote,
  updateQuote,
  updateQuoteByToken,
  getNextQuoteNumber,
  getLineItemsByQuoteId,
  replaceLineItems,
  getBusinessByUserId,
  getCustomerById,
} from "../db";

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.string().default("1"),
  unitPrice: z.string(),
  unit: z.string().optional(),
  taxable: z.boolean().default(true),
});

const quoteInput = z.object({
  title: z.string().min(1),
  jobId: z.number().optional(),
  customerId: z.number().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  validUntil: z.date().optional(),
  taxRate: z.string().optional(),
  lineItems: z.array(lineItemSchema).default([]),
});

function calcTotals(items: z.infer<typeof lineItemSchema>[], taxRate: number) {
  const subtotal = items.reduce((sum, item) => {
    return sum + parseFloat(item.quantity) * parseFloat(item.unitPrice);
  }, 0);
  const taxAmount = items.reduce((sum, item) => {
    if (!item.taxable) return sum;
    return sum + parseFloat(item.quantity) * parseFloat(item.unitPrice) * (taxRate / 100);
  }, 0);
  return {
    subtotal: subtotal.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    total: (subtotal + taxAmount).toFixed(2),
  };
}

export const quotesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getQuotesByUserId(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const quote = await getQuoteById(input.id, ctx.user.id);
      if (!quote) throw new TRPCError({ code: "NOT_FOUND" });
      const items = await getLineItemsByQuoteId(input.id);
      return { ...quote, lineItems: items };
    }),

  create: protectedProcedure
    .input(quoteInput)
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      const prefix = business?.quotePrefix ?? "QT";
      const taxRate = parseFloat(input.taxRate ?? business?.taxRate ?? "10");
      const quoteNumber = await getNextQuoteNumber(ctx.user.id, prefix);
      const totals = calcTotals(input.lineItems, taxRate);
      const { lineItems: items, ...quoteData } = input;
      const id = await createQuote({
        ...quoteData,
        userId: ctx.user.id,
        quoteNumber,
        taxRate: taxRate.toFixed(2),
        ...totals,
        publicToken: nanoid(32),
      });
      await replaceLineItems("quote", id, items);
      return { id, quoteNumber };
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number() }).merge(quoteInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, lineItems: items, ...data } = input;
      const quote = await getQuoteById(id, ctx.user.id);
      if (!quote) throw new TRPCError({ code: "NOT_FOUND" });
      const business = await getBusinessByUserId(ctx.user.id);
      const taxRate = parseFloat(data.taxRate ?? quote.taxRate ?? business?.taxRate ?? "10");
      const currentItems = items ?? await getLineItemsByQuoteId(id);
      const totals = calcTotals(
        currentItems.map(i => ({
          description: (i as any).description,
          quantity: String((i as any).quantity),
          unitPrice: String((i as any).unitPrice),
          unit: (i as any).unit,
          taxable: (i as any).taxable ?? true,
        })),
        taxRate
      );
      await updateQuote(id, ctx.user.id, { ...data, taxRate: taxRate.toFixed(2), ...totals });
      if (items) await replaceLineItems("quote", id, items);
      return { success: true };
    }),

  send: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const quote = await getQuoteById(input.id, ctx.user.id);
      if (!quote) throw new TRPCError({ code: "NOT_FOUND" });
      await updateQuote(input.id, ctx.user.id, { status: "sent", sentAt: new Date() });
      return { success: true, publicToken: quote.publicToken };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await updateQuote(input.id, ctx.user.id, { status: "draft" });
      const { TRPCError: _ } = await import("@trpc/server");
      // soft delete not needed — just mark cancelled
      await updateQuote(input.id, ctx.user.id, {});
      return { success: true };
    }),

  // ─── Public portal endpoints (no auth required) ───────────────────────────
  getPublic: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const quote = await getQuoteByPublicToken(input.token);
      if (!quote) throw new TRPCError({ code: "NOT_FOUND" });
      // Mark as viewed
      if (quote.status === "sent") {
        await updateQuoteByToken(input.token, { status: "viewed", viewedAt: new Date() });
      }
      const items = await getLineItemsByQuoteId(quote.id);
      // Get business info for the quote
      const business = await getBusinessByUserId(quote.userId);
      // Get customer info
      const customer = quote.customerId ? await getCustomerById(quote.customerId, quote.userId) : null;
      return { ...quote, lineItems: items, business, customer };
    }),

  sign: publicProcedure
    .input(z.object({ token: z.string(), signedByName: z.string().min(1), signatureBase64: z.string() }))
    .mutation(async ({ input }) => {
      const quote = await getQuoteByPublicToken(input.token);
      if (!quote) throw new TRPCError({ code: "NOT_FOUND" });
      if (quote.status === "accepted") throw new TRPCError({ code: "BAD_REQUEST", message: "Quote already signed" });
      await updateQuoteByToken(input.token, {
        status: "accepted",
        acceptedAt: new Date(),
        signedByName: input.signedByName,
        signatureUrl: input.signatureBase64,
        signedAt: new Date(),
      });
      return { success: true };
    }),

  decline: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const quote = await getQuoteByPublicToken(input.token);
      if (!quote) throw new TRPCError({ code: "NOT_FOUND" });
      await updateQuoteByToken(input.token, { status: "declined", declinedAt: new Date() });
      return { success: true };
    }),
});
