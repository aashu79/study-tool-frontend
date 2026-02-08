import { apiClient } from "./client";

export interface CreateSummaryRequest {
  customTitle?: string;
  chunkLimit?: number;
  useVectorSearch?: boolean;
  searchQuery?: string;
}

export interface SummaryChunk {
  id: string;
  chunkIndex: number;
  content: string;
}

export interface Summary {
  id: string;
  fileId: string;
  userId: string;
  title: string;
  content: string;
  wordCount: number;
  tokensUsed: number;
  modelUsed: string;
  createdAt: string;
  chunks?: SummaryChunk[];
}

export interface SummaryListResponse {
  data: Summary[];
  count: number;
  total?: number;
  page?: number;
  limit?: number;
}

export interface SummaryQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "wordCount";
  sortOrder?: "asc" | "desc";
}

export const summaryService = {
  // Create summary for a file
  async createSummary(
    fileId: string,
    options?: CreateSummaryRequest,
  ): Promise<Summary> {
    const response = await apiClient.post(
      `/api/summary/file/${fileId}`,
      options || {},
    );
    return response.data.data;
  },

  // Get all summaries for a specific file
  async getFileSummaries(fileId: string): Promise<SummaryListResponse> {
    const response = await apiClient.get(`/api/summary/file/${fileId}`);
    return {
      data: response.data.data,
      count: response.data.count,
    };
  },

  // Get a specific summary by ID
  async getSummary(summaryId: string): Promise<Summary> {
    const response = await apiClient.get(`/api/summary/${summaryId}`);
    return response.data.data;
  },

  // Get all summaries for the authenticated user
  async getUserSummaries(
    params?: SummaryQueryParams,
  ): Promise<SummaryListResponse> {
    const response = await apiClient.get("/api/summary", { params });
    return {
      data: response.data.data,
      count: response.data.count,
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
    };
  },

  // Delete a summary
  async deleteSummary(summaryId: string): Promise<void> {
    await apiClient.delete(`/api/summary/${summaryId}`);
  },

  // Update summary title
  async updateSummaryTitle(summaryId: string, title: string): Promise<Summary> {
    const response = await apiClient.patch(`/api/summary/${summaryId}`, {
      title,
    });
    return response.data.data;
  },
};
