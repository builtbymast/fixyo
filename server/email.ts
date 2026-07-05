import { ENV } from "./_core/env";

// Email notification templates for FixYo
export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Quote sent notification
export function generateQuoteSentEmail(
  customerName: string,
  businessName: string,
  quoteNumber: string,
  quoteAmount: string,
  portalLink: string
): EmailNotification {
  return {
    to: "", // Will be set by caller
    subject: `Quote #${quoteNumber} from ${businessName}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a3a52;">Quote from ${businessName}</h2>
            <p>Hi ${customerName},</p>
            <p>We've prepared a quote for your project. Please review the details below:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Quote Number:</strong> ${quoteNumber}</p>
              <p><strong>Amount:</strong> $${quoteAmount}</p>
            </div>
            
            <p>
              <a href="${portalLink}" style="background-color: #d4a574; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View & Sign Quote
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

We've prepared a quote for your project. Please review the details below:

Quote Number: ${quoteNumber}
Amount: $${quoteAmount}

View & Sign Quote: ${portalLink}

If you have any questions, please don't hesitate to contact us.

Best regards,
${businessName}
    `,
  };
}

// Invoice sent notification
export function generateInvoiceSentEmail(
  customerName: string,
  businessName: string,
  invoiceNumber: string,
  invoiceAmount: string,
  dueDate: string,
  portalLink: string
): EmailNotification {
  return {
    to: "", // Will be set by caller
    subject: `Invoice #${invoiceNumber} from ${businessName}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a3a52;">Invoice from ${businessName}</h2>
            <p>Hi ${customerName},</p>
            <p>Your invoice is ready. Please find the details below:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Due:</strong> $${invoiceAmount}</p>
              <p><strong>Due Date:</strong> ${dueDate}</p>
            </div>
            
            <p>
              <a href="${portalLink}" style="background-color: #d4a574; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View & Pay Invoice
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

Your invoice is ready. Please find the details below:

Invoice Number: ${invoiceNumber}
Amount Due: $${invoiceAmount}
Due Date: ${dueDate}

View & Pay Invoice: ${portalLink}

If you have any questions, please don't hesitate to contact us.

Best regards,
${businessName}
    `,
  };
}

// Payment received notification
export function generatePaymentReceivedEmail(
  customerName: string,
  businessName: string,
  invoiceNumber: string,
  paidAmount: string,
  paymentDate: string
): EmailNotification {
  return {
    to: "", // Will be set by caller
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
}

// Invoice overdue reminder
export function generateInvoiceOverdueEmail(
  customerName: string,
  businessName: string,
  invoiceNumber: string,
  invoiceAmount: string,
  daysOverdue: number,
  portalLink: string
): EmailNotification {
  return {
    to: "", // Will be set by caller
    subject: `Reminder: Invoice #${invoiceNumber} is Overdue`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d32f2f;">Invoice Overdue Reminder</h2>
            <p>Hi ${customerName},</p>
            <p>This is a friendly reminder that your invoice is now <strong>${daysOverdue} days overdue</strong>.</p>
            
            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Due:</strong> $${invoiceAmount}</p>
              <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
            </div>
            
            <p>Please process payment at your earliest convenience to avoid any disruption to your service.</p>
            
            <p>
              <a href="${portalLink}" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Pay Now
              </a>
            </p>
            
            <p>If you have any questions or need to discuss payment terms, please contact us immediately.</p>
            <p>Best regards,<br>${businessName}</p>
          </div>
        </body>
      </html>
    `,
    text: `
Invoice Overdue Reminder

Hi ${customerName},

This is a friendly reminder that your invoice is now ${daysOverdue} days overdue.

Invoice Number: ${invoiceNumber}
Amount Due: $${invoiceAmount}
Days Overdue: ${daysOverdue}

Please process payment at your earliest convenience to avoid any disruption to your service.

Pay Now: ${portalLink}

If you have any questions or need to discuss payment terms, please contact us immediately.

Best regards,
${businessName}
    `,
  };
}

// Quote signed notification (for business owner)
export function generateQuoteSignedNotificationEmail(
  businessOwnerName: string,
  customerName: string,
  quoteNumber: string,
  quoteAmount: string
): EmailNotification {
  return {
    to: "", // Will be set by caller
    subject: `Quote #${quoteNumber} Signed by ${customerName}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a3a52;">Quote Signed</h2>
            <p>Hi ${businessOwnerName},</p>
            <p><strong>${customerName}</strong> has signed your quote!</p>
            
            <div style="background-color: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <p style="color: #2e7d32;"><strong>✓ Quote Signed</strong></p>
              <p><strong>Quote Number:</strong> ${quoteNumber}</p>
              <p><strong>Customer:</strong> ${customerName}</p>
              <p><strong>Amount:</strong> $${quoteAmount}</p>
            </div>
            
            <p>You can now convert this quote to a job and start work on the project.</p>
            <p>Best regards,<br>FixYo</p>
          </div>
        </body>
      </html>
    `,
    text: `
Quote Signed

Hi ${businessOwnerName},

${customerName} has signed your quote!

✓ Quote Signed
Quote Number: ${quoteNumber}
Customer: ${customerName}
Amount: $${quoteAmount}

You can now convert this quote to a job and start work on the project.

Best regards,
FixYo
    `,
  };
}

// Placeholder for actual email sending (would integrate with SendGrid, AWS SES, etc.)
export async function sendEmail(notification: EmailNotification): Promise<boolean> {
  try {
    // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
    console.log(`[Email] Sending to ${notification.to}`);
    console.log(`[Email] Subject: ${notification.subject}`);
    
    // For now, just log the email
    // In production, this would call an email service API
    return true;
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return false;
  }
}
