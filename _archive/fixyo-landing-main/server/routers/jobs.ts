import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getJobsByUserId,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getNextJobNumber,
  getJobPhotos,
  addJobPhoto,
  deleteJobPhoto,
} from "../db";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

const TRADE_TYPES = ["Plumbing", "Electrical", "Carpentry", "Painting", "Roofing", "HVAC", "Landscaping", "Masonry", "Welding", "Tiling", "Flooring"];

const jobInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  customerId: z.number().optional(),
  status: z.enum(["draft", "active", "completed", "invoiced", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  tradeType: z.enum(TRADE_TYPES as [string, ...string[]]),
  siteAddress: z.string().optional(),
  scheduledDate: z.date().optional(),
  completedDate: z.date().optional(),
  estimatedHours: z.string().optional(),
  actualHours: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

export const jobsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getJobsByUserId(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const job = await getJobById(input.id, ctx.user.id);
      if (!job) throw new TRPCError({ code: "NOT_FOUND" });
      const photos = await getJobPhotos(input.id, ctx.user.id);
      return { ...job, photos };
    }),

  create: protectedProcedure
    .input(jobInput)
    .mutation(async ({ ctx, input }) => {
      const jobNumber = await getNextJobNumber(ctx.user.id);
      const id = await createJob({ ...input, userId: ctx.user.id, jobNumber });
      return { id, jobNumber };
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number() }).merge(jobInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const job = await getJobById(id, ctx.user.id);
      if (!job) throw new TRPCError({ code: "NOT_FOUND" });
      await updateJob(id, ctx.user.id, data);
      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["draft", "active", "completed", "invoiced", "cancelled"]) }))
    .mutation(async ({ ctx, input }) => {
      const job = await getJobById(input.id, ctx.user.id);
      if (!job) throw new TRPCError({ code: "NOT_FOUND" });
      const extra: Record<string, Date | null> = {};
      if (input.status === "completed") extra.completedDate = new Date();
      await updateJob(input.id, ctx.user.id, { status: input.status, ...extra });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteJob(input.id, ctx.user.id);
      return { success: true };
    }),

  uploadPhoto: protectedProcedure
    .input(z.object({ jobId: z.number(), base64: z.string(), mimeType: z.string(), caption: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const job = await getJobById(input.jobId, ctx.user.id);
      if (!job) throw new TRPCError({ code: "NOT_FOUND" });
      const ext = input.mimeType.split("/")[1] ?? "jpg";
      const fileKey = `job-photos/${ctx.user.id}/${input.jobId}-${nanoid(8)}.${ext}`;
      const buffer = Buffer.from(input.base64, "base64");
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      const id = await addJobPhoto({ jobId: input.jobId, userId: ctx.user.id, url, fileKey, caption: input.caption });
      return { id, url };
    }),

  deletePhoto: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteJobPhoto(input.id, ctx.user.id);
      return { success: true };
    }),
});
