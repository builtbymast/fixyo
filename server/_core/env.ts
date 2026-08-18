// DATABASE_URL is our own convention (used locally and is what
// drizzle.config.ts expects). POSTGRES_URL is what Vercel's Supabase
// Marketplace integration injects automatically -- prefer our own name
// when both are set (e.g. local dev), fall back to Vercel's.
const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

export const ENV = {
  databaseUrl,
  supabaseUrl: process.env.VITE_SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  sendgridApiKey: process.env.SENDGRID_API_KEY ?? "",
  sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL ?? "noreply@fixyo.ai",
};
