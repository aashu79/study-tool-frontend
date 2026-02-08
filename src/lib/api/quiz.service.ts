import { apiClient } from "./client";

export type QuizDifficulty = "EASY" | "MEDIUM" | "HARD" | "MIXED";
export type QuizDifficultyInput = "easy" | "medium" | "hard" | "mixed";

export interface CreateQuizRequest {
  title?: string;
  numberOfQuestions?: number;
  difficulty?: QuizDifficultyInput;
  specialInstruction?: string;
  searchQuery?: string;
  useVectorSearch?: boolean;
  chunkLimit?: number;
}

export interface QuizQuestion {
  id: string;
  quizId?: string;
  questionIndex?: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface QuizInsight {
  id: string;
  strengths: string;
  weaknesses: string;
  weakAreas: string[];
  detailedInsights: string;
  recommendedActions: string;
  modelUsed?: string;
  createdAt?: string;
}

export interface QuizAttemptSummary {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  createdAt: string;
}

export interface QuizFileReference {
  id: string;
  filename: string;
  mimetype: string;
}

export interface QuizListItem {
  id: string;
  fileId: string;
  userId: string;
  title: string;
  specialInstruction: string | null;
  difficulty: QuizDifficulty;
  questionCount: number;
  modelUsed: string;
  createdAt: string;
  updatedAt: string;
  file?: QuizFileReference;
  _count?: {
    attempts: number;
    insights: number;
  };
}

export interface QuizDetails extends QuizListItem {
  questions: QuizQuestion[];
  attempts: QuizAttemptSummary[];
  insights: QuizInsight[];
}

export interface QuizAnswerSubmission {
  questionId: string;
  selectedOptionIndex: number;
}

export interface SubmitQuizAnswersRequest {
  answers: QuizAnswerSubmission[];
}

export interface QuizAttemptAnswer {
  id: string;
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  selectedOption?: string;
  correctOption?: string;
  question: QuizQuestion;
}

export interface QuizSubmissionResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  answers: QuizAttemptAnswer[];
  insight: QuizInsight | null;
  createdAt: string;
}

export interface QuizAttempt extends QuizAttemptSummary {
  quizId: string;
  userId: string;
  insight: QuizInsight | null;
}

export interface QuizAttemptDetails {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  answers: QuizAttemptAnswer[];
  insight: QuizInsight | null;
  quiz: {
    id: string;
    title: string;
    difficulty: QuizDifficulty;
    questionCount: number;
  };
  createdAt: string;
}

export interface QuizListQueryParams {
  page?: number;
  limit?: number;
  fileId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QuizListResponse {
  data: QuizListItem[];
  pagination: PaginationMeta;
}

export interface QuizAttemptsResponse {
  data: QuizAttempt[];
  count: number;
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : ({} as Record<string, unknown>);

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

const asNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => String(item)) : [];

const pickString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    const normalized = asString(value);
    if (normalized) {
      return normalized;
    }
  }
  return undefined;
};

const normalizeDifficulty = (value: unknown): QuizDifficulty => {
  const normalized = asString(value)?.toUpperCase();
  if (
    normalized === "EASY" ||
    normalized === "MEDIUM" ||
    normalized === "HARD" ||
    normalized === "MIXED"
  ) {
    return normalized;
  }
  return "MEDIUM";
};

const mapInsight = (value: unknown): QuizInsight | null => {
  const source = asRecord(value);
  const id = pickString(source.id);
  if (!id) {
    return null;
  }

  return {
    id,
    strengths: pickString(source.strengths) ?? "",
    weaknesses: pickString(source.weaknesses) ?? "",
    weakAreas: asStringArray(source.weakAreas),
    detailedInsights: pickString(source.detailedInsights) ?? "",
    recommendedActions: pickString(source.recommendedActions) ?? "",
    modelUsed: pickString(source.modelUsed),
    createdAt: pickString(source.createdAt),
  };
};

const mapQuestion = (value: unknown, fallbackIndex = 0): QuizQuestion => {
  const source = asRecord(value);
  const id = pickString(source.id, source.questionId) ?? `question-${fallbackIndex + 1}`;
  const options = asStringArray(source.options);

  return {
    id,
    quizId: pickString(source.quizId),
    questionIndex: asNumber(source.questionIndex, fallbackIndex + 1),
    questionText: pickString(source.questionText) ?? "",
    options,
    correctOptionIndex: asNumber(source.correctOptionIndex, -1),
    explanation: pickString(source.explanation),
  };
};

const mapAttemptAnswer = (value: unknown, index: number): QuizAttemptAnswer => {
  const source = asRecord(value);
  const rawQuestion = source.question ?? source;
  const question = mapQuestion(rawQuestion, index);
  const selectedOptionIndex = asNumber(source.selectedOptionIndex, -1);
  const fallbackCorrectIndex = question.correctOptionIndex;
  const resolvedCorrectIndex =
    asNumber(source.correctOptionIndex, fallbackCorrectIndex) ?? fallbackCorrectIndex;

  const normalizedQuestion: QuizQuestion = {
    ...question,
    correctOptionIndex: resolvedCorrectIndex,
    questionIndex: asNumber(source.questionIndex, question.questionIndex ?? index + 1),
    explanation: pickString(source.explanation, question.explanation),
  };

  const selectedOption =
    pickString(source.selectedOption) ??
    (selectedOptionIndex >= 0
      ? normalizedQuestion.options[selectedOptionIndex]
      : undefined);
  const correctOption =
    pickString(source.correctOption) ??
    (resolvedCorrectIndex >= 0
      ? normalizedQuestion.options[resolvedCorrectIndex]
      : undefined);

  return {
    id: pickString(source.id) ?? `${normalizedQuestion.id}-${index + 1}`,
    questionId:
      pickString(source.questionId, normalizedQuestion.id) ?? normalizedQuestion.id,
    selectedOptionIndex,
    isCorrect: Boolean(source.isCorrect),
    selectedOption,
    correctOption,
    question: normalizedQuestion,
  };
};

const mapAttemptSummary = (value: unknown): QuizAttempt => {
  const source = asRecord(value);
  return {
    id: pickString(source.id) ?? "",
    quizId: pickString(source.quizId, asRecord(source.quiz).id) ?? "",
    userId: pickString(source.userId) ?? "",
    score: asNumber(source.score, 0),
    totalQuestions: asNumber(source.totalQuestions, 0),
    correctAnswers: asNumber(source.correctAnswers, 0),
    percentage: asNumber(source.percentage, 0),
    createdAt: pickString(source.createdAt, source.submittedAt) ?? "",
    insight: mapInsight(source.insight ?? source.insights),
  };
};

const mapQuizListItem = (value: unknown): QuizListItem => {
  const source = asRecord(value);
  const file = asRecord(source.file);
  const count = asRecord(source._count);

  return {
    id: pickString(source.id) ?? "",
    fileId: pickString(source.fileId, file.id) ?? "",
    userId: pickString(source.userId) ?? "",
    title: pickString(source.title) ?? "Untitled Quiz",
    specialInstruction: pickString(source.specialInstruction) ?? null,
    difficulty: normalizeDifficulty(source.difficulty),
    questionCount: asNumber(source.questionCount, 0),
    modelUsed: pickString(source.modelUsed) ?? "",
    createdAt: pickString(source.createdAt) ?? "",
    updatedAt: pickString(source.updatedAt, source.createdAt) ?? "",
    file:
      pickString(file.id) && pickString(file.filename)
        ? {
            id: pickString(file.id) ?? "",
            filename: pickString(file.filename) ?? "",
            mimetype: pickString(file.mimetype) ?? "",
          }
        : undefined,
    _count: {
      attempts: asNumber(count.attempts, 0),
      insights: asNumber(count.insights, 0),
    },
  };
};

const mapQuizDetails = (value: unknown): QuizDetails => {
  const source = asRecord(value);
  const listItem = mapQuizListItem(source);
  const questions = Array.isArray(source.questions)
    ? source.questions.map((question, index) => mapQuestion(question, index))
    : [];

  const attempts = Array.isArray(source.attempts)
    ? source.attempts.map((attempt) => mapAttemptSummary(attempt))
    : [];

  const mappedInsights = Array.isArray(source.insights)
    ? source.insights.map((insight) => mapInsight(insight)).filter(Boolean)
    : [];

  return {
    ...listItem,
    questionCount: listItem.questionCount || questions.length,
    questions,
    attempts,
    insights: mappedInsights as QuizInsight[],
  };
};

const mapSubmissionResult = (
  value: unknown,
  fallbackQuizId: string,
): QuizSubmissionResult => {
  const source = asRecord(value);
  const quiz = asRecord(source.quiz);
  const answers = Array.isArray(source.answers)
    ? source.answers.map((answer, index) => mapAttemptAnswer(answer, index))
    : [];

  return {
    id: pickString(source.id) ?? "",
    quizId: pickString(source.quizId, quiz.id) ?? fallbackQuizId,
    userId: pickString(source.userId) ?? "",
    score: asNumber(source.score, 0),
    totalQuestions: asNumber(source.totalQuestions, answers.length),
    correctAnswers: asNumber(source.correctAnswers, 0),
    percentage: asNumber(source.percentage, 0),
    answers,
    insight: mapInsight(source.insight ?? source.insights),
    createdAt: pickString(source.createdAt, source.submittedAt) ?? "",
  };
};

const mapAttemptDetails = (value: unknown): QuizAttemptDetails => {
  const source = asRecord(value);
  const quizSource = asRecord(source.quiz);
  const answers = Array.isArray(source.answers)
    ? source.answers.map((answer, index) => mapAttemptAnswer(answer, index))
    : [];

  const questionCount = asNumber(
    quizSource.questionCount,
    asNumber(source.totalQuestions, answers.length),
  );

  return {
    id: pickString(source.id) ?? "",
    quizId: pickString(source.quizId, quizSource.id) ?? "",
    userId: pickString(source.userId) ?? "",
    score: asNumber(source.score, 0),
    totalQuestions: asNumber(source.totalQuestions, questionCount),
    correctAnswers: asNumber(source.correctAnswers, 0),
    percentage: asNumber(source.percentage, 0),
    answers,
    insight: mapInsight(source.insight ?? source.insights),
    quiz: {
      id: pickString(quizSource.id, source.quizId) ?? "",
      title: pickString(quizSource.title) ?? "Quiz Attempt",
      difficulty: normalizeDifficulty(quizSource.difficulty),
      questionCount,
    },
    createdAt: pickString(source.createdAt, source.submittedAt) ?? "",
  };
};

export const quizService = {
  async createQuizFromFile(
    fileId: string,
    payload?: CreateQuizRequest,
  ): Promise<QuizDetails> {
    const response = await apiClient.post(`/api/quiz/file/${fileId}`, payload || {});
    return mapQuizDetails(response.data.data);
  },

  async getUserQuizzes(params?: QuizListQueryParams): Promise<QuizListResponse> {
    const response = await apiClient.get("/api/quiz", { params });
    const data = Array.isArray(response.data.data) ? response.data.data : [];
    return {
      data: data.map((quiz: unknown) => mapQuizListItem(quiz)),
      pagination: {
        page: asNumber(response.data?.pagination?.page, 1),
        limit: asNumber(response.data?.pagination?.limit, 10),
        total: asNumber(response.data?.pagination?.total, data.length),
        totalPages: asNumber(response.data?.pagination?.totalPages, 1),
      },
    };
  },

  async getQuizDetails(quizId: string): Promise<QuizDetails> {
    const response = await apiClient.get(`/api/quiz/${quizId}`);
    return mapQuizDetails(response.data.data);
  },

  async submitQuizAnswers(
    quizId: string,
    payload: SubmitQuizAnswersRequest,
  ): Promise<QuizSubmissionResult> {
    const response = await apiClient.post(`/api/quiz/${quizId}/submit`, payload);
    return mapSubmissionResult(response.data.data, quizId);
  },

  async getQuizAttempts(quizId: string): Promise<QuizAttemptsResponse> {
    const response = await apiClient.get(`/api/quiz/${quizId}/attempts`);
    const data = Array.isArray(response.data.data) ? response.data.data : [];
    return {
      data: data.map((attempt: unknown) => mapAttemptSummary(attempt)),
      count: asNumber(response.data.count, data.length),
    };
  },

  async getQuizAttemptDetails(attemptId: string): Promise<QuizAttemptDetails> {
    const response = await apiClient.get(`/api/quiz/attempt/${attemptId}`);
    return mapAttemptDetails(response.data.data);
  },
};
