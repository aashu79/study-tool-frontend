import { useQuery } from "@tanstack/react-query";
import { studySessionService } from "../api/study-session.service";
import type { SessionListQueryParams } from "../api/study-session.service";

export function useStudySessions(params?: SessionListQueryParams) {
  return useQuery({
    queryKey: ["studySessions", params],
    queryFn: () => studySessionService.listSessions(params),
    staleTime: 30 * 1000,
  });
}

export function useStudySessionById(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["studySession", sessionId],
    queryFn: () => studySessionService.getSessionById(sessionId!),
    enabled: !!sessionId,
    staleTime: 30 * 1000,
  });
}
