# FixYo — Build Briefing for Arena

**Prepared:** 2026-08-16
**Audience:** Arena (AI dev agent) picking up this codebase
**Repo:** `C:\Users\amybe\OneDrive\Desktop\fixyo-main`

Read this before touching anything else in the repo. The other `.md` files at repo root
(`AUDIT_REPORT_UPDATED.md`, `TECHNICAL_DEBT_REPORT.md`, `AUDIT_CHECKLIST*.md`, `todo.md`) are
**stale and partly wrong** — see §7. This document was produced by directly reading the current
code and running the build/tests, not by trusting those files.

---

## 0. TL;DR

- **The production build is currently broken.** `vite build` fails immediately — `App.tsx`
  imports four page components that don't exist on disk. This is job #1. See §1.
- Product: **FixYo** — a trades/tradie job-quote-invoice SaaS (jobs → quotes → e-signature →
  invoices → payment). tRPC + React 19 + Drizzle/MySQL + Express, deployed on Vercel.
- Core CRUD (jobs, quotes, invoices, customers, business) is genuinely well-built on the backend.
  The gap is entirely in the **frontend**: several routed pages are literal "coming soon" stubs
  or don't exist at all, and there's a parallel set of **orphaned dead-code folders** from an
  abandoned scaffolding pass that look real but aren't wired into the app.
- Auth is a **Manus-platform OAuth + JWT session** — an external dependency, not a portable
  auth stack. Assume it stays as-is unless told otherwise.
- Tests: 12 passing, 17 failing — all 17 failures are environment-gated (no `DATABASE_URL` /
  `STRIPE_SECRET_KEY` in this sandbox), not proven code bugs. Re-run with real env vars before
  trusting either way.

---

## 1. CRITICAL — Fix the build first

`client/src/App.tsx` lazy-imports these pages, none of which exist in `client/src/pages/`:

| Import in App.tsx | Routed at | File exists? |
|---|---|---|
| `./pages/CustomerDetail` | `/app/customers/:id` | ❌ No |
| `./pages/InvoiceDetail` | `/app/invoices/:id` | ❌ No |
| `./pages/AIGenerator` | `/app/ai` | ❌ No |
| `./pages/SettingsProfile` | `/app/settings/profile` | ❌ No (only `SettingsUserProfile.tsx` and `SettingsBusinessProfile.tsx` exist) |

Confirmed by actually running `npx vite build`:

```
✗ Build failed
error during build:
Could not resolve "./pages/InvoiceDetail" from "client/src/App.tsx"
```

**`todo.md` claims `InvoiceDetail` and `CustomerDetail` are done (`[x]`) — they are not.** Don't
trust that file's checkboxes (§7).

**Fix options, in order of speed:**
1. Fastest unblock: create the four missing files as real (not stub) pages, or point the
   imports at existing equivalents if one already covers the need.
2. `JobDetail.tsx` and `QuoteDetail.tsx` *do* exist and resolve, but are 850-byte "coming soon"
   placeholders (`QuoteDetail.tsx`'s component is even still named `PageDetail` — a copy-paste
   leftover). These won't break the build, but they're functionally the same gap as the missing
   files above — a user can't view a job or quote's detail page today.
3. `SettingsSubscription.tsx` (473 bytes) is also a stub, lower priority — nothing in the backend
   reads/writes the `subscriptions` table yet either (see §3).

Treat "make `pnpm run build` succeed" as the acceptance bar for step 1, then treat "detail pages
actually show real data" as the bar for step 2.

---

## 1b. CRITICAL — Cross-tenant IDOR in customers/jobs/quotes/invoices

Verified directly in `server/routers.ts`: the `get`, `update`, and `delete` procedures on
`customers`, `jobs`, `quotes`, and `invoices` all take a bare `z.object({ id: z.number() })`
under `protectedProcedure` — i.e. any logged-in user, not scoped to their own business — and
never check that the record's `businessId` matches the caller's business. Example
(`customers.get`, line 105-109):

```ts
get: protectedProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    return db.getCustomer(input.id);   // no ownership check
  }),
```

Same pattern at `jobs.get` (172-178), `quotes.get` (257-263), `invoices.get` (448-454), and the
corresponding `update`/`delete` procedures for all four resources. Contrast with `list` and
`create`, which correctly scope by `db.getBusinessByUserId(ctx.user.id)`.

**Impact:** any authenticated FixYo user can read, edit, or delete any other business's
customers, jobs, quotes, and invoices simply by incrementing/guessing integer IDs. This is a
live cross-tenant data exposure, not a hypothetical — worth fixing before this goes anywhere
near production, arguably ahead of cosmetic/feature gaps.

**Fix shape:** add a shared ownership check (e.g. an `assertBusinessOwnership(recordBusinessId,
ctx)` helper) and call it in every `get`/`update`/`delete` procedure across these four routers,
the same way `quotes.generatePDF`/`sendEmail` and `invoices.generatePDF`/`sendEmail` already do
it correctly (`if (!business || business.id !== quote.businessId) throw new Error("Unauthorized")`).

## 1c. Public quote/invoice tokens use `Math.random()`, not a CSPRNG

Both `quotes.create` and `invoices.create` generate the `publicToken` (the unguessable-by-design
token in the customer-facing portal URL — `/portal/quote/:token`, `/portal/invoice/:token` —
used for unauthenticated quote viewing/signing and invoice viewing/payment) the same way:

```ts
const publicToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
```

`Math.random()` is not cryptographically secure and has a limited/guessable output space. Since
this token is the *only* access control on a public-facing page that can trigger a real payment
or an e-signature, this should be a proper random token — `nanoid` is already a project
dependency and is the natural fix (`nanoid(32)` or similar).

## 1d. CRITICAL — `invoices.markPaid` lets anyone mark an invoice paid for free

`server/routers.ts` line 552:

```ts
markPaid: publicProcedure
  .input(z.object({ token: z.string(), paidAmount: z.number().or(z.string()) }))
  .mutation(async ({ input }) => {
    const invoice = await db.getInvoiceByPublicToken(input.token);
    if (!invoice) throw new Error("Invoice not found");
    await db.updateInvoice(invoice.id, {
      status: "paid",
      paidDate: new Date(),
      paidAmount: String(input.paidAmount),   // client-supplied, unverified
    });
    return { success: true };
  }),
```

This is `publicProcedure` (no auth) and takes a client-supplied `paidAmount` with **zero verification
that a real payment occurred** — no Stripe payment intent check, no webhook signature, nothing.
Anyone who has (or guesses) an invoice's `publicToken` can call this directly and mark it paid,
for any amount they choose, without paying anything. The legitimate payment path already exists
and is correct (`server/webhooks.ts` verifies Stripe's signature before marking paid) — this
procedure is a parallel, unguarded bypass of it. Worse than the IDOR issue above in severity
since it doesn't even require authentication, just the token from a shared/emailed link.

**Fix:** delete this procedure, or make it internal-only (called from the verified webhook
handler, never exposed as a client-callable tRPC procedure).

## 1e. Public quote/invoice email links are broken (`/public/...` vs `/portal/...`)

`server/routers.ts` builds the customer-facing links sent in `quotes.sendEmail` (line 420) and
`invoices.sendEmail` (line 637) as:

```ts
const portalLink = `${input.origin}/public/quote/${quote.publicToken}`;   // quotes
const portalLink = `${input.origin}/public/invoice/${invoice.publicToken}`; // invoices
```

But `client/src/App.tsx` only registers routes at `/portal/quote/:token` and
`/portal/invoice/:token` (note **portal**, not **public**). Every "View & Sign Quote" / "View &
Pay Invoice" link in every email FixYo sends currently 404s for the customer. Trivial one-line
fix in both places once found, but currently breaks the entire customer-facing half of the
product silently (no error on the business side — the email just sends "successfully" with a
dead link inside it).

**Same root cause, third instance:** `client/src/pages/PublicQuoteView.tsx` line 49 — after a
customer successfully signs a quote, it does `setLocation("/public/quote-signed")` after a 2s
delay. That route isn't registered in `App.tsx` either (only `/`, `/portal/quote/:token`,
`/portal/invoice/:token`, `/app/*`, `/404`, and the catch-all exist), so the customer gets bounced
to the 404 page two seconds after signing — a bad note to end the signing flow on. Fix by either
registering a real confirmation route or showing an inline "signed" state instead of navigating
away.

## 2. Product summary

FixYo is a tool for tradespeople (electricians, plumbers, etc.) to run their small business:
manage customers, create jobs, turn jobs into quotes, get quotes e-signed by the customer via a
public link, convert to invoices, and get paid online via Stripe. Multi-tenant by `businessId` —
each logged-in user owns one `business` row and everything (customers/jobs/quotes/invoices)
is scoped to it.

---

## 3. Architecture map

### Stack
- **Frontend:** React 19, Vite 7, Wouter (routing), TanStack Query, tRPC client, Tailwind 4,
  Radix UI primitives, React Hook Form + Zod.
- **Backend:** Express 4 + tRPC 11 server, entry point `server/_core/index.ts` →
  `server/_core/createApp.ts`. Dev mode uses Vite middleware for HMR; prod serves
  `dist/public` static files.
- **DB:** MySQL via Drizzle ORM. Schema: `drizzle/schema.ts`. 3 migrations, all dated Jul 8
  (no schema changes since — everything since has been page/route churn, not data model changes).
- **Deploy:** Vercel (`vercel.json`) — SPA rewrite to `index.html`, API rewritten to `api/index`
  serverless function. `outputDirectory: dist/public`.
- **Package manager:** pnpm (`pnpm@10.4.1` pinned in `packageManager`, but devDependency lists
  `^10.15.1` — minor mismatch, worth normalizing at some point, not urgent).

### tRPC routers (`server/routers.ts`, ~25KB, the real spine of the backend)
- `auth` — me / logout / updateProfile
- `business` — get / create / update
- `customers` — list / get / create / update / delete
- `jobs` — list / get / create / update / delete / addPhoto / deletePhoto
- `quotes` — list / get / getByToken / create / update / delete / sign / generatePDF / sendEmail
- `invoices` — list / get / getByToken / create / update / delete / markPaid / initiatePayment /
  generatePDF / sendEmail
- `dashboard` — stats / recentActivity

This layer is solid: real Zod validation, real DB queries, consistent `businessId` scoping.

**Known gap inside it:** `quotes.generatePDF` / `invoices.generatePDF` tRPC procedures don't
actually return a PDF — they return `{ success: true, filename: "..." }` only. Real PDF bytes
only get generated and used inside the `sendEmail` mutations (which call into `server/pdf.ts`
and attach the PDF to the outgoing email). There's no working "download PDF directly" path.
The matching Express routes `GET /api/pdf/quote/:quoteId` and `GET /api/pdf/invoice/:invoiceId`
(in `_core/createApp.ts`) are also stubs — they return `{ message: "PDF download endpoint ready" }`
instead of streaming a file. If a "download PDF" button exists in the UI, it's currently decorative.

### Database (`drizzle/schema.ts`, MySQL)
`users`, `businesses`, `customers`, `jobs`, `jobPhotos`, `quotes`, `quoteLineItems`, `invoices`,
`invoiceLineItems`, `aiPromptLogs`, `subscriptions`.

- `aiPromptLogs` exists but nothing writes to it — there is no AI router in `routers.ts` at all,
  despite the frontend having an (unbuilt) `/app/ai` route.
- `subscriptions` is explicitly commented `(for future use)` in the schema — nothing reads/writes
  it, and `SettingsSubscription.tsx` is a stub. Billing/plan-tiering is not implemented, only
  modeled.

### Auth
Manus-platform OAuth + first-party JWT session cookie (**not** NextAuth/Clerk/Supabase/custom
password auth):
- `server/_core/oauth.ts` — `GET /api/oauth/callback`, exchanges code via `sdk.exchangeCodeForToken`,
  upserts user, issues session JWT cookie.
- `server/_core/sdk.ts` — talks to a Manus-hosted OAuth server (`OAUTH_SERVER_URL`), signs/verifies
  session JWTs with `jose` (HS256, secret = `JWT_SECRET`).
- `server/_core/context.ts` / `trpc.ts` — `protectedProcedure`/`adminProcedure` middleware enforce
  auth per-procedure.

This is a real external dependency: login won't work at all if the Manus auth server or the
`OAUTH_SERVER_URL` / `VITE_APP_ID` / `OWNER_OPEN_ID` env vars aren't correctly set. Don't assume
you can swap this out casually — treat it as a platform constraint unless the human says otherwise.

### PDF, Email, Storage, Payments
- **`server/pdf.ts`** — real, fully implemented PDFKit generator for quotes/invoices (branded
  header/footer, line-item table, totals, 10% GST hardcoded). Good.
- **`server/emailService.ts`** — the one actually wired into `routers.ts` (`sendQuoteWithPDF`,
  `sendInvoiceWithPDF`, `sendPaymentReceivedEmail`). Real SendGrid integration, but falls back to
  `console.log`-only if `SENDGRID_API_KEY` isn't set — so it's code-complete but currently
  running in "log only" mode pending a real key.
- **`server/email.ts`** — a *separate*, older email module with its own templates and a stub
  `sendEmail()` (`// TODO: Integrate with actual email service`, just logs). **Nothing calls
  this file from routers.ts** — it's dead code superseded by `emailService.ts`. Candidate for
  deletion once confirmed unused elsewhere.
- **`server/storage.ts`** — file uploads (logo/avatar) go through a Manus-hosted storage proxy
  (`BUILT_IN_FORGE_API_URL`/`KEY`), **not** AWS S3 directly, despite `@aws-sdk/client-s3` being a
  listed dependency. That SDK appears to be an unused leftover from a template — verify before
  assuming S3 is live anywhere.
- **`server/stripe.ts`** — real: creates Stripe Checkout Sessions for invoice payment.
- **`server/webhooks.ts`** — real: handles `payment_intent.succeeded/failed`, `charge.refunded`,
  correctly wired with raw-body parsing before JSON middleware at `POST /api/webhooks/stripe`
  (required for Stripe signature verification). **Caveat:** this file constructs `new
  Stripe(ENV.stripeSecretKey)` at module load time — if `STRIPE_SECRET_KEY` is unset/empty, the
  Stripe SDK throws on import and breaks anything that imports this module (this is exactly why
  `webhooks.test.ts` currently fails to even collect).

### Orphaned / dead code — do not build on these without checking first
A cluster of files, all dated **Aug 10–14** (much newer than the Jul 8 core app), exist but are
**not imported or routed anywhere**:
- `client/src/pages/app/{Invoices,Jobs,Quotes,MessageGenerator}.tsx` — tiny placeholder stubs
- `client/src/pages/landing/{Demo,Pricing,Home,LandingDemo}.tsx` — landing-page variants, two of
  them (`Home.tsx`, `LandingDemo.tsx`) fairly built-out (~7KB each) but still unreferenced
- `server/routes/{ai,invoices,jobs,quotes}.ts` and `server/services/{openai,stripe}.ts` — trivial
  Express routers returning hardcoded placeholder JSON (e.g. `AI result placeholder for: ${prompt}`),
  never imported by `createApp.ts`
- `.kombai/` folder (canvas, design-systems, dated Jul 28) suggests a design/scaffolding tool
  ("Kombai") pass that generated all of the above and was never integrated into the live app

**Also present, clearly historical, not live:** `_archive/fixyo-landing-main/` is a complete
earlier standalone "FixYo landing page" project (own client/server/drizzle/package.json) —
looks like pre-merge history kept for reference, not something to build on.

**Unexplained, likely harmless:** an empty folder literally named `dating app ---` at repo root.
No content, no clear origin. Flag to the user before deleting (see §8 — nothing in this repo
should be deleted without asking first).

---

## 4. What's real vs. stub, by page

| Page | State |
|---|---|
| Home, AppLayout, Dashboard, JobsList, JobForm, QuotesList, QuoteForm, InvoicesList, InvoiceForm, CustomersList, CustomerForm, PublicQuoteView, PublicInvoiceView, SettingsBusiness, SettingsBusinessProfile, SettingsUserProfile, NotFound | ✅ Real, substantial implementations |
| JobDetail | 🟡 Stub ("coming soon") |
| QuoteDetail | 🟡 Stub ("coming soon"; component internally named `PageDetail`) |
| SettingsSubscription | 🟡 Stub (473 bytes) |
| CustomerDetail, InvoiceDetail, AIGenerator, SettingsProfile | ❌ Don't exist — **breaks the build** |
| ComponentShowcase.tsx | Real but orphaned — not imported anywhere, dev reference only |

Note `SettingsBusiness.tsx` and `SettingsBusinessProfile.tsx` both exist and both look real —
likely duplicates from iteration. Worth checking which one `App.tsx` actually routes to
(`SettingsBusiness`, per the router table) and whether `SettingsBusinessProfile.tsx` is dead code.

---

## 5. Environment / secrets

Vars actually read by the app (per `server/_core/env.ts`): `VITE_APP_ID`, `JWT_SECRET`,
`DATABASE_URL`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `NODE_ENV`, `BUILT_IN_FORGE_API_URL`,
`BUILT_IN_FORGE_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SENDGRID_API_KEY`,
`SENDGRID_FROM_EMAIL`, `FRONTEND_URL`, `PORT`.

**`.env.example` is messy and partly misleading** — it has `DATABASE_URL`, `STRIPE_SECRET_KEY`/
`STRIPE_WEBHOOK_SECRET`, `SENDGRID_API_KEY`, and `PORT` each defined **twice**, plus sections for
vars the app never reads (`SESSION_SECRET`, `SMTP_*`, `AWS_*`, `GA_MEASUREMENT_ID`, `SENTRY_DSN`).
Looks like two different templates got concatenated. Worth cleaning up so it matches reality —
low priority but cheap to fix and reduces onboarding confusion.

**Stripe account status is unknown from the code.** `STRIPE_SETUP_CHECKLIST.md` (dated Jul 8) has
every step past "test keys added" still unchecked (KYC, bank account, webhook endpoint, live
keys). Treat Stripe as **test-mode / business setup incomplete** unless the human confirms
otherwise — don't assume live payments work end-to-end. That doc also contains what look like
example/placeholder Stripe key strings (`pk_live_...`, a malformed `mk_...` "secret" example) —
worth a quick hygiene pass to make sure no real key ever got pasted into a markdown file, but
the secret-looking one has an invalid prefix so it reads as a fabricated example, not a live leak.

---

## 6. Tests

`npx vitest run` from repo root (this sandbox, no DB/Stripe key configured):

```
Test Files  6 failed | 2 passed (8)
Tests       17 failed | 12 passed | 27 skipped (56)
```

- Passing: `auth.logout.test.ts`, `auth.updateProfile.test.ts` (12 tests, no DB dependency).
- All `routers.test.ts` / `emailService.test.ts` / `logo-upload.test.ts` / `pdf.test.ts` failures
  are `Error: Database not available` from `server/db.ts` — purely a missing `DATABASE_URL` in
  this environment, not a demonstrated code bug.
- `webhooks.test.ts` fails at import time (`Neither apiKey nor config.authenticator provided`)
  because `server/webhooks.ts` constructs the Stripe SDK at module load with an empty key when
  `STRIPE_SECRET_KEY` is unset — the newer Stripe SDK throws immediately rather than deferring.
  This is a real, fixable robustness gap (lazy-init the Stripe client) independent of env config.

**Action:** re-run the suite with real `DATABASE_URL`/`STRIPE_SECRET_KEY` before drawing
conclusions about actual code health. Don't reuse the "17 failing" number as evidence of broken
logic without doing that first.

---

## 7. Why the other docs in this repo are unreliable

`AUDIT_REPORT_UPDATED.md`, `TECHNICAL_DEBT_REPORT.md`, `AUDIT_CHECKLIST*.md` — all dated
**March 29, 2026**, generated by a "Manus AI" agent, describing a ~75%-complete MVP snapshot from
4.5 months ago. Since then the page/route layer was reworked (Aug 10-14 orphaned scaffolding,
plus whatever produced the current routed pages) without anyone updating these docs. **Treat them
as historical only** — useful for seeing what problems existed once, not for current status.

`todo.md` is actively self-contradictory and wrong in both directions:
- Marks `InvoiceDetail` and `CustomerDetail` **done** — files don't exist, build is broken.
- Marks `QuoteDetail`/`JobDetail` **done** — files exist but are bare stubs.
- Marks `InvoiceForm`, `CustomerForm`, `PublicQuoteView`, `PublicInvoiceView` **not done** in one
  section — all four are real, substantial implementations elsewhere in the same file's own
  checklist.

Don't use checkbox state in `todo.md` as a signal of anything. If you update it going forward,
reconcile it against actual files first.

**No `README.md` exists anywhere in the repo.** There's no single onboarding doc besides this one
and the stale ones above — worth creating a real README once the build is unblocked.

---

## 8. Suggested direction / priority order

Revised after finding §1b–1e: the payment-bypass and cross-tenant data-access issues are more
urgent than the build break, because a broken build merely blocks *shipping* — these bugs are
live security/financial risk in the current code the moment it does ship (or if it's already
deployed somewhere). Fix in this order:

0. **`invoices.markPaid` payment bypass** (§1d) — remove or lock down before anything else touches
   payments. This is the single highest-severity issue found.
1. **Cross-tenant IDOR on customers/jobs/quotes/invoices** (§1b) — add ownership checks to every
   `get`/`update`/`delete` procedure across all four routers.
2. **Insecure public tokens** (§1c) — swap `Math.random()` for `nanoid` on quote/invoice
   `publicToken` generation.
3. **Broken portal links** (§1e) — fix `/public/...` → `/portal/...` in both `sendEmail` procedures.
4. **Unblock the build** (§1) — create or correctly reference the 4 missing pages so `pnpm run
   build` succeeds. Still necessary before anything can ship at all.
5. **Make JobDetail and QuoteDetail real** — they resolve but render nothing useful; same
   practical gap as the missing pages, just not build-breaking.
6. **Wire up real PDF download** — `quotes.generatePDF`/`invoices.generatePDF` and the
   `/api/pdf/*` routes are decorative; either implement them for real (stream bytes from
   `server/pdf.ts`, which already works) or remove the UI affordance until they do.
4. **Decide the fate of the orphaned Aug 10-14 files** (`client/src/pages/app/*`,
   `client/src/pages/landing/*`, `server/routes/*`, `server/services/*`, `.kombai/`) — either
   finish wiring them in (if they represent an intended redesign) or delete them as dead weight.
   This needs a decision from the human, not a unilateral delete — ask first, per project norms.
5. **Reconcile `todo.md`** against actual file state once the above is settled, so it's usable
   again as a status source of truth.
6. **Lazy-init the Stripe client** in `server/webhooks.ts` so the module doesn't throw on import
   when `STRIPE_SECRET_KEY` is absent — small robustness fix, also unblocks that test file.
7. **Confirm Stripe account state** with the human (test vs. live, KYC status) before building
   anything that assumes payments are production-ready.
8. **Clean up `.env.example`** to match what `server/_core/env.ts` actually reads.
9. Longer-term / lower priority, not urgent: `subscriptions` table + billing UI is entirely
   unimplemented (schema only); `aiPromptLogs` + AI features have no backend router at all
   despite a routed (currently missing) `/app/ai` page; database has no enforced foreign-key
   constraints per the old technical debt report (not re-verified in this pass — worth a fresh
   check when addressing #4/#5).

---

## 9. Open questions for the human before major work

- Are the `app/`/`landing/`/`server/routes`/`server/services` orphaned files an abandoned
  redesign attempt worth reviving, or safe to delete?
- Is `SettingsBusiness.tsx` or `SettingsBusinessProfile.tsx` the one to keep?
- Is Stripe meant to go live soon, or is FixYo still pre-revenue/testing?
- Is AI generation (`AIGenerator` page, `aiPromptLogs` table) still an intended near-term
  feature, or was it deprioritized?

Also, separately from FixYo itself: this repo's git root resolves to `C:\Users\amybe` (the whole
Windows user profile), not `fixyo-main` — git is scoped far wider than intended. Not addressed in
this briefing since it's outside FixYo's own build status, but worth fixing before relying on git
history/branches for this project.
