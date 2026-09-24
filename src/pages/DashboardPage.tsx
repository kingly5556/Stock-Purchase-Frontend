import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAsync } from "../lib/useAsync";

export function DashboardPage() {
  const { data, error, loading } = useAsync(() => api.inventory.lowStock(), []);

  return (
    <>
      <h2>Low stock</h2>
      <p className="muted">Products at or under their reorder point.</p>
      {error && <div className="error-banner">{error}</div>}
      {loading && <p className="muted">Loading…</p>}
      {data && data.length === 0 && <p className="muted">Nothing below reorder point.</p>}
      {data && data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Balance</th>
              <th>Reorder point</th>
              <th>Suggested reorder qty</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.productId}>
                <td>{row.sku}</td>
                <td>
                  <Link to={`/products/${row.productId}/stock-card`}>{row.name}</Link>
                </td>
                <td className="low-stock-row">{row.balance}</td>
                <td>{row.reorderPoint}</td>
                <td>{row.reorderQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
