-- Row Level Security. The app's own backend connects as the postgres role and
-- always bypasses RLS (superuser), so these policies are defense-in-depth for
-- the anon/authenticated roles used by Supabase client libraries -- they stop
-- a leaked anon key (or a future direct-from-browser Supabase call) from
-- reading or writing another tradie's data.

CREATE OR REPLACE FUNCTION owned_business_ids()
RETURNS SETOF integer AS $$
  SELECT b.id FROM businesses b
  JOIN users u ON u.id = b."userId"
  WHERE u."authUserId" = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
--> statement-breakpoint

-- users: can only see/update their own row
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY users_select_own ON "users" FOR SELECT
  USING ("authUserId" = auth.uid());
--> statement-breakpoint
CREATE POLICY users_update_own ON "users" FOR UPDATE
  USING ("authUserId" = auth.uid());
--> statement-breakpoint

-- businesses: owned directly via userId
ALTER TABLE "businesses" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY businesses_select_own ON "businesses" FOR SELECT
  USING ("userId" IN (SELECT id FROM users WHERE "authUserId" = auth.uid()));
--> statement-breakpoint
CREATE POLICY businesses_insert_own ON "businesses" FOR INSERT
  WITH CHECK ("userId" IN (SELECT id FROM users WHERE "authUserId" = auth.uid()));
--> statement-breakpoint
CREATE POLICY businesses_update_own ON "businesses" FOR UPDATE
  USING ("userId" IN (SELECT id FROM users WHERE "authUserId" = auth.uid()));
--> statement-breakpoint

-- Tables owned via businessId
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY customers_all_own ON "customers" FOR ALL
  USING ("businessId" IN (SELECT owned_business_ids()))
  WITH CHECK ("businessId" IN (SELECT owned_business_ids()));
--> statement-breakpoint

ALTER TABLE "jobs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY jobs_all_own ON "jobs" FOR ALL
  USING ("businessId" IN (SELECT owned_business_ids()))
  WITH CHECK ("businessId" IN (SELECT owned_business_ids()));
--> statement-breakpoint

ALTER TABLE "quotes" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY quotes_all_own ON "quotes" FOR ALL
  USING ("businessId" IN (SELECT owned_business_ids()))
  WITH CHECK ("businessId" IN (SELECT owned_business_ids()));
--> statement-breakpoint

ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY invoices_all_own ON "invoices" FOR ALL
  USING ("businessId" IN (SELECT owned_business_ids()))
  WITH CHECK ("businessId" IN (SELECT owned_business_ids()));
--> statement-breakpoint

ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY subscriptions_all_own ON "subscriptions" FOR ALL
  USING ("businessId" IN (SELECT owned_business_ids()))
  WITH CHECK ("businessId" IN (SELECT owned_business_ids()));
--> statement-breakpoint

ALTER TABLE "aiPromptLogs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY aiPromptLogs_all_own ON "aiPromptLogs" FOR ALL
  USING ("businessId" IN (SELECT owned_business_ids()))
  WITH CHECK ("businessId" IN (SELECT owned_business_ids()));
--> statement-breakpoint

-- Tables owned via a parent row that's itself scoped by businessId
ALTER TABLE "jobPhotos" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY jobPhotos_all_own ON "jobPhotos" FOR ALL
  USING ("jobId" IN (SELECT id FROM jobs WHERE "businessId" IN (SELECT owned_business_ids())))
  WITH CHECK ("jobId" IN (SELECT id FROM jobs WHERE "businessId" IN (SELECT owned_business_ids())));
--> statement-breakpoint

ALTER TABLE "quoteLineItems" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY quoteLineItems_all_own ON "quoteLineItems" FOR ALL
  USING ("quoteId" IN (SELECT id FROM quotes WHERE "businessId" IN (SELECT owned_business_ids())))
  WITH CHECK ("quoteId" IN (SELECT id FROM quotes WHERE "businessId" IN (SELECT owned_business_ids())));
--> statement-breakpoint

ALTER TABLE "invoiceLineItems" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY invoiceLineItems_all_own ON "invoiceLineItems" FOR ALL
  USING ("invoiceId" IN (SELECT id FROM invoices WHERE "businessId" IN (SELECT owned_business_ids())))
  WITH CHECK ("invoiceId" IN (SELECT id FROM invoices WHERE "businessId" IN (SELECT owned_business_ids())));
