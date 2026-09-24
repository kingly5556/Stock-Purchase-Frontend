export type Product = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  cost: number; // satang
  reorderPoint: number;
  reorderQty: number;
};

export type Supplier = {
  id: string;
  name: string;
  contactInfo?: string | null;
  leadTimeDays?: number | null;
};

export type PurchaseOrderStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "SENT"
  | "PARTIALLY_RECEIVED"
  | "COMPLETED"
  | "CANCELLED";

export type PurchaseOrderLine = {
  id: string;
  productId: string;
  qtyOrdered: number;
  qtyReceived: number;
  unitCost: number; // satang
  product?: Product;
};

export type GoodsReceiptLine = {
  id: string;
  poLineId: string;
  qtyReceived: number;
};

export type GoodsReceipt = {
  id: string;
  poId: string;
  receivedBy: string;
  receivedAt: string;
  note?: string | null;
  lines: GoodsReceiptLine[];
};

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier?: Supplier;
  status: PurchaseOrderStatus;
  totalAmount: number; // satang
  createdBy: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  lines: PurchaseOrderLine[];
  goodsReceipts?: GoodsReceipt[];
};

export type StockMovement = {
  id: string;
  productId: string;
  type: "RECEIPT" | "ISSUE" | "ADJUSTMENT";
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  refType: string;
  refId?: string | null;
  createdBy: string;
  createdAt: string;
};

export type LowStockRow = {
  productId: string;
  sku: string;
  name: string;
  balance: number;
  reorderPoint: number;
  reorderQty: number;
};
