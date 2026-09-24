# Stock & Purchase Order — frontend

React + TypeScript + Vite SPA for the Stock & Purchase Order module. The domain rules, data model and auth contract live in the sibling **`Stock-Purchase-Backend/AGENTS.md`** (and `K-ERPHub/AGENTS.md` for the gateway) — read those first.

- **No login UI, no token handling in app code.** Users sign in once at ERPHUB (`/erphub`); ERPHUB's reverse proxy attaches `Authorization: Bearer <jwt>` to every `/erp/stock/...` request. Never add sign-in screens or store tokens here.
- **Production build** uses `base: "/erp/stock/"` and is served by the backend Express app from `dist/` (expected sibling folder `Stock-Purchase-Backend`, see its `src/app.ts`). Run `npm run build` here after frontend changes.
- **Dev server** proxies `/api` to `http://localhost:4001` and signs a throwaway dev JWT using `JWT_SECRET` from `../Stock-Purchase-Backend/.env` (override the path with `BACKEND_ENV_PATH`) — see `vite.config.ts`.
- Money is integer satang (THB × 100) end to end; format only at display time.