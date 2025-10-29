import { useEffect, useState } from "react";
import { api } from "../api";

type Note = { id: string; content: string; created_at: string };

export default function Notes({ applicationId }: { applicationId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");

  const load = async () => {
    const { data } = await api.get(`/notes?application_id=${applicationId}`);
    setNotes(data);
  };
  useEffect(() => { load(); }, [applicationId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/notes", { application_id: applicationId, content: text });
    setText(""); load();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="bg-white p-4 rounded-xl shadow">
        <textarea value={text} onChange={e=>setText(e.target.value)}
          placeholder="Add a note…" className="w-full border rounded p-2 h-24" />
        <div className="mt-2"><button className="px-3 py-2 rounded bg-black text-white">Save Note</button></div>
      </form>

      <div className="space-y-2">
        {notes.map(n=>(
          <div key={n.id} className="bg-white rounded-xl shadow p-4">
            <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
            <div className="mt-1 whitespace-pre-wrap">{n.content}</div>
          </div>
        ))}
        {notes.length===0 && <div className="text-gray-600">No notes yet.</div>}
      </div>
    </div>
  );
}
