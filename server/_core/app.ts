import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { verifyWebhookSignature, handleWebhookEvent } from "../webhooks";
import { storagePut } from "../storage";
import fileUpload from "express-fileupload";

/**
 * Builds and returns the configured Express app without calling listen().
 * Used by both the traditional server (index.ts) and the Vercel handler (api/index.ts).
 */
export function createApp() {
  const app = express();

  // Stripe webhook must receive the raw body before JSON middleware runs
  app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      try {
        const signature = req.headers["stripe-signature"] as string;
        if (!signature) {
          return res.status(400).json({ error: "Missing stripe-signature header" });
        }
        const event = verifyWebhookSignature(req.body as Buffer, signature);
        if (!event) {
          return res.status(400).json({ error: "Invalid webhook signature" });
        }
        await handleWebhookEvent(event);
        res.json({ received: true });
      } catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({ error: "Webhook processing failed" });
      }
    }
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }));

  registerOAuthRoutes(app);

  app.post("/api/upload/photo", async (req, res) => {
    try {
      const { file, jobId } = req.body;
      if (!file || !jobId) {
        return res.status(400).json({ error: "Missing file or jobId" });
      }
      const url = `https://placeholder.com/photos/${jobId}/${Date.now()}.jpg`;
      res.json({ url });
    } catch (error) {
      console.error("Photo upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.post("/api/upload/avatar", async (req, res) => {
    try {
      const file = (req as any).files?.file;
      if (!file) return res.status(400).json({ error: "No file provided" });
      const fileName = `avatars/${Date.now()}-${file.name}`;
      const { url } = await storagePut(fileName, file.data, file.mimetype);
      res.json({ url });
    } catch (error) {
      console.error("Avatar upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.post("/api/upload/logo", async (req, res) => {
    try {
      const file = (req as any).files?.file;
      if (!file) return res.status(400).json({ error: "No file provided" });
      const fileName = `logos/${Date.now()}-${file.name}`;
      const { url } = await storagePut(fileName, file.data, file.mimetype);
      res.json({ url });
    } catch (error) {
      console.error("Logo upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.get("/api/pdf/quote/:quoteId", async (req, res) => {
    try {
      const quoteId = parseInt(req.params.quoteId);
      res.setHeader("Content-Type", "application/json");
      res.json({ message: "PDF download endpoint ready", quoteId });
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "PDF generation failed" });
    }
  });

  app.get("/api/pdf/invoice/:invoiceId", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.invoiceId);
      res.setHeader("Content-Type", "application/json");
      res.json({ message: "PDF download endpoint ready", invoiceId });
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "PDF generation failed" });
    }
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );

  return app;
}
