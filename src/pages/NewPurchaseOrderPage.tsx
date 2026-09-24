import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useAsync } from "../lib/useAsync";

type DraftLine = { productId: string; qtyOrdered: string; unitCost: string };

export function NewPurchaseOrderPage() {
  const navigate = useNavigate();
  const { data: products } = useAsync(() => api.products.list(), []);
  const { data: suppliers } = useAsync(() => api.suppliers.list(), []);

  const [supplierId, setSupplierId] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([{ productId: "", qtyOrdered: "", unitCost: "" }]);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function addLine() {
    setLines((prev) => [...prev, { productId: "", qtyOrdered: "", unitCost: "" }]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit() {
    setError(undefined);
    if (!supplierId) {
      setError("Choose a supplier");
      return;
    }
    const parsedLines = lines
      .filter((l) => l.productId)
      .map((l) => ({
        productId: l.productId,
        qtyOrdered: Number(l.qtyOrdered),
        unitCost: Math.round(Number(l.unitCost) * 100),
      }));
    if (parsedLines.length === 0) {
      setError("Add at least one line");
      return;
    }
    setSubmitting(true);
    try {
      const po = await api.purchaseOrders.create({ supplierId, lines: parsedLines });
      navigate(`/purchase-orders/${po.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create purchase order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h2>New purchase order</h2>
      <div className="card">
        <label>
          Supplier
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            <option value="">Select a supplier…</option>
            {suppliers?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <table style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty ordered</th>
              <th>Unit cost (THB)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td>
                  <select
                    value={line.productId}
                    onChange={(e) => updateLine(i, { productId: e.target.value })}
                  >
                    <option value="">Select…</option>
                    {products?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} — {p.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={line.qtyOrdered}
                    onChange={(e) => updateLine(i, { qtyOrdered: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unitCost}
                    onChange={(e) => updateLine(i, { unitCost: e.target.value })}
                  />
                </td>
                <td>
                  {lines.length > 1 && (
                    <button type="button" className="secondary" onClick={() => removeLine(i)}>
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="actions">
          <button type="button" className="secondary" onClick={addLine}>
            Add line
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}
        <div className="actions">
          <button type="button" onClick={onSubmit} disabled={submitting}>
            Create draft PO
          </button>
        </div>
      </div>
    </>
  );
}
