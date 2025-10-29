import { api } from "../api";
export type Contact = { id: string; name: string; email?: string; role?: string };
export async function listContacts(appId: string): Promise<Contact[]> {
  const { data } = await api.get(`/applications/${appId}/contacts`);
  return data;
}
export async function createContact(appId: string, body: { name: string; email?: string; role?: string }): Promise<Contact> {
  const { data } = await api.post(`/applications/${appId}/contacts`, body);
  return data;
}
export async function deleteContact(id: string): Promise<void> {
  await api.delete(`/contacts/${id}`);
}
