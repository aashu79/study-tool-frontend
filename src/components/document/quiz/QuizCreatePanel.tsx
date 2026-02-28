import { useState, type FormEvent } from "react";
import { FiChevronDown, FiChevronUp, FiZap } from "react-icons/fi";
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
}

const INITIAL_FORM_STATE: QuizFormState = {
  title: "",
  numberOfQuestions: 10,
  difficulty: "medium",
  specialInstruction: "",
};

const DIFFICULTY_OPTIONS: Array<{
  value: QuizDifficultyInput;
  label: string;
}> = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "mixed", label: "Mixed" },
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
      useVectorSearch: true,
      chunkLimit: 3,
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5 text-slate-800">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <FiZap size={14} />
          </span>
          <div className="text-left">
            <p className="text-sm font-semibold">Generate Quiz</p>
          </div>
        </div>
        <span className="text-slate-400">
          {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </span>
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-3">
          {disabled && disableReason && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {disableReason}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              Title <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={formState.title}
              onChange={(event) => handleChange("title", event.target.value)}
              placeholder="e.g., Chapter 4 Review"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-slate-50/50"
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                Number of Questions
              </label>
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
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                Difficulty
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange("difficulty", opt.value)}
                    className={`rounded-lg py-2 text-xs font-medium transition-all ${
                      formState.difficulty === opt.value
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              Special Instruction{" "}
              <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              value={formState.specialInstruction}
              onChange={(event) =>
                handleChange("specialInstruction", event.target.value)
              }
              rows={2}
              placeholder="e.g., Focus on chapter 2 concepts"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-slate-50/50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={disabled || isSubmitting}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              "Generate Quiz"
            )}
          </button>
        </form>
      )}
    </div>
  );
};
