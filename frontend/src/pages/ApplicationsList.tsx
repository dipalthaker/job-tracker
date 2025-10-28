import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchApplications,
  updateApplication,
  deleteApplication,
  type Application,
  type Status,
} from "../services/applications";

const STATUSES: Status[] = [
  "APPLIED",
  "OA",
  "INTERVIEW",
  "ONSITE",
  "OFFER",
  "REJECTED",
];

export default function ApplicationsList() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"" | Status>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await fetchApplications();
        if (!alive) return;
        setApps(data ?? []);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps
      .filter(a => filter ? a.status === filter : true)
      .filter(a => {
        if (!q) return true;
        const hay = `${a.company} ${a.role} ${a.location || ""} ${a.source || ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        const da = a.applied_at ? +new Date(a.applied_at) : 0;
        const db = b.applied_at ? +new Date(b.applied_at) : 0;
        return db - da;
      });
  }, [apps, query, filter]);

  async function onStatusChange(id: string, newStatus: Status) {
    try {
      await updateApplication(id, { status: newStatus });
      setApps((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    } catch (e: any) {
      alert(e?.response?.data?.detail || e?.message || "Failed to update status");
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this application? This cannot be undone.")) return;
    try {
      await deleteApplication(id);
      setApps((prev) => prev.filter((a) => a.id !== id));
    } catch (e: any) {
      alert(e?.response?.data?.detail || e?.message || "Failed to delete");
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0">Applications</h1>
        <div className="text-muted small">
          Total: <strong>{apps.length}</strong> • Showing{" "}
          <strong>{filtered.length}</strong>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 text-md-end">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setQuery("");
                  setFilter("");
                }}
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-center text-secondary">Loading…</div>
          ) : err ? (
            <div className="alert alert-danger m-3">{err}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Applied</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id}>
                      <td>{a.company}</td>
                      <td>{a.role}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={a.status}
                          onChange={(e) =>
                            onStatusChange(a.id, e.target.value as Status)
                          }
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{a.location || "-"}</td>
                      <td>
                        {a.applied_at
                          ? new Date(a.applied_at).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="text-end">
                        <div className="btn-group">
                          <Link
                            to={`/applications/${a.id}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            View
                          </Link>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => onDelete(a.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td colSpan={6} className="text-center text-secondary py-4">
                        No matching applications.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
