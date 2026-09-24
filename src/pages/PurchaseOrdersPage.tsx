import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../lib/api";
import { formatSatang } from "../lib/money";
import { useAsync } from "../lib/useAsync";

export function PurchaseOrdersPage() {
  const { data, error, loading } = useAsync(() => api.purchaseOrders.list(), []);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Purchase Orders</h2>
        <Link to="/purchase-orders/new">
          <button>New purchase order</button>
        </Link>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {loading && <p className="muted">Loading…</p>}
      {data && (
        <table>
          <thead>
            <tr>
              <th>PO #</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Total</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {data.map((po) => (
              <tr key={po.id}>
                <td>
                  <Link to={`/purchase-orders/${po.id}`}>{po.poNumber}</Link>
                </td>
                <td>{po.supplier?.name ?? po.supplierId}</td>
                <td>
                  <StatusBadge status={po.status} />
                </td>
                <td>{formatSatang(po.totalAmount)}</td>
                <td>{new Date(po.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
