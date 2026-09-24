import type {
  GoodsReceipt,
  LowStockRow,
  Product,
  PurchaseOrder,
  StockMovement,
  Supplier,
} from "../types";

// BASE_URL is "/" in dev (Vite proxies /api to the backend directly) and
// "/erp/stock/" in production (served through ERPHUB's proxy, which is also
// what attaches the caller's Authorization header — this module never
// touches a token itself). See vite.config.ts and AGENTS.md.
const API_BASE = `${import.meta.env.BASE_URL}api`.replace(/\/+/g, "/");

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  products: {
    list: () => request<Product[]>("/products"),
    create: (input: Omit<Product, "id">) =>
      request<Product>("/products", { method: "POST", body: JSON.stringify(input) }),
  },
  suppliers: {
    list: () => request<Supplier[]>("/suppliers"),
    create: (input: Omit<Supplier, "id">) =>
      request<Supplier>("/suppliers", { method: "POST", body: JSON.stringify(input) }),
  },
  inventory: {
    lowStock: () => request<LowStockRow[]>("/inventory/low-stock"),
    balance: (productId: string) =>
      request<{ productId: string; balance: number }>(`/inventory/balance/${productId}`),
  },
  purchaseOrders: {
    list: () => request<PurchaseOrder[]>("/purchase-orders"),
    get: (id: string) => request<PurchaseOrder>(`/purchase-orders/${id}`),
    create: (input: {
      supplierId: string;
      lines: { productId: string; qtyOrdered: number; unitCost: number }[];
    }) => request<PurchaseOrder>("/purchase-orders", { method: "POST", body: JSON.stringify(input) }),
    submit: (id: string) => request<PurchaseOrder>(`/purchase-orders/${id}/submit`, { method: "POST" }),
    approve: (id: string) => request<PurchaseOrder>(`/purchase-orders/${id}/approve`, { method: "POST" }),
    send: (id: string) => request<PurchaseOrder>(`/purchase-orders/${id}/send`, { method: "POST" }),
    cancel: (id: string) => request<PurchaseOrder>(`/purchase-orders/${id}/cancel`, { method: "POST" }),
  },
  goodsReceipts: {
    receive: (input: { poId: string; note?: string; lines: { poLineId: string; qtyReceived: number }[] }) =>
      request<{ receipt: GoodsReceipt; purchaseOrder: PurchaseOrder }>("/goods-receipts", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  },
  reports: {
    stockCard: (productId: string) =>
      request<{ product: Product; movements: StockMovement[] }>(`/reports/stock-card/${productId}`),
  },
};

export { ApiError };
