import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getCustomersByUserId,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../db";

const customerInput = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

export const customersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getCustomersByUserId(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const customer = await getCustomerById(input.id, ctx.user.id);
      if (!customer) throw new TRPCError({ code: "NOT_FOUND" });
      return customer;
    }),

  create: protectedProcedure
    .input(customerInput)
    .mutation(async ({ ctx, input }) => {
      const id = await createCustomer({ ...input, userId: ctx.user.id });
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number() }).merge(customerInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateCustomer(id, ctx.user.id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteCustomer(input.id, ctx.user.id);
      return { success: true };
    }),
});
