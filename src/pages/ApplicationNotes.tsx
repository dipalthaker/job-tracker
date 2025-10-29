// src/components/ApplicationNotes.tsx
import { useEffect, useState } from "react";
import { api } from "../api";

type Note = {
  id: string;
  application_id: string;
  content: string;
  created_at: string;
};

export default function ApplicationNotes({ applicationId }: { applicationId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadNotes() {
    setLoading(true);
    const { data } = await api.get(`/applications/${applicationId}/notes`);
    setNotes(data);
    setLoading(false);
  }

  async function addNote() {
    if (!newNote.trim()) return;
    const { data } = await api.post(`/applications/${applicationId}/notes`, { content: newNote });
    setNotes((prev) => [data, ...prev]);
    setNewNote("");
  }

  async function deleteNote(id: string) {
    if (!window.confirm("Delete this note?")) return;
    await api.delete(`/notes/${id}`);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  useEffect(() => {
    loadNotes();
  }, [applicationId]);

  return (
    <div className="mt-4">
      <h5>Notes</h5>
      <div className="input-group mb-3">
        <input
          className="form-control"
          placeholder="Add a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <button className="btn btn-primary" onClick={addNote}>Add</button>
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : notes.length === 0 ? (
        <div className="text-muted">No notes yet.</div>
      ) : (
        <ul className="list-group">
          {notes.map((n) => (
            <li key={n.id} className="list-group-item d-flex justify-content-between">
              <span>{n.content}</span>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => deleteNote(n.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
