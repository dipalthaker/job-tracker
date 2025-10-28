import { api } from "../api";
export type Note = { id: string; content: string; created_at?: string };
export async function listNotes(appId: string): Promise<Note[]> {
  const { data } = await api.get(`/applications/${appId}/notes`);
  return data;
}
export async function createNote(appId: string, body: { content: string }): Promise<Note> {
  const { data } = await api.post(`/applications/${appId}/notes`, body);
  return data;
}
export async function deleteNote(noteId: string): Promise<void> {
  await api.delete(`/notes/${noteId}`);
}
