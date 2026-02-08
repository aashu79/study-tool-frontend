import { apiClient } from "./client";

export interface ProcessingStatusResponse {
  fileId: string;
  filename: string;
  processingStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  errorMessage: string | null;
  chunkCount: number;
  latestJob?: {
    id: string;
    status: string;
    attempts: number;
    startedAt: string;
    completedAt: string | null;
  };
}

export interface TriggerProcessingResponse {
  status: string;
  fileId: string;
  jobId: string;
}

export interface WorkerHealthResponse {
  available: boolean;
  status: {
    status: string;
    redis: string;
    minio: string;
  };
}

export interface QueueStatsResponse {
  pending: number;
  processing: number;
  worker_status: string;
}

export const processingService = {
  // Trigger manual processing
  async triggerProcessing(fileId: string): Promise<TriggerProcessingResponse> {
    const response = await apiClient.post(`/api/processing/trigger/${fileId}`);
    return response.data.data;
  },

  // Get processing status
  async getStatus(fileId: string): Promise<ProcessingStatusResponse> {
    const response = await apiClient.get(`/api/processing/status/${fileId}`);
    return response.data.data;
  },

  // Check worker health
  async checkHealth(): Promise<WorkerHealthResponse> {
    const response = await apiClient.get("/api/processing/health");
    return response.data.data;
  },

  // Get queue statistics
  async getQueueStats(): Promise<QueueStatsResponse> {
    const response = await apiClient.get("/api/processing/queue/stats");
    return response.data.data;
  },
};
