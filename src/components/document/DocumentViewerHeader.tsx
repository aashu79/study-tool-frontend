import { FiArrowLeft, FiBookOpen, FiPlay, FiSquare } from "react-icons/fi";

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
    <div className="relative overflow-hidden bg-linear-to-r from-slate-900 via-indigo-900 to-violet-900 text-white shadow-xl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
      <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative px-4 py-3.5 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={onBackToDashboard}
              disabled={isSessionEnding}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 border border-white/15 hover:border-white/25"
            >
              <FiArrowLeft size={15} />
              <span className="font-medium text-sm hidden sm:inline">
                {isSessionEnding ? "Ending..." : "Back"}
              </span>
            </button>
            <div className="hidden sm:block w-px h-8 bg-white/20" />
            <div className="hidden sm:flex p-2 bg-indigo-500/20 rounded-lg border border-indigo-400/20">
              <FiBookOpen size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold truncate max-w-[40vw] lg:max-w-xl">
                {fileName}
              </h1>
              <p className="text-xs text-white/60 mt-0.5 truncate">
                {mimeType || "Document"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isStudySessionActive ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-xs font-medium text-emerald-300">
                    Active
                  </span>
                </div>
                <button
                  onClick={onEndSession}
                  disabled={isSessionEnding}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-red-500/80 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-red-500/20"
                >
                  <FiSquare size={13} />
                  {isSessionEnding ? "Ending..." : "End"}
                </button>
              </div>
            ) : (
              <button
                onClick={onStartSession}
                disabled={isSessionStarting || isSessionBootstrapLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-indigo-500/30"
              >
                <FiPlay size={13} />
                {isSessionStarting ? "Starting..." : "Start Session"}
              </button>
            )}

            <div className="hidden md:flex items-center rounded-lg bg-white/8 p-0.5 border border-white/10">
              {(["both", "document", "content"] as const).map((state) => (
                <button
                  key={state}
                  onClick={() => onSetPanelState(state)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    panelState === state
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {state === "both"
                    ? "Split"
                    : state === "document"
                      ? "Doc"
                      : "Content"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerHeader;
