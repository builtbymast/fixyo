import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  AiPromptLog,
  Business,
  Customer,
  InsertAiPromptLog,
  InsertBusiness,
  InsertCustomer,
  InsertInvoice,
  InsertJob,
  InsertJobPhoto,
  InsertLineItem,
  InsertQuote,
  InsertSubscription,
  InsertUser,
  Invoice,
  Job,
  JobPhoto,
  LineItem,
  Quote,
  Subscription,
  aiPromptLogs,
  businesses,
  customers,
  invoices,
  jobPhotos,
  jobs,
  lineItems,
  quotes,
  subscriptions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Business ─────────────────────────────────────────────────────────────────
export async function getBusinessByUserId(userId: number): Promise<Business | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(businesses).where(eq(businesses.userId, userId)).limit(1);
  return result[0];
}

export async function upsertBusiness(userId: number, data: Partial<InsertBusiness>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await getBusinessByUserId(userId);
  if (existing) {
    await db.update(businesses).set({ ...data, updatedAt: new Date() }).where(eq(businesses.userId, userId));
  } else {
    await db.insert(businesses).values({ userId, name: data.name ?? "My Business", ...data });
  }
}

// ─── Customers ────────────────────────────────────────────────────────────────
export async function getCustomersByUserId(userId: number): Promise<Customer[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers).where(eq(customers.userId, userId)).orderBy(desc(customers.createdAt));
}

export async function getCustomerById(id: number, userId: number): Promise<Customer | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(and(eq(customers.id, id), eq(customers.userId, userId))).limit(1);
  return result[0];
}

export async function createCustomer(data: InsertCustomer): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(customers).values(data);
  return (result[0] as any).insertId;
}

export async function updateCustomer(id: number, userId: number, data: Partial<InsertCustomer>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(customers).set({ ...data, updatedAt: new Date() }).where(and(eq(customers.id, id), eq(customers.userId, userId)));
}

export async function deleteCustomer(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(customers).where(and(eq(customers.id, id), eq(customers.userId, userId)));
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export async function getJobsByUserId(userId: number): Promise<Job[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobs).where(eq(jobs.userId, userId)).orderBy(desc(jobs.createdAt));
}

export async function getJobById(id: number, userId: number): Promise<Job | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(jobs).where(and(eq(jobs.id, id), eq(jobs.userId, userId))).limit(1);
  return result[0];
}

export async function createJob(data: InsertJob): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(jobs).values(data);
  return (result[0] as any).insertId;
}

export async function updateJob(id: number, userId: number, data: Partial<InsertJob>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(jobs).set({ ...data, updatedAt: new Date() }).where(and(eq(jobs.id, id), eq(jobs.userId, userId)));
}

export async function deleteJob(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(jobs).where(and(eq(jobs.id, id), eq(jobs.userId, userId)));
}

export async function getNextJobNumber(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) return "JOB-001";
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(jobs).where(eq(jobs.userId, userId));
  const count = Number(result[0]?.count ?? 0) + 1;
  return `JOB-${String(count).padStart(3, "0")}`;
}

// ─── Job Photos ───────────────────────────────────────────────────────────────
export async function getJobPhotos(jobId: number, userId: number): Promise<JobPhoto[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobPhotos).where(and(eq(jobPhotos.jobId, jobId), eq(jobPhotos.userId, userId))).orderBy(desc(jobPhotos.createdAt));
}

export async function addJobPhoto(data: InsertJobPhoto): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(jobPhotos).values(data);
  return (result[0] as any).insertId;
}

export async function deleteJobPhoto(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(jobPhotos).where(and(eq(jobPhotos.id, id), eq(jobPhotos.userId, userId)));
}

// ─── Line Items ───────────────────────────────────────────────────────────────
export async function getLineItemsByQuoteId(quoteId: number): Promise<LineItem[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lineItems).where(eq(lineItems.quoteId, quoteId)).orderBy(lineItems.sortOrder);
}

export async function getLineItemsByInvoiceId(invoiceId: number): Promise<LineItem[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lineItems).where(eq(lineItems.invoiceId, invoiceId)).orderBy(lineItems.sortOrder);
}

export async function replaceLineItems(parentType: "quote" | "invoice", parentId: number, items: Omit<InsertLineItem, "quoteId" | "invoiceId">[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  if (parentType === "quote") {
    await db.delete(lineItems).where(eq(lineItems.quoteId, parentId));
    if (items.length > 0) await db.insert(lineItems).values(items.map((item, i) => ({ ...item, quoteId: parentId, sortOrder: i })));
  } else {
    await db.delete(lineItems).where(eq(lineItems.invoiceId, parentId));
    if (items.length > 0) await db.insert(lineItems).values(items.map((item, i) => ({ ...item, invoiceId: parentId, sortOrder: i })));
  }
}

// ─── Quotes ───────────────────────────────────────────────────────────────────
export async function getQuotesByUserId(userId: number): Promise<Quote[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quotes).where(eq(quotes.userId, userId)).orderBy(desc(quotes.createdAt));
}

export async function getQuoteById(id: number, userId: number): Promise<Quote | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quotes).where(and(eq(quotes.id, id), eq(quotes.userId, userId))).limit(1);
  return result[0];
}

export async function getQuoteByPublicToken(token: string): Promise<Quote | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quotes).where(eq(quotes.publicToken, token)).limit(1);
  return result[0];
}

export async function createQuote(data: InsertQuote): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(quotes).values(data);
  return (result[0] as any).insertId;
}

export async function updateQuote(id: number, userId: number, data: Partial<InsertQuote>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(quotes).set({ ...data, updatedAt: new Date() }).where(and(eq(quotes.id, id), eq(quotes.userId, userId)));
}

export async function updateQuoteByToken(token: string, data: Partial<InsertQuote>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(quotes).set({ ...data, updatedAt: new Date() }).where(eq(quotes.publicToken, token));
}

export async function getNextQuoteNumber(userId: number, prefix = "QT"): Promise<string> {
  const db = await getDb();
  if (!db) return `${prefix}-001`;
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(quotes).where(eq(quotes.userId, userId));
  const count = Number(result[0]?.count ?? 0) + 1;
  return `${prefix}-${String(count).padStart(3, "0")}`;
}

// ─── Invoices ─────────────────────────────────────────────────────────────────
export async function getInvoicesByUserId(userId: number): Promise<Invoice[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt));
}

export async function getInvoiceById(id: number, userId: number): Promise<Invoice | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices).where(and(eq(invoices.id, id), eq(invoices.userId, userId))).limit(1);
  return result[0];
}

export async function getInvoiceByPublicToken(token: string): Promise<Invoice | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices).where(eq(invoices.publicToken, token)).limit(1);
  return result[0];
}

export async function createInvoice(data: InsertInvoice): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(invoices).values(data);
  return (result[0] as any).insertId;
}

export async function updateInvoice(id: number, userId: number, data: Partial<InsertInvoice>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(invoices).set({ ...data, updatedAt: new Date() }).where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
}

export async function updateInvoiceByToken(token: string, data: Partial<InsertInvoice>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(invoices).set({ ...data, updatedAt: new Date() }).where(eq(invoices.publicToken, token));
}

export async function getNextInvoiceNumber(userId: number, prefix = "INV"): Promise<string> {
  const db = await getDb();
  if (!db) return `${prefix}-001`;
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(invoices).where(eq(invoices.userId, userId));
  const count = Number(result[0]?.count ?? 0) + 1;
  return `${prefix}-${String(count).padStart(3, "0")}`;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalJobs: 0, activeJobs: 0, pendingQuotes: 0, unpaidInvoices: 0, totalRevenue: "0" };
  const [jobCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(jobs).where(eq(jobs.userId, userId));
  const [activeJobCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(jobs).where(and(eq(jobs.userId, userId), eq(jobs.status, "active")));
  const [pendingQuoteCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(quotes).where(and(eq(quotes.userId, userId), eq(quotes.status, "sent")));
  const [unpaidInvoiceCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(invoices).where(and(eq(invoices.userId, userId), eq(invoices.status, "sent")));
  const [revenue] = await db.select({ total: sql<string>`COALESCE(SUM(total), 0)` }).from(invoices).where(and(eq(invoices.userId, userId), eq(invoices.status, "paid")));
  return {
    totalJobs: Number(jobCount?.count ?? 0),
    activeJobs: Number(activeJobCount?.count ?? 0),
    pendingQuotes: Number(pendingQuoteCount?.count ?? 0),
    unpaidInvoices: Number(unpaidInvoiceCount?.count ?? 0),
    totalRevenue: revenue?.total ?? "0",
  };
}

// ─── AI Prompt Logs ───────────────────────────────────────────────────────────
export async function logAiPrompt(data: InsertAiPromptLog): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(aiPromptLogs).values(data);
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export async function getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result[0];
}

export async function upsertSubscription(userId: number, data: Partial<InsertSubscription>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await getSubscriptionByUserId(userId);
  if (existing) {
    await db.update(subscriptions).set({ ...data, updatedAt: new Date() }).where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({ userId, plan: "free", status: "active", ...data });
  }
}
