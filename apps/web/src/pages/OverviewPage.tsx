import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { ROLE_LABELS, type OverviewResponse } from "../lib/types";
import { Badge } from "../components/ui/Badge";

export function OverviewPage() {
  const { user, hasRole } = useAuth();
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    apiGet<OverviewResponse>("/overview", ac.signal)
      .then(setData)
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(e instanceof ApiError ? e.message : "Failed to load overview");
      });
    return () => ac.abort();
  }, []);

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="muted">
          Signed in as {user?.name} · {user ? ROLE_LABELS[user.role] : ""}
        </p>
      </div>

      {error && <div className="card"><div className="card__body" style={{ color: "var(--status-danger-fg)" }}>{error}</div></div>}

      {!data && !error && <p className="muted">Loading metrics…</p>}

      {data && (
        <>
          <section className="grid-metrics">
            <Metric label="Active staff" value={data.staffCount} />
            <Metric label="Retail customers" value={data.customers.retail} />
            <Metric label="Wholesale customers" value={data.customers.wholesale} />
            <Metric label="Published products" value={data.products.published} />
            <Metric label="Draft products" value={data.products.draft} />
          </section>

          <section className="card">
            <div className="card__header">Action queue</div>
            <div className="table-wrap" style={{ border: 0 }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Count</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <QueueRow
                    label="Wholesale applications awaiting review"
                    count={data.actionQueue.pendingWholesaleApplications}
                    status="Pending"
                  />
                  <QueueRow
                    label="Open quotes (requested / draft / sent)"
                    count={data.actionQueue.openQuotes}
                    status="Draft"
                  />
                  <QueueRow
                    label="Unpaid invoices (sent / overdue)"
                    count={data.actionQueue.unpaidInvoices}
                    status="Sent"
                  />
                  <QueueRow
                    label="Retail orders to ship"
                    count={data.actionQueue.ordersToShip}
                    status="Processing"
                  />
                </tbody>
              </table>
            </div>
          </section>

          {hasRole("ADMIN") && (
            <p className="muted" style={{ fontSize: "var(--text-xs)" }}>
              Revenue by channel, top products, and other role-scoped reports
              are available under <Link to="/settings?tab=reports">Settings → Reports</Link>.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <div className="card__body">
        <div className="metric__value">{value.toLocaleString()}</div>
        <div className="metric__label">{label}</div>
      </div>
    </div>
  );
}

function QueueRow({
  label,
  count,
  status,
}: {
  label: string;
  count: number;
  status: string;
}) {
  return (
    <tr>
      <td>{label}</td>
      <td style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--color-blue)" }}>
        {count}
      </td>
      <td>
        <Badge tone="pending">{status}</Badge>
      </td>
    </tr>
  );
}
