import { apiClient } from "./client";

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

const SILENT_HEADERS = { "X-Skip-Error-Toast": "true" } as const;

export const studySessionService = {
  async startStudySession(payload: StartStudySessionRequest): Promise<StudySession> {
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
};
