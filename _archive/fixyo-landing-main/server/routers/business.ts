import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getBusinessByUserId, upsertBusiness } from "../db";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

export const businessRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return getBusinessByUserId(ctx.user.id);
  }),

  upsert: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        abn: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postcode: z.string().optional(),
        tradeType: z.string().optional(),
        licenceNumber: z.string().optional(),
        website: z.string().optional(),
        taxRate: z.string().optional(),
        invoicePrefix: z.string().optional(),
        quotePrefix: z.string().optional(),
        paymentTerms: z.number().optional(),
        bankName: z.string().optional(),
        bsb: z.string().optional(),
        accountNumber: z.string().optional(),
        accountName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await upsertBusiness(ctx.user.id, input);
      return { success: true };
    }),

  uploadLogo: protectedProcedure
    .input(z.object({ base64: z.string(), mimeType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.mimeType.split("/")[1] ?? "png";
      const key = `logos/${ctx.user.id}-${nanoid(8)}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      await upsertBusiness(ctx.user.id, { logoUrl: url });
      return { url };
    }),
});
