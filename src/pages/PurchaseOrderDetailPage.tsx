import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { api, ApiError } from "../lib/api";
import { formatSatang } from "../lib/money";
import { useAsync } from "../lib/useAsync";

const ACTIONS: Record<string, { key: "submit" | "approve" | "send" | "cancel"; label: string }[]> = {
  DRAFT: [
    { key: "submit", label: "Submit" },
    { key: "cancel", label: "Cancel" },
  ],
  PENDING_APPROVAL: [
    { key: "approve", label: "Approve" },
    { key: "cancel", label: "Cancel" },
  ],
  APPROVED: [
    { key: "send", label: "Send to supplier" },
    { key: "cancel", label: "Cancel" },
  ],
  SENT: [{ key: "cancel", label: "Cancel" }],
};

export function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: po, error, loading, reload } = useAsync(() => api.purchaseOrders.get(id!), [id]);
  const [actionError, setActionError] = useState<string>();
  const [busy, setBusy] = useState(false);

  // Server enforces every role check on these actions; this UI just offers
  // the buttons that make sense for the current status and surfaces a 403
  // from the backend as an error banner if the caller isn't permitted.
  async function runAction(key: "submit" | "approve" | "send" | "cancel") {
    setBusy(true);
    setActionError(undefined);
    try {
      await api.purchaseOrders[key](id!);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!po) return null;

  const canReceive = po.status === "SENT" || po.status === "PARTIALLY_RECEIVED";

  return (
    <>
      <p>
        <Link to="/purchase-orders">&larr; Purchase orders</Link>
      </p>
      <h2>
        {po.poNumber} <StatusBadge status={po.status} />
      </h2>
      <p className="muted">
        Supplier: {po.supplier?.name ?? po.supplierId} · Total: {formatSatang(po.totalAmount)}
      </p>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Lines</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Ordered</th>
              <th>Received</th>
              <th>Unit cost</th>
            </tr>
          </thead>
          <tbody>
            {po.lines.map((line) => (
              <tr key={line.id}>
                <td>{line.product ? `${line.product.sku} — ${line.product.name}` : line.productId}</td>
                <td>{line.qtyOrdered}</td>
                <td>{line.qtyReceived}</td>
                <td>{formatSatang(line.unitCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {actionError && <div className="error-banner">{actionError}</div>}
        <div className="actions">
          {(ACTIONS[po.status] ?? []).map((action) => (
            <button
              key={action.key}
              className={action.key === "cancel" ? "danger" : undefined}
              disabled={busy}
              onClick={() => runAction(action.key)}
            >
              {action.label}
            </button>
          ))}
          {(ACTIONS[po.status] ?? []).length === 0 && (
            <p className="muted">No actions available in status {po.status}.</p>
          )}
        </div>
      </div>

      {canReceive && <ReceiveGoodsForm poId={po.id} lines={po.lines} onReceived={reload} />}

      {po.goodsReceipts && po.goodsReceipts.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Goods receipts</h3>
          <table>
            <thead>
              <tr>
                <th>Received at</th>
                <th>Received by</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {po.goodsReceipts.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.receivedAt).toLocaleString()}</td>
                  <td>{r.receivedBy}</td>
                  <td>{r.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function ReceiveGoodsForm({
  poId,
  lines,
  onReceived,
}: {
  poId: string;
  lines: { id: string; qtyOrdered: number; qtyReceived: number; product?: { sku: string; name: string } }[];
  onReceived: () => void;
}) {
  const outstanding = lines.filter((l) => l.qtyReceived < l.qtyOrdered);
  const [qtys, setQtys] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(undefined);
    const receiveLines = outstanding
      .map((l) => ({ poLineId: l.id, qtyReceived: Number(qtys[l.id] || 0) }))
      .filter((l) => l.qtyReceived > 0);
    if (receiveLines.length === 0) {
      setError("Enter a quantity for at least one line");
      return;
    }
    setSubmitting(true);
    try {
      await api.goodsReceipts.receive({ poId, lines: receiveLines });
      setQtys({});
      onReceived();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to record receipt");
    } finally {
      setSubmitting(false);
    }
  }

  if (outstanding.length === 0) return null;

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Receive goods</h3>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Outstanding</th>
            <th>Receive now</th>
          </tr>
        </thead>
        <tbody>
          {outstanding.map((line) => {
            const remaining = line.qtyOrdered - line.qtyReceived;
            return (
              <tr key={line.id}>
                <td>{line.product ? `${line.product.sku} — ${line.product.name}` : line.id}</td>
                <td>{remaining}</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    max={remaining}
                    value={qtys[line.id] ?? ""}
                    onChange={(e) => setQtys((prev) => ({ ...prev, [line.id]: e.target.value }))}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {error && <div className="error-banner">{error}</div>}
      <div className="actions">
        <button onClick={onSubmit} disabled={submitting}>
          Record receipt
        </button>
      </div>
    </div>
  );
}
