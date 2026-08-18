import Stripe from "stripe";
import { ENV } from "./_core/env";

let _stripe: Stripe | null = null;

// Lazily construct the client so a missing STRIPE_SECRET_KEY doesn't crash
// the whole process at import time — it only throws when Stripe is actually used.
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!ENV.stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(ENV.stripeSecretKey);
  }
  return _stripe;
}

export async function createInvoiceCheckoutSession(
  invoiceId: number,
  invoiceNumber: string,
  amount: number,
  customerEmail: string,
  customerName: string,
  origin: string
) {
  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: `Invoice ${invoiceNumber}`,
              description: `Payment for invoice ${invoiceNumber}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: customerEmail,
      client_reference_id: invoiceId.toString(),
      metadata: {
        invoice_id: invoiceId.toString(),
        invoice_number: invoiceNumber,
        customer_email: customerEmail,
        customer_name: customerName,
      },
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/portal/invoice/${invoiceId}`,
      allow_promotion_codes: true,
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    throw error;
  }
}

export async function handlePaymentIntentSucceeded(paymentIntentId: string) {
  try {
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    throw error;
  }
}
