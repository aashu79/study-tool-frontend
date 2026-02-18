import { apiClient } from "./client";

export type FlashcardType =
  | "DEFINITION"
  | "FORMULA"
  | "CONCEPT"
  | "PROCESS"
  | "EXAMPLE"
  | "COMPARISON"
  | "APPLICATION";

export interface CreateFlashcardSetRequest {
  title?: string;
  description?: string;
  numberOfCards?: number;
  focusAreas?: string[];
  specialInstruction?: string;
  includeFormulas?: boolean;
  includeExamples?: boolean;
  useVectorSearch?: boolean;
  searchQuery?: string;
  chunkLimit?: number;
}

export interface FlashcardCard {
  id: string;
  cardIndex: number;
  front: string;
  back: string;
  hint: string | null;
  topic: string | null;
  type: FlashcardType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardFileReference {
  id: string;
  filename: string;
  mimetype: string;
}

export interface FlashcardSetBase {
  id: string;
  fileId: string;
  userId: string;
  title: string;
  description: string | null;
  focusAreas: string[];
  generationInstruction: string | null;
  cardCount: number;
  modelUsed: string;
  createdAt: string;
  updatedAt: string;
  file?: FlashcardFileReference;
}

export interface FlashcardSetListItem extends FlashcardSetBase {
  cardsCount?: number;
}

export interface FlashcardSetDetails extends FlashcardSetBase {
  cards: FlashcardCard[];
}

export interface FlashcardSetListQueryParams {
  page?: number;
  limit?: number;
  fileId?: string;
}

export interface FlashcardSetPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FlashcardSetListResponse {
  data: FlashcardSetListItem[];
  pagination: FlashcardSetPagination;
}

export interface FileFlashcardSetListResponse {
  data: FlashcardSetListItem[];
  count: number;
}

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

const asNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

const normalizeFlashcardType = (value: unknown): FlashcardType => {
  const normalized = asString(value)?.toUpperCase();
  if (
    normalized === "DEFINITION" ||
    normalized === "FORMULA" ||
    normalized === "CONCEPT" ||
    normalized === "PROCESS" ||
    normalized === "EXAMPLE" ||
    normalized === "COMPARISON" ||
    normalized === "APPLICATION"
  ) {
    return normalized;
  }
  return "CONCEPT";
};

const mapCard = (value: unknown, index: number): FlashcardCard => {
  const source = asRecord(value);
  return {
    id: asString(source.id) ?? `card-${index + 1}`,
    cardIndex: asNumber(source.cardIndex, index + 1),
    front: asString(source.front) ?? "",
    back: asString(source.back) ?? "",
    hint: asString(source.hint) ?? null,
    topic: asString(source.topic) ?? null,
    type: normalizeFlashcardType(source.type),
    tags: asStringArray(source.tags),
    createdAt: asString(source.createdAt) ?? "",
    updatedAt: asString(source.updatedAt) ?? asString(source.createdAt) ?? "",
  };
};

const mapSetBase = (value: unknown): FlashcardSetBase => {
  const source = asRecord(value);
  const file = asRecord(source.file);
  const hasFile = Boolean(asString(file.id) && asString(file.filename));

  return {
    id: asString(source.id) ?? "",
    fileId: asString(source.fileId) ?? "",
    userId: asString(source.userId) ?? "",
    title: asString(source.title) ?? "Untitled Flashcard Set",
    description: asString(source.description) ?? null,
    focusAreas: asStringArray(source.focusAreas),
    generationInstruction: asString(source.generationInstruction) ?? null,
    cardCount: asNumber(source.cardCount, 0),
    modelUsed: asString(source.modelUsed) ?? "",
    createdAt: asString(source.createdAt) ?? "",
    updatedAt: asString(source.updatedAt) ?? asString(source.createdAt) ?? "",
    file: hasFile
      ? {
          id: asString(file.id) ?? "",
          filename: asString(file.filename) ?? "",
          mimetype: asString(file.mimetype) ?? "",
        }
      : undefined,
  };
};

const mapSetListItem = (value: unknown): FlashcardSetListItem => {
  const source = asRecord(value);
  const base = mapSetBase(source);
  const cardsCount = asNumber(source.cardsCount, base.cardCount);
  return {
    ...base,
    cardsCount,
  };
};

const mapSetDetails = (value: unknown): FlashcardSetDetails => {
  const source = asRecord(value);
  const base = mapSetBase(source);
  const rawCards = Array.isArray(source.cards) ? source.cards : [];
  const cards = rawCards.map((card, index) => mapCard(card, index));

  return {
    ...base,
    cardCount: base.cardCount || cards.length,
    cards,
  };
};

const mapPagination = (value: unknown, fallbackTotal = 0): FlashcardSetPagination => {
  const source = asRecord(value);
  const limit = asNumber(source.limit, 10);
  const total = asNumber(source.total, fallbackTotal);
  const totalPages =
    asNumber(source.totalPages, 0) || (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);

  return {
    page: asNumber(source.page, 1),
    limit,
    total,
    totalPages,
  };
};

export const flashcardService = {
  async createFlashcardSetFromFile(
    fileId: string,
    payload?: CreateFlashcardSetRequest,
  ): Promise<FlashcardSetDetails> {
    const response = await apiClient.post(
      `/api/flashcards/file/${fileId}`,
      payload || {},
    );
    return mapSetDetails(response.data.data);
  },

  async listUserFlashcardSets(
    params?: FlashcardSetListQueryParams,
  ): Promise<FlashcardSetListResponse> {
    const response = await apiClient.get("/api/flashcards", { params });
    const rawSets = Array.isArray(response.data.data) ? response.data.data : [];
    return {
      data: rawSets.map((set: unknown) => mapSetListItem(set)),
      pagination: mapPagination(response.data.pagination, rawSets.length),
    };
  },

  async listFileFlashcardSets(fileId: string): Promise<FileFlashcardSetListResponse> {
    const response = await apiClient.get(`/api/flashcards/file/${fileId}`);
    const rawSets = Array.isArray(response.data.data) ? response.data.data : [];
    return {
      data: rawSets.map((set: unknown) => mapSetListItem(set)),
      count: asNumber(response.data.count, rawSets.length),
    };
  },

  async getFlashcardSet(setId: string): Promise<FlashcardSetDetails> {
    const response = await apiClient.get(`/api/flashcards/${setId}`);
    return mapSetDetails(response.data.data);
  },

  async renameFlashcardSet(
    setId: string,
    title: string,
  ): Promise<FlashcardSetDetails> {
    const response = await apiClient.patch(`/api/flashcards/${setId}`, { title });
    return mapSetDetails(response.data.data);
  },

  async deleteFlashcardSet(setId: string): Promise<void> {
    await apiClient.delete(`/api/flashcards/${setId}`);
  },
};
