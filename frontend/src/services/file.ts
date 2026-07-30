import api from "../services/api";

export interface UploadedFile {
  id: number;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  folder: "images" | "files";
  url: string;
  provider: string;
}

export const uploadFile = async (
  file: File,
): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    "/api/files/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data as UploadedFile;
};

export const deleteFile = async (id: number) => {
  const response = await api.delete(`/api/files/${id}`);

  return response.data;
};

// Stored URLs are relative (e.g. "/uploads/images/xxx.webp") —
// prefix with the API's base URL so <img>/<a> tags can load them.
export const getFileUrl = (
  url?: string | null,
): string | undefined => {
  if (!url) return undefined;

  // Already absolute (e.g. pointing at an S3 bucket in the future)
  if (/^https?:\/\//i.test(url)) return url;

  const baseURL = api.defaults.baseURL ?? "";

  return `${baseURL}${url}`;
};