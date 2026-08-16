import { Readable } from "stream";
import type PDFKit from "pdfkit";
import { ENV } from "./_core/env";

// Email attachment interface
export interface EmailAttachment {
  filename: string;
  content: Buffer | Readable;
  contentType?: string;
}

// Extended email notification with attachments
export interface EmailNotificationWithAttachments {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
}

/**
 * Convert PDFKit document to Buffer for email attachment
 * PDFKit documents are streams, so we need to collect the data
 */
export async function pdfDocumentToBuffer(pdfDoc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    pdfDoc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    pdfDoc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    pdfDoc.on("error", (error: Error) => {
      reject(error);
    });
  });
}

/**
 * Send email with PDF attachment using SendGrid
 */
export async function sendEmailWithAttachments(
  notification: EmailNotificationWithAttachments
): Promise<boolean> {
  try {
    // Check if SendGrid API key is configured
    if (!ENV.sendgridApiKey) {
      console.log(`[Email] SendGrid not configured. Logging email instead:`);
      console.log(`[Email] To: ${notification.to}`);
      console.log(`[Email] Subject: ${notification.subject}`);

      if (notification.attachments && notification.attachments.length > 0) {
        console.log(
          `[Email] Attachments: ${notification.attachments.map((a) => a.filename).join(", ")}`
        );
      }

      return true;
    }

    // Use SendGrid to send email
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(ENV.sendgridApiKey);

    const msg = {
      to: notification.to,
      from: ENV.sendgridFromEmail,
      subject: notification.subject,
      html: notification.html,
      text: notification.text,
      attachments: notification.attachments?.map((att) => ({
        filename: att.filename,
        content:
          att.content instanceof Buffer
            ? att.content.toString("base64")
            : Buffer.from(att.content as any).toString("base64"),
        type: att.contentType || "application/octet-stream",
        disposition: "attachment",
      })),
    };

    await sgMail.send(msg);

    console.log(`[Email] Successfully sent to ${notification.to}`);
    return true;
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return false;
  }
}

/**
 * Send quote with PDF attachment
 */
export async function sendQuoteWithPDF(
  customerEmail: string,
  customerName: string,
  businessName: string,
  quoteNumber: string,
  quoteAmount: string,
  portalLink: string,
  pdfBuffer: Buffer
): Promise<boolean> {
  const notification: EmailNotificationWithAttachments = {
    to: customerEmail,
    subject: `Quote #${quoteNumber} from ${businessName}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a3a52;">Quote from ${businessName}</h2>
            <p>Hi ${customerName},</p>
            <p>We've prepared a quote for your project. The PDF is attached for your review.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Quote Number:</strong> ${quoteNumber}</p>
              <p><strong>Amount:</strong> $${quoteAmount}</p>
            </div>
            
            <p>
              <a href="${portalLink}" style="background-color: #d4a574; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View & Sign Quote Online
              </a>
            </p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>${businessName}</p>
          </div>
        </body>
      </html>
    `,
    text: `
Quote from ${businessName}

Hi ${customerName},

We've prepared a quote for your project. The PDF is attached for your review.

Quote Number: ${quoteNumber}
Amount: $${quoteAmount}

View & Sign Quote Online: ${portalLink}

If you have any questions, please don't hesitate to contact us.

Best regards,
${businessName}
    `,
    attachments: [
      {
        filename: `quote-${quoteNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  return sendEmailWithAttachments(notification);
}

/**
 * Send invoice with PDF attachment
 */
export async function sendInvoiceWithPDF(
  customerEmail: string,
  customerName: string,
  businessName: string,
  invoiceNumber: string,
  invoiceAmount: string,
  dueDate: string,
  portalLink: string,
  pdfBuffer: Buffer
): Promise<boolean> {
  const notification: EmailNotificationWithAttachments = {
    to: customerEmail,
    subject: `Invoice #${invoiceNumber} from ${businessName}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a3a52;">Invoice from ${businessName}</h2>
            <p>Hi ${customerName},</p>
            <p>Your invoice is ready. The PDF is attached for your records.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Due:</strong> $${invoiceAmount}</p>
              <p><strong>Due Date:</strong> ${dueDate}</p>
            </div>
            
            <p>
              <a href="${portalLink}" style="background-color: #d4a574; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View & Pay Invoice Online
              </a>
            </p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>${businessName}</p>
          </div>
        </body>
      </html>
    `,
    text: `
Invoice from ${businessName}

Hi ${customerName},

Your invoice is ready. The PDF is attached for your records.

Invoice Number: ${invoiceNumber}
Amount Due: $${invoiceAmount}
Due Date: ${dueDate}

View & Pay Invoice Online: ${portalLink}

If you have any questions, please don't hesitate to contact us.

Best regards,
${businessName}
    `,
    attachments: [
      {
        filename: `invoice-${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  return sendEmailWithAttachments(notification);
}

/**
 * Send payment received notification
 */
export async function sendPaymentReceivedEmail(
  customerEmail: string,
  customerName: string,
  businessName: string,
  invoiceNumber: string,
  paidAmount: string,
  paymentDate: string
): Promise<boolean> {
  const notification: EmailNotificationWithAttachments = {
    to: customerEmail,
    subject: `Payment Received - Invoice #${invoiceNumber}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a3a52;">Payment Received</h2>
            <p>Hi ${customerName},</p>
            <p>Thank you for your payment! We've received your payment confirmation.</p>
            
            <div style="background-color: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <p style="color: #2e7d32;"><strong>✓ Payment Confirmed</strong></p>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Paid:</strong> $${paidAmount}</p>
              <p><strong>Payment Date:</strong> ${paymentDate}</p>
            </div>
            
            <p>Your invoice has been marked as paid. Thank you for your business!</p>
            <p>Best regards,<br>${businessName}</p>
          </div>
        </body>
      </html>
    `,
    text: `
Payment Received

Hi ${customerName},

Thank you for your payment! We've received your payment confirmation.

✓ Payment Confirmed
Invoice Number: ${invoiceNumber}
Amount Paid: $${paidAmount}
Payment Date: ${paymentDate}

Your invoice has been marked as paid. Thank you for your business!

Best regards,
${businessName}
    `,
  };

  return sendEmailWithAttachments(notification);
}
