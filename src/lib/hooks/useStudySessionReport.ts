import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studySessionService } from "../api/study-session.service";

export function useStudySessionReport(sessionId: string | undefined) {
  const queryClient = useQueryClient();

  const reportQuery = useQuery({
    queryKey: ["studySessionReport", sessionId],
    queryFn: () => studySessionService.getSessionReport(sessionId!),
    enabled: !!sessionId,
    staleTime: 60 * 1000,
  });

  const sendEmailMutation = useMutation({
    mutationFn: ({ force }: { force?: boolean }) =>
      studySessionService.sendReportEmail(sessionId!, force),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["studySessionReport", sessionId],
      });
    },
  });

  return { reportQuery, sendEmailMutation };
}
