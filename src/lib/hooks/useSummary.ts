import { useState } from "react";
import {
  summaryService,
  type Summary,
  type CreateSummaryRequest,
  type SummaryListResponse,
  type SummaryQueryParams,
} from "../api/summary.service";
import { getApiErrorMessage } from "../api/error";

export const useSummary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSummary = async (
    fileId: string,
    options?: CreateSummaryRequest,
  ): Promise<Summary> => {
    try {
      setLoading(true);
      setError(null);
      return await summaryService.createSummary(fileId, options);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, "Failed to create summary");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const getFileSummaries = async (
    fileId: string,
  ): Promise<SummaryListResponse> => {
    try {
      setLoading(true);
      setError(null);
      return await summaryService.getFileSummaries(fileId);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, "Failed to get summaries");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const getSummary = async (summaryId: string): Promise<Summary> => {
    try {
      setLoading(true);
      setError(null);
      return await summaryService.getSummary(summaryId);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, "Failed to get summary");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const getUserSummaries = async (
    params?: SummaryQueryParams,
  ): Promise<SummaryListResponse> => {
    try {
      setLoading(true);
      setError(null);
      return await summaryService.getUserSummaries(params);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, "Failed to get summaries");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSummary = async (summaryId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await summaryService.deleteSummary(summaryId);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, "Failed to delete summary");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateSummaryTitle = async (
    summaryId: string,
    title: string,
  ): Promise<Summary> => {
    try {
      setLoading(true);
      setError(null);
      return await summaryService.updateSummaryTitle(summaryId, title);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, "Failed to update summary");
      setError(message);
      throw new Error(message);
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
