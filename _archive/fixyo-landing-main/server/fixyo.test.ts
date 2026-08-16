import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Shared test context helpers ─────────────────────────────────────────────

type AuthUser = NonNullable<TrpcContext["user"]>;

function makeCtx(overrides?: Partial<AuthUser>): TrpcContext {
  const user: AuthUser = {
    id: 1,
    openId: "test-user-1",
    email: "test@fixyo.ai",
    name: "Test Tradie",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

// ─── Auth tests ───────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns the authenticated user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@fixyo.ai");
  });

  it("returns null for unauthenticated requests", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("auth.logout", () => {
  it("returns success and clears the session cookie", async () => {
    const cleared: string[] = [];
    const ctx = makeCtx();
    ctx.res.clearCookie = (name: string) => { cleared.push(name); };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(cleared.length).toBe(1);
  });
});

// ─── Dashboard tests ──────────────────────────────────────────────────────────

describe("dashboard.stats", () => {
  it("returns stats object with expected keys for authenticated user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.dashboard.stats();
    expect(stats).toHaveProperty("totalJobs");
    expect(stats).toHaveProperty("activeJobs");
    expect(stats).toHaveProperty("totalRevenue");
    expect(stats).toHaveProperty("pendingQuotes");
    expect(stats).toHaveProperty("unpaidInvoices");
    expect(typeof stats.totalJobs).toBe("number");
    expect(typeof stats.activeJobs).toBe("number");
    expect(stats.totalRevenue !== undefined).toBe(true);
  });
});

// ─── Business tests ───────────────────────────────────────────────────────────

describe("business.get", () => {
  it("returns null when no business profile exists", async () => {
    const ctx = makeCtx({ id: 9999, openId: "no-biz-user" });
    const caller = appRouter.createCaller(ctx);
    const biz = await caller.business.get();
    // db helper returns undefined when no record found
    expect(biz == null).toBe(true);
  });
});

// ─── Customers tests ──────────────────────────────────────────────────────────

describe("customers.list", () => {
  it("returns an array for authenticated user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.customers.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Jobs tests ───────────────────────────────────────────────────────────────

describe("jobs.list", () => {
  it("returns an array for authenticated user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.jobs.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Quotes tests ─────────────────────────────────────────────────────────────

describe("quotes.list", () => {
  it("returns an array for authenticated user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.quotes.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Invoices tests ───────────────────────────────────────────────────────────

describe("invoices.list", () => {
  it("returns an array for authenticated user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.invoices.list();
    expect(Array.isArray(result)).toBe(true);
  });
});
