import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createApplication,
  fetchApplications,
  deleteApplication, // NEW
} from "../services/applications";

// Keep local types to avoid breaking your existing imports
type Status = "APPLIED" | "OA" | "INTERVIEW" | "ONSITE" | "OFFER" | "REJECTED";
type Application = {
  id: string;
  company: string;
  role: string;
  location?: string | null;
  source?: string | null;
  status: Status;
  job_url?: string | null;
  applied_at?: string | null;
  last_update_at?: string | null;
};

const STATUS: Status[] = ["APPLIED", "OA", "INTERVIEW", "ONSITE", "OFFER", "REJECTED"];

function statusBadge(s: Status) {
  switch (s) {
    case "APPLIED":
      return "secondary";
    case "OA":
      return "info";
    case "INTERVIEW":
      return "primary";
    case "ONSITE":
      return "warning";
    case "OFFER":
      return "success";
    case "REJECTED":
      return "danger";
    default:
      return "secondary";
  }
}

const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString() : "—");

export default function Dashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // form state (always visible)
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<Status>("APPLIED");
  const [jobUrl, setJobUrl] = useState("");

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
    return () => {
      alive = false;
    };
  }, []);

  async function onSave() {
    if (!company || !role) return;
    try {
      const payload = {
        company,
        role,
        location: location || undefined,
        source: source || undefined,
        status,
        job_url: jobUrl || undefined,
      };
      const created = await createApplication(payload as any);
      setApps((a) => [created, ...a]);
      setCompany("");
      setRole("");
      setLocation("");
      setSource("");
      setStatus("APPLIED");
      setJobUrl("");
    } catch (e: any) {
      let message = "Failed to create application.";
      const detail = e?.response?.data?.detail;

        if (Array.isArray(detail)) {
          message = detail
            .map((d: any) => `${(d.loc || []).join(".")}: ${d.msg}`)
            .join("\n");
        } else if (typeof detail === "string") {
          message = detail;
        } else if (e?.message) {
          message = e.message;
        }

        if (jobUrl && !/^https?:\/\//i.test(jobUrl.trim())) {
          message += "\nTip: Job URL must start with http:// or https://";
        }

      alert(message);
    
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this application? This cannot be undone.")) return;
    try {
      await deleteApplication(id);
      setApps((a) => a.filter((x) => x.id !== id));
    } catch (e: any) {
      alert(e?.response?.data?.detail || e?.message || "Delete failed");
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <h1 className="m-0">Dashboard</h1>
      </div>

      {/* Add Application form (always visible) */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Add Application</h5>
          <div className="row g-2">
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Company *"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Role *"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <input
                className="form-control"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <input
                className="form-control"
                placeholder="Source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                {STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-9">
              <input
                className="form-control"
                placeholder="Job URL"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
              />
            </div>
            <div className="col-md-3 text-md-end">
              <button className="btn btn-primary w-100" onClick={onSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <h5 className="mb-3">Your Applications</h5>
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
                    <th>Location</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((a) => (
                    <tr key={a.id}>
                      <td>{a.company}</td>
                      <td>{a.role}</td>
                      <td>{a.location || "—"}</td>
                      <td>
                        <span className={`badge text-bg-${statusBadge(a.status)}`}>{a.status}</span>
                      </td>
                      <td>{fmtDate(a.applied_at)}</td>
                      <td className="text-end d-flex gap-2 justify-content-end">
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
                      </td>
                    </tr>
                  ))}
                  {!apps.length && (
                    <tr>
                      <td colSpan={6} className="text-center text-secondary py-4">
                        No applications yet.
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
