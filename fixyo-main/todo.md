# FixYo Implementation Roadmap

## Phase 1: Detail Pages (HIGH PRIORITY)
- [x] JobDetail page with full job information and action buttons
- [x] QuoteDetail page with line items and signature status
- [x] InvoiceDetail page with payment tracking
- [x] CustomerDetail page with job/quote/invoice history

## Phase 2: Form Pages (HIGH PRIORITY)
- [x] JobForm page (create and edit) with customer selection, date picker, and notes editor
- [x] JobForm photo upload feature (before/after images) with drag-and-drop and preview
- [x] QuoteForm page with line items editor and auto-calculations
- [ ] InvoiceForm page with line items editor
- [ ] CustomerForm page (create and edit)

## Week 1: Critical Path to Launch
- [x] QuoteForm with dynamic line items editor and auto-calculations
- [x] PDF generation for quotes and invoices with Trusted Craft design
- [x] PublicQuoteView page with signature capture (canvas-based drawing)
- [ ] PublicInvoiceView page with Stripe payment integration - IN PROGRESS
- [ ] Email notifications system
- [ ] InvoiceForm page with line items editor
- [ ] CustomerForm page (create and edit)
- [ ] Settings pages (Business, Profile, Subscription)

## Phase 3: PDF Generation (HIGH PRIORITY)
- [x] Install PDF generation library (pdfkit)
- [x] Create PDF template for quotes with company branding
- [x] Create PDF template for invoices with payment details
- [x] Add PDF download endpoints to server
- [x] Add tRPC procedures for PDF generation
- [x] Unit tests for PDF generation (7 tests passing)
- [x] Add PDF email functionality with attachments
- [x] Email service with PDF attachment support
- [x] Quote email with PDF attachment (quotes.sendEmail)
- [x] Invoice email with PDF attachment (invoices.sendEmail)
- [x] SendGrid integration for real email delivery
- [x] SendGrid unit tests (10 tests passing)
- [x] Payment received email notification

## Phase 4: Public Portal Pages (HIGH PRIORITY)
- [ ] PublicQuoteView page (customer view, signature capture)
- [ ] PublicInvoiceView page (customer view, payment button)
- [ ] Signature capture component
- [ ] Payment page integration

## Phase 5: Form Validation & Error Handling (MEDIUM PRIORITY)
- [ ] Add client-side form validation
- [ ] Add server-side validation
- [ ] Implement error messages
- [ ] Add success notifications
- [ ] Handle edge cases

## Phase 6: Email Notifications (MEDIUM PRIORITY)
- [ ] Install email service library
- [ ] Create email templates
- [ ] Quote sent notification
- [ ] Invoice sent notification
- [ ] Payment received notification
- [ ] Invoice overdue reminder

## Phase 7: Settings Pages (MEDIUM PRIORITY)
- [ ] SettingsBusiness page
- [ ] SettingsProfile page
- [ ] SettingsSubscription page

## Phase 8: AI Generator UI (MEDIUM PRIORITY)
- [ ] AIGenerator page with prompt templates
- [ ] Job description generator
- [ ] Quote text generator
- [ ] Invoice notes generator
- [ ] Follow-up email generator

## Phase 9: Advanced Features (LOW PRIORITY)
- [ ] Advanced search and filtering
- [ ] Analytics dashboard
- [ ] Team management
- [ ] Calendar integration
- [ ] Accounting software sync

## Week 2: Settings Pages (IN PROGRESS)
- [x] Business Profile settings page (company name, ABN, address, logo)
- [x] Business logo upload endpoint (/api/upload/logo)
- [x] User Profile settings page (name, email, profile picture)
- [ ] Subscription settings page (billing, plan management)

## Payment Processing (IN PROGRESS)
- [x] Stripe webhook signing secret configured
- [x] Webhook handler endpoint created (/api/webhooks/stripe)
- [x] Payment success handler (updates invoice to paid)
- [x] Payment failure handler (updates invoice to overdue)
- [x] Refund handler (updates invoice paid amount and status)
- [ ] Test webhook with Stripe test events
