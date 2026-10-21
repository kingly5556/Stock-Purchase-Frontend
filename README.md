# Stock & Purchase Order module — frontend

**[Live demo](https://k-erp-hub.vercel.app)** · Part of **[K-ERP](https://github.com/kingly5556/K-ERP)** (overview, architecture, test results)

[![CI](https://github.com/kingly5556/Stock-Purchase-Frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/kingly5556/Stock-Purchase-Frontend/actions/workflows/ci.yml)

![Purchase order list](https://raw.githubusercontent.com/kingly5556/K-ERP/main/docs/images/stock-purchase-orders.png)

React + TypeScript + Vite SPA for inventory and purchase-order management. It is one module of the ERPHUB suite:

| Repo | Role |
|---|---|
| `K-ERPHub` | Login + reverse-proxy gateway (issues the JWT) |
| `Stock-Purchase-Backend` | REST API + serves this SPA's build |
| `Stock-Purchase-Frontend` | this repo |

Keep `Stock-Purchase-Backend` and `Stock-Purchase-Frontend` as sibling folders (e.g. together under `K-ERP/Stock and purchase/`); `K-ERPHub` can live anywhere, it only talks to the backend over HTTP.

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

## How I built this

I designed the architecture, the data model and the business rules, and wrote them down as specs
(`AGENTS.md`) before any code. I used AI coding assistants to generate much of the implementation,
then reviewed it, ran and extended the tests, and fixed what was wrong. I can walk through any part
of the code and explain why it is built that way. More in the [K-ERP overview](https://github.com/kingly5556/K-ERP#how-i-built-this).
