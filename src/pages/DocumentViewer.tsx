import { useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";
import { useDocumentData } from "../lib/hooks/useDocumentData";
import { useProcessingStatus } from "../lib/hooks/useProcessingStatus";
import { useStudySession } from "../lib/hooks/useStudySession";
import { usePanelState } from "../lib/hooks/usePanelState";
import { useTabs } from "../lib/hooks/useTabs";
import { useStudySessionPrompt } from "../lib/hooks/useStudySessionPrompt";
import toast from "react-hot-toast";
import DocumentViewerHeader from "../components/document/DocumentViewerHeader";
import DocumentViewerTabs from "../components/document/DocumentViewerTabs";
import DocumentViewerContent from "../components/document/DocumentViewerContent";
import StudySessionPrompt from "../components/document/StudySessionPrompt";

const DocumentViewer = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();

  // Custom hooks
  const {
    data: documentData,
    isLoading: isDocumentLoading,
    error: documentError,
  } = useDocumentData(fileId);
  const { data: statusData } = useProcessingStatus(fileId);
  const {
    studySessionId,
    isSessionStarting,
    isSessionEnding,
    isSessionBootstrapLoading,
    logStudyEvent,
    logDistraction,
    endStudySession,
    startStudySession,
  } = useStudySession(fileId);
  const {
    panelState,
    setPanelState,
    handleDocumentExpand,
    handleContentExpand,
  } = usePanelState();
  const { activeTab, setActiveTab, tabs } = useTabs(
    studySessionId,
    logStudyEvent,
  );
  const { showStudySessionPrompt, setShowStudySessionPrompt } =
    useStudySessionPrompt(
      documentData,
      fileId,
      isSessionBootstrapLoading,
      studySessionId,
    );

  const processingStatus = statusData?.processingStatus || "";

  // Error handling
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

  useEffect(() => {
    if (!studySessionId) {
      return;
    }
    setShowStudySessionPrompt(false);
  }, [setShowStudySessionPrompt, studySessionId]);

  // Inactivity tracking
  useEffect(() => {
    if (!studySessionId) {
      return;
    }

    let inactivityTimeoutId: number | null = null;
    let inactivityStartedAt: number | null = null;
    let windowBlurStartedAt: number | null = null;
    let tabHiddenStartedAt: number | null = null;

    const clearInactivityTimer = () => {
      if (inactivityTimeoutId !== null) {
        window.clearTimeout(inactivityTimeoutId);
        inactivityTimeoutId = null;
      }
    };

    const flushInactivityDuration = (reason: string) => {
      if (inactivityStartedAt === null) {
        return;
      }

      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - inactivityStartedAt) / 1000),
      );
      inactivityStartedAt = null;

      logDistraction("INACTIVITY_TIMEOUT", durationSeconds, {
        source: "document_viewer",
        reason,
      });
    };

    const scheduleInactivityTimer = () => {
      clearInactivityTimer();
      inactivityTimeoutId = window.setTimeout(() => {
        if (inactivityStartedAt === null) {
          inactivityStartedAt = Date.now();
        }
      }, 60 * 1000); // INACTIVITY_TIMEOUT_MS
    };

    const handleActivity = () => {
      flushInactivityDuration("user_activity");
      scheduleInactivityTimer();
    };

    const handleWindowBlur = () => {
      if (document.visibilityState === "hidden") {
        return;
      }

      flushInactivityDuration("window_blur");
      if (windowBlurStartedAt === null) {
        windowBlurStartedAt = Date.now();
      }
    };

    const handleWindowFocus = () => {
      if (windowBlurStartedAt !== null) {
        const durationSeconds = Math.max(
          1,
          Math.round((Date.now() - windowBlurStartedAt) / 1000),
        );
        windowBlurStartedAt = null;

        logDistraction("WINDOW_BLUR", durationSeconds, {
          source: "document_viewer",
        });
      }

      handleActivity();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushInactivityDuration("tab_hidden");
        if (tabHiddenStartedAt === null) {
          tabHiddenStartedAt = Date.now();
        }
        return;
      }

      if (tabHiddenStartedAt !== null) {
        const durationSeconds = Math.max(
          1,
          Math.round((Date.now() - tabHiddenStartedAt) / 1000),
        );
        tabHiddenStartedAt = null;

        logDistraction("TAB_SWITCH", durationSeconds, {
          source: "document_viewer",
        });
      }

      handleActivity();
    };

    // Initial setup
    scheduleInactivityTimer();

    // Event listeners
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInactivityTimer();
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [studySessionId, logDistraction]);

  // End session on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (studySessionId) {
        void endStudySession("INCOMPLETE", { silentOnError: true });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [studySessionId, endStudySession]);

  const handleBackToDashboard = useCallback(async () => {
    await endStudySession("INCOMPLETE", { silentOnError: true });
    navigate("/dashboard");
  }, [endStudySession, navigate]);

  const handleStartSession = useCallback(() => {
    setShowStudySessionPrompt(false);
    void startStudySession();
  }, [setShowStudySessionPrompt, startStudySession]);

  const fileName = documentData?.fileName || "Document";
  const fileUrl = documentData?.fileUrl || "";
  const mimeType = documentData?.mimeType || "application/octet-stream";
  const isStudySessionActive = Boolean(studySessionId);

  if (isDocumentLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4" />
        <p className="text-slate-600 font-medium">Loading document...</p>
      </div>
    );
  }

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
            onClick={handleBackToDashboard}
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
      <DocumentViewerHeader
        fileName={fileName}
        mimeType={mimeType}
        isStudySessionActive={isStudySessionActive}
        isSessionEnding={isSessionEnding}
        isSessionStarting={isSessionStarting}
        isSessionBootstrapLoading={isSessionBootstrapLoading}
        panelState={panelState}
        onBackToDashboard={handleBackToDashboard}
        onEndSession={() => void endStudySession("COMPLETED", { notify: true })}
        onStartSession={handleStartSession}
        onSetPanelState={setPanelState}
      />

      {!isStudySessionActive && !isSessionBootstrapLoading && (
        <div className="px-3 sm:px-6 pt-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-amber-900">
              Study session is not active. Start one to track learning activity
              and distractions.
            </p>
            <button
              onClick={handleStartSession}
              disabled={isSessionStarting}
              className="px-3 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSessionStarting ? "Starting..." : "Start Session"}
            </button>
          </div>
        </div>
      )}

      {panelState !== "document" && (
        <div
          className={`px-3 sm:px-6 z-10 ${
            isStudySessionActive || isSessionBootstrapLoading
              ? "-mt-4 sm:-mt-5"
              : "mt-3"
          }`}
        >
          <DocumentViewerTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      )}

      <div className="flex-1 p-3 sm:p-6 overflow-hidden">
        <DocumentViewerContent
          fileId={fileId!}
          fileUrl={fileUrl}
          fileName={fileName}
          mimeType={mimeType}
          activeTab={activeTab}
          panelState={panelState}
          processingStatus={processingStatus}
          studySessionId={studySessionId}
          onDocumentExpand={handleDocumentExpand}
          onContentExpand={handleContentExpand}
          onSetPanelState={setPanelState}
        />
      </div>

      <StudySessionPrompt
        isVisible={showStudySessionPrompt}
        isSessionStarting={isSessionStarting}
        onStartSession={handleStartSession}
        onDismiss={() => setShowStudySessionPrompt(false)}
      />
    </div>
  );
};

export default DocumentViewer;
