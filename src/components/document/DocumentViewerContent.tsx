import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { UniversalDocumentViewer } from "../common/UniversalDocumentViewer";
import { ImprovedSummaryTab } from "./ImprovedSummaryTab";
import { QuizTab } from "./QuizTab";
import { FlashcardsTab } from "./FlashcardsTab";
import ProcessingStatusDisplay from "./ProcessingStatusDisplay";

interface DocumentViewerContentProps {
  fileId: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  activeTab: "summary" | "quiz" | "flashcards";
  panelState: "both" | "document" | "content";
  processingStatus: string;
  studySessionId: string | null;
  onDocumentExpand: () => void;
  onContentExpand: () => void;
  onSetPanelState: (state: "both" | "document" | "content") => void;
}

const DocumentViewerContent = ({
  fileId,
  fileUrl,
  fileName,
  mimeType,
  activeTab,
  panelState,
  processingStatus,
  studySessionId,
  onDocumentExpand,
  onContentExpand,
  onSetPanelState,
}: DocumentViewerContentProps) => {
  return (
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
            onToggleExpand={onDocumentExpand}
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
              <ProcessingStatusDisplay
                processingStatus={processingStatus}
                fileId={fileId}
              />
            </div>
          )}

          <div className="h-full overflow-hidden">
            {activeTab === "summary" && <ImprovedSummaryTab fileId={fileId} />}
            {activeTab === "quiz" && (
              <QuizTab
                fileId={fileId}
                processingStatus={processingStatus}
                studySessionId={studySessionId}
              />
            )}
            {activeTab === "flashcards" && (
              <FlashcardsTab
                fileId={fileId}
                processingStatus={processingStatus}
              />
            )}
          </div>

          {panelState === "both" && (
            <button
              onClick={onContentExpand}
              className="absolute top-3 right-3 z-10 p-2.5 bg-white/95 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              title="Expand content panel"
            >
              <FiMaximize2 size={17} className="text-slate-700" />
            </button>
          )}

          {panelState !== "both" && (
            <button
              onClick={() => onSetPanelState("both")}
              className="absolute top-3 right-3 z-10 p-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors shadow-sm"
              title="Show both panels"
            >
              <FiMinimize2 size={17} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentViewerContent;
