import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  longtext,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  profilePicture: text("profilePicture"), // URL to profile picture in S3
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Business profile for each user/company
 */
export const businesses = mysqlTable("businesses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  abn: varchar("abn", { length: 11 }), // Australian Business Number
  acn: varchar("acn", { length: 9 }), // Australian Company Number
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  address: text("address"),
  suburb: varchar("suburb", { length: 100 }),
  state: varchar("state", { length: 3 }), // NSW, VIC, QLD, etc
  postcode: varchar("postcode", { length: 4 }),
  tradeType: varchar("tradeType", { length: 100 }), // Plumbing, Electrical, Carpentry, etc
  logo: text("logo"), // URL to logo image
  bankAccountName: varchar("bankAccountName", { length: 255 }),
  bankAccountNumber: varchar("bankAccountNumber", { length: 20 }),
  bankBsb: varchar("bankBsb", { length: 6 }),
  taxFileNumber: varchar("taxFileNumber", { length: 11 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

/**
 * Customers/clients
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  suburb: varchar("suburb", { length: 100 }),
  state: varchar("state", { length: 3 }),
  postcode: varchar("postcode", { length: 4 }),
  notes: longtext("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Jobs/work orders
 */
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  customerId: int("customerId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: longtext("description"),
  status: mysqlEnum("status", [
    "scheduled",
    "in_progress",
    "completed",
    "cancelled",
  ])
    .default("scheduled")
    .notNull(),
  scheduledDate: timestamp("scheduledDate"),
  completedDate: timestamp("completedDate"),
  location: text("location"),
  notes: longtext("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

/**
 * Job photos
 */
export const jobPhotos = mysqlTable("jobPhotos", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  url: text("url").notNull(),
  caption: varchar("caption", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JobPhoto = typeof jobPhotos.$inferSelect;
export type InsertJobPhoto = typeof jobPhotos.$inferInsert;

/**
 * Quotes
 */
export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  customerId: int("customerId").notNull(),
  jobId: int("jobId"), // Optional: can be created from a job
  quoteNumber: varchar("quoteNumber", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", [
    "draft",
    "sent",
    "viewed",
    "signed",
    "rejected",
    "expired",
  ])
    .default("draft")
    .notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0"),
  notes: longtext("notes"),
  terms: longtext("terms"),
  validUntil: timestamp("validUntil"),
  signedDate: timestamp("signedDate"),
  signedByName: varchar("signedByName", { length: 255 }),
  signatureUrl: text("signatureUrl"),
  publicToken: varchar("publicToken", { length: 64 }).unique(), // For public signing link
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

/**
 * Quote line items
 */
export const quoteLineItems = mysqlTable("quoteLineItems", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quoteId").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuoteLineItem = typeof quoteLineItems.$inferSelect;
export type InsertQuoteLineItem = typeof quoteLineItems.$inferInsert;

/**
 * Invoices
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  customerId: int("customerId").notNull(),
  jobId: int("jobId"), // Optional: linked to job
  quoteId: int("quoteId"), // Optional: created from quote
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", [
    "draft",
    "sent",
    "viewed",
    "partially_paid",
    "paid",
    "overdue",
    "cancelled",
  ])
    .default("draft")
    .notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0"),
  paidAmount: decimal("paidAmount", { precision: 10, scale: 2 }).default("0"),
  notes: longtext("notes"),
  dueDate: timestamp("dueDate"),
  sentDate: timestamp("sentDate"),
  paidDate: timestamp("paidDate"),
  publicToken: varchar("publicToken", { length: 64 }).unique(), // For public payment page
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Invoice line items
 */
export const invoiceLineItems = mysqlTable("invoiceLineItems", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = typeof invoiceLineItems.$inferInsert;

/**
 * AI Prompt logs for tracking AI usage
 */
export const aiPromptLogs = mysqlTable("aiPromptLogs", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  userId: int("userId").notNull(),
  promptType: varchar("promptType", { length: 50 }).notNull(), // job_description, quote_text, invoice_notes, follow_up_email
  input: longtext("input").notNull(),
  output: longtext("output").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiPromptLog = typeof aiPromptLogs.$inferSelect;
export type InsertAiPromptLog = typeof aiPromptLogs.$inferInsert;

/**
 * Subscriptions (for future use)
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  plan: mysqlEnum("plan", ["free", "starter", "professional", "enterprise"])
    .default("free")
    .notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired"])
    .default("active")
    .notNull(),
  monthlyJobs: int("monthlyJobs").default(0),
  monthlyQuotes: int("monthlyQuotes").default(0),
  monthlyInvoices: int("monthlyInvoices").default(0),
  startDate: timestamp("startDate").defaultNow().notNull(),
  renewalDate: timestamp("renewalDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;