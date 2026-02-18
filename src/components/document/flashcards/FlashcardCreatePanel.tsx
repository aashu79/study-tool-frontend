import { useState, type FormEvent } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiFeather,
  FiSearch,
  FiSettings,
  FiZap,
} from "react-icons/fi";
import type { CreateFlashcardSetRequest } from "../../../lib/api/flashcard.service";

interface FlashcardCreatePanelProps {
  isOpen: boolean;
  disabled?: boolean;
  disableReason?: string;
  isSubmitting?: boolean;
  onToggle: () => void;
  onSubmit: (payload: CreateFlashcardSetRequest) => void;
}

interface CreateFormState {
  title: string;
  description: string;
  numberOfCards: number;
  focusAreasText: string;
  specialInstruction: string;
  includeFormulas: boolean;
  includeExamples: boolean;
  useVectorSearch: boolean;
  searchQuery: string;
  chunkLimit: number;
}

const INITIAL_STATE: CreateFormState = {
  title: "",
  description: "",
  numberOfCards: 24,
  focusAreasText: "",
  specialInstruction: "",
  includeFormulas: true,
  includeExamples: true,
  useVectorSearch: true,
  searchQuery: "",
  chunkLimit: 40,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const safeNumber = (value: number, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? clamp(value, min, max) : fallback;

const toFocusAreas = (value: string): string[] =>
  value
    .split(/[\n,;|]/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

export const FlashcardCreatePanel = ({
  isOpen,
  disabled = false,
  disableReason,
  isSubmitting = false,
  onToggle,
  onSubmit,
}: FlashcardCreatePanelProps) => {
  const [formState, setFormState] = useState<CreateFormState>(INITIAL_STATE);

  const updateField = <K extends keyof CreateFormState>(
    key: K,
    value: CreateFormState[K],
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || isSubmitting) {
      return;
    }

    onSubmit({
      title: formState.title.trim() || undefined,
      description: formState.description.trim() || undefined,
      numberOfCards: safeNumber(
        formState.numberOfCards,
        5,
        100,
        INITIAL_STATE.numberOfCards,
      ),
      focusAreas: toFocusAreas(formState.focusAreasText),
      specialInstruction: formState.specialInstruction.trim() || undefined,
      includeFormulas: formState.includeFormulas,
      includeExamples: formState.includeExamples,
      useVectorSearch: formState.useVectorSearch,
      searchQuery:
        formState.useVectorSearch && formState.searchQuery.trim()
          ? formState.searchQuery.trim()
          : undefined,
      chunkLimit: safeNumber(
        formState.chunkLimit,
        8,
        120,
        INITIAL_STATE.chunkLimit,
      ),
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-slate-800">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <FiZap size={16} />
          </span>
          <div className="text-left">
            <p className="text-sm font-semibold">Generate Flashcard Set</p>
            <p className="text-xs text-slate-600">
              Build exam-focused cards with custom controls
            </p>
          </div>
        </div>
        <span className="text-slate-500">
          {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </span>
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {disabled && disableReason && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {disableReason}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Title (Optional)
            </label>
            <input
              type="text"
              value={formState.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Set title"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={formState.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Short set summary"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Number of Cards
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-2 py-1.5">
                <FiFeather className="text-slate-500" size={14} />
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={formState.numberOfCards}
                  onChange={(event) =>
                    updateField(
                      "numberOfCards",
                      safeNumber(
                        Number(event.target.value),
                        5,
                        100,
                        INITIAL_STATE.numberOfCards,
                      ),
                    )
                  }
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Chunk Limit
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-2 py-1.5">
                <FiSettings className="text-slate-500" size={14} />
                <input
                  type="number"
                  min={8}
                  max={120}
                  value={formState.chunkLimit}
                  onChange={(event) =>
                    updateField(
                      "chunkLimit",
                      safeNumber(
                        Number(event.target.value),
                        8,
                        120,
                        INITIAL_STATE.chunkLimit,
                      ),
                    )
                  }
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Focus Areas
            </label>
            <textarea
              rows={2}
              value={formState.focusAreasText}
              onChange={(event) => updateField("focusAreasText", event.target.value)}
              placeholder="Derivatives, Integration rules, Optimization"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Special Instruction
            </label>
            <textarea
              rows={3}
              value={formState.specialInstruction}
              onChange={(event) =>
                updateField("specialInstruction", event.target.value)
              }
              placeholder="Focus on exam-level formulas and common mistakes."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FiSettings size={14} />
              Content Strategy
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={formState.includeFormulas}
                  onChange={(event) =>
                    updateField("includeFormulas", event.target.checked)
                  }
                  className="h-4 w-4 accent-emerald-600"
                />
                Include formulas
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={formState.includeExamples}
                  onChange={(event) =>
                    updateField("includeExamples", event.target.checked)
                  }
                  className="h-4 w-4 accent-emerald-600"
                />
                Include examples
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-slate-700 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={formState.useVectorSearch}
                  onChange={(event) =>
                    updateField("useVectorSearch", event.target.checked)
                  }
                  className="h-4 w-4 accent-emerald-600"
                />
                Use vector retrieval
              </label>
            </div>

            {formState.useVectorSearch && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Search Query
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5">
                  <FiSearch className="text-slate-500" size={14} />
                  <input
                    type="text"
                    value={formState.searchQuery}
                    onChange={(event) =>
                      updateField("searchQuery", event.target.value)
                    }
                    placeholder="Optional retrieval query"
                    className="w-full bg-transparent text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={disabled || isSubmitting}
            className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Generating Flashcards..." : "Generate Flashcard Set"}
          </button>
        </form>
      )}
    </div>
  );
};
