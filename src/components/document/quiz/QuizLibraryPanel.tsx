import {
  FiAlertCircle,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";
import type {
  PaginationMeta,
  QuizDifficulty,
  QuizListItem,
} from "../../../lib/api/quiz.service";

interface QuizLibraryPanelProps {
  quizzes: QuizListItem[];
  selectedQuizId: string | null;
  isLoading: boolean;
  errorMessage?: string;
  isRefreshing?: boolean;
  pagination?: PaginationMeta;
  onSelectQuiz: (quizId: string) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

const difficultyBadgeStyles: Record<QuizDifficulty, string> = {
  EASY: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-sky-100 text-sky-700",
  HARD: "bg-rose-100 text-rose-700",
  MIXED: "bg-violet-100 text-violet-700",
};

export const QuizLibraryPanel = ({
  quizzes,
  selectedQuizId,
  isLoading,
  errorMessage,
  isRefreshing = false,
  pagination,
  onSelectQuiz,
  onPageChange,
  onRetry,
}: QuizLibraryPanelProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-[18rem]">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Quiz Library</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            {pagination?.total ?? quizzes.length} quiz
            {(pagination?.total ?? quizzes.length) === 1 ? "" : "zes"}
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          <FiRefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="h-full min-h-48 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin" />
          </div>
        ) : errorMessage ? (
          <div className="h-full min-h-48 flex flex-col items-center justify-center text-center px-4">
            <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <FiAlertCircle size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">
              Failed to load quizzes
            </p>
            <p className="text-xs text-slate-600 mb-3">{errorMessage}</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="h-full min-h-48 flex flex-col items-center justify-center text-center px-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
              <FiBookOpen size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">
              No quizzes yet
            </p>
            <p className="text-xs text-slate-600">
              Generate your first quiz from this document.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {quizzes.map((quiz) => {
              const isSelected = selectedQuizId === quiz.id;
              return (
                <button
                  type="button"
                  key={quiz.id}
                  onClick={() => onSelectQuiz(quiz.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-cyan-300 bg-cyan-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-2">
                      {quiz.title}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${difficultyBadgeStyles[quiz.difficulty]}`}
                    >
                      {quiz.difficulty}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                    <span>{quiz.questionCount} questions</span>
                    <span>•</span>
                    <span>{quiz._count?.attempts ?? 0} attempts</span>
                    <span>•</span>
                    <span>
                      {new Date(quiz.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="border-t border-slate-200 px-3 py-2 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronLeft size={12} />
            Previous
          </button>
          <span className="text-xs text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <FiChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

