import { useState } from "react";
import {
  processingService,
  type ProcessingStatusResponse,
  type TriggerProcessingResponse,
  type WorkerHealthResponse,
  type QueueStatsResponse,
} from "../api/processing.service";

export const useProcessing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerProcessing = async (
    fileId: string,
  ): Promise<TriggerProcessingResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await processingService.triggerProcessing(fileId);
      return data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to trigger processing";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getStatus = async (
    fileId: string,
  ): Promise<ProcessingStatusResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await processingService.getStatus(fileId);
      return data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to get status";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async (): Promise<WorkerHealthResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await processingService.checkHealth();
      return data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to check health";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getQueueStats = async (): Promise<QueueStatsResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await processingService.getQueueStats();
      return data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to get queue stats";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    triggerProcessing,
    getStatus,
    checkHealth,
    getQueueStats,
  };
};
