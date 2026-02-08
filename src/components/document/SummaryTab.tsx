import { useState } from "react";
import { FiDownload, FiTrash2, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSummary } from "../../lib/hooks/useSummary";
import type { CreateSummaryRequest, Summary } from "../../lib/api/summary.service";
import ReactMarkdown from "react-markdown";

interface SummaryTabProps {
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

export const SummaryTab = ({ fileId }: SummaryTabProps) => {
  const { createSummary, getFileSummaries, deleteSummary, updateSummaryTitle } =
    useSummary();
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const [customTitle, setCustomTitle] = useState("");
  const [chunkLimit, setChunkLimit] = useState(20);
  const [useVectorSearch, setUseVectorSearch] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: summaries = [], isLoading } = useQuery({
    queryKey: ["summaries", fileId],
    queryFn: async () => {
      const result = await getFileSummaries(fileId);
      return result.data;
    },
    enabled: !!fileId,
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
    },
  });

  const handleGenerateSummary = () => {
    createMutation.mutate({
      customTitle: customTitle || undefined,
      chunkLimit,
      useVectorSearch,
      searchQuery: searchQuery || undefined,
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
    updateMutation.mutate({ id: summaryId, title: editTitle });
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
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Generate Summary
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Custom Title (optional)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(event) => setCustomTitle(event.target.value)}
              placeholder="e.g., Chapter 3 Summary"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Chunk Limit: {chunkLimit}
            </label>
            <input
              type="range"
              min={5}
              max={50}
              value={chunkLimit}
              onChange={(event) => setChunkLimit(parseInt(event.target.value, 10))}
              className="w-full"
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
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            <label htmlFor="vectorSearch" className="text-sm text-slate-700">
              Use intelligent content selection (recommended)
            </label>
          </div>

          {useVectorSearch && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Focus Query (optional)
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="e.g., main concepts and key points"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">
                Specify what to focus on in the summary
              </p>
            </div>
          )}

          <button
            onClick={handleGenerateSummary}
            disabled={createMutation.isPending}
            className="w-full bg-linear-to-r from-teal-600 to-cyan-600 text-white py-2 px-4 rounded-lg hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
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

        {createMutation.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : "Failed to generate summary"}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
          </div>
        ) : safeSummaries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">
              No summaries yet. Generate your first summary above!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {safeSummaries.map((summary) => (
              <div
                key={summary.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="bg-linear-to-r from-teal-50 to-cyan-50 p-4 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingId === summary.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(event) => setEditTitle(event.target.value)}
                            className="flex-1 px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                          <button
                            onClick={() => handleSaveEdit(summary.id)}
                            disabled={updateMutation.isPending}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                          >
                            <FiCheck size={18} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      ) : (
                        <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          {summary.title}
                          <button
                            onClick={() => handleStartEdit(summary)}
                            className="p-1 text-slate-500 hover:text-teal-600 hover:bg-white rounded"
                          >
                            <FiEdit2 size={14} />
                          </button>
                        </h4>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                        <span>{summary.wordCount} words</span>
                        <span>|</span>
                        <span>{summary.tokensUsed} tokens</span>
                        <span>|</span>
                        <span>{new Date(summary.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadSummary(summary)}
                        className="p-2 text-teal-600 hover:bg-white rounded-lg transition-colors"
                        title="Download"
                      >
                        <FiDownload size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(summary.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-red-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 prose prose-sm max-w-none">
                  <ReactMarkdown>{summary.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

