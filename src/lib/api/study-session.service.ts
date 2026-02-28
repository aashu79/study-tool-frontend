import { apiClient } from "./client";
import type { PaginationMeta } from "./quiz.service";

export type StudySessionStatus = "ACTIVE" | "COMPLETED" | "INCOMPLETE";

export type StudyEventType =
  | "SESSION_STARTED"
  | "SESSION_ENDED"
  | "VIEW_SUMMARY"
  | "OPEN_FLASHCARD"
  | "START_QUIZ"
  | "SUBMIT_QUIZ"
  | "ANSWER_QUESTION"
  | "CUSTOM_ACTIVITY";

export type DistractionType =
  | "TAB_SWITCH"
  | "WINDOW_BLUR"
  | "INACTIVITY_TIMEOUT"
  | "APP_BACKGROUND"
  | "OTHER";

export interface StudySessionSummary {
  totalDurationSeconds: number;
  distractionRatioPercentage: number;
  focusScore: number;
  distractionCount: number;
}

export interface StudySession {
  id: string;
  userId: string;
  fileId: string;
  sessionStart: string;
  sessionEnd: string | null;
  status: StudySessionStatus;
  focusTimeSeconds: number;
  idleTimeSeconds: number;
  distractionCount: number;
  createdAt: string;
  updatedAt: string;
  summary?: StudySessionSummary;
}

export interface StartStudySessionRequest {
  fileId: string;
  sessionStart?: string;
  initialEventData?: Record<string, unknown>;
}

export interface LogStudyEventRequest {
  eventType: StudyEventType;
  eventData?: Record<string, unknown>;
  timestamp?: string;
}

export interface LogDistractionRequest {
  distractionType: DistractionType;
  durationSeconds: number;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

export interface EndStudySessionRequest {
  status?: Extract<StudySessionStatus, "COMPLETED" | "INCOMPLETE">;
  sessionEnd?: string;
  focusTimeSeconds?: number;
  idleTimeSeconds?: number;
}

// ── List / Detail / Report ────────────────────────────────────────────────────

export interface SessionFileRef {
  id: string;
  filename: string;
  mimetype: string;
}

export interface SessionListItem extends StudySession {
  file?: SessionFileRef;
  _count?: { events: number; distractions: number };
}

export interface SessionListResponse {
  data: SessionListItem[];
  pagination: PaginationMeta;
}

export interface SessionListQueryParams {
  page?: number;
  limit?: number;
  fileId?: string;
  status?: StudySessionStatus;
}

export interface SessionEventItem {
  id: string;
  sessionId: string;
  eventType: string;
  eventData?: Record<string, unknown>;
  timestamp: string;
}

export interface SessionDistractionItem {
  id: string;
  sessionId: string;
  distractionType: DistractionType;
  durationSeconds: number;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface SessionReportDistractions {
  items: SessionDistractionItem[];
  totalDurationSeconds: number;
  countByType: Record<string, number>;
}

export interface SessionReportActivity {
  events: SessionEventItem[];
  countByType: Record<string, number>;
}

export interface SessionReportQuizAttempt {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  createdAt: string;
  quiz?: { id: string; title: string; difficulty: string };
}

export interface SessionReportQuiz {
  attempts: SessionReportQuizAttempt[];
  averageScore: number;
  bestScore: number;
  totalAttempts: number;
}

export interface SessionReportImprovement {
  recommendations: string[];
  nextSessionChecklist: string[];
  overallRating: string;
}

export interface SessionReportEmailDelivery {
  sent: boolean;
  emailAddress?: string;
  sentAt?: string;
  canResend: boolean;
}

export interface SessionReport {
  session: SessionListItem;
  activity: SessionReportActivity;
  distractions: SessionReportDistractions;
  quiz: SessionReportQuiz;
  improvement: SessionReportImprovement;
  emailDelivery: SessionReportEmailDelivery;
}

export interface SendReportEmailResponse {
  success: boolean;
  message: string;
  emailAddress?: string;
  sentAt?: string;
}

const SILENT_HEADERS = { "X-Skip-Error-Toast": "true" } as const;

export const studySessionService = {
  async startStudySession(
    payload: StartStudySessionRequest,
  ): Promise<StudySession> {
    const response = await apiClient.post("/api/study-sessions", payload);
    return response.data.data as StudySession;
  },

  async getActiveStudySession(fileId?: string): Promise<StudySession | null> {
    const response = await apiClient.get("/api/study-sessions/active", {
      params: fileId ? { fileId } : undefined,
      headers: SILENT_HEADERS,
    });
    return (response.data.data as StudySession | null) ?? null;
  },

  async logStudyEvent(
    sessionId: string,
    payload: LogStudyEventRequest,
  ): Promise<void> {
    await apiClient.post(`/api/study-sessions/${sessionId}/events`, payload, {
      headers: SILENT_HEADERS,
    });
  },

  async logDistraction(
    sessionId: string,
    payload: LogDistractionRequest,
  ): Promise<void> {
    await apiClient.post(
      `/api/study-sessions/${sessionId}/distractions`,
      payload,
      {
        headers: SILENT_HEADERS,
      },
    );
  },

  async endStudySession(
    sessionId: string,
    payload?: EndStudySessionRequest,
  ): Promise<StudySession> {
    const response = await apiClient.patch(
      `/api/study-sessions/${sessionId}/end`,
      payload ?? {},
    );
    return response.data.data as StudySession;
  },

  async listSessions(
    params?: SessionListQueryParams,
  ): Promise<SessionListResponse> {
    const response = await apiClient.get("/api/study-sessions", {
      params,
      headers: SILENT_HEADERS,
    });
    return response.data as SessionListResponse;
  },

  async getSessionById(sessionId: string): Promise<SessionListItem> {
    const response = await apiClient.get(`/api/study-sessions/${sessionId}`, {
      headers: SILENT_HEADERS,
    });
    return response.data.data as SessionListItem;
  },

  async getSessionReport(sessionId: string): Promise<SessionReport> {
    const response = await apiClient.get(
      `/api/study-sessions/${sessionId}/report`,
      { headers: SILENT_HEADERS },
    );
    return response.data.data as SessionReport;
  },

  async sendReportEmail(
    sessionId: string,
    force = false,
  ): Promise<SendReportEmailResponse> {
    const response = await apiClient.post(
      `/api/study-sessions/${sessionId}/report/email`,
      { force },
    );
    return response.data as SendReportEmailResponse;
  },
};
