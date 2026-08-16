# Stripe Statement Descriptor Guide for FixYo

## What is a Statement Descriptor?

The **Statement Descriptor** is the text that appears on your customers' credit card or bank statements when they pay through FixYo. It helps customers recognize the charge and reduces payment disputes and chargebacks.

---

## Statement Descriptor Format

Stripe allows you to set two types of descriptors:

### 1. **Statement Descriptor** (Main Descriptor)
- **Length:** 1-22 characters (including spaces and special characters)
- **What it shows:** The main company/business name on the statement
- **Example:** `FIXYO JOBS` or `FIXYO AUSTRALIA`

### 2. **Statement Descriptor Suffix** (Optional - for dynamic descriptions)
- **Length:** 1-22 characters
- **What it shows:** Additional context after the main descriptor
- **Example:** If main is `FIXYO`, suffix could be `INVOICE` to show `FIXYO INVOICE`

---

## Recommended Statement Descriptors for FixYo

### **Option 1: Simple & Professional**
```
Statement Descriptor: FIXYO JOBS
```
- Clear, recognizable
- Customers immediately know it's from FixYo
- Works for all transaction types

### **Option 2: Business-Specific**
```
Statement Descriptor: FIXYO AU
```
- Indicates Australian business
- Shorter, more concise
- Good if you want to add suffix later

### **Option 3: With Dynamic Suffix**
```
Statement Descriptor: FIXYO
Statement Descriptor Suffix: INVOICE
```
- Main shows: `FIXYO`
- On invoice payments shows: `FIXYO INVOICE`
- Provides context for customers

### **Option 4: Company Name Based**
```
Statement Descriptor: [YOUR BUSINESS NAME]
```
- Example: `ABC PLUMBING CO` (if that's your business name)
- Customers see their service provider's name directly
- Most recognizable for customers

---

## Best Practices

✅ **DO:**
- Use your business name or "FIXYO" for clarity
- Keep it short and memorable
- Use uppercase letters (more visible on statements)
- Avoid special characters except hyphens and spaces
- Make it match your brand

❌ **DON'T:**
- Use generic terms like "PAYMENT" or "CHARGE"
- Include phone numbers or URLs
- Use lowercase (less visible)
- Use special characters like @, #, $, &
- Make it longer than 22 characters

---

## How to Set It in Stripe

1. Go to **Stripe Dashboard** → **Settings** (gear icon)
2. Click **Account Settings** → **Business Settings**
3. Scroll to **Statements** section
4. Fill in:
   - **Statement Descriptor:** `FIXYO JOBS` (recommended)
   - **Statement Descriptor Suffix:** (optional - leave blank or add context)
5. Click **Save**

---

## What Customers Will See

### On Credit Card Statement:
```
FIXYO JOBS
FIXYO JOBS
FIXYO JOBS
```

### On Bank Statement (if paying via bank transfer):
```
FIXYO JOBS - Invoice #INV-001
```

---

## Example Scenarios

### Scenario 1: Single Service Provider
```
Statement Descriptor: FIXYO JOBS
Result: Customers see "FIXYO JOBS" on their statement
```

### Scenario 2: Multiple Service Types
```
Statement Descriptor: FIXYO
Statement Descriptor Suffix: INVOICE (or QUOTE, JOB, etc.)
Result: Shows "FIXYO INVOICE" or "FIXYO QUOTE" depending on transaction type
```

### Scenario 3: Branded Business
```
Statement Descriptor: ABC PLUMBING
Result: Customers see their plumber's name directly
```

---

## Recommended Setting for FixYo

**We recommend using:**

```
Statement Descriptor: FIXYO JOBS
```

**Why?**
- Clear and professional
- Immediately recognizable
- Works for all transaction types (invoices, quotes, payments)
- Easy for customers to identify
- Reduces payment disputes and chargebacks
- Aligns with your brand

---

## Important Notes

- Changes to the statement descriptor can take **24-48 hours** to appear on statements
- The descriptor applies to **all transactions** processed through your Stripe account
- If you process payments for multiple business types, consider using the suffix option
- Customers can contact their bank if they don't recognize the charge, so clarity is important

---

## Testing

After you set your statement descriptor:

1. Process a test payment using card: `4242 4242 4242 4242`
2. Check your Stripe Dashboard → **Payments** to verify the descriptor
3. The descriptor will appear on your own bank statement (if using a real test card)

---

## Questions?

If you need to change the descriptor later:
- Go back to **Stripe Dashboard** → **Settings** → **Business Settings** → **Statements**
- Make your changes
- Click **Save**
- Changes take effect within 24-48 hours
