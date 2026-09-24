import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAsync } from "../lib/useAsync";

export function StockCardPage() {
  const { productId } = useParams<{ productId: string }>();
  const { data, error, loading } = useAsync(() => api.reports.stockCard(productId!), [productId]);

  return (
    <>
      <p>
        <Link to="/products">&larr; Products</Link>
      </p>
      <h2>Stock card {data ? `— ${data.product.name} (${data.product.sku})` : ""}</h2>
      {error && <div className="error-banner">{error}</div>}
      {loading && <p className="muted">Loading…</p>}
      {data && (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Balance before</th>
              <th>Balance after</th>
              <th>Reference</th>
              <th>By</th>
            </tr>
          </thead>
          <tbody>
            {data.movements.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.createdAt).toLocaleString()}</td>
                <td>{m.type}</td>
                <td>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</td>
                <td>{m.balanceBefore}</td>
                <td>{m.balanceAfter}</td>
                <td>
                  {m.refType}
                  {m.refId ? ` (${m.refId})` : ""}
                </td>
                <td>{m.createdBy}</td>
              </tr>
            ))}
            {data.movements.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">
                  No movements yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </>
  );
}
