import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiClipboard, FiTrendingUp } from "react-icons/fi";
import toast from "react-hot-toast";
import { QuizCreatePanel } from "./quiz/QuizCreatePanel";
import { QuizDetailPanel } from "./quiz/QuizDetailPanel";
import { QuizLibraryPanel } from "./quiz/QuizLibraryPanel";
import { useQuiz } from "../../lib/hooks/useQuiz";
import type {
  CreateQuizRequest,
  QuizSubmissionResult,
  SubmitQuizAnswersRequest,
} from "../../lib/api/quiz.service";

interface QuizTabProps {
  fileId: string;
  processingStatus?: string;
}

const PAGE_SIZE = 8;

const getProcessingBlockingMessage = (status?: string) => {
  if (!status || status === "COMPLETED") {
    return "";
  }

  if (status === "PROCESSING") {
    return "Quiz generation will be available after document processing completes.";
  }

  if (status === "FAILED") {
    return "Document processing failed. Reprocess the file before generating quizzes.";
  }

  return "Document is not ready yet. Please process it before generating quizzes.";
};

export const QuizTab = ({ fileId, processingStatus }: QuizTabProps) => {
  const queryClient = useQueryClient();
  const {
    createQuizFromFile,
    getUserQuizzes,
    getQuizDetails,
    submitQuizAnswers,
    getQuizAttempts,
    getQuizAttemptDetails,
  } = useQuiz();

  const [page, setPage] = useState(1);
  const [showCreatePanel, setShowCreatePanel] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    null,
  );
  const [createResetSignal, setCreateResetSignal] = useState(0);
  const [latestSubmission, setLatestSubmission] =
    useState<QuizSubmissionResult | null>(null);

  const disableGeneration =
    !!processingStatus && processingStatus !== "COMPLETED";
  const disableReason = getProcessingBlockingMessage(processingStatus);

  const quizzesQuery = useQuery({
    queryKey: ["quizList", fileId, page, PAGE_SIZE],
    queryFn: () => getUserQuizzes({ fileId, page, limit: PAGE_SIZE }),
    enabled: !!fileId,
    staleTime: 30 * 1000,
  });

  const quizzes = quizzesQuery.data?.data ?? [];

  const activeQuizId = selectedQuizId ?? quizzes[0]?.id ?? null;

  const quizDetailsQuery = useQuery({
    queryKey: ["quizDetails", activeQuizId],
    queryFn: () => getQuizDetails(activeQuizId!),
    enabled: !!activeQuizId,
    staleTime: 30 * 1000,
  });

  const attemptsQuery = useQuery({
    queryKey: ["quizAttempts", activeQuizId],
    queryFn: () => getQuizAttempts(activeQuizId!),
    enabled: !!activeQuizId,
    staleTime: 15 * 1000,
  });

  const attemptDetailsQuery = useQuery({
    queryKey: ["quizAttemptDetails", selectedAttemptId],
    queryFn: () => getQuizAttemptDetails(selectedAttemptId!),
    enabled: !!selectedAttemptId,
    staleTime: 10 * 1000,
  });

  const createQuizMutation = useMutation({
    mutationFn: (payload: CreateQuizRequest) =>
      createQuizFromFile(fileId, payload),
    onSuccess: (quiz) => {
      toast.success("Quiz generated successfully");
      setCreateResetSignal((prev) => prev + 1);
      setShowCreatePanel(false);
      setSelectedQuizId(quiz.id);
      setSelectedAttemptId(null);
      setLatestSubmission(null);
      queryClient.setQueryData(["quizDetails", quiz.id], quiz);
      queryClient.invalidateQueries({ queryKey: ["quizList", fileId] });
      queryClient.invalidateQueries({ queryKey: ["quizAttempts", quiz.id] });
      setPage(1);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to generate quiz";
      toast.error(message);
    },
  });

  const submitAnswersMutation = useMutation({
    mutationFn: (payload: {
      quizId: string;
      answers: SubmitQuizAnswersRequest["answers"];
    }) => submitQuizAnswers(payload.quizId, { answers: payload.answers }),
    onSuccess: (result) => {
      setLatestSubmission(result);
      setSelectedAttemptId(result.id);
      toast.success(
        `Attempt submitted: ${result.correctAnswers}/${result.totalQuestions}`,
      );
      queryClient.invalidateQueries({
        queryKey: ["quizDetails", result.quizId],
      });
      queryClient.invalidateQueries({
        queryKey: ["quizAttempts", result.quizId],
      });
      queryClient.invalidateQueries({
        queryKey: ["quizAttemptDetails", result.id],
      });
      queryClient.invalidateQueries({ queryKey: ["quizList", fileId] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit quiz answers";
      toast.error(message);
    },
  });

  const quizzesErrorMessage = useMemo(() => {
    const error = quizzesQuery.error;
    return error instanceof Error ? error.message : undefined;
  }, [quizzesQuery.error]);

  const quizDetailsErrorMessage = useMemo(() => {
    const error = quizDetailsQuery.error;
    return error instanceof Error ? error.message : undefined;
  }, [quizDetailsQuery.error]);

  const attemptsErrorMessage = useMemo(() => {
    const error = attemptsQuery.error;
    return error instanceof Error ? error.message : undefined;
  }, [attemptsQuery.error]);

  const attemptDetailsErrorMessage = useMemo(() => {
    const error = attemptDetailsQuery.error;
    return error instanceof Error ? error.message : undefined;
  }, [attemptDetailsQuery.error]);

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 sm:p-5">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Quiz Studio
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Build targeted quizzes from this document and review every
                attempt with AI-generated insights.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-cyan-700 font-semibold">
                  Quizzes
                </p>
                <p className="text-sm font-semibold text-cyan-900 flex items-center gap-1">
                  <FiClipboard size={14} />
                  {quizzesQuery.data?.pagination.total ?? quizzes.length}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-emerald-700 font-semibold">
                  Attempts
                </p>
                <p className="text-sm font-semibold text-emerald-900 flex items-center gap-1">
                  <FiTrendingUp size={14} />
                  {attemptsQuery.data?.count ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[22rem,1fr] gap-4">
          <div className="space-y-4">
            <QuizCreatePanel
              key={createResetSignal}
              isOpen={showCreatePanel}
              onToggle={() => setShowCreatePanel((prev) => !prev)}
              onSubmit={(payload) => createQuizMutation.mutate(payload)}
              isSubmitting={createQuizMutation.isPending}
              disabled={disableGeneration}
              disableReason={disableReason}
            />

            <QuizLibraryPanel
              quizzes={quizzes}
              selectedQuizId={activeQuizId}
              isLoading={quizzesQuery.isLoading}
              errorMessage={quizzesErrorMessage}
              isRefreshing={quizzesQuery.isFetching}
              pagination={quizzesQuery.data?.pagination}
              onSelectQuiz={(quizId) => {
                setSelectedQuizId(quizId);
                setSelectedAttemptId(null);
              }}
              onPageChange={(nextPage) => setPage(nextPage)}
              onRetry={() => quizzesQuery.refetch()}
            />
          </div>

          <QuizDetailPanel
            key={activeQuizId ?? "empty"}
            quiz={quizDetailsQuery.data}
            isLoading={quizDetailsQuery.isLoading && !!activeQuizId}
            loadError={quizDetailsErrorMessage}
            attempts={attemptsQuery.data?.data ?? []}
            areAttemptsLoading={attemptsQuery.isLoading && !!activeQuizId}
            attemptsError={attemptsErrorMessage}
            attemptDetails={attemptDetailsQuery.data}
            areAttemptDetailsLoading={
              attemptDetailsQuery.isLoading && !!selectedAttemptId
            }
            attemptDetailsError={attemptDetailsErrorMessage}
            latestSubmission={latestSubmission}
            isSubmitting={submitAnswersMutation.isPending}
            onSubmitAnswers={(payload) => {
              if (!activeQuizId) {
                toast.error("Please select a quiz first.");
                return;
              }
              submitAnswersMutation.mutate({
                quizId: activeQuizId,
                answers: payload.answers,
              });
            }}
            onSelectAttempt={(attemptId) => setSelectedAttemptId(attemptId)}
            onClearAttemptSelection={() => setSelectedAttemptId(null)}
            onRetryQuizDetails={() => quizDetailsQuery.refetch()}
            onRetryAttempts={() => attemptsQuery.refetch()}
          />
        </div>
      </div>
    </div>
  );
};
