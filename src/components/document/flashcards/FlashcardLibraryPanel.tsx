import {
  FiAlertCircle,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";
import type {
  FlashcardSetListItem,
  FlashcardSetPagination,
} from "../../../lib/api/flashcard.service";

interface FlashcardLibraryPanelProps {
  sets: FlashcardSetListItem[];
  selectedSetId: string | null;
  isLoading: boolean;
  errorMessage?: string;
  isRefreshing?: boolean;
  pagination?: FlashcardSetPagination;
  onSelectSet: (setId: string) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

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

export const FlashcardLibraryPanel = ({
  sets,
  selectedSetId,
  isLoading,
  errorMessage,
  isRefreshing = false,
  pagination,
  onSelectSet,
  onPageChange,
  onRetry,
}: FlashcardLibraryPanelProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-[18rem]">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Flashcard Sets</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            {pagination?.total ?? sets.length} set
            {(pagination?.total ?? sets.length) === 1 ? "" : "s"}
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
            <div className="h-8 w-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          </div>
        ) : errorMessage ? (
          <div className="h-full min-h-48 flex flex-col items-center justify-center text-center px-4">
            <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <FiAlertCircle size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">
              Failed to load flashcard sets
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
        ) : sets.length === 0 ? (
          <div className="h-full min-h-48 flex flex-col items-center justify-center text-center px-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
              <FiBookOpen size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">
              No flashcard sets yet
            </p>
            <p className="text-xs text-slate-600">
              Generate your first set from this document.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sets.map((set) => {
              const isSelected = selectedSetId === set.id;
              const cardsCount = set.cardsCount ?? set.cardCount;
              return (
                <button
                  type="button"
                  key={set.id}
                  onClick={() => onSelectSet(set.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-emerald-300 bg-emerald-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800 line-clamp-2">
                    {set.title}
                  </p>

                  {set.focusAreas.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {set.focusAreas.slice(0, 3).map((area) => (
                        <span
                          key={`${set.id}-${area}`}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                    <span>{cardsCount} cards</span>
                    <span>|</span>
                    <span>{formatDate(set.createdAt)}</span>
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

