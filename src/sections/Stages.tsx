import { useEffect, useState } from "react";
import { api } from "../api";

type Stage = { id: string; type: string; scheduled_at?: string; outcome?: string; notes?: string };

export default function Stages({ applicationId }: { applicationId: string }) {
  const [items, setItems] = useState<Stage[]>([]);
  const [form, setForm] = useState({ type: "RECRUITER", scheduled_at: "", notes: "" });

  const load = async () => {
    const { data } = await api.get(`/stages?application_id=${applicationId}`);
    setItems(data);
  };
  useEffect(() => { load(); }, [applicationId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/stages", { application_id: applicationId, ...form });
    setForm({ type: "RECRUITER", scheduled_at: "", notes: "" });
    load();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="bg-white p-4 rounded-xl shadow space-y-2">
        <div className="grid md:grid-cols-3 gap-2">
          <select value={form.type} onChange={e=>setForm({ ...form, type: e.target.value })} className="border rounded p-2">
            {["RECRUITER","TECH_SCREEN","OA","ONSITE","OFFER","OTHER"].map(t=> <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="datetime-local" value={form.scheduled_at} onChange={e=>setForm({ ...form, scheduled_at: e.target.value })} className="border rounded p-2"/>
          <input placeholder="Notes" value={form.notes} onChange={e=>setForm({ ...form, notes: e.target.value })} className="border rounded p-2"/>
        </div>
        <button className="px-3 py-2 rounded bg-black text-white">Add Stage</button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100"><tr><th className="p-3 text-left">Type</th><th className="p-3 text-left">Scheduled</th><th className="p-3 text-left">Outcome</th><th className="p-3 text-left">Notes</th></tr></thead>
          <tbody>
            {items.map(s=>(
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.type}</td>
                <td className="p-3">{s.scheduled_at ? new Date(s.scheduled_at).toLocaleString() : "-"}</td>
                <td className="p-3">{s.outcome || "-"}</td>
                <td className="p-3">{s.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
