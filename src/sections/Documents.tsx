import { useEffect, useState } from "react";
import { api } from "../api";

type Doc = { id: string; file_name: string; file_type: string; size_bytes?: number; uploaded_at: string; s3_key: string };

export default function Documents({ applicationId }: { applicationId: string }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const load = async () => { const { data } = await api.get(`/documents?application_id=${applicationId}`); setDocs(data); };
  useEffect(() => { load(); }, [applicationId]);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const { data } = await api.post("/documents/presign-put", {
      application_id: applicationId,
      file_name: file.name,
      file_type: file.type
    });
    await fetch(data.url, { method: "PUT", body: file });       // upload to S3
    await api.post("/documents", {                              // record in DB
      application_id: applicationId,
      file_name: file.name,
      file_type: file.type,
      s3_key: data.key,
      size_bytes: file.size
    });
    setFile(null); load();
  };

  const download = async (key: string) => {
    const { data } = await api.post("/documents/presign-get", { key });
    window.open(data.url, "_blank");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={upload} className="bg-white p-4 rounded-xl shadow flex gap-2 items-center">
        <input type="file" onChange={e=>setFile(e.target.files?.[0] || null)} />
        <button className="px-3 py-2 rounded bg-black text-white" disabled={!file}>Upload</button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100"><tr><th className="p-3 text-left">File</th><th className="p-3">Type</th><th className="p-3">Size</th><th className="p-3"></th></tr></thead>
          <tbody>{docs.map(d=>(
            <tr key={d.id} className="border-t">
              <td className="p-3">{d.file_name}</td>
              <td className="p-3">{d.file_type}</td>
              <td className="p-3">{d.size_bytes ? Math.round(d.size_bytes/1024) + " KB" : "-"}</td>
              <td className="p-3 text-right">
                <button onClick={()=>download(d.s3_key)} className="px-3 py-1 rounded bg-blue-600 text-white">Download</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
