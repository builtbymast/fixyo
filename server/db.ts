import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  InsertBusiness,
  businesses,
  InsertCustomer,
  customers,
  InsertJob,
  jobs,
  InsertJobPhoto,
  jobPhotos,
  InsertQuote,
  quotes,
  InsertQuoteLineItem,
  quoteLineItems,
  InsertInvoice,
  invoices,
  InsertInvoiceLineItem,
  invoiceLineItems,
  InsertAiPromptLog,
  aiPromptLogs,
  InsertSubscription,
  subscriptions,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ============ BUSINESS QUERIES ============

export async function getBusiness(businessId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBusinessByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBusiness(data: InsertBusiness) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(businesses).values(data);
  const result = await db.select().from(businesses).orderBy(desc(businesses.id)).limit(1);
  return result[0]?.id || 0;
}

export async function updateBusiness(businessId: number, data: Partial<InsertBusiness>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(businesses).set(data).where(eq(businesses.id, businessId));
}

// ============ CUSTOMER QUERIES ============

export async function getCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCustomersByBusiness(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(customers)
    .where(eq(customers.businessId, businessId))
    .orderBy(desc(customers.createdAt));
}

export async function createCustomer(data: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(customers).values(data);
  const result = await db.select().from(customers).orderBy(desc(customers.id)).limit(1);
  return result[0]?.id || 0;
}

export async function updateCustomer(customerId: number, data: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set(data).where(eq(customers.id, customerId));
}

export async function deleteCustomer(customerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(customers).where(eq(customers.id, customerId));
}

// ============ JOB QUERIES ============

export async function getJob(jobId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getJobsByBusiness(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(jobs)
    .where(eq(jobs.businessId, businessId))
    .orderBy(desc(jobs.createdAt));
}

export async function getJobsByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(jobs)
    .where(eq(jobs.customerId, customerId))
    .orderBy(desc(jobs.createdAt));
}

export async function createJob(data: InsertJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(jobs).values(data);
  const result = await db.select().from(jobs).orderBy(desc(jobs.id)).limit(1);
  return result[0]?.id || 0;
}

export async function updateJob(jobId: number, data: Partial<InsertJob>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(jobs).set(data).where(eq(jobs.id, jobId));
}

export async function deleteJob(jobId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(jobs).where(eq(jobs.id, jobId));
}

// ============ JOB PHOTO QUERIES ============

export async function getJobPhotos(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(jobPhotos)
    .where(eq(jobPhotos.jobId, jobId))
    .orderBy(desc(jobPhotos.createdAt));
}

export async function addJobPhoto(data: InsertJobPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(jobPhotos).values(data);
  const result = await db.select().from(jobPhotos).orderBy(desc(jobPhotos.id)).limit(1);
  return result[0]?.id || 0;
}

export async function deleteJobPhoto(photoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(jobPhotos).where(eq(jobPhotos.id, photoId));
}

// ============ QUOTE QUERIES ============

export async function getQuote(quoteId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, quoteId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getQuoteByPublicToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(quotes)
    .where(eq(quotes.publicToken, token))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getQuotesByBusiness(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(quotes)
    .where(eq(quotes.businessId, businessId))
    .orderBy(desc(quotes.createdAt));
}

export async function getQuotesByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(quotes)
    .where(eq(quotes.customerId, customerId))
    .orderBy(desc(quotes.createdAt));
}

export async function createQuote(data: InsertQuote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(quotes).values(data);
  const result = await db.select().from(quotes).orderBy(desc(quotes.id)).limit(1);
  return result[0]?.id || 0;
}

export async function updateQuote(quoteId: number, data: Partial<InsertQuote>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(quotes).set(data).where(eq(quotes.id, quoteId));
}

export async function deleteQuote(quoteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(quotes).where(eq(quotes.id, quoteId));
}

// ============ QUOTE LINE ITEM QUERIES ============

export async function getQuoteLineItems(quoteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(quoteLineItems)
    .where(eq(quoteLineItems.quoteId, quoteId))
    .orderBy(desc(quoteLineItems.createdAt));
}

export async function addQuoteLineItem(data: InsertQuoteLineItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(quoteLineItems).values(data);
  const result = await db.select().from(quoteLineItems).orderBy(desc(quoteLineItems.id)).limit(1);
  return result[0]?.id || 0;
}

export async function updateQuoteLineItem(itemId: number, data: Partial<InsertQuoteLineItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(quoteLineItems).set(data).where(eq(quoteLineItems.id, itemId));
}

export async function deleteQuoteLineItem(itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(quoteLineItems).where(eq(quoteLineItems.id, itemId));
}

// ============ INVOICE QUERIES ============

export async function getInvoice(invoiceId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getInvoiceByPublicToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(invoices)
    .where(eq(invoices.publicToken, token))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getInvoicesByBusiness(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(invoices)
    .where(eq(invoices.businessId, businessId))
    .orderBy(desc(invoices.createdAt));
}

export async function getInvoicesByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(invoices)
    .where(eq(invoices.customerId, customerId))
    .orderBy(desc(invoices.createdAt));
}

export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(invoices).values(data);
  const result = await db.select().from(invoices).orderBy(desc(invoices.id)).limit(1);
  return result[0]?.id || 0;
}

export async function updateInvoice(invoiceId: number, data: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(invoices).set(data).where(eq(invoices.id, invoiceId));
}

export async function deleteInvoice(invoiceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(invoices).where(eq(invoices.id, invoiceId));
}

// ============ INVOICE LINE ITEM QUERIES ============

export async function getInvoiceLineItems(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(invoiceLineItems)
    .where(eq(invoiceLineItems.invoiceId, invoiceId))
    .orderBy(desc(invoiceLineItems.createdAt));
}

export async function addInvoiceLineItem(data: InsertInvoiceLineItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(invoiceLineItems).values(data);
  const result = await db.select().from(invoiceLineItems).orderBy(desc(invoiceLineItems.id)).limit(1);
  return result[0]?.id || 0;
}

export async function updateInvoiceLineItem(itemId: number, data: Partial<InsertInvoiceLineItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(invoiceLineItems).set(data).where(eq(invoiceLineItems.id, itemId));
}

export async function deleteInvoiceLineItem(itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(invoiceLineItems).where(eq(invoiceLineItems.id, itemId));
}

// ============ AI PROMPT LOG QUERIES ============

export async function logAiPrompt(data: InsertAiPromptLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(aiPromptLogs).values(data);
  const result = await db.select().from(aiPromptLogs).orderBy(desc(aiPromptLogs.id)).limit(1);
  return result[0]?.id || 0;
}

export async function getAiPromptLogs(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(aiPromptLogs)
    .where(eq(aiPromptLogs.businessId, businessId))
    .orderBy(desc(aiPromptLogs.createdAt));
}

// ============ SUBSCRIPTION QUERIES ============

export async function getSubscription(businessId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.businessId, businessId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(subscriptions).values(data);
  const result = await db.select().from(subscriptions).orderBy(desc(subscriptions.id)).limit(1);
  return result[0]?.id || 0;
}

export async function updateSubscription(subscriptionId: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subscriptions).set(data).where(eq(subscriptions.id, subscriptionId));
}
