import { useEffect, useState } from "react";
import { api } from "../api";
type Reminder = { id: string; due_at: string; message: string; sent: boolean };

export default function Reminders({ applicationId }: { applicationId: string }) {
  const [items, setItems] = useState<Reminder[]>([]);
  const [form, setForm] = useState({ due_at: "", message: "" });
  const load = async () => { const { data } = await api.get(`/reminders?application_id=${applicationId}`); setItems(data); };
  useEffect(()=>{ load(); },[applicationId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/reminders", { application_id: applicationId, ...form });
    setForm({ due_at: "", message: "" }); load();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="bg-white p-4 rounded-xl shadow grid md:grid-cols-3 gap-2">
        <input type="datetime-local" className="border rounded p-2" value={form.due_at} onChange={e=>setForm({...form, due_at:e.target.value})}/>
        <input className="border rounded p-2 md:col-span-2" placeholder="Message" value={form.message} onChange={e=>setForm({...form, message:e.target.value})}/>
        <button className="px-3 py-2 rounded bg-black text-white">Add Reminder</button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100"><tr><th className="p-3 text-left">Due</th><th className="p-3">Message</th><th className="p-3">Status</th></tr></thead>
          <tbody>{items.map(r=>(
            <tr key={r.id} className="border-t">
              <td className="p-3">{new Date(r.due_at).toLocaleString()}</td>
              <td className="p-3">{r.message}</td>
              <td className="p-3">{r.sent ? "Sent" : "Pending"}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
