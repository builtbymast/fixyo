# FixYo Full App TODO

## Phase 1 — Database & Backend Upgrade
- [x] Upgrade project to full-stack (db, server, user)
- [x] Write full database schema (users, businesses, customers, jobs, quotes, invoices, lineItems, jobPhotos, aiPromptLogs, subscriptions)
- [x] Push schema to database (all 10 tables created)

## Phase 2 — Server Routers
- [x] Write server/db.ts with all query helpers
- [x] Write server/routers/business.ts — business profile CRUD
- [x] Write server/routers/customers.ts — customer CRUD
- [x] Write server/routers/jobs.ts — job CRUD + status management
- [x] Write server/routers/quotes.ts — quote CRUD + send + sign
- [x] Write server/routers/invoices.ts — invoice CRUD + send + mark paid
- [x] Write server/routers/ai.ts — AI prompt generator
- [x] Write server/routers/dashboard.ts — dashboard stats
- [x] Register all routers in server/routers.ts

## Phase 3 — Auth & App Shell
- [x] Update App.tsx with all routes (landing, app, auth)
- [x] Build AppLayout.tsx — authenticated sidebar layout
- [x] Build Dashboard page with live stats cards
- [x] Update Navbar to show Sign In / Go to App based on auth state

## Phase 4 — Jobs Module
- [x] Build JobsList page — table with filters, status badges, search
- [x] Build JobDetail page — full job view with photos, notes, linked quotes/invoices
- [x] Build JobForm (create/edit) — all fields, customer picker, scheduling
- [x] Job status management (active → completed → invoiced) — inline status change in JobDetail

## Phase 5 — Quoting Module
- [x] Build QuotesList page
- [x] Build QuoteForm — line items, tax, notes, terms, valid until
- [x] Build QuoteDetail — preview, send, status tracking
- [x] Quote PDF generation / print view
- [x] Customer signature flow (public token page)

## Phase 6 — Invoicing Module
- [x] Build InvoicesList page
- [x] Build InvoiceForm — from scratch or from quote/job
- [x] Build InvoiceDetail — preview, send, mark paid
- [x] Invoice PDF / print view
- [x] Customer payment page (public token page)

## Phase 7 — Customer Portal
- [x] Build public /portal/quote/:token page — view & sign quote
- [x] Build public /portal/invoice/:token page — view & pay invoice

## Phase 8 — AI Prompt Generator
- [x] Build AI page — trade type selector, context input, output display
- [x] Wire to server LLM helper with structured prompts
- [x] Support: job description, quote text, invoice notes, follow-up email

## Phase 9 — Customers Module
- [x] Build CustomersList page
- [x] Build CustomerDetail — contact info, job history, quotes, invoices

## Phase 10 — Settings
- [x] Build Settings/Business page — ABN, logo, trade type, bank details
- [x] Build Settings/Profile page — name, email, avatar
- [x] Build Settings/Subscription page — plan, usage, upgrade CTA

## Phase 11 — Polish & Testing
- [x] Write vitest tests for all routers (10 tests passing)
- [x] Responsive design check (mobile)
- [x] Update Navbar auth state (Sign In vs Go to App)
- [x] CustomerDetail page
- [x] PDF print views for quotes and invoices
- [x] Final checkpoint and delivery
