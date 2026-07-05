import { createApp } from "../server/_core/app";

// Vercel's @vercel/node runtime calls this Express app directly as (req, res).
// A single instance is reused across warm invocations in the same container.
const app = createApp();

export default app;
