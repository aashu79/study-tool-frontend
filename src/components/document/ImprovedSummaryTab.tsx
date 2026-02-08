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
} from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSummary } from "../../lib/hooks/useSummary";
import type { CreateSummaryRequest, Summary } from "../../lib/api/summary.service";
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
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);
  const [showThinking, setShowThinking] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const [customTitle, setCustomTitle] = useState("");
  const [chunkLimit, setChunkLimit] = useState(20);
  const [useVectorSearch, setUseVectorSearch] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
      setSearchQuery("");
      setChunkLimit(20);
      setUseVectorSearch(true);
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
      queryClient.setQueryData(
        ["summaries", fileId],
        (old: Summary[] = []) =>
          old.filter(isValidSummary).filter((summary) => summary.id !== deletedId),
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
      queryClient.setQueryData(
        ["summaries", fileId],
        (old: Summary[] = []) =>
          old
            .filter(isValidSummary)
            .map((summary) => (summary.id === id ? updatedSummary : summary)),
      );
      setEditingId(null);
      toast.success("Title updated successfully");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update title";
      toast.error(message);
    },
  });

  const handleGenerateSummary = () => {
    if (createMutation.isPending) {
      return;
    }

    createMutation.mutate({
      customTitle: customTitle.trim() || undefined,
      chunkLimit,
      useVectorSearch,
      searchQuery: searchQuery.trim() || undefined,
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

  const selectedSummary = safeSummaries.find((summary) => summary.id === selectedSummaryId);
  const selectedContent = selectedSummary
    ? parseContent(selectedSummary.content)
    : null;

  if (fetchError) {
    const message =
      fetchError instanceof Error ? fetchError.message : "Failed to load summaries";
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
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Summaries</h3>
            <p className="text-sm text-slate-600 mt-0.5">
              {safeSummaries.length} summary
              {safeSummaries.length === 1 ? "" : "ies"} available
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 font-medium shadow-sm"
          >
            <FiPlus size={18} />
            Create Summary
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white border-b border-slate-200 px-6 py-5 shadow-sm">
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-slate-800">
                Generate New Summary
              </h4>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Custom Title <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(event) => setCustomTitle(event.target.value)}
                  placeholder="e.g., Chapter 3 Summary"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Chunk Limit: {chunkLimit}
                </label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={chunkLimit}
                  onChange={(event) => setChunkLimit(parseInt(event.target.value, 10))}
                  className="w-full accent-teal-600"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Maximum number of chunks to use for summary generation
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="vectorSearch"
                  checked={useVectorSearch}
                  onChange={(event) => setUseVectorSearch(event.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 accent-teal-600"
                />
                <label
                  htmlFor="vectorSearch"
                  className="text-sm text-slate-700 font-medium"
                >
                  Use intelligent content selection{" "}
                  <span className="text-teal-600">(recommended)</span>
                </label>
              </div>

              {useVectorSearch && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Focus Query <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="e.g., main concepts and key points"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Specify what to focus on in the summary
                  </p>
                </div>
              )}

              <button
                onClick={handleGenerateSummary}
                disabled={createMutation.isPending}
                className="w-full bg-linear-to-r from-teal-600 to-cyan-600 text-white py-2.5 px-4 rounded-lg hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
              >
                {createMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Summary...
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
          className={`${selectedSummaryId ? "w-80" : "flex-1"} border-r border-slate-200 bg-white overflow-y-auto transition-all duration-300`}
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
          ) : safeSummaries.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="p-4 bg-slate-100 rounded-full inline-block mb-4">
                <FiFileText size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium mb-1">No summaries yet</p>
              <p className="text-sm text-slate-500">
                Click "Create Summary" to generate your first one.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {safeSummaries.map((summary) => {
                const isSelected = selectedSummaryId === summary.id;
                return (
                  <div
                    key={summary.id}
                    onClick={() => setSelectedSummaryId(summary.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-linear-to-r from-teal-50 to-cyan-50 border-teal-300 shadow-sm"
                        : "bg-white border-slate-200 hover:border-teal-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {editingId === summary.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(event) => setEditTitle(event.target.value)}
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
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                              <span className="flex items-center gap-1">
                                <FiFileText size={12} />
                                {summary.wordCount} words
                              </span>
                              <span className="flex items-center gap-1">
                                <FiClock size={12} />
                                {new Date(summary.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {editingId !== summary.id && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleStartEdit(summary);
                            }}
                            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                            title="Edit title"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              downloadSummary(summary);
                            }}
                            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                            title="Download"
                          >
                            <FiDownload size={14} />
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(summary.id);
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <FiTrash2 size={14} />
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
          <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {selectedSummary?.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                    <span>{selectedSummary?.wordCount} words</span>
                    <span>|</span>
                    <span>{selectedSummary?.tokensUsed} tokens</span>
                    <span>|</span>
                    <span>{selectedSummary?.modelUsed}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSummaryId(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
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

                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown>{selectedContent.cleanContent}</ReactMarkdown>
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

