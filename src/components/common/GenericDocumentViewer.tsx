import { FiMaximize, FiMinimize, FiFile } from "react-icons/fi";

interface GenericDocumentViewerProps {
  fileUrl: string;
  fileName: string;
  mimeType: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const GenericDocumentViewer = ({
  fileUrl,
  fileName,
  mimeType,
  isExpanded,
  onToggleExpand,
}: GenericDocumentViewerProps) => {
  const isImage = mimeType.includes("image");
  const isOfficeDoc =
    mimeType.includes("word") ||
    mimeType.includes("powerpoint") ||
    mimeType.includes("excel") ||
    mimeType.includes("presentation") ||
    mimeType.includes("spreadsheet");

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <FiFile className="text-slate-600" size={20} />
          <span className="text-sm font-medium text-slate-700 truncate max-w-md">
            {fileName}
          </span>
        </div>
        <button
          onClick={onToggleExpand}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          title={isExpanded ? "Minimize" : "Maximize"}
        >
          {isExpanded ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isImage ? (
          <div className="flex justify-center">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full h-auto shadow-lg rounded-lg"
            />
          </div>
        ) : isOfficeDoc ? (
          <div className="w-full h-full">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                fileUrl,
              )}`}
              className="w-full h-full border-0 rounded-lg shadow-lg"
              title={fileName}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <FiFile size={64} className="text-slate-400 mb-4" />
            <p className="text-slate-600 mb-2">
              Preview not available for this file type
            </p>
            <p className="text-sm text-slate-500 mb-4">{mimeType}</p>
            <a
              href={fileUrl}
              download={fileName}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
