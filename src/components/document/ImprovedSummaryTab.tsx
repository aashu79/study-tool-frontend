import { useEffect, useState } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiEdit2,
  FiFileText,
  FiList,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { useSummary } from "../../lib/hooks/useSummary";
import type {
  CreateSummaryRequest,
  Summary,
} from "../../lib/api/summary.service";
import {
  Drawer,
  IconButton,
  Modal,
  SkeletonBlock,
} from "./DocumentOverlay";

interface ImprovedSummaryTabProps {
  fileId: string;
}

const isValidSummary = (value: unknown): value is Summary => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const summary = value as Partial<Summary>;
  return (
    typeof summary.id === "string" &&
    typeof summary.title === "string" &&
    typeof summary.content === "string"
  );
};

const parseContent = (content: string) => {
  const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
  const thinkMatches = [...content.matchAll(thinkRegex)];
  const thinkingContent = thinkMatches.map((match) => match[1]).join("\n\n");
  const cleanContent = content.replace(thinkRegex, "").trim();

  return {
    thinkingContent,
    cleanContent,
    hasThinking: thinkMatches.length > 0,
  };
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const ImprovedSummaryTab = ({ fileId }: ImprovedSummaryTabProps) => {
  const { createSummary, getFileSummaries, deleteSummary, updateSummaryTitle } =
    useSummary();
  const queryClient = useQueryClient();

  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);
  const [showThinking, setShowThinking] = useState<Record<string, boolean>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const {
    data: summaries = [],
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["summaries", fileId],
    queryFn: async () => {
      const result = await getFileSummaries(fileId);
      return result.data;
    },
    enabled: !!fileId,
    staleTime: 30 * 1000,
    refetchOnMount: false,
  });

  const safeSummaries = summaries.filter(isValidSummary);

  useEffect(() => {
    if (safeSummaries.length === 0) {
      setSelectedSummaryId(null);
      return;
    }

    if (
      !selectedSummaryId ||
      !safeSummaries.some((summary) => summary.id === selectedSummaryId)
    ) {
      setSelectedSummaryId(safeSummaries[0].id);
    }
  }, [safeSummaries, selectedSummaryId]);

  const createMutation = useMutation({
    mutationFn: (params: CreateSummaryRequest) => createSummary(fileId, params),
    onSuccess: (newSummary) => {
      queryClient.setQueryData(["summaries", fileId], (old: Summary[] = []) => [
        newSummary,
        ...old.filter(isValidSummary),
      ]);
      setCustomTitle("");
      setShowCreateModal(false);
      setSelectedSummaryId(newSummary.id);
      toast.success("Summary generated successfully");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate summary. Please try again.";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSummary,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(["summaries", fileId], (old: Summary[] = []) =>
        old
          .filter(isValidSummary)
          .filter((summary) => summary.id !== deletedId),
      );
      toast.success("Summary deleted successfully");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to delete summary.";
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      updateSummaryTitle(id, title),
    onSuccess: (updatedSummary, { id }) => {
      queryClient.setQueryData(["summaries", fileId], (old: Summary[] = []) =>
        old
          .filter(isValidSummary)
          .map((summary) => (summary.id === id ? updatedSummary : summary)),
      );
      setEditingId(null);
      setEditTitle("");
      toast.success("Title updated successfully");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to update title";
      toast.error(message);
    },
  });

  const selectedSummary = safeSummaries.find(
    (summary) => summary.id === selectedSummaryId,
  );
  const parsedContent = selectedSummary
    ? parseContent(selectedSummary.content)
    : null;

  const handleGenerateSummary = () => {
    if (createMutation.isPending) {
      return;
    }

    createMutation.mutate({
      customTitle: customTitle.trim() || undefined,
      chunkLimit: 3,
      useVectorSearch: true,
    });
  };

  const handleDelete = (summaryId: string) => {
    if (window.confirm("Delete this summary?")) {
      deleteMutation.mutate(summaryId);
    }
  };

  const handleStartEdit = (summary: Summary) => {
    setEditingId(summary.id);
    setEditTitle(summary.title);
  };

  const handleSaveEdit = (summaryId: string) => {
    if (!editTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    updateMutation.mutate({ id: summaryId, title: editTitle.trim() });
  };

  const downloadSummary = (summary: Summary) => {
    const blob = new Blob([summary.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${summary.title}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Summary downloaded");
  };

  if (fetchError) {
    const message =
      fetchError instanceof Error ? fetchError.message : "Failed to load summaries";

    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-md rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
            <FiFileText size={24} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Failed to load summaries
          </h3>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-full flex-col bg-slate-50">
        <div className="flex items-start justify-between gap-4 px-6 py-6 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
              Summary
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Document summary
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Read the current summary or open history to revisit previous versions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowHistoryDrawer(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <FiList size={16} />
              History
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <FiPlus size={16} />
              New Summary
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 px-6 pb-6 sm:px-8 sm:pb-8">
          {isLoading ? (
            <div className="space-y-4">
              <SkeletonBlock className="h-20 w-full rounded-[28px]" />
              <SkeletonBlock className="h-[65vh] w-full rounded-[32px]" />
            </div>
          ) : !selectedSummary || !parsedContent ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-lg rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <FiFileText size={26} />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-slate-900">
                  No summaries yet
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Generate a clean document summary and keep every previous version
                  tucked away in history.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                >
                  <FiPlus size={16} />
                  New Summary
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col gap-4">
              <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {editingId === selectedSummary.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <IconButton
                          title="Save title"
                          onClick={() => handleSaveEdit(selectedSummary.id)}
                          disabled={updateMutation.isPending}
                        >
                          <FiCheck size={17} />
                        </IconButton>
                        <IconButton
                          title="Cancel edit"
                          onClick={() => {
                            setEditingId(null);
                            setEditTitle("");
                          }}
                        >
                          <FiX size={17} />
                        </IconButton>
                      </div>
                    ) : (
                      <>
                        <h3 className="truncate text-2xl font-semibold text-slate-900">
                          {selectedSummary.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                          Generated on {formatDate(selectedSummary.createdAt)}
                        </p>
                      </>
                    )}
                  </div>

                  {editingId !== selectedSummary.id ? (
                    <div className="flex items-center gap-3">
                      <IconButton
                        title="Rename summary"
                        onClick={() => handleStartEdit(selectedSummary)}
                      >
                        <FiEdit2 size={17} />
                      </IconButton>
                      <IconButton
                        title="Download summary"
                        onClick={() => downloadSummary(selectedSummary)}
                      >
                        <FiDownload size={17} />
                      </IconButton>
                      <IconButton
                        title="Delete summary"
                        onClick={() => handleDelete(selectedSummary.id)}
                        disabled={deleteMutation.isPending}
                        className="text-rose-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <FiTrash2 size={17} />
                      </IconButton>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="min-h-0 flex-1 rounded-[32px] border border-slate-200 bg-white shadow-sm">
                <div className="flex h-full min-h-0 flex-col">
                  {parsedContent.hasThinking ? (
                    <button
                      type="button"
                      onClick={() =>
                        setShowThinking((prev) => ({
                          ...prev,
                          [selectedSummary.id]: !prev[selectedSummary.id],
                        }))
                      }
                      className="flex min-h-14 items-center justify-between border-b border-slate-200 px-6 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-inset"
                    >
                      <span>AI Thinking Process</span>
                      {showThinking[selectedSummary.id] ? (
                        <FiChevronUp size={18} />
                      ) : (
                        <FiChevronDown size={18} />
                      )}
                    </button>
                  ) : null}

                  {parsedContent.hasThinking && showThinking[selectedSummary.id] ? (
                    <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm leading-7 text-slate-600">
                      <div className="whitespace-pre-wrap">
                        {parsedContent.thinkingContent}
                      </div>
                    </div>
                  ) : null}

                  <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                    <article className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                      <div className="prose max-w-none text-[15px] leading-7 text-slate-700">
                        <ReactMarkdown>{parsedContent.cleanContent}</ReactMarkdown>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        title="Summary History"
        description="Open a saved summary, rename it, or export a copy."
      >
        {safeSummaries.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm font-medium text-slate-700">
              No saved summaries yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Generate one to start building history for this document.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {safeSummaries.map((summary) => {
              const isActive = summary.id === selectedSummaryId;

              return (
                <button
                  type="button"
                  key={summary.id}
                  onClick={() => {
                    setSelectedSummaryId(summary.id);
                    setShowHistoryDrawer(false);
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    isActive
                      ? "border-teal-200 bg-teal-50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                    {summary.title}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{formatDate(summary.createdAt)}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{summary.wordCount} words</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Drawer>

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Summary"
        description="Create another summary version without disturbing your existing ones."
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Title
              <span className="ml-1 text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(event) => setCustomTitle(event.target.value)}
              placeholder="e.g., Midterm revision summary"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={createMutation.isPending}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiPlus size={16} />
            {createMutation.isPending ? "Generating..." : "Generate Summary"}
          </button>
        </div>
      </Modal>
    </>
  );
};
