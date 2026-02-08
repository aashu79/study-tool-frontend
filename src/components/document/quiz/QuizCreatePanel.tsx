import { useState, type FormEvent } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiSettings,
  FiTarget,
  FiZap,
} from "react-icons/fi";
import type {
  CreateQuizRequest,
  QuizDifficultyInput,
} from "../../../lib/api/quiz.service";

interface QuizCreatePanelProps {
  isOpen: boolean;
  disabled?: boolean;
  disableReason?: string;
  isSubmitting?: boolean;
  onToggle: () => void;
  onSubmit: (payload: CreateQuizRequest) => void;
}

interface QuizFormState {
  title: string;
  numberOfQuestions: number;
  difficulty: QuizDifficultyInput;
  specialInstruction: string;
  searchQuery: string;
  useVectorSearch: boolean;
  chunkLimit: number;
}

const INITIAL_FORM_STATE: QuizFormState = {
  title: "",
  numberOfQuestions: 10,
  difficulty: "medium",
  specialInstruction: "",
  searchQuery: "",
  useVectorSearch: true,
  chunkLimit: 50,
};

const DIFFICULTY_OPTIONS: Array<{
  value: QuizDifficultyInput;
  label: string;
  description: string;
}> = [
  { value: "easy", label: "Easy", description: "Foundational checks" },
  { value: "medium", label: "Medium", description: "Balanced understanding" },
  { value: "hard", label: "Hard", description: "Application heavy" },
  { value: "mixed", label: "Mixed", description: "Varied challenge" },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const normalizeNumericValue = (
  value: number,
  min: number,
  max: number,
  fallback: number,
) => (Number.isFinite(value) ? clamp(value, min, max) : fallback);

export const QuizCreatePanel = ({
  isOpen,
  disabled = false,
  disableReason,
  isSubmitting = false,
  onToggle,
  onSubmit,
}: QuizCreatePanelProps) => {
  const [formState, setFormState] = useState<QuizFormState>(INITIAL_FORM_STATE);

  const handleChange = <K extends keyof QuizFormState>(
    key: K,
    value: QuizFormState[K],
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
      numberOfQuestions: normalizeNumericValue(
        formState.numberOfQuestions,
        1,
        50,
        INITIAL_FORM_STATE.numberOfQuestions,
      ),
      difficulty: formState.difficulty,
      specialInstruction: formState.specialInstruction.trim() || undefined,
      searchQuery:
        formState.useVectorSearch && formState.searchQuery.trim()
          ? formState.searchQuery.trim()
          : undefined,
      useVectorSearch: formState.useVectorSearch,
      chunkLimit: normalizeNumericValue(
        formState.chunkLimit,
        5,
        150,
        INITIAL_FORM_STATE.chunkLimit,
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
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
            <FiZap size={16} />
          </span>
          <div className="text-left">
            <p className="text-sm font-semibold">Generate New Quiz</p>
            <p className="text-xs text-slate-600">
              Tune difficulty, depth, and retrieval strategy
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

          <div className="grid gap-3">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Title (Optional)
            </label>
            <input
              type="text"
              value={formState.title}
              onChange={(event) => handleChange("title", event.target.value)}
              placeholder="Custom quiz name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Questions
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-2 py-1.5">
                <FiTarget className="text-slate-500" size={14} />
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={formState.numberOfQuestions}
                  onChange={(event) => {
                    handleChange(
                      "numberOfQuestions",
                      normalizeNumericValue(
                        Number(event.target.value),
                        1,
                        50,
                        INITIAL_FORM_STATE.numberOfQuestions,
                      ),
                    );
                  }}
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Difficulty
              </label>
              <select
                value={formState.difficulty}
                onChange={(event) =>
                  handleChange("difficulty", event.target.value as QuizDifficultyInput)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {DIFFICULTY_OPTIONS.map((difficulty) => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label} - {difficulty.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Special Instruction (Optional)
            </label>
            <textarea
              value={formState.specialInstruction}
              onChange={(event) =>
                handleChange("specialInstruction", event.target.value)
              }
              rows={3}
              placeholder="Example: Include scenario-based questions and emphasize chapter 2 concepts."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FiSettings size={14} />
                Retrieval Controls
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={formState.useVectorSearch}
                  onChange={(event) =>
                    handleChange("useVectorSearch", event.target.checked)
                  }
                  className="h-4 w-4 accent-cyan-600"
                />
                Vector Search
              </label>
            </div>

            {formState.useVectorSearch && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Focus Query
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5">
                  <FiSearch className="text-slate-500" size={14} />
                  <input
                    type="text"
                    value={formState.searchQuery}
                    onChange={(event) =>
                      handleChange("searchQuery", event.target.value)
                    }
                    placeholder="Prioritize formulas and worked examples"
                    className="w-full bg-transparent text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Chunk Limit
                </label>
                <span className="text-xs text-slate-500">{formState.chunkLimit}</span>
              </div>
              <input
                type="range"
                min={5}
                max={150}
                value={formState.chunkLimit}
                onChange={(event) => {
                  handleChange(
                    "chunkLimit",
                    normalizeNumericValue(
                      Number(event.target.value),
                      5,
                      150,
                      INITIAL_FORM_STATE.chunkLimit,
                    ),
                  );
                }}
                className="w-full accent-cyan-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={disabled || isSubmitting}
            className="w-full rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-cyan-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Generating Quiz..." : "Generate Quiz"}
          </button>
        </form>
      )}
    </div>
  );
};
