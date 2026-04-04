import {
  FiArrowLeft,
  FiBookOpen,
  FiColumns,
  FiFileText,
  FiPlay,
  FiSidebar,
  FiSquare,
} from "react-icons/fi";

interface DocumentViewerHeaderProps {
  fileName: string;
  mimeType: string;
  isStudySessionActive: boolean;
  isSessionEnding: boolean;
  isSessionStarting: boolean;
  isSessionBootstrapLoading: boolean;
  panelState: "both" | "document" | "content";
  onBackToDashboard: () => void;
  onEndSession: () => void;
  onStartSession: () => void;
  onSetPanelState: (state: "both" | "document" | "content") => void;
}

const DocumentViewerHeader = ({
  fileName,
  mimeType,
  isStudySessionActive,
  isSessionEnding,
  isSessionStarting,
  isSessionBootstrapLoading,
  panelState,
  onBackToDashboard,
  onEndSession,
  onStartSession,
  onSetPanelState,
}: DocumentViewerHeaderProps) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="px-4 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              onClick={onBackToDashboard}
              disabled={isSessionEnding}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiArrowLeft size={15} />
              <span className="hidden sm:inline">
                {isSessionEnding ? "Ending..." : "Back"}
              </span>
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-700 shadow-sm">
              <FiBookOpen size={20} />
            </div>

            <div className="min-w-0 space-y-1">
              <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
                {fileName}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  <FiFileText size={12} />
                  {mimeType || "Document"}
                </span>

                {isStudySessionActive ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    Study session active
                  </span>
                ) : null}

                {isSessionBootstrapLoading ? (
                  <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-300 border-t-teal-600 animate-spin" />
                    Checking session
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="hidden items-center rounded-2xl border border-slate-200 bg-slate-50 p-1 md:flex">
              {(["both", "document", "content"] as const).map((state) => {
                const label =
                  state === "both"
                    ? "Split"
                    : state === "document"
                      ? "Document"
                      : "Study";
                const Icon =
                  state === "both"
                    ? FiColumns
                    : state === "document"
                      ? FiFileText
                      : FiSidebar;

                return (
                  <button
                    key={state}
                    onClick={() => onSetPanelState(state)}
                    className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                      panelState === state
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                );
              })}
            </div>

            {isStudySessionActive ? (
              <button
                onClick={onEndSession}
                disabled={isSessionEnding}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSquare size={13} />
                {isSessionEnding ? "Ending..." : "End Session"}
              </button>
            ) : (
              <button
                onClick={onStartSession}
                disabled={isSessionStarting || isSessionBootstrapLoading}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiPlay size={14} />
                {isSessionStarting ? "Starting..." : "Start Session"}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DocumentViewerHeader;
