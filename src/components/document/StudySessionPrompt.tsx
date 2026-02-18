interface StudySessionPromptProps {
  isVisible: boolean;
  isSessionStarting: boolean;
  onStartSession: () => void;
  onDismiss: () => void;
}

const StudySessionPrompt = ({
  isVisible,
  isSessionStarting,
  onStartSession,
  onDismiss,
}: StudySessionPromptProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-[1px] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-900">
          Start a study session?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          If you start now, this document view will track study activity, quiz
          actions, and distractions until you leave or end the session.
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Start Later
          </button>
          <button
            onClick={onStartSession}
            disabled={isSessionStarting}
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSessionStarting ? "Starting..." : "Start Session"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudySessionPrompt;
