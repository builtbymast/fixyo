import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Business Profiles ───────────────────────────────────────────────────────
export const businesses = mysqlTable("businesses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  abn: varchar("abn", { length: 20 }),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  postcode: varchar("postcode", { length: 10 }),
  logoUrl: text("logoUrl"),
  tradeType: varchar("tradeType", { length: 100 }),
  licenceNumber: varchar("licenceNumber", { length: 100 }),
  website: varchar("website", { length: 255 }),
  taxRate: decimal("taxRate", { precision: 5, scale: 2 }).default("10.00"),
  invoicePrefix: varchar("invoicePrefix", { length: 20 }).default("INV"),
  quotePrefix: varchar("quotePrefix", { length: 20 }).default("QT"),
  paymentTerms: int("paymentTerms").default(14),
  bankName: varchar("bankName", { length: 100 }),
  bsb: varchar("bsb", { length: 10 }),
  accountNumber: varchar("accountNumber", { length: 20 }),
  accountName: varchar("accountName", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

// ─── Customers ───────────────────────────────────────────────────────────────
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 30 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  postcode: varchar("postcode", { length: 10 }),
  company: varchar("company", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  customerId: int("customerId"),
  jobNumber: varchar("jobNumber", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "active", "completed", "invoiced", "cancelled"]).default("active").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  tradeType: varchar("tradeType", { length: 100 }),
  siteAddress: text("siteAddress"),
  scheduledDate: timestamp("scheduledDate"),
  completedDate: timestamp("completedDate"),
  estimatedHours: decimal("estimatedHours", { precision: 6, scale: 2 }),
  actualHours: decimal("actualHours", { precision: 6, scale: 2 }),
  notes: text("notes"),
  internalNotes: text("internalNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

// ─── Job Photos ───────────────────────────────────────────────────────────────
export const jobPhotos = mysqlTable("jobPhotos", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  userId: int("userId").notNull(),
  url: text("url").notNull(),
  fileKey: text("fileKey").notNull(),
  caption: varchar("caption", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JobPhoto = typeof jobPhotos.$inferSelect;
export type InsertJobPhoto = typeof jobPhotos.$inferInsert;

// ─── Line Items (shared by quotes and invoices) ───────────────────────────────
export const lineItems = mysqlTable("lineItems", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quoteId"),
  invoiceId: int("invoiceId"),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull().default("1"),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).default("ea"),
  taxable: boolean("taxable").default(true).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LineItem = typeof lineItems.$inferSelect;
export type InsertLineItem = typeof lineItems.$inferInsert;

// ─── Quotes ───────────────────────────────────────────────────────────────────
export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobId: int("jobId"),
  customerId: int("customerId"),
  quoteNumber: varchar("quoteNumber", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["draft", "sent", "viewed", "accepted", "declined", "expired"]).default("draft").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0"),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).default("0"),
  taxRate: decimal("taxRate", { precision: 5, scale: 2 }).default("10.00"),
  notes: text("notes"),
  terms: text("terms"),
  validUntil: timestamp("validUntil"),
  sentAt: timestamp("sentAt"),
  viewedAt: timestamp("viewedAt"),
  acceptedAt: timestamp("acceptedAt"),
  declinedAt: timestamp("declinedAt"),
  signatureUrl: text("signatureUrl"),
  signedAt: timestamp("signedAt"),
  signedByName: varchar("signedByName", { length: 255 }),
  publicToken: varchar("publicToken", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobId: int("jobId"),
  customerId: int("customerId"),
  quoteId: int("quoteId"),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["draft", "sent", "viewed", "paid", "overdue", "cancelled"]).default("draft").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0"),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).default("0"),
  taxRate: decimal("taxRate", { precision: 5, scale: 2 }).default("10.00"),
  amountPaid: decimal("amountPaid", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  terms: text("terms"),
  dueDate: timestamp("dueDate"),
  sentAt: timestamp("sentAt"),
  viewedAt: timestamp("viewedAt"),
  paidAt: timestamp("paidAt"),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  publicToken: varchar("publicToken", { length: 64 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ─── AI Prompt Credits ────────────────────────────────────────────────────────
export const aiPromptLogs = mysqlTable("aiPromptLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  promptType: varchar("promptType", { length: 100 }).notNull(),
  inputText: text("inputText"),
  outputText: text("outputText"),
  tokensUsed: int("tokensUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiPromptLog = typeof aiPromptLogs.$inferSelect;
export type InsertAiPromptLog = typeof aiPromptLogs.$inferInsert;

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  plan: mysqlEnum("plan", ["free", "pro", "enterprise"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "past_due", "trialing"]).default("active").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  trialEndsAt: timestamp("trialEndsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
