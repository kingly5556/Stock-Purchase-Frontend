import { useState, type FormEvent } from "react";
import { api, ApiError } from "../lib/api";
import { useAsync } from "../lib/useAsync";

export function SuppliersPage() {
  const { data, error, loading, reload } = useAsync(() => api.suppliers.list(), []);
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    setFormError(undefined);
    try {
      await api.suppliers.create({
        name: String(form.get("name")),
        contactInfo: String(form.get("contactInfo") || "") || undefined,
        leadTimeDays: form.get("leadTimeDays") ? Number(form.get("leadTimeDays")) : undefined,
      });
      e.currentTarget.reset();
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to create supplier");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h2>Suppliers</h2>

      <div className="card">
        <form className="inline" onSubmit={onSubmit}>
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Contact info
            <input name="contactInfo" />
          </label>
          <label>
            Lead time (days)
            <input name="leadTimeDays" type="number" min="0" />
          </label>
          <button type="submit" disabled={submitting}>
            Add supplier
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
              <th>Name</th>
              <th>Contact</th>
              <th>Lead time</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.contactInfo ?? "—"}</td>
                <td>{s.leadTimeDays != null ? `${s.leadTimeDays}d` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
