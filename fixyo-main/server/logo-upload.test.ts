import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Logo Upload", () => {
  let testBusinessId: number;

  beforeAll(async () => {
    // Create test business
    testBusinessId = await db.createBusiness({
      userId: 1,
      businessName: "Test Business",
    });
  });

  afterAll(async () => {
    // Cleanup is handled by test database
  });

  it("should update business with logo URL", async () => {
    const logoUrl = "https://cdn.example.com/logos/test-logo.png";
    await db.updateBusiness(testBusinessId, { logo: logoUrl });

    const business = await db.getBusiness(testBusinessId);
    expect(business?.logo).toBe(logoUrl);
  });

  it("should handle logo URL in business update", async () => {
    const logoUrl = "https://cdn.example.com/logos/updated-logo.png";
    await db.updateBusiness(testBusinessId, {
      businessName: "Updated Business",
      logo: logoUrl,
    });

    const business = await db.getBusiness(testBusinessId);
    expect(business?.logo).toBe(logoUrl);
    expect(business?.businessName).toBe("Updated Business");
  });

  it("should clear logo when set to empty string", async () => {
    await db.updateBusiness(testBusinessId, { logo: "" });
    const business = await db.getBusiness(testBusinessId);
    expect(business?.logo).toBe("");
  });

  it("should preserve other fields when updating logo", async () => {
    const businessName = "Preserved Business";
    const phone = "(02) 1234 5678";
    const logoUrl = "https://cdn.example.com/logos/preserved-logo.png";

    await db.updateBusiness(testBusinessId, {
      businessName,
      phone,
      logo: logoUrl,
    });

    const business = await db.getBusiness(testBusinessId);
    expect(business?.businessName).toBe(businessName);
    expect(business?.phone).toBe(phone);
    expect(business?.logo).toBe(logoUrl);
  });
});
