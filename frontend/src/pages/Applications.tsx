import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchApplications } from "../services/applications";

type Application = {
  id: string;
  company: string;
  role: string;
  location?: string | null;
  source?: string | null;
  status: "APPLIED" | "OA" | "INTERVIEW" | "ONSITE" | "OFFER" | "REJECTED";
  job_url?: string | null;
  applied_at?: string | null;
  last_update_at?: string | null;
};

const STATUSES: Application["status"][] = [
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
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [sort, setSort] = useState<"recent" | "company">("recent");

  useEffect(() => {
    let dead = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchApplications(); // GET /applications
        if (!dead) setApps(data);
      } catch (e: any) {
        if (!dead) setError(e?.message || "Failed to load applications");
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => {
      dead = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let rows = apps;

    if (status) rows = rows.filter(a => a.status === status);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      rows = rows.filter(
        a =>
          a.company.toLowerCase().includes(needle) ||
          a.role.toLowerCase().includes(needle) ||
          (a.location || "").toLowerCase().includes(needle)
      );
    }

    if (sort === "recent") {
      rows = [...rows].sort((a, b) => {
        const da = Date.parse(a.applied_at || a.last_update_at || "") || 0;
        const db = Date.parse(b.applied_at || b.last_update_at || "") || 0;
        return db - da; // newest first
      });
    } else if (sort === "company") {
      rows = [...rows].sort((a, b) => a.company.localeCompare(b.company));
    }

    return rows;
  }, [apps, q, status, sort]);

  return (
    <div className="container my-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h3 m-0">Applications</h1>
        <div className="d-flex gap-2">
          <input
            className="form-control"
            placeholder="Search company, role, location…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ width: 280 }}
          />
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: 180 }}
          >
            <option value="">All statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="form-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            style={{ width: 180 }}
          >
            <option value="recent">Sort: Recent</option>
            <option value="company">Sort: Company A–Z</option>
          </select>
        </div>
      </div>

      {loading && <div className="alert alert-info mb-0">Loading…</div>}
      {error && <div className="alert alert-danger mb-0">{error}</div>}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: "18%" }}>Company</th>
                <th style={{ width: "18%" }}>Role</th>
                <th style={{ width: "14%" }}>Location</th>
                <th style={{ width: "12%" }}>Status</th>
                <th style={{ width: "16%" }}>Applied</th>
                <th style={{ width: "8%" }}>Link</th>
                <th style={{ width: "14%" }} className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td className="fw-semibold">{a.company}</td>
                  <td>{a.role}</td>
                  <td>{a.location || "-"}</td>
                  <td>
                    <span className={`badge text-bg-${
                      a.status === "REJECTED" ? "secondary"
                      : a.status === "OFFER" ? "success"
                      : a.status === "ONSITE" ? "primary"
                      : a.status === "INTERVIEW" ? "info"
                      : a.status === "OA" ? "warning"
                      : "light"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td>{(a.applied_at || a.last_update_at || "").slice(0, 10) || "-"}</td>
                  <td>
                    {a.job_url ? (
                      <a href={a.job_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">
                        Job
                      </a>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="text-end">
                    <Link to={`/applications/${a.id}`} className="btn btn-sm btn-outline-primary">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    No matching applications.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
