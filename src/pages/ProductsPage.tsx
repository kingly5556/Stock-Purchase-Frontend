import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { formatSatang } from "../lib/money";
import { useAsync } from "../lib/useAsync";

export function ProductsPage() {
  const { data, error, loading, reload } = useAsync(() => api.products.list(), []);
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    setFormError(undefined);
    try {
      await api.products.create({
        sku: String(form.get("sku")),
        name: String(form.get("name")),
        unit: String(form.get("unit")),
        cost: Math.round(Number(form.get("cost")) * 100),
        reorderPoint: Number(form.get("reorderPoint") || 0),
        reorderQty: Number(form.get("reorderQty") || 0),
      });
      e.currentTarget.reset();
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h2>Products</h2>

      <div className="card">
        <form className="inline" onSubmit={onSubmit}>
          <label>
            SKU
            <input name="sku" required />
          </label>
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Unit
            <input name="unit" placeholder="pcs" required />
          </label>
          <label>
            Cost (THB)
            <input name="cost" type="number" step="0.01" min="0" required />
          </label>
          <label>
            Reorder point
            <input name="reorderPoint" type="number" min="0" defaultValue={0} />
          </label>
          <label>
            Reorder qty
            <input name="reorderQty" type="number" min="0" defaultValue={0} />
          </label>
          <button type="submit" disabled={submitting}>
            Add product
          </button>
        </form>
        {formError && <div className="error-banner">{formError}</div>}
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <p className="muted">Loading…</p>}
      {data && (
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Unit</th>
              <th>Cost</th>
              <th>Reorder point</th>
              <th>Reorder qty</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((product) => (
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.unit}</td>
                <td>{formatSatang(product.cost)}</td>
                <td>{product.reorderPoint}</td>
                <td>{product.reorderQty}</td>
                <td>
                  <Link to={`/products/${product.id}/stock-card`}>Stock card</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
