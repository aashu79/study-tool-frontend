import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { UniversalDocumentViewer } from "../common/UniversalDocumentViewer";
import { ImprovedSummaryTab } from "./ImprovedSummaryTab";
import { QuizTab } from "./QuizTab";
import { FlashcardsTab } from "./FlashcardsTab";
import { DocumentChatTab } from "./DocumentChatTab";
import ProcessingStatusDisplay from "./ProcessingStatusDisplay";

interface DocumentViewerContentProps {
  fileId: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  activeTab: "summary" | "quiz" | "flashcards" | "chat";
  panelState: "both" | "document" | "content";
  processingStatus: string;
  studySessionId: string | null;
  onDocumentExpand: () => void;
  onContentExpand: () => void;
  onSetPanelState: (state: "both" | "document" | "content") => void;
}

const expandButtonClassName =
  "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2";

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
      className={`h-full min-h-0 gap-5 ${
        panelState === "both"
          ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]"
          : "grid grid-cols-1"
      }`}
    >
      {panelState !== "content" ? (
        <section
          className={`relative min-h-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm ${
            panelState === "both" ? "order-2 lg:order-1" : ""
          }`}
        >
          <div className="absolute right-5 top-5 z-10">
            {panelState === "both" ? (
              <button
                onClick={onDocumentExpand}
                className={expandButtonClassName}
                title="Expand document"
              >
                <FiMaximize2 size={17} />
              </button>
            ) : (
              <button
                onClick={() => onSetPanelState("both")}
                className={expandButtonClassName}
                title="Show split view"
              >
                <FiMinimize2 size={17} />
              </button>
            )}
          </div>

          <UniversalDocumentViewer
            fileUrl={fileUrl}
            fileName={fileName}
            mimeType={mimeType}
            isExpanded={panelState === "document"}
            onToggleExpand={onDocumentExpand}
          />
        </section>
      ) : null}

      {panelState !== "document" ? (
        <section
          className={`relative min-h-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm ${
            panelState === "both" ? "order-1 lg:order-2" : ""
          }`}
        >
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex shrink-0 justify-end px-5 pt-5">
              {panelState === "both" ? (
                <button
                  onClick={onContentExpand}
                  className={expandButtonClassName}
                  title="Expand study panel"
                >
                  <FiMaximize2 size={17} />
                </button>
              ) : (
                <button
                  onClick={() => onSetPanelState("both")}
                  className={expandButtonClassName}
                  title="Show split view"
                >
                  <FiMinimize2 size={17} />
                </button>
              )}
            </div>

            {processingStatus && processingStatus !== "COMPLETED" ? (
              <div className="shrink-0 px-6 pt-4">
                <ProcessingStatusDisplay
                  processingStatus={processingStatus}
                  fileId={fileId}
                />
              </div>
            ) : null}

            <div className="min-h-0 flex-1 px-2 pb-2 pt-4 sm:px-3">
              <div
                className={`h-full min-h-0 rounded-[24px] bg-slate-50 ${
                  activeTab === "chat" ? "overflow-hidden" : "overflow-y-auto"
                }`}
              >
                {activeTab === "summary" ? (
                  <ImprovedSummaryTab fileId={fileId} />
                ) : null}
                {activeTab === "quiz" ? (
                  <QuizTab
                    fileId={fileId}
                    processingStatus={processingStatus}
                    studySessionId={studySessionId}
                  />
                ) : null}
                {activeTab === "flashcards" ? (
                  <FlashcardsTab
                    fileId={fileId}
                    processingStatus={processingStatus}
                  />
                ) : null}
                {activeTab === "chat" ? (
                  <DocumentChatTab
                    fileId={fileId}
                    processingStatus={processingStatus}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default DocumentViewerContent;
