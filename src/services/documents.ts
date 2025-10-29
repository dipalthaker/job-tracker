// src/services/documents.ts
import { api } from "../api";

export type Doc = {
  id: string;
  application_id: string;
  file_name: string;
  file_type: string;
  s3_key: string;
  size_bytes?: number | null;
  uploaded_at: string;
};

export async function listDocuments(appId: string): Promise<Doc[]> {
  const { data } = await api.get(`/documents/${appId}`);
  return data;
}

export async function presignUpload(appId: string, file: File, fileType: string) {
  const { data } = await api.post(`/documents/${appId}/presign`, {
    file_name: file.name,
    content_type: file.type || "application/octet-stream",
    file_type: fileType,
    size_bytes: file.size,
  });
  return data as { upload_url: string; s3_key: string };
}

export async function uploadToS3(putUrl: string, file: File) {
  // no auth headers to S3; use fetch
  const res = await fetch(putUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`);
}

export async function registerDocument(params: {
  application_id: string;
  file_name: string;
  file_type: string;
  s3_key: string;
  size_bytes?: number;
}) {
  const { data } = await api.post("/documents", params);
  return data as Doc;
}

export async function getDownloadUrl(documentId: string) {
  const { data } = await api.get(`/documents/download/${documentId}`);
  return data as { url: string };
}

export async function deleteDocument(documentId: string) {
  const { data } = await api.delete(`/documents/${documentId}`);
  return data as { ok: boolean };
}
