import { apiClient } from "./client";

export type DocumentChatRole = "USER" | "ASSISTANT";

export interface DocumentChatCitation {
  refId: string;
  chunkId: string;
  pageStart: number | null;
  excerpt: string;
}

export interface DocumentChatUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface DocumentChatMessage {
  id: string;
  role: DocumentChatRole;
  content: string;
  groundedInDocument: boolean;
  usedGeneralKnowledge: boolean;
  citations: DocumentChatCitation[];
  followUpQuestions: string[];
  modelUsed: string | null;
  usage: DocumentChatUsage | null;
  createdAt: string;
}

export interface DocumentChatThread {
  id: string;
  fileId: string;
  fileName: string;
  title: string;
  documentStatus: string;
  messageCount: number;
  latestMessagePreview: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChatPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DocumentChatContext {
  documentReady: boolean;
  documentStatus: string;
  retrievalQuery: string | null;
  sourcesUsed: DocumentChatCitation[];
  sourceCount: number;
}

export interface ListDocumentChatThreadsParams {
  page?: number;
  limit?: number;
}

export interface ListDocumentChatThreadsResponse {
  data: DocumentChatThread[];
  pagination: DocumentChatPagination;
}

export interface CreateDocumentChatThreadRequest {
  title?: string;
}

export interface SendDocumentChatMessageRequest {
  message: string;
  threadId?: string;
  title?: string;
}

export interface SendDocumentChatMessageResponse {
  thread: DocumentChatThread;
  userMessage: DocumentChatMessage;
  assistantMessage: DocumentChatMessage;
  context: DocumentChatContext;
}

export interface GetThreadMessagesParams {
  page?: number;
  limit?: number;
}

export interface GetThreadMessagesResponse {
  data: DocumentChatMessage[];
  thread: DocumentChatThread;
  pagination: DocumentChatPagination;
}

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;

const asBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }

  return false;
};

const asNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);
};

const normalizeRole = (value: unknown): DocumentChatRole => {
  const normalized = asString(value)?.toUpperCase();
  return normalized === "USER" ? "USER" : "ASSISTANT";
};

const mapCitation = (value: unknown, index: number): DocumentChatCitation => {
  const source = asRecord(value);

  return {
    refId: asString(source.refId) ?? `D${index + 1}`,
    chunkId: asString(source.chunkId) ?? "",
    pageStart: asNullableNumber(source.pageStart),
    excerpt: asString(source.excerpt) ?? "",
  };
};

const mapUsage = (value: unknown): DocumentChatUsage | null => {
  const source = asRecord(value);

  const promptTokens = asNumber(source.promptTokens, -1);
  const completionTokens = asNumber(source.completionTokens, -1);
  const totalTokens = asNumber(source.totalTokens, -1);

  if (promptTokens < 0 || completionTokens < 0 || totalTokens < 0) {
    return null;
  }

  return {
    promptTokens,
    completionTokens,
    totalTokens,
  };
};

const mapMessage = (
  value: unknown,
  fallbackRole: DocumentChatRole,
  fallbackIndex = 0,
): DocumentChatMessage => {
  const source = asRecord(value);
  const role = normalizeRole(source.role ?? fallbackRole);
  const citations = Array.isArray(source.citations)
    ? source.citations.map((citation, index) => mapCitation(citation, index))
    : [];

  const createdAt = asString(source.createdAt) ?? new Date().toISOString();

  return {
    id:
      asString(source.id) ??
      `${role.toLowerCase()}-${createdAt}-${fallbackIndex + 1}`,
    role,
    content: asString(source.content) ?? "",
    groundedInDocument: asBoolean(source.groundedInDocument),
    usedGeneralKnowledge: asBoolean(source.usedGeneralKnowledge),
    citations,
    followUpQuestions: asStringArray(source.followUpQuestions),
    modelUsed: asString(source.modelUsed) ?? null,
    usage: mapUsage(source.usage),
    createdAt,
  };
};

const mapThread = (value: unknown): DocumentChatThread => {
  const source = asRecord(value);
  const createdAt = asString(source.createdAt) ?? new Date().toISOString();
  const updatedAt = asString(source.updatedAt) ?? createdAt;

  return {
    id: asString(source.id) ?? "",
    fileId: asString(source.fileId) ?? "",
    fileName: asString(source.fileName) ?? "Document",
    title: asString(source.title) ?? "New document chat",
    documentStatus: asString(source.documentStatus) ?? "UNKNOWN",
    messageCount: asNumber(source.messageCount, 0),
    latestMessagePreview: asString(source.latestMessagePreview) ?? null,
    lastMessageAt: asString(source.lastMessageAt) ?? updatedAt,
    createdAt,
    updatedAt,
  };
};

const mapPagination = (
  value: unknown,
  fallbackTotal = 0,
  fallbackPage = 1,
  fallbackLimit = 10,
): DocumentChatPagination => {
  const source = asRecord(value);
  const total = asNumber(source.total, fallbackTotal);
  const limit = asNumber(source.limit, fallbackLimit);
  const totalPages =
    asNumber(source.totalPages, 0) ||
    (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);

  return {
    total,
    page: asNumber(source.page, fallbackPage),
    limit,
    totalPages,
  };
};

const mapContext = (value: unknown): DocumentChatContext => {
  const source = asRecord(value);
  const sourcesUsed = Array.isArray(source.sourcesUsed)
    ? source.sourcesUsed.map((citation, index) => mapCitation(citation, index))
    : [];

  return {
    documentReady: asBoolean(source.documentReady),
    documentStatus: asString(source.documentStatus) ?? "UNKNOWN",
    retrievalQuery: asString(source.retrievalQuery) ?? null,
    sourcesUsed,
    sourceCount: asNumber(source.sourceCount, sourcesUsed.length),
  };
};

export const documentChatService = {
  async listThreads(
    fileId: string,
    params?: ListDocumentChatThreadsParams,
  ): Promise<ListDocumentChatThreadsResponse> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const response = await apiClient.get(
      `/api/document-chat/file/${fileId}/threads`,
      {
        params: { page, limit },
      },
    );

    const data = asRecord(response.data);
    const rawThreads = Array.isArray(data.data) ? data.data : [];

    return {
      data: rawThreads.map((thread) => mapThread(thread)),
      pagination: mapPagination(
        data.pagination,
        rawThreads.length,
        page,
        limit,
      ),
    };
  },

  async createThread(
    fileId: string,
    payload?: CreateDocumentChatThreadRequest,
  ): Promise<DocumentChatThread> {
    const response = await apiClient.post(
      `/api/document-chat/file/${fileId}/threads`,
      payload ?? {},
    );
    return mapThread(asRecord(response.data).data);
  },

  async sendMessage(
    fileId: string,
    payload: SendDocumentChatMessageRequest,
  ): Promise<SendDocumentChatMessageResponse> {
    const response = await apiClient.post(
      `/api/document-chat/file/${fileId}/messages`,
      payload,
    );

    const data = asRecord(asRecord(response.data).data);

    return {
      thread: mapThread(data.thread),
      userMessage: mapMessage(data.userMessage, "USER", 0),
      assistantMessage: mapMessage(data.assistantMessage, "ASSISTANT", 1),
      context: mapContext(data.context),
    };
  },

  async getThreadMessages(
    threadId: string,
    params?: GetThreadMessagesParams,
  ): Promise<GetThreadMessagesResponse> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 30;

    const response = await apiClient.get(
      `/api/document-chat/threads/${threadId}/messages`,
      {
        params: { page, limit },
      },
    );

    const data = asRecord(response.data);
    const rawMessages = Array.isArray(data.data) ? data.data : [];
    const mappedMessages = rawMessages.map((message, index) =>
      mapMessage(message, "ASSISTANT", index),
    );

    return {
      data: mappedMessages,
      thread: mapThread(data.thread),
      pagination: mapPagination(
        data.pagination,
        mappedMessages.length,
        page,
        limit,
      ),
    };
  },

  async renameThread(
    threadId: string,
    title: string,
  ): Promise<DocumentChatThread> {
    const response = await apiClient.patch(
      `/api/document-chat/threads/${threadId}`,
      {
        title,
      },
    );
    return mapThread(asRecord(response.data).data);
  },

  async deleteThread(
    threadId: string,
  ): Promise<{ threadId: string; deleted: boolean }> {
    const response = await apiClient.delete(
      `/api/document-chat/threads/${threadId}`,
    );
    const data = asRecord(asRecord(response.data).data);
    const deletedFlag = data.deleted;
    const deleted =
      typeof deletedFlag === "boolean" ? deletedFlag : Boolean(deletedFlag);

    return {
      threadId: asString(data.threadId) ?? threadId,
      deleted,
    };
  },
};
