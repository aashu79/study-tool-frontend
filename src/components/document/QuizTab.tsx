import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronDown,
  FiClipboard,
  FiList,
  FiPlus,
  FiPlayCircle,
  FiRefreshCw,
  FiXCircle,
} from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { useQuiz } from "../../lib/hooks/useQuiz";
import type {
  CreateQuizRequest,
  QuizAttempt,
  QuizAttemptDetails,
  QuizDifficulty,
  QuizDifficultyInput,
  QuizSubmissionResult,
  SubmitQuizAnswersRequest,
} from "../../lib/api/quiz.service";
import { toRenderableMarkdown } from "../../lib/utils/markdown";
import {
  Drawer,
  Modal,
  SkeletonBlock,
} from "./DocumentOverlay";

interface QuizTabProps {
  fileId: string;
  processingStatus?: string;
  studySessionId?: string | null;
}

const PAGE_SIZE = 8;

const DIFFICULTY_OPTIONS: Array<{
  value: QuizDifficultyInput;
  label: string;
}> = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "mixed", label: "Mixed" },
];

const difficultyBadgeStyles: Record<QuizDifficulty, string> = {
  EASY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HARD: "bg-rose-50 text-rose-700 border-rose-200",
  MIXED: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const normalizeNumericValue = (
  value: number,
  min: number,
  max: number,
  fallback: number,
) => (Number.isFinite(value) ? clamp(value, min, max) : fallback);

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

const getScoreBadge = (percentage: number) => {
  if (percentage >= 70) {
    return "bg-emerald-100 text-emerald-700";
  }
  if (percentage >= 40) {
    return "bg-amber-100 text-amber-700";
  }
  return "bg-rose-100 text-rose-700";
};

const formatDate = (value?: string) => {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
};

const MarkdownBlock = ({ content }: { content?: string | null }) => {
  const markdown = toRenderableMarkdown(content);
  if (!markdown) {
    return null;
  }

  return (
    <div className="prose prose-sm max-w-none text-slate-700">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};

const AttemptAccordion = ({
  attempt,
  isOpen,
  onToggle,
  isLoading,
  errorMessage,
  detailContent,
}: {
  attempt: QuizAttempt;
  isOpen: boolean;
  onToggle: () => void;
  isLoading: boolean;
  errorMessage?: string;
  detailContent?: QuizAttemptDetails;
}) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200">
    <button
      type="button"
      onClick={onToggle}
      className="flex min-h-14 w-full items-center justify-between gap-4 bg-white px-5 py-4 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-inset"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">
          Attempt on {formatDateTime(attempt.createdAt)}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {attempt.correctAnswers}/{attempt.totalQuestions} correct
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${getScoreBadge(
            attempt.percentage,
          )}`}
        >
          {attempt.percentage.toFixed(1)}%
        </span>
        <FiChevronDown
          size={18}
          className={`text-slate-400 transition ${isOpen ? "rotate-180" : ""}`}
        />
      </div>
    </button>

    {isOpen ? (
      <div className="border-t border-slate-200 bg-slate-50 px-5 py-5">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonBlock className="h-16 w-full rounded-2xl" />
            <SkeletonBlock className="h-32 w-full rounded-2xl" />
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : detailContent ? (
          <div className="space-y-4">
            {detailContent.answers.map((answer, index) => {
              const question = answer.question;

              return (
                <div
                  key={answer.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Q{question.questionIndex ?? index + 1}. {question.questionText}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        answer.isCorrect
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {answer.isCorrect ? (
                        <FiCheckCircle size={14} />
                      ) : (
                        <FiXCircle size={14} />
                      )}
                      {answer.isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = optionIndex === answer.selectedOptionIndex;
                      const isCorrect = optionIndex === question.correctOptionIndex;

                      return (
                        <div
                          key={`${answer.id}-${optionIndex}`}
                          className={`rounded-xl border px-4 py-3 text-sm ${
                            isCorrect
                              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                              : isSelected
                                ? "border-rose-300 bg-rose-50 text-rose-900"
                                : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          <span className="mr-2 font-semibold">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          {option}
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Explanation
                      </p>
                      <div className="mt-2">
                        <MarkdownBlock content={question.explanation} />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    ) : null}
  </div>
);

const QuizHistoryDrawer = ({
  quizzes,
  activeQuizId,
  isOpen,
  onClose,
  onOpenQuiz,
  page,
  totalPages,
  currentPage,
  onPreviousPage,
  onNextPage,
}: {
  quizzes: Array<{
    id: string;
    title: string;
    difficulty: QuizDifficulty;
    questionCount: number;
    createdAt: string;
    _count?: { attempts: number };
  }>;
  activeQuizId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenQuiz: (quizId: string) => void;
  page: number;
  totalPages: number;
  currentPage: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}) => (
  <Drawer
    open={isOpen}
    onClose={onClose}
    title="Quiz History"
    description="Switch between saved quizzes for this document."
  >
    {quizzes.length === 0 ? (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm font-medium text-slate-700">No quizzes yet</p>
      </div>
    ) : (
      <div className="space-y-3">
        {quizzes.map((quiz) => {
          const isActive = quiz.id === activeQuizId;

          return (
            <button
              type="button"
              key={quiz.id}
              onClick={() => onOpenQuiz(quiz.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                isActive
                  ? "border-teal-200 bg-teal-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                  {quiz.title}
                </p>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    difficultyBadgeStyles[quiz.difficulty]
                  }`}
                >
                  {quiz.difficulty}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{quiz.questionCount} questions</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{quiz._count?.attempts ?? 0} attempts</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{formatDate(quiz.createdAt)}</span>
              </div>
            </button>
          );
        })}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between pt-2 text-sm">
            <button
              type="button"
              onClick={onPreviousPage}
              disabled={page <= 1}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={onNextPage}
              disabled={page >= totalPages}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    )}
  </Drawer>
);

const QuizConfigModal = ({
  isOpen,
  onClose,
  disableReason,
  disableGeneration,
  isSubmitting,
  formState,
  onChange,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  disableReason: string;
  disableGeneration: boolean;
  isSubmitting: boolean;
  formState: {
    title: string;
    numberOfQuestions: number;
    difficulty: QuizDifficultyInput;
    specialInstruction: string;
  };
  onChange: Dispatch<
    SetStateAction<{
      title: string;
      numberOfQuestions: number;
      difficulty: QuizDifficultyInput;
      specialInstruction: string;
    }>
  >;
  onSubmit: () => void;
}) => (
  <Modal
    open={isOpen}
    onClose={onClose}
    title="New Quiz"
    description="Set the title, question count, and difficulty before generating."
  >
    <div className="space-y-5">
      {disableReason ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {disableReason}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Title
          <span className="ml-1 text-slate-400">(optional)</span>
        </label>
        <input
          type="text"
          value={formState.title}
          onChange={(event) =>
            onChange((prev) => ({ ...prev, title: event.target.value }))
          }
          placeholder="e.g., Chapter 4 review"
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Number of Questions
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={formState.numberOfQuestions}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                numberOfQuestions: normalizeNumericValue(
                  Number(event.target.value),
                  1,
                  50,
                  10,
                ),
              }))
            }
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Difficulty
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    difficulty: option.value,
                  }))
                }
                className={`min-h-11 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  formState.difficulty === option.value
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Special Instructions
          <span className="ml-1 text-slate-400">(optional)</span>
        </label>
        <textarea
          rows={4}
          value={formState.specialInstruction}
          onChange={(event) =>
            onChange((prev) => ({
              ...prev,
              specialInstruction: event.target.value,
            }))
          }
          placeholder="e.g., Focus on definition-style questions from chapter 2."
          className="w-full resize-none rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={disableGeneration || isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FiClipboard size={16} />
        {isSubmitting ? "Generating..." : "Generate Quiz"}
      </button>
    </div>
  </Modal>
);

export const QuizTab = ({
  fileId,
  processingStatus,
  studySessionId,
}: QuizTabProps) => {
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
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [mode, setMode] = useState<"overview" | "taking">("overview");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [latestSubmission, setLatestSubmission] =
    useState<QuizSubmissionResult | null>(null);
  const [formState, setFormState] = useState({
    title: "",
    numberOfQuestions: 10,
    difficulty: "medium" as QuizDifficultyInput,
    specialInstruction: "",
  });

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

  useEffect(() => {
    if (quizzes.length === 0) {
      setSelectedQuizId(null);
      return;
    }

    if (!selectedQuizId || !quizzes.some((quiz) => quiz.id === selectedQuizId)) {
      setSelectedQuizId(quizzes[0].id);
    }
  }, [quizzes, selectedQuizId]);

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
      setSelectedQuizId(quiz.id);
      setSelectedAttemptId(null);
      setLatestSubmission(null);
      setMode("overview");
      setAnswers({});
      setPage(1);
      setShowConfigModal(false);
      queryClient.setQueryData(["quizDetails", quiz.id], quiz);
      queryClient.invalidateQueries({ queryKey: ["quizList", fileId] });
      queryClient.invalidateQueries({ queryKey: ["quizAttempts", quiz.id] });
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
      sessionId?: string;
    }) =>
      submitQuizAnswers(payload.quizId, {
        answers: payload.answers,
        sessionId: payload.sessionId,
      }),
    onSuccess: (result) => {
      setLatestSubmission(result);
      setSelectedAttemptId(result.id);
      setMode("overview");
      setAnswers({});
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
        error instanceof Error ? error.message : "Failed to submit quiz answers";
      toast.error(message);
    },
  });

  const activeQuiz = quizDetailsQuery.data;
  const attempts = attemptsQuery.data?.data ?? [];
  const questions = activeQuiz?.questions ?? [];
  const answeredCount = questions.reduce(
    (count, question) =>
      typeof answers[question.id] === "number" ? count + 1 : count,
    0,
  );
  const canSubmit = questions.length > 0 && answeredCount === questions.length;

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

  const handleCreateQuiz = () => {
    if (disableGeneration || createQuizMutation.isPending) {
      return;
    }

    createQuizMutation.mutate({
      title: formState.title.trim() || undefined,
      numberOfQuestions: normalizeNumericValue(
        formState.numberOfQuestions,
        1,
        50,
        10,
      ),
      difficulty: formState.difficulty,
      specialInstruction: formState.specialInstruction.trim() || undefined,
      useVectorSearch: true,
      chunkLimit: 3,
    });
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) {
      return;
    }

    if (!canSubmit) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    submitAnswersMutation.mutate({
      quizId: activeQuiz.id,
      answers: questions.map((question) => ({
        questionId: question.id,
        selectedOptionIndex: answers[question.id],
      })),
      sessionId: studySessionId ?? undefined,
    });
  };

  const openHistoryQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setSelectedAttemptId(null);
    setMode("overview");
    setAnswers({});
    setShowHistoryDrawer(false);
  };

  return (
    <>
      <div className="flex min-h-full flex-col bg-slate-50">
        <div className="flex items-start justify-between gap-4 px-6 py-6 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
              Quiz
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Quiz practice
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Generate a focused quiz, start an attempt, and review your past scores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowHistoryDrawer(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <FiList size={16} />
              History
            </button>
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <FiPlus size={16} />
              New Quiz
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 px-6 pb-6 sm:px-8 sm:pb-8">
          {quizzesQuery.isLoading || (activeQuizId && quizDetailsQuery.isLoading) ? (
            <div className="space-y-4">
              <SkeletonBlock className="h-20 w-full rounded-[28px]" />
              <SkeletonBlock className="h-[60vh] w-full rounded-[32px]" />
            </div>
          ) : quizzesErrorMessage ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md rounded-[32px] border border-rose-200 bg-rose-50 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                  <FiAlertCircle size={24} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Failed to load quizzes
                </h3>
                <p className="mt-2 text-sm text-slate-600">{quizzesErrorMessage}</p>
                <button
                  type="button"
                  onClick={() => quizzesQuery.refetch()}
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <FiClipboard size={28} />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-slate-900">
                  No quiz ready yet
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Create a quiz from this document and keep the library tucked away
                  until you need it.
                </p>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(true)}
                  className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                >
                  <FiPlus size={16} />
                  New Quiz
                </button>
              </div>
            </div>
          ) : quizDetailsErrorMessage || !activeQuiz ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md rounded-[32px] border border-rose-200 bg-rose-50 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                  <FiAlertCircle size={24} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Failed to load the selected quiz
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {quizDetailsErrorMessage ?? "Please select another quiz from history."}
                </p>
                <button
                  type="button"
                  onClick={() => quizDetailsQuery.refetch()}
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : mode === "taking" ? (
            <div className="flex h-full min-h-0 flex-col gap-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {activeQuiz.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {answeredCount} of {questions.length} questions answered
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("overview");
                        setAnswers({});
                      }}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Exit Attempt
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      disabled={!canSubmit || submitAnswersMutation.isPending}
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitAnswersMutation.isPending
                        ? "Submitting..."
                        : "Submit Answers"}
                    </button>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-600 transition-all"
                    style={{
                      width: `${
                        questions.length > 0
                          ? (answeredCount / questions.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto space-y-4 pr-1">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
                      Question {index + 1}
                    </p>
                    <p className="mt-3 text-lg font-semibold leading-8 text-slate-900">
                      {question.questionText}
                    </p>

                    <div className="mt-6 grid gap-3">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = answers[question.id] === optionIndex;

                        return (
                          <button
                            type="button"
                            key={`${question.id}-${optionIndex}`}
                            onClick={() =>
                              setAnswers((prev) => ({
                                ...prev,
                                [question.id]: optionIndex,
                              }))
                            }
                            className={`min-h-12 rounded-2xl border px-4 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                              isSelected
                                ? "border-teal-500 bg-teal-50 text-teal-900"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <span className="mr-2 font-semibold">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col gap-4">
              <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      difficultyBadgeStyles[activeQuiz.difficulty]
                    }`}
                  >
                    {activeQuiz.difficulty}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {activeQuiz.questionCount} questions
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {attempts.length} attempt{attempts.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="py-12 text-center">
                  <h3 className="text-3xl font-semibold text-slate-900">
                    {activeQuiz.title}
                  </h3>
                  <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                    Start a full attempt when you are ready, then review each attempt
                    below with an expandable breakdown of your answers.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("taking");
                      setAnswers({});
                      setSelectedAttemptId(null);
                    }}
                    className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-600 px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                  >
                    <FiPlayCircle size={18} />
                    Start Attempt
                  </button>
                </div>
              </div>

              {latestSubmission && latestSubmission.quizId === activeQuiz.id ? (
                <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-6 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">
                        Latest attempt saved
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {latestSubmission.correctAnswers}/
                        {latestSubmission.totalQuestions} correct on{" "}
                        {formatDateTime(latestSubmission.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${getScoreBadge(
                        latestSubmission.percentage,
                      )}`}
                    >
                      {latestSubmission.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="rounded-[32px] border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-5">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">
                        Attempt History
                      </h4>
                      <p className="mt-1 text-sm text-slate-600">
                        Open any attempt to review answers and explanations.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => attemptsQuery.refetch()}
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <FiRefreshCw size={15} />
                      Refresh
                    </button>
                  </div>

                  <div className="px-6 py-5">
                    {attemptsQuery.isLoading ? (
                      <div className="space-y-3">
                        <SkeletonBlock className="h-20 w-full rounded-2xl" />
                        <SkeletonBlock className="h-20 w-full rounded-2xl" />
                      </div>
                    ) : attemptsErrorMessage ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        {attemptsErrorMessage}
                      </div>
                    ) : attempts.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                        <p className="text-sm font-medium text-slate-700">
                          No attempts yet
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Start the first attempt from the card above.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {attempts.map((attempt) => {
                          const isOpen = selectedAttemptId === attempt.id;

                          return (
                            <AttemptAccordion
                              key={attempt.id}
                              attempt={attempt}
                              isOpen={isOpen}
                              onToggle={() =>
                                setSelectedAttemptId((current) =>
                                  current === attempt.id ? null : attempt.id,
                                )
                              }
                              isLoading={attemptDetailsQuery.isLoading && isOpen}
                              errorMessage={attemptDetailsErrorMessage}
                              detailContent={
                                isOpen ? attemptDetailsQuery.data : undefined
                              }
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <QuizHistoryDrawer
        quizzes={quizzes}
        activeQuizId={activeQuizId}
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        onOpenQuiz={openHistoryQuiz}
        page={page}
        totalPages={quizzesQuery.data?.pagination.totalPages ?? 1}
        currentPage={quizzesQuery.data?.pagination.page ?? 1}
        onPreviousPage={() => setPage((prev) => Math.max(1, prev - 1))}
        onNextPage={() =>
          setPage((prev) =>
            Math.min(quizzesQuery.data?.pagination.totalPages ?? 1, prev + 1),
          )
        }
      />

      <QuizConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        disableReason={disableReason}
        disableGeneration={disableGeneration}
        isSubmitting={createQuizMutation.isPending}
        formState={formState}
        onChange={setFormState}
        onSubmit={handleCreateQuiz}
      />
    </>
  );
};
