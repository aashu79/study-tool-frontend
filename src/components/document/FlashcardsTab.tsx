import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiLayers, FiTarget } from "react-icons/fi";
import toast from "react-hot-toast";
import type {
  CreateFlashcardSetRequest,
  FlashcardSetListResponse,
} from "../../lib/api/flashcard.service";
import { useFlashcards } from "../../lib/hooks/useFlashcards";
import { FlashcardCreatePanel } from "./flashcards/FlashcardCreatePanel";
import { FlashcardDetailPanel } from "./flashcards/FlashcardDetailPanel";
import { FlashcardLibraryPanel } from "./flashcards/FlashcardLibraryPanel";

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

export const FlashcardsTab = ({ fileId, processingStatus }: FlashcardsTabProps) => {
  const queryClient = useQueryClient();
  const {
    createFlashcardSetFromFile,
    listUserFlashcardSets,
    getFlashcardSet,
    renameFlashcardSet,
    deleteFlashcardSet,
  } = useFlashcards();

  const [page, setPage] = useState(1);
  const [showCreatePanel, setShowCreatePanel] = useState(true);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [createResetSignal, setCreateResetSignal] = useState(0);

  const disableGeneration = !!processingStatus && processingStatus !== "COMPLETED";
  const disableReason = getProcessingBlockingMessage(processingStatus);

  const setsQuery = useQuery({
    queryKey: ["flashcardSets", fileId, page, PAGE_SIZE],
    queryFn: () => listUserFlashcardSets({ fileId, page, limit: PAGE_SIZE }),
    enabled: !!fileId,
    staleTime: 30 * 1000,
  });

  const sets = setsQuery.data?.data ?? EMPTY_SETS;
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
      setCreateResetSignal((prev) => prev + 1);
      setShowCreatePanel(false);
      setSelectedSetId(createdSet.id);
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
                ? {
                    ...set,
                    title: updatedSet.title,
                    updatedAt: updatedSet.updatedAt,
                  }
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

      queryClient.setQueryData(
        ["flashcardSets", fileId, page, PAGE_SIZE],
        (oldData: FlashcardSetListResponse | undefined) => {
          if (!oldData) {
            return oldData;
          }

          const filtered = oldData.data.filter((set) => set.id !== deletedSetId);
          return {
            ...oldData,
            data: filtered,
            pagination: {
              ...oldData.pagination,
              total: Math.max(0, oldData.pagination.total - 1),
            },
          };
        },
      );

      queryClient.removeQueries({ queryKey: ["flashcardSetDetails", deletedSetId] });
      queryClient.invalidateQueries({ queryKey: ["flashcardSets", fileId] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to delete flashcard set";
      toast.error(message);
    },
  });

  const setsErrorMessage = useMemo(() => {
    const error = setsQuery.error;
    return error instanceof Error ? error.message : undefined;
  }, [setsQuery.error]);

  const setDetailsErrorMessage = useMemo(() => {
    const error = setDetailsQuery.error;
    return error instanceof Error ? error.message : undefined;
  }, [setDetailsQuery.error]);

  const visibleCardsCount = useMemo(
    () =>
      sets.reduce((total, set) => total + (set.cardsCount ?? set.cardCount ?? 0), 0),
    [sets],
  );

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 sm:p-5">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Flashcard Studio
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Generate focused card sets, review all cards, and study with an
                interactive mode.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-emerald-700 font-semibold">
                  Sets
                </p>
                <p className="text-sm font-semibold text-emerald-900 flex items-center gap-1">
                  <FiLayers size={14} />
                  {setsQuery.data?.pagination.total ?? sets.length}
                </p>
              </div>
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-cyan-700 font-semibold">
                  Cards
                </p>
                <p className="text-sm font-semibold text-cyan-900 flex items-center gap-1">
                  <FiTarget size={14} />
                  {visibleCardsCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[22rem,1fr] gap-4">
          <div className="space-y-4">
            <FlashcardCreatePanel
              key={createResetSignal}
              isOpen={showCreatePanel}
              onToggle={() => setShowCreatePanel((prev) => !prev)}
              onSubmit={(payload) => createMutation.mutate(payload)}
              isSubmitting={createMutation.isPending}
              disabled={disableGeneration}
              disableReason={disableReason}
            />

            <FlashcardLibraryPanel
              sets={sets}
              selectedSetId={activeSetId}
              isLoading={setsQuery.isLoading}
              errorMessage={setsErrorMessage}
              isRefreshing={setsQuery.isFetching}
              pagination={setsQuery.data?.pagination}
              onSelectSet={(setId) => setSelectedSetId(setId)}
              onPageChange={(nextPage) => setPage(nextPage)}
              onRetry={() => setsQuery.refetch()}
            />
          </div>

          <FlashcardDetailPanel
            key={activeSetId ?? "empty"}
            flashcardSet={setDetailsQuery.data}
            isLoading={setDetailsQuery.isLoading && !!activeSetId}
            loadError={setDetailsErrorMessage}
            isRenaming={renameMutation.isPending}
            isDeleting={deleteMutation.isPending}
            onRename={(title) => {
              if (!activeSetId) {
                toast.error("Please select a flashcard set first.");
                return;
              }
              renameMutation.mutate({ setId: activeSetId, title });
            }}
            onDelete={() => {
              if (!activeSetId) {
                toast.error("Please select a flashcard set first.");
                return;
              }
              deleteMutation.mutate(activeSetId);
            }}
            onRetry={() => setDetailsQuery.refetch()}
          />
        </div>
      </div>
    </div>
  );
};
