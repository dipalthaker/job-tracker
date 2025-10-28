import { api } from "../api";
export type Stage = { id: string; type: string; scheduled_at?: string; notes?: string };
export async function listStages(appId: string): Promise<Stage[]> {
  const { data } = await api.get(`/applications/${appId}/stages`);
  return data;
}
export async function createStage(appId: string, body: { type: string; scheduled_at?: string; notes?: string }): Promise<Stage> {
  const { data } = await api.post(`/applications/${appId}/stages`, body);
  return data;
}
export async function deleteStage(id: string): Promise<void> {
  await api.delete(`/stages/${id}`);
}
