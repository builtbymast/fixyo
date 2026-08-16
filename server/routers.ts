import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as db from "./db";
import { assertBusinessOwnership } from "./_core/ownership";

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
      .input(
        z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          profilePicture: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.updateUser(ctx.user.id, input);
        const user = await db.getUser(ctx.user.id);
        return user;
      }),
  }),

  // ============ BUSINESS ROUTER ============
  business: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const business = await db.getBusinessByUserId(ctx.user.id);
      return business;
    }),

    create: protectedProcedure
      .input(
        z.object({
          businessName: z.string().min(1),
          abn: z.string().optional(),
          acn: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          website: z.string().optional(),
          address: z.string().optional(),
          suburb: z.string().optional(),
          state: z.string().optional(),
          postcode: z.string().optional(),
          tradeType: z.string().optional(),
          logo: z.string().optional(),
          bankAccountName: z.string().optional(),
          bankAccountNumber: z.string().optional(),
          bankBsb: z.string().optional(),
          taxFileNumber: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const businessId = await db.createBusiness({
          userId: ctx.user.id,
          ...input,
        });
        return { id: businessId };
      }),

    update: protectedProcedure
      .input(
        z.object({
          businessName: z.string().optional(),
          abn: z.string().optional(),
          acn: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          website: z.string().optional(),
          address: z.string().optional(),
          suburb: z.string().optional(),
          state: z.string().optional(),
          postcode: z.string().optional(),
          tradeType: z.string().optional(),
          logo: z.string().optional(),
          bankAccountName: z.string().optional(),
          bankAccountNumber: z.string().optional(),
          bankBsb: z.string().optional(),
          taxFileNumber: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await db.getBusinessByUserId(ctx.user.id);
        if (!business) throw new Error("Business not found");
        await db.updateBusiness(business.id, input);
        return { success: true };
      }),
  }),

  // ============ CUSTOMERS ROUTER ============
  customers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const business = await db.getBusinessByUserId(ctx.user.id);
      if (!business) return [];
      return db.getCustomersByBusiness(business.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const customer = await db.getCustomer(input.id);
        if (!customer) return null;
        await assertBusinessOwnership(ctx.user.id, customer, "customer");
        return customer;
      }),

    create: protectedProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          suburb: z.string().optional(),
          state: z.string().optional(),
          postcode: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await db.getBusinessByUserId(ctx.user.id);
        if (!business) throw new Error("Business not found");
        const customerId = await db.createCustomer({
          businessId: business.id,
          ...input,
        });
        return { id: customerId };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          suburb: z.string().optional(),
          state: z.string().optional(),
          postcode: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const customer = await db.getCustomer(id);
        await assertBusinessOwnership(ctx.user.id, customer, "customer");
        await db.updateCustomer(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const customer = await db.getCustomer(input.id);
        await assertBusinessOwnership(ctx.user.id, customer, "customer");
        await db.deleteCustomer(input.id);
        return { success: true };
      }),
  }),

  // ============ JOBS ROUTER ============
  jobs: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const business = await db.getBusinessByUserId(ctx.user.id);
      if (!business) return [];
      return db.getJobsByBusiness(business.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const job = await db.getJob(input.id);
        if (!job) return null;
        await assertBusinessOwnership(ctx.user.id, job, "job");
        const photos = await db.getJobPhotos(input.id);
        return { ...job, photos };
      }),

    create: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
          title: z.string().min(1),
          description: z.string().optional(),
          scheduledDate: z.date().optional(),
          location: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await db.getBusinessByUserId(ctx.user.id);
        if (!business) throw new Error("Business not found");
        const jobId = await db.createJob({
          businessId: business.id,
          ...input,
        });
        return { id: jobId };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
          scheduledDate: z.date().optional(),
          completedDate: z.date().optional(),
          location: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const job = await db.getJob(id);
        await assertBusinessOwnership(ctx.user.id, job, "job");
        await db.updateJob(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const job = await db.getJob(input.id);
        await assertBusinessOwnership(ctx.user.id, job, "job");
        await db.deleteJob(input.id);
        return { success: true };
      }),

    addPhoto: protectedProcedure
      .input(
        z.object({
          jobId: z.number(),
          url: z.string(),
          caption: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const photoId = await db.addJobPhoto(input);
        return { id: photoId };
      }),

    deletePhoto: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteJobPhoto(input.id);
        return { success: true };
      }),
  }),

  // ============ QUOTES ROUTER ============
  quotes: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const business = await db.getBusinessByUserId(ctx.user.id);
      if (!business) return [];
      return db.getQuotesByBusiness(business.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const quote = await db.getQuote(input.id);
        if (!quote) return null;
        await assertBusinessOwnership(ctx.user.id, quote, "quote");
        const lineItems = await db.getQuoteLineItems(input.id);
        return { ...quote, lineItems };
      }),

    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const quote = await db.getQuoteByPublicToken(input.token);
        if (!quote) return null;
        const lineItems = await db.getQuoteLineItems(quote.id);
        const customer = await db.getCustomer(quote.customerId);
        return { ...quote, lineItems, customer };
      }),

    create: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
          jobId: z.number().optional(),
          quoteNumber: z.string().min(1),
          totalAmount: z.number().or(z.string()),
          taxAmount: z.number().or(z.string()).optional(),
          notes: z.string().optional(),
          terms: z.string().optional(),
          validUntil: z.date().optional(),
          lineItems: z.array(
            z.object({
              description: z.string(),
              quantity: z.number().or(z.string()),
              unitPrice: z.number().or(z.string()),
              amount: z.number().or(z.string()),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await db.getBusinessByUserId(ctx.user.id);
        if (!business) throw new Error("Business not found");

        const publicToken = nanoid();
        const quoteId = await db.createQuote({
          businessId: business.id,
          customerId: input.customerId,
          jobId: input.jobId,
          quoteNumber: input.quoteNumber,
          totalAmount: String(input.totalAmount),
          taxAmount: input.taxAmount ? String(input.taxAmount) : undefined,
          notes: input.notes,
          terms: input.terms,
          validUntil: input.validUntil,
          publicToken,
          status: "draft",
        });

        for (const item of input.lineItems) {
          await db.addQuoteLineItem({
            quoteId,
            description: item.description,
            quantity: String(item.quantity),
            unitPrice: String(item.unitPrice),
            amount: String(item.amount),
          });
        }

        return { id: quoteId, publicToken };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["draft", "sent", "viewed", "signed", "rejected", "expired"]).optional(),
          totalAmount: z.number().or(z.string()).optional(),
          taxAmount: z.number().or(z.string()).optional(),
          notes: z.string().optional(),
          terms: z.string().optional(),
          validUntil: z.date().optional(),
          signedDate: z.date().optional(),
          signedByName: z.string().optional(),
          signatureUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const quote = await db.getQuote(id);
        await assertBusinessOwnership(ctx.user.id, quote, "quote");
        const cleanData: any = { ...data };
        if (data.totalAmount !== undefined) cleanData.totalAmount = String(data.totalAmount);
        if (data.taxAmount !== undefined) cleanData.taxAmount = String(data.taxAmount);
        await db.updateQuote(id, cleanData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const quote = await db.getQuote(input.id);
        await assertBusinessOwnership(ctx.user.id, quote, "quote");
        await db.deleteQuote(input.id);
        return { success: true };
      }),

    sign: publicProcedure
      .input(
        z.object({
          token: z.string(),
          signedByName: z.string(),
          signatureUrl: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const quote = await db.getQuoteByPublicToken(input.token);
        if (!quote) throw new Error("Quote not found");
        await db.updateQuote(quote.id, {
          status: "signed",
          signedDate: new Date(),
          signedByName: input.signedByName,
          signatureUrl: input.signatureUrl,
        });
        return { success: true };
      }),

    generatePDF: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const quote = await db.getQuote(input.id);
        if (!quote) throw new Error("Quote not found");

        const business = await db.getBusinessByUserId(ctx.user.id);
        if (!business || business.id !== quote.businessId) {
          throw new Error("Unauthorized");
        }

        return { success: true, filename: `quote-${quote.quoteNumber}.pdf` };
      }),

    sendEmail: protectedProcedure
      .input(z.object({ id: z.number(), origin: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { generateQuotePDF } = await import("./pdf");
        const { sendQuoteWithPDF, pdfDocumentToBuffer } = await import("./emailService");

        const quote = await db.getQuote(input.id);
        if (!quote) throw new Error("Quote not found");

        const business = await db.getBusinessByUserId(ctx.user.id);
        if (!business || business.id !== quote.businessId) {
          throw new Error("Unauthorized");
        }

        const customer = await db.getCustomer(quote.customerId);
        if (!customer || !customer.email) throw new Error("Customer email not found");

        const lineItems = await db.getQuoteLineItems(input.id);
        const pdfDoc = generateQuotePDF(
          { ...quote, lineItems: lineItems as any },
          customer,
          business,
          quote.quoteNumber
        );

        const pdfBuffer = await pdfDocumentToBuffer(pdfDoc);
        const portalLink = `${input.origin}/portal/quote/${quote.publicToken}`;

        const emailSent = await sendQuoteWithPDF(
          customer.email,
          `${customer.firstName} ${customer.lastName}`,
          business.businessName || "FixYo",
          quote.quoteNumber,
          quote.totalAmount,
          portalLink,
          pdfBuffer
        );

        if (emailSent) {
          await db.updateQuote(input.id, { status: "sent" });
        }

        return { success: emailSent, message: emailSent ? "Quote sent successfully" : "Failed to send quote" };
      }),
  }),

  // ============ INVOICES ROUTER ============
  invoices: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const business = await db.getBusinessByUserId(ctx.user.id);
      if (!business) return [];
      return db.getInvoicesByBusiness(business.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const invoice = await db.getInvoice(input.id);
        if (!invoice) return null;
        await assertBusinessOwnership(ctx.user.id, invoice, "invoice");
        const lineItems = await db.getInvoiceLineItems(input.id);
        return { ...invoice, lineItems };
      }),

    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const invoice = await db.getInvoiceByPublicToken(input.token);
        if (!invoice) return null;
        const lineItems = await db.getInvoiceLineItems(invoice.id);
        const customer = await db.getCustomer(invoice.customerId);
        const business = await db.getBusiness(invoice.businessId);
        return { ...invoice, lineItems, customer, business };
      }),

    create: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
          jobId: z.number().optional(),
          quoteId: z.number().optional(),
          invoiceNumber: z.string().min(1),
          totalAmount: z.number().or(z.string()),
          taxAmount: z.number().or(z.string()).optional(),
          dueDate: z.date().optional(),
          notes: z.string().optional(),
          lineItems: z.array(
            z.object({
              description: z.string(),
              quantity: z.number().or(z.string()),
              unitPrice: z.number().or(z.string()),
              amount: z.number().or(z.string()),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await db.getBusinessByUserId(ctx.user.id);
        if (!business) throw new Error("Business not found");

        const publicToken = nanoid();
        const invoiceId = await db.createInvoice({
          businessId: business.id,
          customerId: input.customerId,
          jobId: input.jobId,
          quoteId: input.quoteId,
          invoiceNumber: input.invoiceNumber,
          totalAmount: String(input.totalAmount),
          taxAmount: input.taxAmount ? String(input.taxAmount) : undefined,
          dueDate: input.dueDate,
          notes: input.notes,
          publicToken,
          status: "draft",
        });

        for (const item of input.lineItems) {
          await db.addInvoiceLineItem({
            invoiceId,
            description: item.description,
            quantity: String(item.quantity),
            unitPrice: String(item.unitPrice),
            amount: String(item.amount),
          });
        }

        return { id: invoiceId, publicToken };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["draft", "sent", "viewed", "partially_paid", "paid", "overdue", "cancelled"]).optional(),
          totalAmount: z.number().or(z.string()).optional(),
          taxAmount: z.number().or(z.string()).optional(),
          paidAmount: z.number().or(z.string()).optional(),
          dueDate: z.date().optional(),
          sentDate: z.date().optional(),
          paidDate: z.date().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const invoice = await db.getInvoice(id);
        await assertBusinessOwnership(ctx.user.id, invoice, "invoice");
        const cleanData: any = { ...data };
        if (data.totalAmount !== undefined) cleanData.totalAmount = String(data.totalAmount);
        if (data.taxAmount !== undefined) cleanData.taxAmount = String(data.taxAmount);
        if (data.paidAmount !== undefined) cleanData.paidAmount = String(data.paidAmount);
        await db.updateInvoice(id, cleanData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const invoice = await db.getInvoice(input.id);
        await assertBusinessOwnership(ctx.user.id, invoice, "invoice");
        await db.deleteInvoice(input.id);
        return { success: true };
      }),

    initiatePayment: publicProcedure
      .input(
        z.object({
          token: z.string(),
          origin: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { createInvoiceCheckoutSession } = await import("./stripe");
        const invoice = await db.getInvoiceByPublicToken(input.token);
        if (!invoice) throw new Error("Invoice not found");
        const customer = await db.getCustomer(invoice.customerId);
        if (!customer) throw new Error("Customer not found");
        
        const totalAmount = typeof invoice.totalAmount === 'string' ? parseFloat(invoice.totalAmount) : invoice.totalAmount;
        const session = await createInvoiceCheckoutSession(
          invoice.id,
          invoice.invoiceNumber,
          totalAmount,
          customer.email || "",
          `${customer.firstName} ${customer.lastName}`,
          input.origin
        );
        
        return { checkoutUrl: session.url };
      }),

    generatePDF: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const invoice = await db.getInvoice(input.id);
        if (!invoice) throw new Error("Invoice not found");

        const business = await db.getBusinessByUserId(ctx.user.id);
        if (!business || business.id !== invoice.businessId) {
          throw new Error("Unauthorized");
        }

        return { success: true, filename: `invoice-${invoice.invoiceNumber}.pdf` };
      }),

    sendEmail: protectedProcedure
      .input(z.object({ id: z.number(), origin: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { generateInvoicePDF } = await import("./pdf");
        const { sendInvoiceWithPDF, pdfDocumentToBuffer } = await import("./emailService");

        const invoice = await db.getInvoice(input.id);
        if (!invoice) throw new Error("Invoice not found");

        const business = await db.getBusinessByUserId(ctx.user.id);
        if (!business || business.id !== invoice.businessId) {
          throw new Error("Unauthorized");
        }

        const customer = await db.getCustomer(invoice.customerId);
        if (!customer || !customer.email) throw new Error("Customer email not found");

        const lineItems = await db.getInvoiceLineItems(input.id);
        const pdfDoc = generateInvoicePDF(
          { ...invoice, lineItems: lineItems as any },
          customer,
          business,
          invoice.invoiceNumber
        );

        const pdfBuffer = await pdfDocumentToBuffer(pdfDoc);
        const portalLink = `${input.origin}/portal/invoice/${invoice.publicToken}`;
        const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "Not specified";

        const emailSent = await sendInvoiceWithPDF(
          customer.email,
          `${customer.firstName} ${customer.lastName}`,
          business.businessName || "FixYo",
          invoice.invoiceNumber,
          invoice.totalAmount,
          dueDate,
          portalLink,
          pdfBuffer
        );

        if (emailSent) {
          await db.updateInvoice(input.id, { status: "sent" });
        }

        return { success: emailSent, message: emailSent ? "Invoice sent successfully" : "Failed to send invoice" };
      }),
  }),

  // ============ DASHBOARD ROUTER ============
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      const business = await db.getBusinessByUserId(ctx.user.id);
      if (!business) {
        return {
          activeJobs: 0,
          pendingQuotes: 0,
          outstandingInvoices: 0,
          totalRevenue: 0,
        };
      }

      const jobs = await db.getJobsByBusiness(business.id);
      const quotes = await db.getQuotesByBusiness(business.id);
      const invoices = await db.getInvoicesByBusiness(business.id);

      const activeJobs = jobs.filter((j) => j.status === "in_progress" || j.status === "scheduled").length;
      const pendingQuotes = quotes.filter((q) => q.status === "sent" || q.status === "viewed").length;
      const outstandingInvoices = invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled").length;
      const totalRevenue = invoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => {
          const amount = typeof i.totalAmount === 'string' ? parseFloat(i.totalAmount) : (typeof i.totalAmount === 'number' ? i.totalAmount : 0);
          return sum + amount;
        }, 0);

      return {
        activeJobs,
        pendingQuotes,
        outstandingInvoices,
        totalRevenue,
      };
    }),

    recentActivity: protectedProcedure.query(async ({ ctx }) => {
      const business = await db.getBusinessByUserId(ctx.user.id);
      if (!business) return [];

      const jobs = await db.getJobsByBusiness(business.id);
      const quotes = await db.getQuotesByBusiness(business.id);
      const invoices = await db.getInvoicesByBusiness(business.id);

      const activity = [
        ...jobs.map((j) => ({ type: "job", title: j.title, date: j.createdAt })),
        ...quotes.map((q) => ({ type: "quote", title: `Quote ${q.quoteNumber}`, date: q.createdAt })),
        ...invoices.map((i) => ({ type: "invoice", title: `Invoice ${i.invoiceNumber}`, date: i.createdAt })),
      ];

      return activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    }),
  }),
});

export type AppRouter = typeof appRouter;
