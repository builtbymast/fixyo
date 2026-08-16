import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getInvoicesByUserId,
  getInvoiceById,
  getInvoiceByPublicToken,
  createInvoice,
  updateInvoice,
  updateInvoiceByToken,
  getNextInvoiceNumber,
  getLineItemsByInvoiceId,
  replaceLineItems,
  getBusinessByUserId,
  getCustomerById,
  getQuoteById,
  getLineItemsByQuoteId,
} from "../db";

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.string().default("1"),
  unitPrice: z.string(),
  unit: z.string().optional(),
  taxable: z.boolean().default(true),
});

const invoiceInput = z.object({
  title: z.string().min(1),
  jobId: z.number().optional(),
  customerId: z.number().optional(),
  quoteId: z.number().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  dueDate: z.date().optional(),
  taxRate: z.string().optional(),
  lineItems: z.array(lineItemSchema).default([]),
});

function calcTotals(items: z.infer<typeof lineItemSchema>[], taxRate: number) {
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.unitPrice), 0);
  const taxAmount = items.reduce((sum, item) => {
    if (!item.taxable) return sum;
    return sum + parseFloat(item.quantity) * parseFloat(item.unitPrice) * (taxRate / 100);
  }, 0);
  return { subtotal: subtotal.toFixed(2), taxAmount: taxAmount.toFixed(2), total: (subtotal + taxAmount).toFixed(2) };
}

export const invoicesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getInvoicesByUserId(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const invoice = await getInvoiceById(input.id, ctx.user.id);
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });
      const items = await getLineItemsByInvoiceId(input.id);
      return { ...invoice, lineItems: items };
    }),

  create: protectedProcedure
    .input(invoiceInput)
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      const prefix = business?.invoicePrefix ?? "INV";
      const taxRate = parseFloat(input.taxRate ?? business?.taxRate ?? "10");
      const invoiceNumber = await getNextInvoiceNumber(ctx.user.id, prefix);
      let items = input.lineItems;
      // If converting from a quote, copy line items
      if (input.quoteId && items.length === 0) {
        const quoteItems = await getLineItemsByQuoteId(input.quoteId);
        items = quoteItems.map(qi => ({
          description: qi.description,
          quantity: String(qi.quantity),
          unitPrice: String(qi.unitPrice),
          unit: qi.unit ?? undefined,
          taxable: qi.taxable,
        }));
      }
      const totals = calcTotals(items, taxRate);
      const { lineItems: _, ...invoiceData } = input;
      const id = await createInvoice({
        ...invoiceData,
        userId: ctx.user.id,
        invoiceNumber,
        taxRate: taxRate.toFixed(2),
        ...totals,
        publicToken: nanoid(32),
      });
      await replaceLineItems("invoice", id, items);
      return { id, invoiceNumber };
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number() }).merge(invoiceInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, lineItems: items, ...data } = input;
      const invoice = await getInvoiceById(id, ctx.user.id);
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });
      const business = await getBusinessByUserId(ctx.user.id);
      const taxRate = parseFloat(data.taxRate ?? invoice.taxRate ?? business?.taxRate ?? "10");
      const currentItems = items ?? await getLineItemsByInvoiceId(id);
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
      await updateInvoice(id, ctx.user.id, { ...data, taxRate: taxRate.toFixed(2), ...totals });
      if (items) await replaceLineItems("invoice", id, items);
      return { success: true };
    }),

  send: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await getInvoiceById(input.id, ctx.user.id);
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });
      await updateInvoice(input.id, ctx.user.id, { status: "sent", sentAt: new Date() });
      return { success: true, publicToken: invoice.publicToken };
    }),

  markPaid: protectedProcedure
    .input(z.object({ id: z.number(), paymentMethod: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await getInvoiceById(input.id, ctx.user.id);
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });
      await updateInvoice(input.id, ctx.user.id, {
        status: "paid",
        paidAt: new Date(),
        amountPaid: invoice.total,
        paymentMethod: input.paymentMethod ?? "manual",
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await updateInvoice(input.id, ctx.user.id, { status: "cancelled" });
      return { success: true };
    }),

  // ─── Public portal ────────────────────────────────────────────────────────
  getPublic: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const invoice = await getInvoiceByPublicToken(input.token);
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });
      if (invoice.status === "sent") {
        await updateInvoiceByToken(input.token, { status: "viewed", viewedAt: new Date() });
      }
      const items = await getLineItemsByInvoiceId(invoice.id);
      const business = await getBusinessByUserId(invoice.userId);
      const customer = invoice.customerId ? await getCustomerById(invoice.customerId, invoice.userId) : null;
      return { ...invoice, lineItems: items, business, customer };
    }),
});
