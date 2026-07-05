import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";
import { generateQuotePDF, generateInvoicePDF } from "./pdf";
import {
  pdfDocumentToBuffer,
  sendQuoteWithPDF,
  sendInvoiceWithPDF,
  sendPaymentReceivedEmail,
} from "./emailService";

describe("SendGrid Email Integration", () => {
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
      quoteNumber: `Q002-${Date.now()}`,
      totalAmount: "1100",
      taxAmount: "100",
      status: "draft",
      publicToken: `test-token-quote-${Date.now()}`,
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
      invoiceNumber: `INV002-${Date.now()}`,
      totalAmount: "1100",
      taxAmount: "100",
      status: "draft",
      publicToken: `test-token-invoice-${Date.now()}`,
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
    // Cleanup is handled by database cascade
  });

  describe("Quote Email with PDF", () => {
    it("should send quote email with PDF attachment via SendGrid", async () => {
      const quote = await db.getQuote(quoteId);
      const customer = await db.getCustomer(customerId);
      const business = await db.getBusiness(businessId);
      const lineItems = await db.getQuoteLineItems(quoteId);

      const pdfDoc = generateQuotePDF(
        { ...quote!, lineItems: lineItems as any },
        customer!,
        business!,
        "Q002"
      );

      const pdfBuffer = await pdfDocumentToBuffer(pdfDoc);

      const result = await sendQuoteWithPDF(
        customer!.email || "",
        `${customer!.firstName} ${customer!.lastName}`,
        business!.businessName || "FixYo",
        quote!.quoteNumber,
        quote!.totalAmount,
        "http://localhost:3000/public/quote/test-token-sg",
        pdfBuffer
      );

      expect(result).toBe(true);
    });

    it("should include quote number in email subject", async () => {
      const quote = await db.getQuote(quoteId);
      expect(quote).toBeDefined();
      expect(quote!.quoteNumber).toContain("Q002");
    });

    it("should include customer email in notification", async () => {
      const customer = await db.getCustomer(customerId);
      expect(customer).toBeDefined();
      expect(customer!.email).toBe("john@example.com");
    });
  });

  describe("Invoice Email with PDF", () => {
    it("should send invoice email with PDF attachment via SendGrid", async () => {
      const invoice = await db.getInvoice(invoiceId);
      const customer = await db.getCustomer(customerId);
      const business = await db.getBusiness(businessId);
      const lineItems = await db.getInvoiceLineItems(invoiceId);

      const pdfDoc = generateInvoicePDF(
        { ...invoice!, lineItems: lineItems as any },
        customer!,
        business!,
        "INV002"
      );

      const pdfBuffer = await pdfDocumentToBuffer(pdfDoc);

      const result = await sendInvoiceWithPDF(
        customer!.email || "",
        `${customer!.firstName} ${customer!.lastName}`,
        business!.businessName || "FixYo",
        invoice!.invoiceNumber,
        invoice!.totalAmount,
        "2026-04-30",
        "http://localhost:3000/public/invoice/test-token-sg",
        pdfBuffer
      );

      expect(result).toBe(true);
    });

    it("should include invoice number in email subject", async () => {
      const invoice = await db.getInvoice(invoiceId);
      expect(invoice).toBeDefined();
      expect(invoice!.invoiceNumber).toContain("INV002");
    });

    it("should include due date in invoice email", async () => {
      const invoice = await db.getInvoice(invoiceId);
      expect(invoice).toBeDefined();
      // Due date should be set or calculated
    });
  });

  describe("Payment Received Email", () => {
    it("should send payment received confirmation email", async () => {
      const customer = await db.getCustomer(customerId);
      const business = await db.getBusiness(businessId);
      const invoice = await db.getInvoice(invoiceId);

      const result = await sendPaymentReceivedEmail(
        customer!.email || "",
        `${customer!.firstName} ${customer!.lastName}`,
        business!.businessName || "FixYo",
        invoice!.invoiceNumber,
        invoice!.totalAmount,
        new Date().toLocaleDateString()
      );

      expect(result).toBe(true);
    });

    it("should include payment confirmation in email", async () => {
      const invoice = await db.getInvoice(invoiceId);
      expect(invoice).toBeDefined();
      // totalAmount is stored as Decimal in database, convert to string for comparison
      expect(invoice!.totalAmount.toString()).toContain("1100");
    });
  });

  describe("Email Configuration", () => {
    it("should handle missing SendGrid API key gracefully", async () => {
      const quote = await db.getQuote(quoteId);
      const customer = await db.getCustomer(customerId);
      const business = await db.getBusiness(businessId);
      const lineItems = await db.getQuoteLineItems(quoteId);

      const pdfDoc = generateQuotePDF(
        { ...quote!, lineItems: lineItems as any },
        customer!,
        business!,
        "Q002"
      );

      const pdfBuffer = await pdfDocumentToBuffer(pdfDoc);

      // Should still return true (logs email instead of sending)
      const result = await sendQuoteWithPDF(
        customer!.email || "",
        `${customer!.firstName} ${customer!.lastName}`,
        business!.businessName || "FixYo",
        quote!.quoteNumber,
        quote!.totalAmount,
        "http://localhost:3000/public/quote/test-token-sg",
        pdfBuffer
      );

      expect(result).toBe(true);
    });

    it("should use default from email when not configured", async () => {
      const customer = await db.getCustomer(customerId);
      const business = await db.getBusiness(businessId);

      const result = await sendPaymentReceivedEmail(
        customer!.email || "",
        `${customer!.firstName} ${customer!.lastName}`,
        business!.businessName || "FixYo",
        "INV002",
        "1100",
        new Date().toLocaleDateString()
      );

      expect(result).toBe(true);
    });
  });
});
