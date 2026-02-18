import { useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiRotateCw,
  FiShuffle,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import type {
  FlashcardCard,
  FlashcardSetDetails,
} from "../../../lib/api/flashcard.service";
import { toRenderableMarkdown } from "../../../lib/utils/markdown";

interface FlashcardDetailPanelProps {
  flashcardSet: FlashcardSetDetails | undefined;
  isLoading: boolean;
  loadError?: string;
  isRenaming: boolean;
  isDeleting: boolean;
  onRename: (title: string) => void;
  onDelete: () => void;
  onRetry: () => void;
}

type DetailMode = "overview" | "study";
const EMPTY_CARDS: FlashcardCard[] = [];

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Unknown date";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString();
};

const typeBadgeStyles: Record<FlashcardCard["type"], string> = {
  CONCEPT: "bg-cyan-100 text-cyan-700",
  DEFINITION: "bg-blue-100 text-blue-700",
  FORMULA: "bg-amber-100 text-amber-700",
  PROCESS: "bg-violet-100 text-violet-700",
  EXAMPLE: "bg-emerald-100 text-emerald-700",
  COMPARISON: "bg-orange-100 text-orange-700",
  APPLICATION: "bg-rose-100 text-rose-700",
};

const MarkdownBlock = ({
  content,
  className = "",
}: {
  content?: string | null;
  className?: string;
}) => {
  const markdown = toRenderableMarkdown(content);
  if (!markdown) {
    return <p className="text-sm text-slate-500">N/A</p>;
  }

  return (
    <div className={`prose prose-sm max-w-none text-slate-700 ${className}`}>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};

export const FlashcardDetailPanel = ({
  flashcardSet,
  isLoading,
  loadError,
  isRenaming,
  isDeleting,
  onRename,
  onDelete,
  onRetry,
}: FlashcardDetailPanelProps) => {
  const [mode, setMode] = useState<DetailMode>("overview");
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [position, setPosition] = useState(0);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  const cards = flashcardSet?.cards ?? EMPTY_CARDS;

  const cardOrder = useMemo(() => {
    if (shuffledOrder.length === cards.length) {
      return shuffledOrder;
    }
    return cards.map((_, index) => index);
  }, [cards, shuffledOrder]);

  const safePosition = Math.min(
    Math.max(position, 0),
    Math.max(cards.length - 1, 0),
  );
  const currentCardIndex = cardOrder[safePosition] ?? 0;
  const currentCard = cards[currentCardIndex];

  const progressPercentage =
    cards.length > 0 ? ((safePosition + 1) / cards.length) * 100 : 0;

  const handleRenameSave = () => {
    const title = titleDraft.trim();
    if (!title) {
      toast.error("Title cannot be empty.");
      return;
    }
    onRename(title);
    setIsEditingTitle(false);
  };

  const handleDelete = () => {
    if (!flashcardSet) {
      return;
    }

    if (
      window.confirm(`Delete "${flashcardSet.title}"? This cannot be undone.`)
    ) {
      onDelete();
    }
  };

  const startStudyMode = () => {
    setMode("study");
    setIsAnswerVisible(false);
    setPosition(0);
    setShuffledOrder([]);
  };

  const shuffleCards = () => {
    if (cards.length < 2) {
      return;
    }
    const nextOrder = cards
      .map((_, index) => index)
      .sort(() => Math.random() - 0.5);
    setShuffledOrder(nextOrder);
    setPosition(0);
    setIsAnswerVisible(false);
  };

  const resetOrder = () => {
    setShuffledOrder([]);
    setPosition(0);
    setIsAnswerVisible(false);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm h-full min-h-[32rem] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!flashcardSet) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm h-full min-h-[32rem] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <FiFileText size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">
            Select a Set
          </h3>
          <p className="text-sm text-slate-600">
            Choose a flashcard set from the library to view, rename, delete, or
            start studying.
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
            Failed to load flashcard set
          </h3>
          <p className="text-sm text-red-700 mb-4">{loadError}</p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <FiRotateCw size={14} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full min-h-[32rem] flex flex-col">
      <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  className="w-full max-w-md rounded-lg border border-white/40 bg-white/15 px-3 py-1.5 text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="button"
                  onClick={handleRenameSave}
                  disabled={isRenaming}
                  className="inline-flex items-center justify-center rounded-md bg-white px-2 py-1.5 text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
                >
                  <FiCheck size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="inline-flex items-center justify-center rounded-md bg-white/15 px-2 py-1.5 text-white hover:bg-white/25"
                >
                  <FiX size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold truncate">
                  {flashcardSet.title}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setTitleDraft(flashcardSet.title);
                    setIsEditingTitle(true);
                  }}
                  className="inline-flex items-center justify-center rounded-md bg-white/15 p-1.5 text-white hover:bg-white/25"
                  title="Rename"
                >
                  <FiEdit2 size={13} />
                </button>
              </div>
            )}

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/90">
              <span>{cards.length} cards</span>
              <span>|</span>
              <span>Created: {formatDateTime(flashcardSet.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === "study" ? (
              <button
                type="button"
                onClick={() => setMode("overview")}
                className="rounded-lg border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
              >
                Exit Study
              </button>
            ) : (
              <button
                type="button"
                onClick={startStudyMode}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
              >
                Start Study
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 rounded-lg border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20 disabled:opacity-60"
            >
              <FiTrash2 size={12} />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-5 space-y-4">
        {mode === "study" ? (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-700">
                  Card {safePosition + 1} / {cards.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={shuffleCards}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    <FiShuffle size={12} />
                    Shuffle
                  </button>
                  <button
                    type="button"
                    onClick={resetOrder}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    <FiRotateCw size={12} />
                    Reset
                  </button>
                </div>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {currentCard ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        typeBadgeStyles[currentCard.type]
                      }`}
                    >
                      {currentCard.type}
                    </span>
                    {currentCard.topic && (
                      <span className="text-xs text-slate-600">
                        Topic: {currentCard.topic}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAnswerVisible((prev) => !prev)}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    {isAnswerVisible ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                    {isAnswerVisible ? "Hide Answer" : "Reveal Answer"}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
                      Question
                    </p>
                    <MarkdownBlock content={currentCard.front} />
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 min-h-[10rem]">
                    <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-2">
                      Answer
                    </p>
                    {isAnswerVisible ? (
                      <MarkdownBlock content={currentCard.back} />
                    ) : (
                      <div className="h-full rounded-lg border border-dashed border-emerald-300 bg-white/70 p-4 flex items-center justify-center text-center">
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            Answer Hidden
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            Click "Reveal Answer" to show it.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {currentCard.hint && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">
                      Hint
                    </p>
                    <MarkdownBlock content={currentCard.hint} />
                  </div>
                )}

                {currentCard.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {currentCard.tags.map((tag) => (
                      <span
                        key={`${currentCard.id}-${tag}`}
                        className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPosition((prev) => Math.max(prev - 1, 0));
                      setIsAnswerVisible(false);
                    }}
                    disabled={safePosition <= 0}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft size={14} />
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAnswerVisible((prev) => !prev)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    {isAnswerVisible ? "Hide Answer" : "Reveal Answer"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPosition((prev) => Math.min(prev + 1, cards.length - 1));
                      setIsAnswerVisible(false);
                    }}
                    disabled={safePosition >= cards.length - 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <FiChevronRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                This set has no cards.
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                  Cards
                </p>
                <p className="text-lg font-semibold text-slate-800">{cards.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                  Model
                </p>
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {flashcardSet.modelUsed || "Unknown"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                  Updated
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {formatDateTime(flashcardSet.updatedAt)}
                </p>
              </div>
            </div>

            {(flashcardSet.description || flashcardSet.generationInstruction) && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                {flashcardSet.description && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                      Description
                    </p>
                    <MarkdownBlock content={flashcardSet.description} />
                  </div>
                )}
                {flashcardSet.generationInstruction && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                      Instruction
                    </p>
                    <MarkdownBlock content={flashcardSet.generationInstruction} />
                  </div>
                )}
              </div>
            )}

            {flashcardSet.focusAreas.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
                  Focus Areas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {flashcardSet.focusAreas.map((area) => (
                    <span
                      key={`${flashcardSet.id}-${area}`}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <FiClock size={14} />
                  <h4 className="text-sm font-semibold">Cards</h4>
                </div>
                <button
                  type="button"
                  onClick={startStudyMode}
                  className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Study This Set
                </button>
              </div>

              <div className="p-3 space-y-3">
                {cards.length === 0 ? (
                  <p className="text-sm text-slate-600">No cards available.</p>
                ) : (
                  cards.map((card) => (
                    <div
                      key={card.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-slate-800">
                          #{card.cardIndex} {card.front}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            typeBadgeStyles[card.type]
                          }`}
                        >
                          {card.type}
                        </span>
                      </div>
                      <MarkdownBlock content={card.back} />
                      {(card.hint || card.topic || card.tags.length > 0) && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                          {card.hint && <span>Hint: {card.hint}</span>}
                          {card.topic && <span>Topic: {card.topic}</span>}
                          {card.tags.map((tag) => (
                            <span
                              key={`${card.id}-${tag}`}
                              className="rounded-full bg-white px-2 py-0.5"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

