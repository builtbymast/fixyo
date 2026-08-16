import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { storagePut } from "../storage";
import fileUpload from "express-fileupload";
import { verifyWebhookSignature, handleWebhookEvent } from "../webhooks";

// ─── Simple in-memory rate limiter ───────────────────────────────────────────
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((record, key) => {
    if (record.resetAt < now) rateLimitStore.delete(key);
  });
}, 5 * 60 * 1000);

function rateLimiter(maxRequests: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";
    const now = Date.now();
    let record = rateLimitStore.get(ip);
    if (!record || record.resetAt < now) {
      record = { count: 0, resetAt: now + windowMs };
      rateLimitStore.set(ip, record);
    }
    record.count++;
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - record.count));
    if (record.count > maxRequests) {
      return res.status(429).json({ error: "Too many requests, please try again later." });
    }
    next();
  };
}

export function createApp() {
  const app = express();

  // ─── Security headers ───────────────────────────────────────────────────────
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    next();
  });

  // ─── CORS ──────────────────────────────────────────────────────────────────
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:5173",
  ].filter(Boolean) as string[];

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (
      origin &&
      (allowedOrigins.includes(origin) ||
        !process.env.NODE_ENV ||
        process.env.NODE_ENV === "development")
    ) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // ─── Rate limiting ──────────────────────────────────────────────────────────
  app.use("/api/", rateLimiter(200, 15 * 60 * 1000));

  // Stripe webhook — raw body before JSON parsing
  app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    try {
      const signature = req.headers["stripe-signature"] as string;
      if (!signature) return res.status(400).json({ error: "Missing stripe-signature header" });
      const event = verifyWebhookSignature(req.body as Buffer, signature);
      if (!event) return res.status(400).json({ error: "Invalid webhook signature" });
      await handleWebhookEvent(event);
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }));

  registerOAuthRoutes(app);

  app.post("/api/upload/photo", async (req, res) => {
    try {
      const file = req.files?.file as any;
      const jobId = req.body?.jobId;
      if (!file || !jobId) return res.status(400).json({ error: "Missing file or jobId" });
      const { url } = await storagePut(`photos/${jobId}/${Date.now()}-${file.name}`, file.data, file.mimetype);
      res.json({ url });
    } catch {
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.post("/api/upload/avatar", async (req, res) => {
    try {
      const file = req.files?.file as any;
      if (!file) return res.status(400).json({ error: "No file provided" });
      const { url } = await storagePut(`avatars/${Date.now()}-${file.name}`, file.data, file.mimetype);
      res.json({ url });
    } catch {
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.post("/api/upload/logo", async (req, res) => {
    try {
      const file = req.files?.file as any;
      if (!file) return res.status(400).json({ error: "No file provided" });
      const { url } = await storagePut(`logos/${Date.now()}-${file.name}`, file.data, file.mimetype);
      res.json({ url });
    } catch {
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.get("/api/pdf/quote/:quoteId", async (req, res) => {
    const quoteId = parseInt(req.params.quoteId);
    res.json({ message: "PDF download endpoint ready", quoteId });
  });

  app.get("/api/pdf/invoice/:invoiceId", async (req, res) => {
    const invoiceId = parseInt(req.params.invoiceId);
    res.json({ message: "PDF download endpoint ready", invoiceId });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );

  return app;
}
