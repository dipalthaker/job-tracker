import { useEffect, useState } from "react";
import { api } from "../api";
type Tag = { id: string; name: string };

export default function Tags({ applicationId }: { applicationId: string }) {
  const [all, setAll] = useState<Tag[]>([]);
  const [assigned, setAssigned] = useState<Tag[]>([]);
  const [name, setName] = useState("");

  const load = async () => {
    const [t, a] = await Promise.all([
      api.get("/tags"),
      api.get(`/applications/${applicationId}/tags`)
    ]);
    setAll(t.data); setAssigned(a.data);
  };
  useEffect(()=>{ load(); },[applicationId]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/tags", { name }); setName(""); load();
  };
  const attach = async (tagId: string) => {
    await api.post(`/applications/${applicationId}/tags/${tagId}`); load();
  };
  const detach = async (tagId: string) => {
    await api.delete(`/applications/${applicationId}/tags/${tagId}`); load();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="bg-white p-4 rounded-xl shadow flex gap-2">
        <input className="border rounded p-2" placeholder="New tag" value={name} onChange={e=>setName(e.target.value)}/>
        <button className="px-3 py-2 rounded bg-black text-white">Create</button>
      </form>

      <div className="bg-white p-4 rounded-xl shadow space-y-2">
        <div className="font-medium">Assigned</div>
        <div className="flex gap-2 flex-wrap">
          {assigned.map(t=>(
            <button key={t.id} onClick={()=>detach(t.id)} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">{t.name} ✕</button>
          ))}
          {assigned.length===0 && <div className="text-gray-600">No tags yet.</div>}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow space-y-2">
        <div className="font-medium">All Tags</div>
        <div className="flex gap-2 flex-wrap">
          {all.map(t=>(
            <button key={t.id} onClick={()=>attach(t.id)} className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">{t.name} +</button>
          ))}
        </div>
      </div>
    </div>
  );
}
