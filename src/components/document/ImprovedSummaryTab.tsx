import { useState } from "react";
import {
  FiDownload,
  FiTrash2,
  FiEdit2,
  FiCheck,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiEye,
  FiEyeOff,
  FiClock,
  FiFileText,
  FiAlertCircle,
  FiZap,
} from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSummary } from "../../lib/hooks/useSummary";
import type {
  CreateSummaryRequest,
  Summary,
} from "../../lib/api/summary.service";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

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

export const ImprovedSummaryTab = ({ fileId }: ImprovedSummaryTabProps) => {
  const { createSummary, getFileSummaries, deleteSummary, updateSummaryTitle } =
    useSummary();
  const queryClient = useQueryClient();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(
    null,
  );
  const [showThinking, setShowThinking] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const [customTitle, setCustomTitle] = useState("");

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

  const createMutation = useMutation({
    mutationFn: (params: CreateSummaryRequest) => createSummary(fileId, params),
    onSuccess: (newSummary) => {
      queryClient.setQueryData(["summaries", fileId], (old: Summary[] = []) => [
        newSummary,
        ...old.filter(isValidSummary),
      ]);
      setCustomTitle("");
      setShowCreateForm(false);
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
      if (selectedSummaryId === deletedId) {
        setSelectedSummaryId(null);
      }
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
      toast.success("Title updated successfully");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to update title";
      toast.error(message);
    },
  });

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
    if (window.confirm("Are you sure you want to delete this summary?")) {
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

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
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

  const selectedSummary = safeSummaries.find(
    (summary) => summary.id === selectedSummaryId,
  );
  const selectedContent = selectedSummary
    ? parseContent(selectedSummary.content)
    : null;

  if (fetchError) {
    const message =
      fetchError instanceof Error
        ? fetchError.message
        : "Failed to load summaries";
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="p-4 bg-red-100 rounded-full inline-block mb-4">
            <FiAlertCircle size={32} className="text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Failed to Load Summaries
          </h3>
          <p className="text-slate-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      <div className="bg-white border-b border-slate-200/80 px-5 py-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Summaries
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {safeSummaries.length} summary
              {safeSummaries.length === 1 ? "" : "ies"} available
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium text-sm shadow-sm shadow-indigo-600/20"
          >
            <FiPlus size={15} />
            New Summary
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white border-b border-slate-200/80 px-5 py-4">
          <div className="max-w-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-md">
                  <FiZap size={14} className="text-indigo-600" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">
                  Generate Summary
                </h4>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Title <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(event) => setCustomTitle(event.target.value)}
                  placeholder="e.g., Chapter 3 Summary"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-slate-50/50"
                />
              </div>

              <button
                onClick={handleGenerateSummary}
                disabled={createMutation.isPending}
                className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm shadow-indigo-600/20"
              >
                {createMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  "Generate Summary"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div
          className={`${selectedSummaryId ? "w-72" : "flex-1"} border-r border-slate-200/80 bg-white overflow-y-auto transition-all duration-300`}
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <span className="animate-spin rounded-full h-7 w-7 border-2 border-indigo-200 border-t-indigo-600" />
            </div>
          ) : safeSummaries.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="p-3 bg-slate-100 rounded-xl inline-block mb-3">
                <FiFileText size={28} className="text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium text-sm mb-1">
                No summaries yet
              </p>
              <p className="text-xs text-slate-400">
                Create your first summary above
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-1.5">
              {safeSummaries.map((summary) => {
                const isSelected = selectedSummaryId === summary.id;
                return (
                  <div
                    key={summary.id}
                    onClick={() => setSelectedSummaryId(summary.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-200 shadow-sm"
                        : "bg-white border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {editingId === summary.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(event) =>
                                setEditTitle(event.target.value)
                              }
                              onClick={(event) => event.stopPropagation()}
                              className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-teal-500"
                            />
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleSaveEdit(summary.id);
                              }}
                              disabled={updateMutation.isPending}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                            >
                              <FiCheck size={16} />
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleCancelEdit();
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <h4 className="font-semibold text-slate-800 text-sm truncate mb-1">
                              {summary.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <FiFileText size={11} />
                                {summary.wordCount} words
                              </span>
                              <span className="flex items-center gap-1">
                                <FiClock size={11} />
                                {new Date(
                                  summary.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {editingId !== summary.id && (
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleStartEdit(summary);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Edit title"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              downloadSummary(summary);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Download"
                          >
                            <FiDownload size={13} />
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(summary.id);
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedSummaryId && selectedContent && (
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <div className="border-b border-slate-200/80 px-5 py-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    {selectedSummary?.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>{selectedSummary?.wordCount} words</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{selectedSummary?.tokensUsed} tokens</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{selectedSummary?.modelUsed}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSummaryId(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="max-w-3xl mx-auto">
                {selectedContent.hasThinking && (
                  <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        setShowThinking((prev) => ({
                          ...prev,
                          [selectedSummaryId]: !prev[selectedSummaryId],
                        }))
                      }
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-amber-800 font-medium">
                        {showThinking[selectedSummaryId] ? (
                          <FiEyeOff size={18} />
                        ) : (
                          <FiEye size={18} />
                        )}
                        <span>AI Thinking Process</span>
                      </div>
                      {showThinking[selectedSummaryId] ? (
                        <FiChevronUp className="text-amber-600" />
                      ) : (
                        <FiChevronDown className="text-amber-600" />
                      )}
                    </button>
                    {showThinking[selectedSummaryId] && (
                      <div className="px-4 py-3 border-t border-amber-200 bg-white">
                        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                          {selectedContent.thinkingContent}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-white rounded-lg border border-slate-100 p-5">
                  <div className="prose prose-slate prose-sm max-w-none">
                    <ReactMarkdown>
                      {selectedContent.cleanContent}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
