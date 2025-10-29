import { useEffect, useState } from "react";
import { api } from "../api";
type Contact = { id: string; name: string; email?: string; role?: string; notes?: string };

export default function Contacts({ applicationId }: { applicationId: string }) {
  const [items, setItems] = useState<Contact[]>([]);
  const [form, setForm] = useState({ name: "", email: "", role: "", notes: "" });

  const load = async () => { const { data } = await api.get(`/contacts?application_id=${applicationId}`); setItems(data); };
  useEffect(() => { load(); }, [applicationId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/contacts", { application_id: applicationId, ...form });
    setForm({ name: "", email: "", role: "", notes: "" }); load();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="bg-white p-4 rounded-xl shadow grid md:grid-cols-4 gap-2">
        <input className="border rounded p-2" placeholder="Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
        <input className="border rounded p-2" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <input className="border rounded p-2" placeholder="Role" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}/>
        <input className="border rounded p-2 md:col-span-3" placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
        <button className="px-3 py-2 rounded bg-black text-white md:col-span-1">Add Contact</button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100"><tr><th className="p-3 text-left">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Notes</th></tr></thead>
          <tbody>{items.map(c=>(
            <tr key={c.id} className="border-t">
              <td className="p-3 font-medium">{c.name}</td>
              <td className="p-3">{c.email || "-"}</td>
              <td className="p-3">{c.role || "-"}</td>
              <td className="p-3">{c.notes || "-"}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
