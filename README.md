# Stock & Purchase Order module — frontend

React + TypeScript + Vite SPA for inventory and purchase-order management. It is one module of the ERPHUB suite:

| Repo | Role |
|---|---|
| `K-ERPHub` | Login + reverse-proxy gateway (issues the JWT) |
| `Stock-Purchase-Backend` | REST API + serves this SPA's build |
| `Stock-Purchase-Frontend` | this repo |

Clone all three as sibling folders (e.g. under `K-ERP/`).

## Local development

```bash
npm install
npm run dev      # http://localhost:5173 — proxies /api to the backend on :4001
```

The dev server reads `JWT_SECRET` from `../Stock-Purchase-Backend/.env` (or `BACKEND_ENV_PATH`) to sign a throwaway dev token, so start the backend first.

## Production build

```bash
npm run build    # outputs dist/ with base /erp/stock/
```

The backend serves `dist/` (default `../Stock-Purchase-Frontend/dist` relative to the backend, override with `FRONTEND_DIST`), reached by users through ERPHUB at `/erp/stock/`.