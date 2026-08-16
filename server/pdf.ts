import PDFDocument from "pdfkit";
import type { Quote, Invoice, Customer, Business } from "../drizzle/schema";

interface QuoteLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

const COLORS = {
  primary: "#1e3a5f", // Deep Navy
  accent: "#d4a574", // Amber-Gold
  text: "#333333",
  lightText: "#666666",
  border: "#e0e0e0",
  background: "#faf8f3", // Warm Cream
};

const FONTS = {
  title: 24,
  heading: 14,
  normal: 11,
  small: 9,
};

function drawHeader(doc: PDFKit.PDFDocument, business: Business) {
  // Company name
  doc.fontSize(FONTS.title).fillColor(COLORS.primary).font("Helvetica-Bold");
  doc.text(business.businessName || "FixYo", 50, 40);

  // Company details
  doc.fontSize(FONTS.small).fillColor(COLORS.lightText).font("Helvetica");
  const details = [];
  if (business.abn) details.push(`ABN: ${business.abn}`);
  if (business.phone) details.push(`Phone: ${business.phone}`);
  if (business.email) details.push(`Email: ${business.email}`);

  let yPos = 70;
  details.forEach((detail) => {
    doc.text(detail, 50);
    yPos += 15;
  });

  // Horizontal line
  doc.moveTo(50, yPos + 5).lineTo(550, yPos + 5).stroke(COLORS.border);
  return yPos + 20;
}

function drawQuoteHeader(
  doc: PDFKit.PDFDocument,
  quote: Quote,
  quoteNumber: string
) {
  doc.fontSize(FONTS.heading).fillColor(COLORS.primary).font("Helvetica-Bold");
  doc.text("QUOTE", 50, 20);

  doc.fontSize(FONTS.normal).fillColor(COLORS.text).font("Helvetica");
  doc.text(`Quote #: ${quoteNumber}`, 400, 20);
  const createdDate = quote.createdAt instanceof Date ? quote.createdAt : new Date(quote.createdAt);
  doc.text(`Date: ${createdDate.toLocaleDateString()}`, 400, 35);

  if (quote.validUntil) {
    const validDate = quote.validUntil instanceof Date ? quote.validUntil : new Date(quote.validUntil);
    doc.text(
      `Valid Until: ${validDate.toLocaleDateString()}`,
      400,
      50
    );
  }
}

function drawCustomerInfo(
  doc: PDFKit.PDFDocument,
  customer: Customer,
  yPos: number
) {
  doc.fontSize(FONTS.heading).fillColor(COLORS.primary).font("Helvetica-Bold");
  doc.text("Bill To:", 50, yPos);

  doc.fontSize(FONTS.normal).fillColor(COLORS.text).font("Helvetica");
  yPos += 20;
  doc.text(`${customer.firstName} ${customer.lastName}`, 50, yPos);
  yPos += 15;

  if (customer.email) {
    doc.text(`Email: ${customer.email}`, 50, yPos);
    yPos += 15;
  }

  if (customer.phone) {
    doc.text(`Phone: ${customer.phone}`, 50, yPos);
    yPos += 15;
  }

  if (customer.address) {
    doc.text(`Address: ${customer.address}`, 50, yPos);
    yPos += 15;
  }

  if (customer.suburb && customer.state && customer.postcode) {
    doc.text(
      `${customer.suburb} ${customer.state} ${customer.postcode}`,
      50,
      yPos
    );
    yPos += 15;
  }

  return yPos + 10;
}

function drawLineItemsTable(
  doc: PDFKit.PDFDocument,
  items: QuoteLineItem[] | InvoiceLineItem[],
  yPos: number
) {
  const tableTop = yPos;
  const col1 = 50;
  const col2 = 350;
  const col3 = 430;
  const col4 = 500;

  // Table header
  doc.fillColor(COLORS.primary).rect(col1 - 10, tableTop, 510, 25).fill();

  doc
    .fontSize(FONTS.small)
    .fillColor("white")
    .font("Helvetica-Bold")
    .text("Description", col1, tableTop + 7)
    .text("Qty", col3, tableTop + 7, { align: "right" })
    .text("Unit Price", col4 - 60, tableTop + 7, { align: "right" })
    .text("Amount", col4, tableTop + 7, { align: "right" });

  // Table rows
  let rowY = tableTop + 30;
  doc.fontSize(FONTS.normal).fillColor(COLORS.text).font("Helvetica");

  items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.fillColor(COLORS.background).rect(col1 - 10, rowY - 5, 510, 20).fill();
    }

    doc.fillColor(COLORS.text);
    doc.text(item.description, col1, rowY, { width: 280 });
    const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity;
    const unitPrice = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice;
    const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
    doc.text(qty.toString(), col3, rowY, { align: "right" });
    doc.text(`$${unitPrice.toFixed(2)}`, col4 - 60, rowY, {
      align: "right",
    });
    doc.text(`$${amount.toFixed(2)}`, col4, rowY, { align: "right" });

    rowY += 20;
  });

  return rowY + 10;
}

function drawTotals(
  doc: PDFKit.PDFDocument,
  subtotal: number,
  tax: number,
  discount: number,
  total: number,
  yPos: number
) {
  const col1 = 350;
  const col2 = 500;

  doc.fontSize(FONTS.normal).fillColor(COLORS.text).font("Helvetica");

  doc.text("Subtotal:", col1, yPos);
  doc.text(`$${subtotal.toFixed(2)}`, col2, yPos, { align: "right" });
  yPos += 20;

  if (discount > 0) {
    doc.fillColor("#d32f2f");
    doc.text("Discount:", col1, yPos);
    doc.text(`-$${discount.toFixed(2)}`, col2, yPos, { align: "right" });
    yPos += 20;
    doc.fillColor(COLORS.text);
  }

  doc.text("Tax (10%):", col1, yPos);
  doc.text(`$${tax.toFixed(2)}`, col2, yPos, { align: "right" });
  yPos += 20;

  // Total box
  doc
    .fillColor(COLORS.primary)
    .rect(col1 - 10, yPos, 160, 30)
    .fill();

  doc
    .fontSize(FONTS.heading)
    .fillColor("white")
    .font("Helvetica-Bold")
    .text("TOTAL:", col1, yPos + 6)
    .text(`$${total.toFixed(2)}`, col2, yPos + 6, { align: "right" });

  return yPos + 40;
}

function drawFooter(doc: PDFKit.PDFDocument, yPos: number) {
  doc.moveTo(50, yPos).lineTo(550, yPos).stroke(COLORS.border);

  doc
    .fontSize(FONTS.small)
    .fillColor(COLORS.lightText)
    .font("Helvetica")
    .text(
      "Thank you for your business! Please contact us if you have any questions.",
      50,
      yPos + 15,
      { align: "center", width: 500 }
    );

  doc.text(
    `Generated on ${new Date().toLocaleDateString()} by FixYo`,
    50,
    yPos + 40,
    { align: "center", width: 500 }
  );
}

export function generateQuotePDF(
  quote: Quote & { lineItems: QuoteLineItem[] },
  customer: Customer,
  business: Business,
  quoteNumber: string
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  let yPos = drawHeader(doc, business);
  drawQuoteHeader(doc, quote, quoteNumber);

  yPos = 150;
  yPos = drawCustomerInfo(doc, customer, yPos);

  // Scope of work section (if needed, can be added to quote model later)
  // yPos += 20;

  yPos = drawLineItemsTable(doc, quote.lineItems, yPos);

  const subtotal = quote.lineItems.reduce((sum, item) => {
    const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
    return sum + amount;
  }, 0);
  const discount = 0; // Discount not in quote model
  const afterDiscount = subtotal - discount;
  const tax = (afterDiscount * 10) / 100;
  const total = afterDiscount + tax;

  yPos = drawTotals(doc, subtotal, tax, discount, total, yPos);

  if (quote.notes) {
    doc
      .fontSize(FONTS.heading)
      .fillColor(COLORS.primary)
      .font("Helvetica-Bold")
      .text("Terms & Conditions:", 50, yPos);

    doc
      .fontSize(FONTS.small)
      .fillColor(COLORS.text)
      .font("Helvetica")
      .text(quote.notes, 50, yPos + 20, { width: 500, align: "left" });

    yPos += 60;
  }

  drawFooter(doc, Math.min(yPos, 700));

  doc.end();
  return doc;
}

export function generateInvoicePDF(
  invoice: Invoice & { lineItems: InvoiceLineItem[] },
  customer: Customer,
  business: Business,
  invoiceNumber: string
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  let yPos = drawHeader(doc, business);

  doc.fontSize(FONTS.heading).fillColor(COLORS.primary).font("Helvetica-Bold");
  doc.text("INVOICE", 50, 20);

  doc.fontSize(FONTS.normal).fillColor(COLORS.text).font("Helvetica");
  doc.text(`Invoice #: ${invoiceNumber}`, 400, 20);
  const invCreatedDate = invoice.createdAt instanceof Date ? invoice.createdAt : new Date(invoice.createdAt);
  doc.text(`Date: ${invCreatedDate.toLocaleDateString()}`, 400, 35);
  if (invoice.dueDate) {
    const dueDate = invoice.dueDate instanceof Date ? invoice.dueDate : new Date(invoice.dueDate);
    doc.text(
      `Due Date: ${dueDate.toLocaleDateString()}`,
      400,
      50
    );
  }

  yPos = 150;
  yPos = drawCustomerInfo(doc, customer, yPos);

  yPos = drawLineItemsTable(doc, invoice.lineItems, yPos);

  const subtotal = invoice.lineItems.reduce((sum, item) => {
    const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
    return sum + amount;
  }, 0);
  const discount = 0; // Invoice model doesn't have discountAmount field
  const afterDiscount = subtotal - discount;
  const tax = (afterDiscount * 10) / 100;
  const total = afterDiscount + tax;

  yPos = drawTotals(doc, subtotal, tax, discount, total, yPos);

  // Payment status
  const statusColor =
    invoice.status === "paid"
      ? "#2e7d32"
      : invoice.status === "overdue"
        ? "#d32f2f"
        : "#f57c00";

  doc
    .fontSize(FONTS.heading)
    .fillColor(statusColor)
    .font("Helvetica-Bold")
    .text(`Status: ${invoice.status.toUpperCase()}`, 50, yPos);

  if (invoice.notes) {
    yPos += 40;
    doc
      .fontSize(FONTS.heading)
      .fillColor(COLORS.primary)
      .font("Helvetica-Bold")
      .text("Notes:", 50, yPos);

    doc
      .fontSize(FONTS.small)
      .fillColor(COLORS.text)
      .font("Helvetica")
      .text(invoice.notes, 50, yPos + 20, { width: 500, align: "left" });

    yPos += 60;
  }

  drawFooter(doc, Math.min(yPos, 700));

  doc.end();
  return doc;
}
