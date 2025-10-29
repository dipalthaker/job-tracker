// src/services/applications.ts
import { api } from "../api";

export type Status = "APPLIED" | "OA" | "INTERVIEW" | "ONSITE" | "OFFER" | "REJECTED";

export type Application = {
  id: string;
  company: string;
  role: string;
  location?: string | null;
  source?: string | null;
  status: Status;
  job_url?: string | null;
  applied_at?: string | null;
  last_update_at?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  jd_text?: string | null;
};

export async function fetchApplications(): Promise<Application[]> {
  const { data } = await api.get("/applications");
  return data;
}

export async function fetchApplicationById(id: string): Promise<Application> {
  const { data } = await api.get(`/applications/${id}`);
  return data;
}

export async function createApplication(body: Partial<Application>): Promise<Application> {
  const { data } = await api.post("/applications", body);
  return data;
}

export async function updateApplication(id: string, body: Partial<Application>) {
  const { data } = await api.patch(`/applications/${id}`, body);
  return data;
}
export async function deleteApplication(id: string) {
  await api.delete(`/applications/${id}`);
}
