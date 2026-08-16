import type { Express } from "express";
import { COOKIE_NAME } from "@shared/const";
import { ENV } from "../_core/env";
import { sdk } from "../_core/sdk";

export function registerDevLoginRoute(app: Express) {
  if (ENV.isProduction || ENV.oAuthServerUrl) return;

  app.get("/api/dev-login", async (req, res) => {
    try {
      const token = await sdk.signSession(
        { openId: "dev-user-001", appId: "dev", name: "Dev User" },
        { expiresInMs: 1000 * 60 * 60 * 24 * 7 }
      );
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      res.redirect("/app/dashboard");
    } catch (e) {
      res.status(500).send("Dev login failed: " + String(e));
    }
  });

  console.log("[Dev] Login route enabled at /api/dev-login");
}
