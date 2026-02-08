import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiFileText,
  FiBookOpen,
  FiHelpCircle,
  FiCreditCard,
  FiAlertCircle,
  FiRefreshCw,
  FiMaximize2,
  FiMinimize2,
  FiArrowLeft,
} from "react-icons/fi";
import { fileService } from "../lib/api/file.service";
import { useProcessing } from "../lib/hooks/useProcessing";
import { UniversalDocumentViewer } from "../components/common/UniversalDocumentViewer";
import { ImprovedSummaryTab } from "../components/document/ImprovedSummaryTab";
import { QuizTab } from "../components/document/QuizTab";
import { FlashcardsTab } from "../components/document/FlashcardsTab";
import toast from "react-hot-toast";

type TabType = "summary" | "quiz" | "flashcards";
type PanelState = "both" | "document" | "content";

interface DocumentData {
  fileName: string;
  fileUrl: string;
  mimeType: string;
}

const DocumentViewer = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { getStatus, triggerProcessing } = useProcessing();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [panelState, setPanelState] = useState<PanelState>("both");

  const {
    data: documentData,
    isLoading: isDocumentLoading,
    error: documentError,
  } = useQuery<DocumentData>({
    queryKey: ["documentViewerFile", fileId],
    enabled: !!fileId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    queryFn: async () => {
      if (!fileId) {
        throw new Error("File ID is missing");
      }

      const [{ url }, filesData] = await Promise.all([
        fileService.getFileUrl(fileId),
        fileService.getFiles(),
      ]);
      const file = filesData.files.find((f) => f.id === fileId);

      return {
        fileName: file?.filename || "Document",
        fileUrl: url,
        mimeType: file?.mimetype || "application/octet-stream",
      };
    },
  });

  // Processing status query
  const { data: statusData } = useQuery({
    queryKey: ["processingStatus", fileId],
    queryFn: async () => {
      if (!fileId) return null;
      try {
        const status = await getStatus(fileId);
        return status;
      } catch (error: unknown) {
        console.error("Failed to fetch processing status:", error);
        return null;
      }
    },
    enabled: !!fileId,
    staleTime: 2 * 1000,
    refetchOnMount: false,
    refetchInterval: (data: unknown) => {
      const statusData = data as { processingStatus?: string } | null;
      return statusData?.processingStatus === "PROCESSING" ? 3000 : false;
    },
  });

  const processingStatus = statusData?.processingStatus || "";

  // Trigger processing mutation
  const triggerMutation = useMutation({
    mutationFn: triggerProcessing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processingStatus", fileId] });
      toast.success("Processing started successfully!");
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to trigger processing";
      toast.error(errorMessage);
    },
  });

  const handleTriggerProcessing = () => {
    if (!fileId) {
      toast.error("File ID is missing");
      return;
    }
    triggerMutation.mutate(fileId);
  };

  useEffect(() => {
    if (!documentError) return;

    const err = documentError as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    const errorMessage =
      err?.response?.data?.message || err?.message || "Failed to load document";
    toast.error(errorMessage);
  }, [documentError]);

  const tabs = [
    {
      id: "summary" as TabType,
      label: "Summary",
      icon: FiFileText,
      activeClasses:
        "text-cyan-700 bg-cyan-50 border-cyan-200 shadow-cyan-100/70",
      iconClasses: "bg-cyan-100 text-cyan-700",
      glowClasses: "from-cyan-500 to-blue-500",
    },
    {
      id: "quiz" as TabType,
      label: "Quiz",
      icon: FiHelpCircle,
      activeClasses:
        "text-orange-700 bg-orange-50 border-orange-200 shadow-orange-100/70",
      iconClasses: "bg-orange-100 text-orange-700",
      glowClasses: "from-orange-500 to-amber-500",
    },
    {
      id: "flashcards" as TabType,
      label: "Flashcards",
      icon: FiCreditCard,
      activeClasses:
        "text-emerald-700 bg-emerald-50 border-emerald-200 shadow-emerald-100/70",
      iconClasses: "bg-emerald-100 text-emerald-700",
      glowClasses: "from-emerald-500 to-teal-500",
    },
  ];

  const handleDocumentExpand = () => {
    setPanelState(panelState === "document" ? "both" : "document");
  };

  const handleContentExpand = () => {
    setPanelState(panelState === "content" ? "both" : "content");
  };

  const getStatusDisplay = () => {
    const statusConfig = {
      PENDING: {
        bg: "bg-yellow-50",
        text: "text-yellow-800",
        border: "border-yellow-200",
        icon: FiAlertCircle,
        message: "Document is pending processing",
      },
      PROCESSING: {
        bg: "bg-blue-50",
        text: "text-blue-800",
        border: "border-blue-200",
        icon: FiRefreshCw,
        message: "Document is being processed...",
      },
      FAILED: {
        bg: "bg-red-50",
        text: "text-red-800",
        border: "border-red-200",
        icon: FiAlertCircle,
        message: "Processing failed. Try triggering it again.",
      },
      COMPLETED: null,
    };

    const config = statusConfig[processingStatus as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <div
        className={`${config.bg} ${config.text} border ${config.border} p-4 rounded-xl flex items-center justify-between shadow-sm`}
      >
        <div className="flex items-center gap-3">
          <Icon
            size={20}
            className={processingStatus === "PROCESSING" ? "animate-spin" : ""}
          />
          <span className="font-medium">{config.message}</span>
        </div>
        {processingStatus !== "PROCESSING" && (
          <button
            onClick={handleTriggerProcessing}
            disabled={triggerMutation.isPending}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
          >
            {triggerMutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              "Process Now"
            )}
          </button>
        )}
      </div>
    );
  };

  if (isDocumentLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4" />
        <p className="text-slate-600 font-medium">Loading document...</p>
      </div>
    );
  }

  const fileName = documentData?.fileName || "Document";
  const fileUrl = documentData?.fileUrl || "";
  const mimeType = documentData?.mimeType || "application/octet-stream";

  if (documentError || !documentData) {
    const err = documentError as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    const errorMessage =
      err?.response?.data?.message || err?.message || "Failed to load document";

    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center max-w-md px-6">
          <div className="p-4 bg-red-100 rounded-full inline-block mb-4">
            <FiAlertCircle className="text-red-600" size={48} />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Error Loading Document
          </h2>
          <p className="text-slate-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
          >
            Back to Materials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 text-white shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_48%)]" />
        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <button
                onClick={() => navigate("/dashboard")}
                className="shrink-0 flex items-center gap-2 px-3 py-2 bg-white/14 hover:bg-white/22 rounded-xl transition-colors border border-white/25"
              >
                <FiArrowLeft size={16} />
                <span className="font-medium text-sm">Back</span>
              </button>
              <div className="hidden sm:block w-px h-10 bg-white/30" />
              <div className="hidden sm:flex p-2.5 bg-white/12 rounded-xl border border-white/25">
                <FiBookOpen size={22} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate max-w-[56vw] lg:max-w-2xl">
                  {fileName}
                </h1>
                <p className="text-xs sm:text-sm text-white/85 mt-0.5 truncate">
                  {mimeType || "Document"}
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 rounded-xl bg-white/12 p-1 border border-white/20">
              {(["both", "document", "content"] as PanelState[]).map(
                (state) => (
                  <button
                    key={state}
                    onClick={() => setPanelState(state)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      panelState === state
                        ? "bg-white text-cyan-800"
                        : "text-white/85 hover:text-white hover:bg-white/15"
                    }`}
                  >
                    {state === "both"
                      ? "Split"
                      : state === "document"
                        ? "Document"
                        : "Content"}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {panelState !== "document" && (
        <div className="px-3 sm:px-6 -mt-4 sm:-mt-5 z-10">
          <div className="rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200 p-2 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative overflow-hidden rounded-xl border px-4 py-3 text-left transition-all ${
                      isActive
                        ? `${tab.activeClasses} shadow-md`
                        : "border-transparent bg-slate-100/80 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tab.glowClasses} ${
                        isActive
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-60 transition-opacity"
                      }`}
                    />
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2 ${
                          isActive
                            ? tab.iconClasses
                            : "bg-white text-slate-500 group-hover:text-slate-700"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <span className="font-semibold text-sm sm:text-base">
                        {tab.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-3 sm:p-6 overflow-hidden">
        <div
          className={`h-full gap-4 sm:gap-5 ${
            panelState === "both" ? "flex flex-col lg:flex-row" : "flex"
          }`}
        >
          {panelState !== "content" && (
            <div
              className={`min-h-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-300 ${
                panelState === "both"
                  ? "w-full lg:w-[52%] h-1/2 lg:h-full"
                  : "w-full h-full"
              }`}
            >
              <UniversalDocumentViewer
                fileUrl={fileUrl}
                fileName={fileName}
                mimeType={mimeType}
                isExpanded={panelState === "document"}
                onToggleExpand={handleDocumentExpand}
              />
            </div>
          )}

          {panelState !== "document" && (
            <div
              className={`min-h-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden relative transition-all duration-300 ${
                panelState === "both"
                  ? "w-full lg:w-[48%] h-1/2 lg:h-full"
                  : "w-full h-full"
              }`}
            >
              {processingStatus && processingStatus !== "COMPLETED" && (
                <div className="p-4 border-b border-slate-200 bg-slate-50/85">
                  {getStatusDisplay()}
                </div>
              )}

              <div className="h-full overflow-hidden">
                {activeTab === "summary" && (
                  <ImprovedSummaryTab fileId={fileId!} />
                )}
                {activeTab === "quiz" && (
                  <QuizTab
                    fileId={fileId!}
                    processingStatus={processingStatus}
                  />
                )}
                {activeTab === "flashcards" && <FlashcardsTab />}
              </div>

              {panelState === "both" && (
                <button
                  onClick={handleContentExpand}
                  className="absolute top-3 right-3 z-10 p-2.5 bg-white/95 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                  title="Expand content panel"
                >
                  <FiMaximize2 size={17} className="text-slate-700" />
                </button>
              )}

              {panelState !== "both" && (
                <button
                  onClick={() => setPanelState("both")}
                  className="absolute top-3 right-3 z-10 p-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors shadow-sm"
                  title="Show both panels"
                >
                  <FiMinimize2 size={17} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
