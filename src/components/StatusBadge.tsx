import type { PurchaseOrderStatus } from "../types";

export function StatusBadge({ status }: { status: PurchaseOrderStatus }) {
  return <span className={`badge ${status}`}>{status.replace(/_/g, " ")}</span>;
}
