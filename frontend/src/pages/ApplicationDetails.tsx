// src/pages/ApplicationDetails.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../api";

/* ============================= Types ============================= */

type Status = "APPLIED" | "OA" | "INTERVIEW" | "ONSITE" | "OFFER" | "REJECTED";

type Application = {
  id: string;
  company: string;
  role: string;
  location?: string | null;
  source?: string | null;
  status: Status;
  job_url?: string | null;
  jd_text?: string | null;          // free text / notes
  applied_at?: string | null;       // ISO
  last_update_at?: string | null;   // ISO
};

type Doc = {
  id: string;
  file_name: string;
  file_type: string;     // "cover_letter" | "resume" | "prep_notes" | "other"
  content_type: string;
  size_bytes?: number | null;
  s3_key: string;
  uploaded_at: string;   // ISO
};

/* ========================= Helper functions ====================== */

const STATUSES: Status[] = ["APPLIED", "OA", "INTERVIEW", "ONSITE", "OFFER", "REJECTED"];
const FILE_TYPES = [
  { value: "cover_letter", label: "Cover Letter" },
  { value: "resume", label: "Resume" },
  { value: "prep_notes", label: "Interview Notes" },
  { value: "other", label: "Other" },
];

function toLocalInputValue(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function fmtBytes(n?: number | null) {
  if (!n && n !== 0) return "-";
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

/* ====================== Inline Documents Panel =================== */

function DocumentsPanel({ appId }: { appId: string }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState("cover_letter");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load list
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const { data } = await api.get<Doc[]>(`/applications/${appId}/documents`);
        if (!alive) return;
        setDocs(data || []);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Failed to load documents");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [appId]);

  async function onChooseFile() {
    fileInputRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.currentTarget.value = ""; // reset input so same file can be picked again
    if (!file) return;

    try {
      setUploading(true);

      // 1) Ask backend for a presigned PUT URL
      const presignBody = {
        file_name: file.name,
        content_type: file.type || "application/octet-stream",
        file_type: selectedType,
        size_bytes: file.size,
      };
      const { data: presign } = await api.post<{
        url: string;
        fields?: Record<string, string>; // (we’re using PUT-style urls, so fields usually undefined)
        s3_key: string;
      }>("/documents/presign", presignBody);

      // 2) PUT to S3 using returned URL
      //    (we assume a simple presigned-URL PUT flow; no extra fields)
      const putRes = await fetch(presign.url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!putRes.ok) {
        throw new Error(`Upload failed: ${putRes.status} ${putRes.statusText}`);
      }

      // 3) Register document in DB
      const { data: saved } = await api.post<Doc>("/documents/register", {
        application_id: appId,
        file_name: file.name,
        file_type: selectedType,
        content_type: file.type || "application/octet-stream",
        size_bytes: file.size,
        s3_key: presign.s3_key,
      });

      setDocs(d => [saved, ...d]);
    } catch (e: any) {
      alert(e?.response?.data?.detail || e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onDeleteDoc(id: string) {
    if (!confirm("Delete this document?")) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocs(d => d.filter(x => x.id !== id));
    } catch (e: any) {
      alert(e?.response?.data?.detail || e?.message || "Failed to delete document");
    }
  }

  async function onDownloadDoc(id: string) {
    try {
      // Backend returns a presigned GET URL (or direct proxy); open in new tab
      const { data } = await api.get<{ url: string }>(`/documents/${id}/download`);
      window.open(data.url, "_blank");
    } catch (e: any) {
      alert(e?.response?.data?.detail || e?.message || "Failed to get download link");
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="card-title m-0">Documents</h5>
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {FILE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input
              ref={fileInputRef}
              type="file"
              className="d-none"
              onChange={onFileChange}
            />
            <button className="btn btn-sm btn-primary" onClick={onChooseFile} disabled={uploading}>
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-muted">Loading…</div>
        ) : err ? (
          <div className="alert alert-danger">{err}</div>
        ) : docs.length === 0 ? (
          <div className="text-muted">No documents yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(d => (
                  <tr key={d.id}>
                    <td className="fw-semibold">{d.file_name}</td>
                    <td className="text-capitalize">{d.file_type.replace("_", " ")}</td>
                    <td>{fmtBytes(d.size_bytes ?? undefined)}</td>
                    <td>{new Date(d.uploaded_at).toLocaleString()}</td>
                    <td className="text-end">
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => onDownloadDoc(d.id)}>
                          Download
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => onDeleteDoc(d.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================= Main Page (left side form) ============ */

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // local edit fields
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<Status>("APPLIED");
  const [jobUrl, setJobUrl] = useState("");
  const [jdText, setJdText] = useState("");
  const [appliedAt, setAppliedAt] = useState(""); // datetime-local string

  // load application
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const { data } = await api.get<Application>(`/applications/${id}`);
        if (!alive) return;
        setApp(data);
        setCompany(data.company ?? "");
        setRole(data.role ?? "");
        setLocation(data.location ?? "");
        setSource(data.source ?? "");
        setStatus(data.status);
        setJobUrl((data.job_url ?? "") as string);
        setJdText(data.jd_text ?? "");
        setAppliedAt(toLocalInputValue(data.applied_at));
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  async function onSave() {
    if (!id) return;
    if (!company.trim() || !role.trim()) {
      alert("Company and Role are required.");
      return;
    }
    try {
      setSaving(true);
      const payload: any = {
        company,
        role,
        location: location || null,
        source: source || null,
        status,
        job_url: jobUrl || null,
        jd_text: jdText || null, // free text / notes
      };
      payload.applied_at = appliedAt ? new Date(appliedAt).toISOString() : null;

      const { data } = await api.patch<Application>(`/applications/${id}`, payload);
      setApp(data);
      setAppliedAt(toLocalInputValue(data.applied_at)); // normalize into input
      alert("Saved.");
    } catch (e: any) {
      alert(e?.response?.data?.detail || e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteApp() {
    if (!id) return;
    if (!window.confirm("Delete this application? This cannot be undone.")) return;
    try {
      setDeleting(true);
      await api.delete(`/applications/${id}`);
      nav("/applications", { replace: true });
    } catch (e: any) {
      alert(e?.response?.data?.detail || e?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const lastUpdated = useMemo(() => {
    if (!app?.last_update_at) return "-";
    try { return new Date(app.last_update_at).toLocaleString(); }
    catch { return app.last_update_at; }
  }, [app?.last_update_at]);

  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) return <div className="container py-4"><div className="alert alert-danger">{err}</div></div>;
  if (!app) return null;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h4 m-0">Application Details</h1>
        <div className="d-flex gap-2">
          <Link to="/applications" className="btn btn-outline-secondary">Back</Link>
          <button className="btn btn-danger" onClick={onDeleteApp} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left: Edit form */}
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Company *</label>
                  <input className="form-control" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Role *</label>
                  <input className="form-control" value={role} onChange={(e) => setRole(e.target.value)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Location</label>
                  <input className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Source</label>
                  <input className="form-control" value={source} onChange={(e) => setSource(e.target.value)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Applied at</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={appliedAt}
                    onChange={(e) => setAppliedAt(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Job URL</label>
                  <input className="form-control" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} />
                </div>

                <div className="col-12">
                  <label className="form-label">Notes (free text)</label>
                  <textarea
                    className="form-control"
                    rows={6}
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Anything related to this application—prep items, interview notes, follow-ups…"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-primary" onClick={onSave} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Meta + Documents */}
        <div className="col-lg-5">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h6 className="text-muted mb-2">Metadata</h6>
              <div className="small">
                <div><strong>ID:</strong> {app.id}</div>
                <div><strong>Last updated:</strong> {lastUpdated}</div>
                {app.job_url && (
                  <div className="mt-2">
                    <a href={app.job_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">
                      Open Job Posting
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DocumentsPanel appId={app.id} />
        </div>
      </div>
    </div>
  );
}
