import { useState, type FormEvent } from "react";
import { FiChevronDown, FiChevronUp, FiZap } from "react-icons/fi";
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
  numberOfCards: number;
  focusAreasText: string;
  specialInstruction: string;
}

const INITIAL_STATE: CreateFormState = {
  title: "",
  numberOfCards: 15,
  focusAreasText: "",
  specialInstruction: "",
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const safeNumber = (
  value: number,
  min: number,
  max: number,
  fallback: number,
) => (Number.isFinite(value) ? clamp(value, min, max) : fallback);

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
      numberOfCards: safeNumber(
        formState.numberOfCards,
        5,
        50,
        INITIAL_STATE.numberOfCards,
      ),
      focusAreas: toFocusAreas(formState.focusAreasText),
      specialInstruction: formState.specialInstruction.trim() || undefined,
      includeFormulas: true,
      includeExamples: true,
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
            <p className="text-sm font-semibold">Generate Flashcards</p>
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
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="e.g., Chapter 5 Key Terms"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-slate-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              Number of Cards
            </label>
            <input
              type="number"
              min={5}
              max={50}
              value={formState.numberOfCards}
              onChange={(event) =>
                updateField(
                  "numberOfCards",
                  safeNumber(
                    Number(event.target.value),
                    5,
                    50,
                    INITIAL_STATE.numberOfCards,
                  ),
                )
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-slate-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              Focus Areas{" "}
              <span className="text-slate-400">
                (optional, comma-separated)
              </span>
            </label>
            <input
              type="text"
              value={formState.focusAreasText}
              onChange={(event) =>
                updateField("focusAreasText", event.target.value)
              }
              placeholder="e.g., Derivatives, Integration, Limits"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-slate-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              Special Instruction{" "}
              <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={formState.specialInstruction}
              onChange={(event) =>
                updateField("specialInstruction", event.target.value)
              }
              placeholder="e.g., Focus on common exam questions"
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
              "Generate Flashcards"
            )}
          </button>
        </form>
      )}
    </div>
  );
};
