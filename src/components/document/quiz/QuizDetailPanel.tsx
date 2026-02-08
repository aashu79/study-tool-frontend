import { useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiFileText,
  FiPlayCircle,
  FiRefreshCw,
  FiTrendingUp,
  FiXCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import type {
  QuizAttempt,
  QuizAttemptDetails,
  QuizDetails,
  QuizSubmissionResult,
  SubmitQuizAnswersRequest,
} from "../../../lib/api/quiz.service";
import { IoCloseCircleOutline } from "react-icons/io5";

interface QuizDetailPanelProps {
  quiz: QuizDetails | undefined;
  isLoading: boolean;
  loadError?: string;
  attempts: QuizAttempt[];
  areAttemptsLoading: boolean;
  attemptsError?: string;
  attemptDetails: QuizAttemptDetails | undefined;
  areAttemptDetailsLoading: boolean;
  attemptDetailsError?: string;
  latestSubmission: QuizSubmissionResult | null;
  isSubmitting: boolean;
  onSubmitAnswers: (payload: SubmitQuizAnswersRequest) => void;
  onSelectAttempt: (attemptId: string) => void;
  onClearAttemptSelection: () => void;
  onRetryQuizDetails: () => void;
  onRetryAttempts: () => void;
}

type PanelMode = "overview" | "taking";

const getScoreBadge = (percentage: number) => {
  if (percentage >= 85) {
    return "bg-emerald-100 text-emerald-700";
  }
  if (percentage >= 70) {
    return "bg-cyan-100 text-cyan-700";
  }
  if (percentage >= 50) {
    return "bg-amber-100 text-amber-700";
  }
  return "bg-rose-100 text-rose-700";
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString();
};

export const QuizDetailPanel = ({
  quiz,
  isLoading,
  loadError,
  attempts,
  areAttemptsLoading,
  attemptsError,
  attemptDetails,
  areAttemptDetailsLoading,
  attemptDetailsError,
  latestSubmission,
  isSubmitting,
  onSubmitAnswers,
  onSelectAttempt,
  onClearAttemptSelection,
  onRetryQuizDetails,
  onRetryAttempts,
}: QuizDetailPanelProps) => {
  const [mode, setMode] = useState<PanelMode>("overview");
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const questions = quiz?.questions ?? [];

  const answeredCount = questions.reduce(
    (count, question) =>
      typeof answers[question.id] === "number" ? count + 1 : count,
    0,
  );

  const canSubmit = questions.length > 0 && answeredCount === questions.length;

  const handleSubmit = () => {
    if (!quiz) {
      return;
    }
    if (!canSubmit) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    const payload: SubmitQuizAnswersRequest = {
      answers: questions.map((question) => ({
        questionId: question.id,
        selectedOptionIndex: answers[question.id],
      })),
    };

    onSubmitAnswers(payload);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm h-full min-h-[32rem] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm h-full min-h-[32rem] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <FiFileText size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">
            Select a Quiz
          </h3>
          <p className="text-sm text-slate-600">
            Pick a quiz from the library to preview questions, start a new
            attempt, and review your performance insights.
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 h-full min-h-[32rem] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-white text-red-600 flex items-center justify-center">
            <FiAlertCircle size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            Failed to load quiz details
          </h3>
          <p className="text-sm text-red-700 mb-4">{loadError}</p>
          <button
            type="button"
            onClick={onRetryQuizDetails}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <FiRefreshCw size={14} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full min-h-[32rem] flex flex-col">
      <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{quiz.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/85">
              <span className="rounded-full bg-white/20 px-2 py-0.5 font-semibold">
                {quiz.difficulty}
              </span>
              <span>{quiz.questionCount} questions</span>
              <span>|</span>
              <span>{attempts.length} attempt(s)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === "taking" ? (
              <button
                type="button"
                onClick={() => {
                  setMode("overview");
                  setAnswers({});
                }}
                className="rounded-lg border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
              >
                Exit Quiz
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode("taking");
                  setAnswers({});
                  onClearAttemptSelection();
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-cyan-800 hover:bg-cyan-50"
              >
                <FiPlayCircle size={14} />
                Start Attempt
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-5 space-y-4">
        {latestSubmission && latestSubmission.quizId === quiz.id && (
          <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-cyan-800 font-semibold">
                <FiTrendingUp size={16} />
                Latest Attempt Result
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getScoreBadge(
                  latestSubmission.percentage,
                )}`}
              >
                {latestSubmission.percentage.toFixed(1)}%
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700">
              You scored {latestSubmission.correctAnswers} out of{" "}
              {latestSubmission.totalQuestions}.
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Submitted: {formatDateTime(latestSubmission.createdAt)}
            </p>
            {latestSubmission.insight && (
              <div className="mt-3 rounded-lg border border-cyan-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Recommended Actions
                </p>
                <p className="text-sm text-slate-700">
                  {latestSubmission.insight.recommendedActions}
                </p>
              </div>
            )}
          </div>
        )}

        {mode === "taking" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-700">
                Progress: {answeredCount}/{questions.length} answered
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Answers"}
              </button>
            </div>

            {questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-800 mb-3">
                  Q{index + 1}. {question.questionText}
                </p>

                <div className="grid gap-2">
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
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-50 text-cyan-900"
                            : "border-slate-300 bg-white hover:border-cyan-300 hover:bg-cyan-50/40"
                        }`}
                      >
                        <span className="font-semibold mr-2">
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
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                  Difficulty
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {quiz.difficulty}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                  Questions
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {quiz.questionCount}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                  Model
                </p>
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {quiz.modelUsed}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-800">
                  <FiClock size={14} />
                  <h4 className="text-sm font-semibold">Attempt History</h4>
                </div>
                <button
                  type="button"
                  onClick={onRetryAttempts}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                >
                  <FiRefreshCw size={12} />
                  Reload
                </button>
              </div>

              <div className="p-3 space-y-2">
                {areAttemptsLoading ? (
                  <div className="py-6 flex justify-center">
                    <div className="h-6 w-6 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin" />
                  </div>
                ) : attemptsError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {attemptsError}
                  </div>
                ) : attempts.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    No attempts recorded yet.
                  </p>
                ) : (
                  attempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="rounded-lg border border-slate-200 p-3 bg-slate-50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm">
                          <p className="font-semibold text-slate-800">
                            Score: {attempt.correctAnswers}/
                            {attempt.totalQuestions}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {formatDateTime(attempt.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getScoreBadge(
                              attempt.percentage,
                            )}`}
                          >
                            {attempt.percentage.toFixed(1)}%
                          </span>
                          <button
                            type="button"
                            onClick={() => onSelectAttempt(attempt.id)}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
                          >
                            <FiEye size={12} />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {(areAttemptDetailsLoading ||
              attemptDetails ||
              attemptDetailsError) && (
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">
                    Attempt Details
                  </h4>
                  <button
                    type="button"
                    onClick={onClearAttemptSelection}
                    className="text-xs text-red-600 hover:text-slate-900"
                  >
                    <span className="inline-flex items-center gap-1">
                      <IoCloseCircleOutline size={14} />
                      <p>Close</p>
                    </span>
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  {areAttemptDetailsLoading ? (
                    <div className="py-5 flex justify-center">
                      <div className="h-6 w-6 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin" />
                    </div>
                  ) : attemptDetailsError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {attemptDetailsError}
                    </div>
                  ) : attemptDetails ? (
                    <>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm text-slate-700">
                          <span className="font-semibold text-slate-900">
                            {attemptDetails.correctAnswers}/
                            {attemptDetails.totalQuestions}
                          </span>{" "}
                          correct ({attemptDetails.percentage.toFixed(1)}%)
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Submitted: {formatDateTime(attemptDetails.createdAt)}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {attemptDetails.answers.map((answer, index) => {
                          const question = answer.question;
                          const selectedOption = answer.selectedOption ?? "N/A";
                          const correctOption = answer.correctOption ?? "N/A";
                          const selectedIndex = answer.selectedOptionIndex;
                          const correctIndex = question.correctOptionIndex;

                          return (
                            <div
                              key={answer.id}
                              className="rounded-lg border border-slate-200 p-3"
                            >
                              <p className="text-sm font-semibold text-slate-800 mb-2">
                                Q{question.questionIndex ?? index + 1}.{" "}
                                {question.questionText}
                              </p>

                              <div className="space-y-2 text-sm">
                                <p
                                  className={`inline-flex items-center gap-1 ${
                                    answer.isCorrect
                                      ? "text-emerald-700"
                                      : "text-rose-700"
                                  }`}
                                >
                                  {answer.isCorrect ? (
                                    <FiCheckCircle size={14} />
                                  ) : (
                                    <FiXCircle size={14} />
                                  )}
                                  Your answer: {selectedOption}
                                </p>
                                {!answer.isCorrect && (
                                  <p className="text-emerald-700">
                                    Correct answer: {correctOption}
                                  </p>
                                )}

                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-1.5">
                                  {question.options.map(
                                    (option, optionIndex) => {
                                      const isSelected =
                                        optionIndex === selectedIndex;
                                      const isCorrect =
                                        optionIndex === correctIndex;
                                      return (
                                        <div
                                          key={`${answer.id}-option-${optionIndex}`}
                                          className={`flex items-center justify-between gap-2 rounded-md px-2 py-1 ${
                                            isCorrect
                                              ? "bg-emerald-100 text-emerald-800"
                                              : isSelected
                                                ? "bg-rose-100 text-rose-800"
                                                : "bg-white text-slate-700"
                                          }`}
                                        >
                                          <span>
                                            {String.fromCharCode(
                                              65 + optionIndex,
                                            )}
                                            . {option}
                                          </span>
                                          <span className="text-[11px] font-semibold">
                                            {isCorrect
                                              ? "Correct"
                                              : isSelected
                                                ? "Selected"
                                                : ""}
                                          </span>
                                        </div>
                                      );
                                    },
                                  )}
                                </div>

                                {question.explanation ? (
                                  <p className="text-xs text-slate-600">
                                    {question.explanation}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {attemptDetails.insight && (
                        <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 space-y-2">
                          <p className="text-sm font-semibold text-cyan-900">
                            AI Performance Insight
                          </p>
                          <p className="text-sm text-slate-700">
                            <span className="font-semibold">Strengths:</span>{" "}
                            {attemptDetails.insight.strengths || "N/A"}
                          </p>
                          <p className="text-sm text-slate-700">
                            <span className="font-semibold">Weaknesses:</span>{" "}
                            {attemptDetails.insight.weaknesses || "N/A"}
                          </p>
                          {attemptDetails.insight.weakAreas.length > 0 && (
                            <p className="text-sm text-slate-700">
                              <span className="font-semibold">Weak Areas:</span>{" "}
                              {attemptDetails.insight.weakAreas.join(", ")}
                            </p>
                          )}
                          <p className="text-sm text-slate-700">
                            <span className="font-semibold">
                              Detailed Insights:
                            </span>{" "}
                            {attemptDetails.insight.detailedInsights || "N/A"}
                          </p>
                          <p className="text-sm text-slate-700">
                            <span className="font-semibold">
                              Recommended Actions:
                            </span>{" "}
                            {attemptDetails.insight.recommendedActions || "N/A"}
                          </p>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
