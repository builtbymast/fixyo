import Stripe from "stripe";
import { ENV } from "./_core/env";
import * as db from "./db";

const stripe = new Stripe(ENV.stripeSecretKey);
// Note: apiVersion is set via environment or Stripe account settings

/**
 * Verify Stripe webhook signature
 * Ensures the webhook event is genuinely from Stripe
 */
export function verifyWebhookSignature(
  body: Buffer | string,
  signature: string
): Stripe.Event | null {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      ENV.stripeWebhookSecret
    );
    return event;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return null;
  }
}

/**
 * Handle payment_intent.succeeded event
 * Updates invoice status to 'paid' when payment succeeds
 */
export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  try {
    // Extract invoice ID from metadata
    const invoiceId = paymentIntent.metadata?.invoiceId;
    if (!invoiceId) {
      console.warn("No invoiceId in payment intent metadata");
      return;
    }

    const numericInvoiceId = parseInt(invoiceId);
    const amountReceived = paymentIntent.amount_received / 100; // Convert from cents to dollars

    // Get the invoice
    const invoice = await db.getInvoice(numericInvoiceId);
    if (!invoice) {
      console.warn(`Invoice ${invoiceId} not found`);
      return;
    }

    // Update invoice status and paid amount
    await db.updateInvoice(numericInvoiceId, {
      status: "paid",
      paidAmount: amountReceived.toString(),
      paidDate: new Date(),
    });

    console.log(
      `Invoice ${invoiceId} marked as paid. Amount: $${amountReceived}`
    );
  } catch (error) {
    console.error("Error handling payment_intent.succeeded:", error);
    throw error;
  }
}

/**
 * Handle payment_intent.payment_failed event
 * Updates invoice status to 'overdue' when payment fails
 */
export async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  try {
    // Extract invoice ID from metadata
    const invoiceId = paymentIntent.metadata?.invoiceId;
    if (!invoiceId) {
      console.warn("No invoiceId in payment intent metadata");
      return;
    }

    const numericInvoiceId = parseInt(invoiceId);

    // Get the invoice
    const invoice = await db.getInvoice(numericInvoiceId);
    if (!invoice) {
      console.warn(`Invoice ${invoiceId} not found`);
      return;
    }

    // Update invoice status to overdue
    await db.updateInvoice(numericInvoiceId, {
      status: "overdue",
    });

    console.log(`Invoice ${invoiceId} payment failed - marked as overdue`);
  } catch (error) {
    console.error("Error handling payment_intent.payment_failed:", error);
    throw error;
  }
}

/**
 * Handle charge.refunded event
 * Updates invoice status when a refund is issued
 */
export async function handleChargeRefunded(
  charge: Stripe.Charge
): Promise<void> {
  try {
    // Extract invoice ID from metadata
    const invoiceId = charge.metadata?.invoiceId;
    if (!invoiceId) {
      console.warn("No invoiceId in charge metadata");
      return;
    }

    const numericInvoiceId = parseInt(invoiceId);
    const refundedAmount = charge.amount_refunded / 100; // Convert from cents to dollars

    // Get the invoice
    const invoice = await db.getInvoice(numericInvoiceId);
    if (!invoice) {
      console.warn(`Invoice ${invoiceId} not found`);
      return;
    }

    // Calculate new paid amount after refund
    const currentPaid = typeof invoice.paidAmount === "string" ? parseFloat(invoice.paidAmount) : invoice.paidAmount || 0;
    const totalAmount = typeof invoice.totalAmount === "string" ? parseFloat(invoice.totalAmount) : invoice.totalAmount;
    const newPaidAmount = Math.max(0, currentPaid - refundedAmount);

    // Determine new status based on paid amount
    let newStatus: "paid" | "partially_paid" | "sent" = "sent";
    if (newPaidAmount >= totalAmount) {
      newStatus = "paid";
    } else if (newPaidAmount > 0) {
      newStatus = "partially_paid";
    }

    // Update invoice
    await db.updateInvoice(numericInvoiceId, {
      status: newStatus,
      paidAmount: newPaidAmount.toString(),
    });

    console.log(
      `Invoice ${invoiceId} refunded. New paid amount: $${newPaidAmount}`
    );
  } catch (error) {
    console.error("Error handling charge.refunded:", error);
    throw error;
  }
}

/**
 * Main webhook event handler
 * Routes different Stripe events to appropriate handlers
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(
        event.data.object as Stripe.PaymentIntent
      );
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(
        event.data.object as Stripe.PaymentIntent
      );
      break;

    case "charge.refunded":
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}
