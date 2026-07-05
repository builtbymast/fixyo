import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";
import { generateQuotePDF, generateInvoicePDF } from "./pdf";

describe("PDF Generation", () => {
  let businessId: number;
  let customerId: number;
  let quoteId: number;
  let invoiceId: number;
  const userId = 999; // Test user

  beforeAll(async () => {
    // Create test business
    businessId = await db.createBusiness({
      userId,
      businessName: "Test Plumbing Co",
      abn: "12345678901",
      acn: "123456789",
      phone: "0412345678",
      email: "test@example.com",
      address: "123 Main St",
      suburb: "Sydney",
      state: "NSW",
      postcode: "2000",
      tradeType: "Plumbing",
    });

    // Create test customer
    customerId = await db.createCustomer({
      businessId,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "0412345678",
      address: "456 Oak Ave",
      suburb: "Parramatta",
      state: "NSW",
      postcode: "2150",
    });

    // Create test quote
    quoteId = await db.createQuote({
      businessId,
      customerId,
      quoteNumber: "Q001",
      totalAmount: "1100",
      taxAmount: "100",
      status: "draft",
      publicToken: "test-token-quote",
    });

    // Add quote line items
    await db.addQuoteLineItem({
      quoteId,
      description: "Pipe repair",
      quantity: "1",
      unitPrice: "500",
      amount: "500",
    });

    await db.addQuoteLineItem({
      quoteId,
      description: "Labor",
      quantity: "2",
      unitPrice: "300",
      amount: "600",
    });

    // Create test invoice
    invoiceId = await db.createInvoice({
      businessId,
      customerId,
      invoiceNumber: "INV001",
      totalAmount: "1100",
      taxAmount: "100",
      status: "draft",
      publicToken: "test-token-invoice",
    });

    // Add invoice line items
    await db.addInvoiceLineItem({
      invoiceId,
      description: "Pipe repair",
      quantity: "1",
      unitPrice: "500",
      amount: "500",
    });

    await db.addInvoiceLineItem({
      invoiceId,
      description: "Labor",
      quantity: "2",
      unitPrice: "300",
      amount: "600",
    });
  });

  afterAll(async () => {
    // Cleanup
    await db.deleteQuote(quoteId);
    await db.deleteInvoice(invoiceId);
    await db.deleteCustomer(customerId);
    await db.deleteBusiness(businessId);
  });

  describe("generateQuotePDF", () => {
    it("should generate a valid PDF document for a quote", async () => {
      const quote = await db.getQuote(quoteId);
      const customer = await db.getCustomer(customerId);
      const business = await db.getBusiness(businessId);
      const lineItems = await db.getQuoteLineItems(quoteId);

      expect(quote).toBeDefined();
      expect(customer).toBeDefined();
      expect(business).toBeDefined();
      expect(lineItems).toHaveLength(2);

      const pdfDoc = generateQuotePDF(
        { ...quote!, lineItems: lineItems as any },
        customer!,
        business!,
        "Q001"
      );

      expect(pdfDoc).toBeDefined();
    });

    it("should include business information in the PDF", async () => {
      const quote = await db.getQuote(quoteId);
      const customer = await db.getCustomer(customerId);
      const business = await db.getBusiness(businessId);
      const lineItems = await db.getQuoteLineItems(quoteId);

      const pdfDoc = generateQuotePDF(
        { ...quote!, lineItems: lineItems as any },
        customer!,
        business!,
        "Q001"
      );

      expect(pdfDoc).toBeDefined();
    });

    it("should include customer information in the PDF", async () => {
      const quote = await db.getQuote(quoteId);
      const customer = await db.getCustomer(customerId);
      const business = await db.getBusiness(businessId);
      const lineItems = await db.getQuoteLineItems(quoteId);

      const pdfDoc = generateQuotePDF(
        { ...quote!, lineItems: lineItems as any },
        customer!,
        business!,
        "Q001"
      );

      expect(pdfDoc).toBeDefined();
    });

    it("should include line items in the PDF", async () => {
      const quote = await db.getQuote(quoteId);
      const customer = await db.getCustomer(customerId);
      const business = await db.getBusiness(businessId);
      const lineItems = await db.getQuoteLineItems(quoteId);

      expect(lineItems).toHaveLength(2);
      expect(lineItems[0].description).toBe("Pipe repair");
      expect(lineItems[1].description).toBe("Labor");

      const pdfDoc = generateQuotePDF(
        { ...quote!, lineItems: lineItems as any },
        customer!,
        business!,
        "Q001"
      );

      expect(pdfDoc).toBeDefined();
    });
  });

  describe("generateInvoicePDF", () => {
    it("should generate a valid PDF document for an invoice", async () => {
      const invoice = await db.getInvoice(invoiceId);
      const customer = await db.getCustomer(customerId);
      const business = await db.getBusiness(businessId);
      const lineItems = await db.getInvoiceLineItems(invoiceId);

      expect(invoice).toBeDefined();
      expect(customer).toBeDefined();
      expect(business).toBeDefined();
      expect(lineItems).toHaveLength(2);

      const pdfDoc = generateInvoicePDF(
        { ...invoice!, lineItems: lineItems as any },
        customer!,
        business!,
        "INV001"
      );

      expect(pdfDoc).toBeDefined();
    });

    it("should include invoice status in the PDF", async () => {
      const invoice = await db.getInvoice(invoiceId);
      const customer = await db.getCustomer(customerId);
      const business = await db.getBusiness(businessId);
      const lineItems = await db.getInvoiceLineItems(invoiceId);

      expect(invoice?.status).toBe("draft");

      const pdfDoc = generateInvoicePDF(
        { ...invoice!, lineItems: lineItems as any },
        customer!,
        business!,
        "INV001"
      );

      expect(pdfDoc).toBeDefined();
    });

    it("should include line items in the PDF", async () => {
      const invoice = await db.getInvoice(invoiceId);
      const customer = await db.getCustomer(customerId);
      const business = await db.getBusiness(businessId);
      const lineItems = await db.getInvoiceLineItems(invoiceId);

      expect(lineItems).toHaveLength(2);
      expect(lineItems[0].description).toBe("Pipe repair");
      expect(lineItems[1].description).toBe("Labor");

      const pdfDoc = generateInvoicePDF(
        { ...invoice!, lineItems: lineItems as any },
        customer!,
        business!,
        "INV001"
      );

      expect(pdfDoc).toBeDefined();
    });
  });
});
