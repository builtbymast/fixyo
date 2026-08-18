import { defineConfig } from "drizzle-kit";

// POSTGRES_URL is what `vercel env pull` gives you for prod (Vercel's
// Supabase integration naming) -- fall back to it so this also works
// against prod without renaming anything by hand.
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL (or POSTGRES_URL) is required to run drizzle commands");
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
