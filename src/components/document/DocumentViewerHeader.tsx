import { FiArrowLeft, FiBookOpen } from "react-icons/fi";

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
    <div className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 text-white shadow-lg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_48%)]" />
      <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="relative px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <button
              onClick={onBackToDashboard}
              disabled={isSessionEnding}
              className="shrink-0 flex items-center gap-2 px-3 py-2 bg-white/14 hover:bg-white/22 rounded-xl transition-colors border border-white/25"
            >
              <FiArrowLeft size={16} />
              <span className="font-medium text-sm">
                {isSessionEnding ? "Ending..." : "Back"}
              </span>
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

          <div className="flex flex-col md:flex-row items-end md:items-center gap-2">
            {isStudySessionActive ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex rounded-lg bg-emerald-500/20 border border-emerald-300/45 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                  Session Active
                </span>
                <button
                  onClick={onEndSession}
                  disabled={isSessionEnding}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSessionEnding ? "Ending..." : "End Session"}
                </button>
              </div>
            ) : (
              <button
                onClick={onStartSession}
                disabled={isSessionStarting || isSessionBootstrapLoading}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/16 hover:bg-white/24 border border-white/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSessionStarting ? "Starting..." : "Start Session"}
              </button>
            )}

            <div className="hidden md:flex items-center gap-2 rounded-xl bg-white/12 p-1 border border-white/20">
              {(["both", "document", "content"] as const).map((state) => (
                <button
                  key={state}
                  onClick={() => onSetPanelState(state)}
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerHeader;
