import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { generateQuotePDF, generateInvoicePDF } from "../pdf";
import { getDb } from "../db";
import { storagePut } from "../storage";
import fileUpload from "express-fileupload";
import { verifyWebhookSignature, handleWebhookEvent } from "../webhooks";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Stripe webhook needs raw body, so add it before JSON parsing
  app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    try {
      const signature = req.headers["stripe-signature"] as string;
      if (!signature) {
        return res.status(400).json({ error: "Missing stripe-signature header" });
      }

      const event = verifyWebhookSignature(req.body as Buffer, signature);
      if (!event) {
        return res.status(400).json({ error: "Invalid webhook signature" });
      }

      // Handle the webhook event
      await handleWebhookEvent(event);
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // File upload middleware
  app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Photo upload endpoint
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

  // Avatar upload endpoint
  app.post("/api/upload/avatar", async (req, res) => {
    try {
      const file = req.files?.file as any;
      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const fileName = `avatars/${Date.now()}-${file.name}`;
      const { url } = await storagePut(fileName, file.data, file.mimetype);
      res.json({ url });
    } catch (error) {
      console.error("Avatar upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Logo upload endpoint
  app.post("/api/upload/logo", async (req, res) => {
    try {
      const file = req.files?.file as any;
      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const fileName = `logos/${Date.now()}-${file.name}`;
      const { url } = await storagePut(fileName, file.data, file.mimetype);
      res.json({ url });
    } catch (error) {
      console.error("Logo upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // PDF download endpoints
  app.get("/api/pdf/quote/:quoteId", async (req, res) => {
    try {
      const quoteId = parseInt(req.params.quoteId);
      // PDF generation endpoint - simplified for now
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
      // PDF generation endpoint - simplified for now
      res.setHeader("Content-Type", "application/json");
      res.json({ message: "PDF download endpoint ready", invoiceId });
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "PDF generation failed" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
