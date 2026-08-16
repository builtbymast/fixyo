import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Business Router", () => {
  let testBusinessId: number;

  it("should create a business", async () => {
    const id = await db.createBusiness({
      userId: 1,
      businessName: "Test Plumbing Co",
      abn: "12345678901",
      tradeType: "Plumbing",
    });
    testBusinessId = id;
    expect(id).toBeGreaterThan(0);
  });

  it("should get a business by ID", async () => {
    const business = await db.getBusiness(testBusinessId);
    expect(business).toBeDefined();
    expect(business?.businessName).toBe("Test Plumbing Co");
  });

  it("should update a business", async () => {
    await db.updateBusiness(testBusinessId, { businessName: "Updated Plumbing Co" });
    const business = await db.getBusiness(testBusinessId);
    expect(business?.businessName).toBe("Updated Plumbing Co");
  });
});

describe("Customer Router", () => {
  let testCustomerId: number;
  const testBusinessId = 1;

  it("should create a customer", async () => {
    const id = await db.createCustomer({
      businessId: testBusinessId,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "0412345678",
    });
    testCustomerId = id;
    expect(id).toBeGreaterThan(0);
  });

  it("should get a customer by ID", async () => {
    const customer = await db.getCustomer(testCustomerId);
    expect(customer).toBeDefined();
    expect(customer?.firstName).toBe("John");
  });

  it("should list customers for a business", async () => {
    const customers = await db.getCustomersByBusiness(testBusinessId);
    expect(Array.isArray(customers)).toBe(true);
  });

  it("should delete a customer", async () => {
    await db.deleteCustomer(testCustomerId);
    const customer = await db.getCustomer(testCustomerId);
    expect(customer).toBeUndefined();
  });
});

describe("Job Router", () => {
  let testJobId: number;
  const testBusinessId = 1;
  const testCustomerId = 1;

  it("should create a job", async () => {
    const id = await db.createJob({
      businessId: testBusinessId,
      customerId: testCustomerId,
      title: "Pipe Repair",
      description: "Fix broken pipe in kitchen",
      status: "scheduled",
    });
    testJobId = id;
    expect(id).toBeGreaterThan(0);
  });

  it("should get a job by ID", async () => {
    const job = await db.getJob(testJobId);
    expect(job).toBeDefined();
    expect(job?.title).toBe("Pipe Repair");
  });

  it("should update job status", async () => {
    await db.updateJob(testJobId, { status: "in_progress" });
    const job = await db.getJob(testJobId);
    expect(job?.status).toBe("in_progress");
  });

  it("should list jobs for a business", async () => {
    const jobs = await db.getJobsByBusiness(testBusinessId);
    expect(Array.isArray(jobs)).toBe(true);
  });
});

describe("Quote Router", () => {
  let testQuoteId: number;
  const testBusinessId = 1;
  const testCustomerId = 1;

  it("should create a quote", async () => {
    const id = await db.createQuote({
      businessId: testBusinessId,
      customerId: testCustomerId,
      quoteNumber: "Q-001",
      totalAmount: "1500.00",
      taxAmount: "150.00",
      status: "draft",
      publicToken: "test-token-123",
    });
    testQuoteId = id;
    expect(id).toBeGreaterThan(0);
  });

  it("should get a quote by ID", async () => {
    const quote = await db.getQuote(testQuoteId);
    expect(quote).toBeDefined();
    expect(quote?.quoteNumber).toBe("Q-001");
  });

  it("should update quote status", async () => {
    await db.updateQuote(testQuoteId, { status: "sent" });
    const quote = await db.getQuote(testQuoteId);
    expect(quote?.status).toBe("sent");
  });

  it("should get quote by public token", async () => {
    const quote = await db.getQuoteByPublicToken("test-token-123");
    expect(quote).toBeDefined();
    expect(quote?.quoteNumber).toBe("Q-001");
  });
});

describe("Invoice Router", () => {
  let testInvoiceId: number;
  const testBusinessId = 1;
  const testCustomerId = 1;

  it("should create an invoice", async () => {
    const id = await db.createInvoice({
      businessId: testBusinessId,
      customerId: testCustomerId,
      invoiceNumber: "INV-001",
      totalAmount: "1500.00",
      taxAmount: "150.00",
      status: "draft",
      publicToken: "invoice-token-123",
    });
    testInvoiceId = id;
    expect(id).toBeGreaterThan(0);
  });

  it("should get an invoice by ID", async () => {
    const invoice = await db.getInvoice(testInvoiceId);
    expect(invoice).toBeDefined();
    expect(invoice?.invoiceNumber).toBe("INV-001");
  });

  it("should update invoice status", async () => {
    await db.updateInvoice(testInvoiceId, { status: "sent" });
    const invoice = await db.getInvoice(testInvoiceId);
    expect(invoice?.status).toBe("sent");
  });

  it("should get invoice by public token", async () => {
    const invoice = await db.getInvoiceByPublicToken("invoice-token-123");
    expect(invoice).toBeDefined();
    expect(invoice?.invoiceNumber).toBe("INV-001");
  });
});
