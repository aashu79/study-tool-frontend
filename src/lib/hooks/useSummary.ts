import { useState } from "react";
import {
  summaryService,
  type Summary,
  type CreateSummaryRequest,
  type SummaryListResponse,
  type SummaryQueryParams,
} from "../api/summary.service";

export const useSummary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSummary = async (
    fileId: string,
    options?: CreateSummaryRequest,
  ): Promise<Summary | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await summaryService.createSummary(fileId, options);
      return data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create summary";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getFileSummaries = async (
    fileId: string,
  ): Promise<SummaryListResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await summaryService.getFileSummaries(fileId);
      return data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to get summaries";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSummary = async (summaryId: string): Promise<Summary | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await summaryService.getSummary(summaryId);
      return data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to get summary";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserSummaries = async (
    params?: SummaryQueryParams,
  ): Promise<SummaryListResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await summaryService.getUserSummaries(params);
      return data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to get summaries";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSummary = async (summaryId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await summaryService.deleteSummary(summaryId);
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete summary";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateSummaryTitle = async (
    summaryId: string,
    title: string,
  ): Promise<Summary | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await summaryService.updateSummaryTitle(summaryId, title);
      return data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update summary";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createSummary,
    getFileSummaries,
    getSummary,
    getUserSummaries,
    deleteSummary,
    updateSummaryTitle,
  };
};
