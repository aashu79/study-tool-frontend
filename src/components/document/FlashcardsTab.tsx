import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiShuffle,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import type {
  CreateFlashcardSetRequest,
  FlashcardSetListResponse,
} from "../../lib/api/flashcard.service";
import { useFlashcards } from "../../lib/hooks/useFlashcards";
import { toRenderableMarkdown } from "../../lib/utils/markdown";
import { Drawer, Modal, SkeletonBlock } from "./DocumentOverlay";

interface FlashcardsTabProps {
  fileId: string;
  processingStatus?: string;
}

const PAGE_SIZE = 8;
const EMPTY_SETS: FlashcardSetListResponse["data"] = [];

const getProcessingBlockingMessage = (status?: string) => {
  if (!status || status === "COMPLETED") {
    return "";
  }

  if (status === "PROCESSING") {
    return "Flashcard generation will be available after document processing completes.";
  }

  if (status === "FAILED") {
    return "Document processing failed. Reprocess the file before generating flashcards.";
  }

  return "Document is not ready yet. Please process it before generating flashcards.";
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

export const FlashcardsTab = ({
  fileId,
  processingStatus,
}: FlashcardsTabProps) => {
  const queryClient = useQueryClient();
  const {
    createFlashcardSetFromFile,
    listUserFlashcardSets,
    getFlashcardSet,
    renameFlashcardSet,
    deleteFlashcardSet,
  } = useFlashcards();

  const [page, setPage] = useState(1);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSetsDrawer, setShowSetsDrawer] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [position, setPosition] = useState(0);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [formState, setFormState] = useState({
    title: "",
    numberOfCards: 15,
    focusAreasText: "",
    specialInstruction: "",
  });

  const disableGeneration =
    !!processingStatus && processingStatus !== "COMPLETED";
  const disableReason = getProcessingBlockingMessage(processingStatus);

  const setsQuery = useQuery({
    queryKey: ["flashcardSets", fileId, page, PAGE_SIZE],
    queryFn: () => listUserFlashcardSets({ fileId, page, limit: PAGE_SIZE }),
    enabled: !!fileId,
    staleTime: 30 * 1000,
  });

  const sets = setsQuery.data?.data ?? EMPTY_SETS;

  useEffect(() => {
    if (sets.length === 0) {
      setSelectedSetId(null);
      return;
    }

    if (!selectedSetId || !sets.some((set) => set.id === selectedSetId)) {
      setSelectedSetId(sets[0].id);
    }
  }, [selectedSetId, sets]);

  const activeSetId = selectedSetId ?? sets[0]?.id ?? null;

  const setDetailsQuery = useQuery({
    queryKey: ["flashcardSetDetails", activeSetId],
    queryFn: () => getFlashcardSet(activeSetId!),
    enabled: !!activeSetId,
    staleTime: 30 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateFlashcardSetRequest) =>
      createFlashcardSetFromFile(fileId, payload),
    onSuccess: (createdSet) => {
      toast.success("Flashcard set generated successfully");
      setSelectedSetId(createdSet.id);
      setPosition(0);
      setShuffledOrder([]);
      setIsFlipped(false);
      setShowCreateModal(false);
      setPage(1);
      queryClient.setQueryData(["flashcardSetDetails", createdSet.id], createdSet);
      queryClient.invalidateQueries({ queryKey: ["flashcardSets", fileId] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to generate flashcards";
      toast.error(message);
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ setId, title }: { setId: string; title: string }) =>
      renameFlashcardSet(setId, title),
    onSuccess: (updatedSet) => {
      toast.success("Flashcard set renamed");
      setIsEditingTitle(false);
      setTitleDraft("");
      queryClient.setQueryData(["flashcardSetDetails", updatedSet.id], updatedSet);
      queryClient.setQueriesData(
        { queryKey: ["flashcardSets", fileId] },
        (oldData: FlashcardSetListResponse | undefined) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            data: oldData.data.map((set) =>
              set.id === updatedSet.id
                ? { ...set, title: updatedSet.title, updatedAt: updatedSet.updatedAt }
                : set,
            ),
          };
        },
      );
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to rename set";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (setId: string) => deleteFlashcardSet(setId),
    onSuccess: (_, deletedSetId) => {
      toast.success("Flashcard set deleted");
      if (activeSetId === deletedSetId) {
        setSelectedSetId(null);
      }
      queryClient.removeQueries({ queryKey: ["flashcardSetDetails", deletedSetId] });
      queryClient.invalidateQueries({ queryKey: ["flashcardSets", fileId] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to delete flashcard set";
      toast.error(message);
    },
  });

  const activeSet = setDetailsQuery.data;
  const cards = activeSet?.cards ?? [];
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
  const currentCard = cards[cardOrder[safePosition] ?? 0];
  const progressPercentage =
    cards.length > 0 ? ((safePosition + 1) / cards.length) * 100 : 0;

  useEffect(() => {
    setPosition(0);
    setShuffledOrder([]);
    setIsFlipped(false);
  }, [activeSetId]);

  const handleCreateSet = () => {
    if (disableGeneration || createMutation.isPending) {
      return;
    }

    createMutation.mutate({
      title: formState.title.trim() || undefined,
      numberOfCards: safeNumber(formState.numberOfCards, 5, 50, 15),
      focusAreas: toFocusAreas(formState.focusAreasText),
      specialInstruction: formState.specialInstruction.trim() || undefined,
      includeFormulas: true,
      includeExamples: true,
      useVectorSearch: true,
      chunkLimit: 3,
    });
  };

  const handleRenameSave = () => {
    const title = titleDraft.trim();
    if (!title || !activeSetId) {
      toast.error("Title cannot be empty.");
      return;
    }
    renameMutation.mutate({ setId: activeSetId, title });
  };

  const handleDelete = () => {
    if (!activeSetId || !activeSet) {
      return;
    }

    if (window.confirm(`Delete "${activeSet.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(activeSetId);
    }
  };

  const shuffleCards = () => {
    if (cards.length < 2) {
      return;
    }
    setShuffledOrder(
      cards.map((_, index) => index).sort(() => Math.random() - 0.5),
    );
    setPosition(0);
    setIsFlipped(false);
  };

  return (
    <>
      <div className="flex min-h-full flex-col bg-slate-50">
        <div className="flex items-start justify-between gap-4 px-6 py-6 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
              Flashcards
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Flashcard study
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Keep the active set front and center, then flip through cards at your own pace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSetsDrawer(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <FiLayers size={16} />
              Sets
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <FiPlus size={16} />
              New Set
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 px-6 pb-6 sm:px-8 sm:pb-8">
          {setsQuery.isLoading || (activeSetId && setDetailsQuery.isLoading) ? (
            <div className="space-y-4">
              <SkeletonBlock className="h-12 w-2/3 rounded-full" />
              <SkeletonBlock className="h-[68vh] w-full rounded-[32px]" />
            </div>
          ) : sets.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <FiPlus size={26} />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-slate-900">
                  No flashcard set yet
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Generate a new set and start studying from a large interactive card view.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
                >
                  <FiPlus size={16} />
                  New Set
                </button>
              </div>
            </div>
          ) : !activeSet ? (
            <div className="flex h-full items-center justify-center">
              <div className="rounded-[32px] border border-rose-200 bg-rose-50 p-8 text-center">
                <p className="text-sm font-semibold text-slate-900">
                  Failed to load the selected flashcard set.
                </p>
                <button
                  type="button"
                  onClick={() => setDetailsQuery.refetch()}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col gap-4">
              <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {isEditingTitle ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={titleDraft}
                          onChange={(event) => setTitleDraft(event.target.value)}
                          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          type="button"
                          onClick={handleRenameSave}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
                        >
                          <FiCheck size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingTitle(false);
                            setTitleDraft("");
                          }}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="truncate text-2xl font-semibold text-slate-900">
                            {activeSet.title}
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setTitleDraft(activeSet.title);
                              setIsEditingTitle(true);
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          {cards.length} cards in this set
                          <span className="mx-2 inline-block h-1 w-1 rounded-full bg-slate-300" />
                          Updated {formatDate(activeSet.updatedAt)}
                        </p>
                      </>
                    )}

                    {activeSet.focusAreas.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activeSet.focusAreas.map((area) => (
                          <span
                            key={`${activeSet.id}-${area}`}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={shuffleCards}
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
                    >
                      <FiShuffle size={15} />
                      Shuffle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShuffledOrder([]);
                        setPosition(0);
                        setIsFlipped(false);
                      }}
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
                    >
                      <FiRefreshCw size={15} />
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-700">
                    Card {cards.length > 0 ? safePosition + 1 : 0} of {cards.length}
                  </p>
                  {currentCard?.type ? (
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                      {currentCard.type}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-600 transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {currentCard ? (
                  <div className="mt-6 flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setIsFlipped((prev) => !prev)}
                      className="w-full max-w-3xl rounded-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                      style={{ perspective: "1600px" }}
                    >
                      <div
                        className="relative h-[26rem] w-full transition-transform duration-500"
                        style={{
                          transformStyle: "preserve-3d",
                          transform: isFlipped
                            ? "rotateY(180deg)"
                            : "rotateY(0deg)",
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-[32px] border border-slate-200 bg-slate-50 p-8 text-left shadow-sm"
                          style={{ backfaceVisibility: "hidden" }}
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
                            Front
                          </p>
                          {currentCard.topic ? (
                            <p className="mt-3 text-sm font-medium text-slate-500">
                              {currentCard.topic}
                            </p>
                          ) : null}
                          <div className="mt-5 text-3xl font-semibold leading-[1.4] text-slate-900">
                            <MarkdownBlock content={currentCard.front} />
                          </div>
                          {currentCard.tags.length > 0 ? (
                            <div className="mt-6 flex flex-wrap gap-2">
                              {currentCard.tags.map((tag) => (
                                <span
                                  key={`${currentCard.id}-${tag}`}
                                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div
                          className="absolute inset-0 rounded-[32px] border border-teal-200 bg-teal-50 p-8 text-left shadow-sm"
                          style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                          }}
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                            Back
                          </p>
                          <div className="mt-5 text-base leading-8 text-slate-800">
                            <MarkdownBlock content={currentCard.back} />
                          </div>
                          {currentCard.hint ? (
                            <div className="mt-6 rounded-2xl border border-amber-200 bg-white/80 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                Hint
                              </p>
                              <p className="mt-2 text-sm text-slate-700">
                                {currentCard.hint}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </button>

                    <p className="mt-4 text-sm text-slate-500">
                      Click the card to flip it.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
                    This set has no cards yet.
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPosition((prev) => Math.max(prev - 1, 0));
                      setIsFlipped(false);
                    }}
                    disabled={safePosition <= 0}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiChevronLeft size={16} />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFlipped((prev) => !prev)}
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white"
                  >
                    {isFlipped ? "Show Front" : "Flip Card"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPosition((prev) => Math.min(prev + 1, cards.length - 1));
                      setIsFlipped(false);
                    }}
                    disabled={safePosition >= cards.length - 1}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={showSetsDrawer}
        onClose={() => setShowSetsDrawer(false)}
        title="Flashcard Sets"
        description="Switch between saved sets for this document."
      >
        {sets.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm font-medium text-slate-700">No sets yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sets.map((set) => (
              <button
                type="button"
                key={set.id}
                onClick={() => {
                  setSelectedSetId(set.id);
                  setShowSetsDrawer(false);
                }}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  activeSetId === set.id
                    ? "border-teal-200 bg-teal-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                  {set.title}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{set.cardsCount ?? set.cardCount} cards</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{formatDate(set.createdAt)}</span>
                </div>
              </button>
            ))}

            {(setsQuery.data?.pagination.totalPages ?? 1) > 1 ? (
              <div className="flex items-center justify-between pt-2 text-sm">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-slate-500">
                  Page {setsQuery.data?.pagination.page ?? 1} of{" "}
                  {setsQuery.data?.pagination.totalPages ?? 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(
                        setsQuery.data?.pagination.totalPages ?? 1,
                        prev + 1,
                      ),
                    )
                  }
                  disabled={page >= (setsQuery.data?.pagination.totalPages ?? 1)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        )}
      </Drawer>

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Flashcard Set"
        description="Choose the size and focus areas for the next set."
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
                setFormState((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="e.g., Authentication systems"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Number of Cards
            </label>
            <input
              type="number"
              min={5}
              max={50}
              value={formState.numberOfCards}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  numberOfCards: safeNumber(Number(event.target.value), 5, 50, 15),
                }))
              }
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Focus Areas
              <span className="ml-1 text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={formState.focusAreasText}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  focusAreasText: event.target.value,
                }))
              }
              placeholder="e.g., document processing, retrieval, authentication"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
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
                setFormState((prev) => ({
                  ...prev,
                  specialInstruction: event.target.value,
                }))
              }
              placeholder="e.g., Add exam-style prompts and concise answers."
              className="w-full resize-none rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="button"
            onClick={handleCreateSet}
            disabled={disableGeneration || createMutation.isPending}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiPlus size={16} />
            {createMutation.isPending ? "Generating..." : "Generate Flashcards"}
          </button>
        </div>
      </Modal>
    </>
  );
};
