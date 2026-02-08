import { apiClient } from "./client";

export interface FileUploadResponse {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedAt?: string;
  createdAt?: string;
  processingStatus?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  errorMessage?: string | null;
}

export interface SignedUrlResponse {
  url: string;
}

export interface FileQueryParams {
  search?: string;
  sortOrder?: "asc" | "desc";
  fromDate?: string;
  page?: number;
  limit?: number;
}

export interface FilesResponse {
  files: FileUploadResponse[];
  total: number;
  page: number;
  limit: number;
}

export const fileService = {
  uploadFiles: async (files: File[]): Promise<FileUploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await apiClient.post("/api/file/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getFiles: async (params?: FileQueryParams): Promise<FilesResponse> => {
    const response = await apiClient.get("/api/file/files", { params });
    return response.data;
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await apiClient.delete(`/api/file/${fileId}`);
  },

  getProfilePicture: async (): Promise<SignedUrlResponse> => {
    const response = await apiClient.get("/api/file/profile-picture");
    return response.data;
  },

  getFileUrl: async (fileId: string): Promise<SignedUrlResponse> => {
    const response = await apiClient.get(`/api/file/file/${fileId}`);
    return response.data;
  },

  getFileDownloadUrl: async (fileId: string): Promise<SignedUrlResponse> => {
    const response = await apiClient.get(`/api/file/file/${fileId}/download`);
    return response.data;
  },
};
