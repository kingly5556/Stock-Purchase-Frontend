import path from "node:path";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { SignJWT } from "jose";
import { defineConfig } from "vite";

// Production build is served by the backend Express app (see
// Stock-Purchase-Backend/src/app.ts) and reached through ERPHUB's proxy at
// /erp/stock/..., so asset/API URLs baked into the bundle must carry that
// prefix. `import.meta.env.BASE_URL` is what src/lib/api.ts and the router's
// basename read to build every URL — see AGENTS.md for why no auth token
// handling belongs here in the app code (ERPHUB's proxy attaches it on
// every proxied request in production).
//
// For local dev *without* ERPHUB in front of us, nothing attaches that
// header, so every /api call would 401. As a dev-only convenience, this
// config signs a throwaway token with the backend's own JWT_SECRET (from
// Stock-Purchase-Backend/.env) and has the dev proxy attach it — never shipped to the
// production build, never touches app source.
async function devAuthHeader(): Promise<Record<string, string>> {
  const env = dotenv.config({ path: process.env.BACKEND_ENV_PATH ?? path.resolve(import.meta.dirname, "../Stock-Purchase-Backend/.env") }).parsed;
  const secret = env?.JWT_SECRET;
  if (!secret) return {};
  const token = await new SignJWT({
    sub: "dev-user",
    username: "dev",
    roles: ["Admin", "Manager", "Purchasing", "Warehouse Staff"],
    allowedModules: ["stock"],
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(new TextEncoder().encode(secret));
  return { Authorization: `Bearer ${token}` };
}

export default defineConfig(async ({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/erp/stock/" : "/",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4001",
        headers: command === "serve" ? await devAuthHeader() : undefined,
      },
    },
  },
}));
