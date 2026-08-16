import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { logAiPrompt } from "../db";

const TRADE_SYSTEM_PROMPT = `You are an expert Australian tradesperson assistant. You write clear, professional, and concise text for trade businesses. 
Your outputs are practical, Australian-English, and ready to use directly in quotes, job descriptions, or customer communications.
Never use overly formal language. Keep it professional but approachable.`;

export const aiRouter = router({
  generateJobDescription: protectedProcedure
    .input(z.object({
      tradeType: z.string(),
      jobTitle: z.string(),
      context: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userPrompt = `Write a clear, professional job description for a ${input.tradeType} job titled "${input.jobTitle}".
${input.context ? `Additional context: ${input.context}` : ""}
Include: what the job involves, scope of work, and any relevant notes. Keep it under 150 words. Australian English.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: TRADE_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
      const output = String(response.choices[0]?.message?.content ?? "");
      await logAiPrompt({ userId: ctx.user.id, promptType: "job_description", inputText: userPrompt, outputText: output });
      return { text: output };
    }),

  generateQuoteText: protectedProcedure
    .input(z.object({
      tradeType: z.string(),
      jobTitle: z.string(),
      lineItemsSummary: z.string().optional(),
      context: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userPrompt = `Write professional quote notes for a ${input.tradeType} job: "${input.jobTitle}".
${input.lineItemsSummary ? `Work includes: ${input.lineItemsSummary}` : ""}
${input.context ? `Context: ${input.context}` : ""}
Include: brief description of work, what's included, any exclusions, and a professional closing note. Under 120 words. Australian English.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: TRADE_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
      const output = String(response.choices[0]?.message?.content ?? "");
      await logAiPrompt({ userId: ctx.user.id, promptType: "quote_text", inputText: userPrompt, outputText: output });
      return { text: output };
    }),

  generateFollowUpEmail: protectedProcedure
    .input(z.object({
      customerName: z.string(),
      jobTitle: z.string(),
      tradeType: z.string(),
      context: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userPrompt = `Write a friendly follow-up email to ${input.customerName} about their ${input.tradeType} job: "${input.jobTitle}".
${input.context ? `Context: ${input.context}` : ""}
Keep it brief, professional, and friendly. Australian English. Include a subject line.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: TRADE_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
      const output = String(response.choices[0]?.message?.content ?? "");
      await logAiPrompt({ userId: ctx.user.id, promptType: "follow_up_email", inputText: userPrompt, outputText: output });
      return { text: output };
    }),

  generateInvoiceNote: protectedProcedure
    .input(z.object({
      tradeType: z.string(),
      jobTitle: z.string(),
      paymentTerms: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userPrompt = `Write professional invoice notes for a ${input.tradeType} job: "${input.jobTitle}".
Payment terms: ${input.paymentTerms ?? 14} days.
Include: thank you note, payment instructions reminder, and contact details prompt. Under 80 words. Australian English.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: TRADE_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
      const output = String(response.choices[0]?.message?.content ?? "");
      await logAiPrompt({ userId: ctx.user.id, promptType: "invoice_note", inputText: userPrompt, outputText: output });
      return { text: output };
    }),

  generateLineItems: protectedProcedure
    .input(z.object({
      tradeType: z.string(),
      jobDescription: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userPrompt = `Generate a list of typical line items for a ${input.tradeType} job described as: "${input.jobDescription}".
Return JSON array with objects: { description: string, quantity: number, unit: string, unitPrice: number }
Use realistic Australian market rates. Include labour and materials separately. Max 8 items.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: TRADE_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "line_items",
            strict: true,
            schema: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      description: { type: "string" },
                      quantity: { type: "number" },
                      unit: { type: "string" },
                      unitPrice: { type: "number" },
                    },
                    required: ["description", "quantity", "unit", "unitPrice"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["items"],
              additionalProperties: false,
            },
          },
        },
      });
      const content = String(response.choices[0]?.message?.content ?? '{"items":[]}');
      const parsed = JSON.parse(content);
      await logAiPrompt({ userId: ctx.user.id, promptType: "line_items", inputText: userPrompt, outputText: content });
      return { items: parsed.items };
    }),
});
