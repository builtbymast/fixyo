import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";
import { generateQuotePDF, generateInvoicePDF } from "./pdf";
import { pdfDocumentToBuffer, sendQuoteWithPDF, sendInvoiceWithPDF } from "./emailService";

describe("Email Service with PDF Attachments", () => {
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
  });

  afterAll(async () => {
    // Cleanup is handled by database cascade on business deletion
    // Tests create isolated data that can be cleaned up manually if needed
  });

  describe("pdfDocumentToBuffer", () => {
    it("should convert PDF document to buffer", async () => {
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

      const buffer = await pdfDocumentToBuffer(pdfDoc);

      expect(buffer).toBeDefined();
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should create buffer with PDF header", async () => {
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

      const buffer = await pdfDocumentToBuffer(pdfDoc);

      // PDF files start with %PDF
      expect(buffer.toString("utf8", 0, 4)).toBe("%PDF");
    });
  });

  describe("sendQuoteWithPDF", () => {
    it("should send quote email with PDF attachment", async () => {
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

      const pdfBuffer = await pdfDocumentToBuffer(pdfDoc);

      const result = await sendQuoteWithPDF(
        customer!.email || "",
        `${customer!.firstName} ${customer!.lastName}`,
        business!.businessName || "FixYo",
        quote!.quoteNumber,
        quote!.totalAmount,
        "http://localhost:3000/public/quote/test-token",
        pdfBuffer
      );

      expect(result).toBe(true);
    });

    it("should include PDF in quote email attachment", async () => {
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

      const pdfBuffer = await pdfDocumentToBuffer(pdfDoc);

      expect(pdfBuffer).toBeDefined();
      expect(pdfBuffer.length).toBeGreaterThan(0);

      const result = await sendQuoteWithPDF(
        customer!.email || "",
        `${customer!.firstName} ${customer!.lastName}`,
        business!.businessName || "FixYo",
        quote!.quoteNumber,
        quote!.totalAmount,
        "http://localhost:3000/public/quote/test-token",
        pdfBuffer
      );

      expect(result).toBe(true);
    });
  });

  describe("sendInvoiceWithPDF", () => {
    it("should send invoice email with PDF attachment", async () => {
      const invoice = await db.getInvoice(invoiceId);
      const customer = await db.getCustomer(customerId);
      const business = await db.getBusiness(businessId);
      const lineItems = await db.getInvoiceLineItems(invoiceId);

      const pdfDoc = generateInvoicePDF(
        { ...invoice!, lineItems: lineItems as any },
        customer!,
        business!,
        "INV001"
      );

      const pdfBuffer = await pdfDocumentToBuffer(pdfDoc);

      const result = await sendInvoiceWithPDF(
        customer!.email || "",
        `${customer!.firstName} ${customer!.lastName}`,
        business!.businessName || "FixYo",
        invoice!.invoiceNumber,
        invoice!.totalAmount,
        "2026-04-30",
        "http://localhost:3000/public/invoice/test-token",
        pdfBuffer
      );

      expect(result).toBe(true);
    });

    it("should include PDF in invoice email attachment", async () => {
      const invoice = await db.getInvoice(invoiceId);
      const customer = await db.getCustomer(customerId);
      const business = await db.getBusiness(businessId);
      const lineItems = await db.getInvoiceLineItems(invoiceId);

      const pdfDoc = generateInvoicePDF(
        { ...invoice!, lineItems: lineItems as any },
        customer!,
        business!,
        "INV001"
      );

      const pdfBuffer = await pdfDocumentToBuffer(pdfDoc);

      expect(pdfBuffer).toBeDefined();
      expect(pdfBuffer.length).toBeGreaterThan(0);

      const result = await sendInvoiceWithPDF(
        customer!.email || "",
        `${customer!.firstName} ${customer!.lastName}`,
        business!.businessName || "FixYo",
        invoice!.invoiceNumber,
        invoice!.totalAmount,
        "2026-04-30",
        "http://localhost:3000/public/invoice/test-token",
        pdfBuffer
      );

      expect(result).toBe(true);
    });
  });
});
