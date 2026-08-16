# 🔗 Complete Stripe Setup Checklist with Direct Links

Here are all the direct links and steps you need to complete Stripe setup for FixYo:

---

## **1. GENERATE API KEYS (Test Mode)**

**Link:** [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)

**Steps:**

1. Go to the link above

1. You'll see your **Publishable Key** and **Secret Key** (test mode )

1. Copy both keys and save them safely

1. These are already configured in FixYo as:

- `VITE_STRIPE_PUBLISHABcan u give me a spot to put the keys`

- `LE_KEY` (frontend)

- `STRIPE_SECRET_KEY` (backend)

**Test Keys Format:**

- Publishable: `pk_test_...`

- Secret: `sk_test_...`

---

## **2. COMPLETE KYC VERIFICATION (Identity Verification)**

**Link:** [https://dashboard.stripe.com/account](https://dashboard.stripe.com/account)

**Steps:**

1. Go to the link above

1. Click **"Verify your identity"** or **"Complete verification"**

1. Fill in your business information:

- Business name

- ABN (Australian Business Number )

- Business address

- Director/Owner information

- Phone number

- Email address

1. Upload required documents (usually ID + business registration)

1. Submit for verification (takes 24-48 hours typically)

**Why needed:** To move from sandbox (test) to live mode and process real payments

---

## **3. ADD BANKING INFORMATION (Payouts)**

**Link:** [https://dashboard.stripe.com/settings/payouts](https://dashboard.stripe.com/settings/payouts)

**Steps:**

1. Go to the link above

1. Click **"Add a bank account"**

1. Enter your Australian bank details:

- Account holder name

- BSB (Bank-State-Branch code )

- Account number

- Account type (Savings/Cheque)

1. Verify the account (Stripe will make 2 small deposits, you confirm amounts)

1. Set payout schedule (daily, weekly, or monthly)

**Important:** This is where your customer payments will be deposited

---

## **4. SET UP WEBHOOK ENDPOINT (Payment Confirmations)**

**Link:** [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)

**Steps:**

1. Go to the link above

1. Click **"Add an endpoint"**

1. Enter the webhook URL:

   ```
   https://fixyojobs-fkv5qazz.manus.space/api/stripe/webhook
   ```

1. Select events to listen for:

- ✅ `checkout.session.completed`

- ✅ `payment_intent.succeeded`

- ✅ `payment_intent.payment_failed`

- ✅ `invoice.paid`

- ✅ `charge.refunded`

1. Click **"Add endpoint"**

1. Copy the **Signing Secret** (starts with `whsec_` )

1. This is already configured as `STRIPE_WEBHOOK_SECRET`

**Why needed:** To automatically update invoice status when payments are received

---

## **5. CONFIGURE STATEMENT DESCRIPTOR**

**Link:** [https://dashboard.stripe.com/settings/account](https://dashboard.stripe.com/settings/account)

**Steps:**

1. Go to the link above

1. Scroll to **"Statements"** section

1. Enter Statement Descriptor:

   ```
   FIXYO JOBS
   ```

1. Click **"Save"**

**What customers will see on their bank statement:** `FIXYO JOBS`

---

## **6. ENABLE PAYMENT METHODS**

**Link:** [https://dashboard.stripe.com/settings/payment_methods](https://dashboard.stripe.com/settings/payment_methods)

**Steps:**

1. Go to the link above

1. Make sure these are enabled:

- ✅ Card payments (Visa, Mastercard, Amex )

- ✅ Australian payment methods (if available)

1. Configure card settings if needed

1. Save changes

---

## **7. SET UP EMAIL RECEIPTS (Optional but Recommended)**

**Link:** [https://dashboard.stripe.com/settings/emails](https://dashboard.stripe.com/settings/emails)

**Steps:**

1. Go to the link above

1. Enable **"Send email receipts to customers"**

1. Customize email templates if desired

1. Save changes

---

## **8. GENERATE LIVE API KEYS (After KYC Approved )**

**Link:** [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)

**Steps:**

1. Complete KYC verification first (step 2 above )

1. Once approved, go to the link above

1. Toggle from **"Test mode"** to **"Live mode"** (top left)

1. You'll see your **Live Publishable Key** and **Live Secret Key**

1. Copy both keys

1. Update in FixYo Settings → Payment with live keys

**Live Keys Format:**

- Publishable:`pk_live_51S0LEMEzJPsl3L76M0k15FoRknPcrrfbyhF70mO3qCVJpV8MQmEzJLEPieZvkTA1oKEqgMr4xqnEzccgCaF8JPzu00iIXjrtoJ_...`

- Secret:`mk_1TG706EzJPsl3L76yCHiLc2p_...`

---

## **QUICK REFERENCE TABLE**

| Task | Link | Status |
| --- | --- | --- |
| Generate Test API Keys | [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys) | ⏳ DO THIS FIRST |
| Complete KYC Verification | [https://dashboard.stripe.com/account](https://dashboard.stripe.com/account) | ⏳ DO THIS SECOND |
| Add Bank Account | [https://dashboard.stripe.com/settings/payouts](https://dashboard.stripe.com/settings/payouts) | ⏳ DO THIS THIRD |
| Set Up Webhooks | [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks) | ⏳ DO THIS FOURTH |
| Statement Descriptor | [https://dashboard.stripe.com/settings/account](https://dashboard.stripe.com/settings/account) | ⏳ DO THIS FIFTH |
| Payment Methods | [https://dashboard.stripe.com/settings/payment_methods](https://dashboard.stripe.com/settings/payment_methods) | ⏳ DO THIS SIXTH |
| Email Receipts | [https://dashboard.stripe.com/settings/emails](https://dashboard.stripe.com/settings/emails) | Optional |
| Generate Live Keys | [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) | ⏳ AFTER KYC APPROVED |

---

## **TESTING WORKFLOW**

### **Step 1: Test with Sandbox Keys**

1. Use test API keys (pk_test_... and sk_test_... )

1. Test payment card: `4242 4242 4242 4242`

1. Any future expiry date (e.g., 12/25)

1. Any 3-digit CVC (e.g., 123)

1. Process test payments through FixYo

### **Step 2: Complete KYC Verification**

1. Submit identity verification

1. Wait 24-48 hours for approval

1. Receive confirmation email

### **Step 3: Switch to Live Keys**

1. Go to Stripe Dashboard → Settings → API Keys

1. Toggle to **Live mode**

1. Copy live keys (pk_live_... and sk_live_...)

1. Update FixYo with live keys via Settings → Payment

1. Process real payments

---

## **IMPORTANT REMINDERS**

⚠️ **Never share your Secret Keys** (sk_test_... or sk_live_...)

- Keep them private and secure

- Rotate them if accidentally exposed

- Only use in backend code, never in frontend

✅ **Publishable Keys are safe to share**

- Used on frontend for payment forms

- Can be included in client-side code

✅ **Test thoroughly before going live**

- Use test cards to verify payment flow

- Check webhook delivery

- Verify email receipts

- Test refunds and error scenarios

---

## **NEED HELP?**

If you get stuck on any step:

1. Check Stripe Help Center: [https://support.stripe.com](https://support.stripe.com)

1. Review Stripe Documentation: [https://stripe.com/docs](https://stripe.com/docs)

1. Contact Stripe Support via Dashboard: [https://dashboard.stripe.com/support](https://dashboard.stripe.com/support)

---

## **NEXT STEPS FOR FIXYO**

Once you have your API keys:

1. ✅ Test keys are already in FixYo (from webdev_add_feature )

1. ⏳ Complete KYC verification (24-48 hours)

1. ⏳ Add bank account for payouts

1. ⏳ Set up webhook endpoint

1. ⏳ Test payment flow with test card

1. ⏳ Get live keys after KYC approval

1. ⏳ Update FixYo with live keys

1. ⏳ Launch to production

---

**You're all set! Start with the first link and work through the checklist. Each step takes 5-10 minutes.**

