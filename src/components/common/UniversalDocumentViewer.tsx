import { useState } from "react";
import {
  FiMaximize2,
  FiMinimize2,
  FiFile,
  FiDownload,
  FiExternalLink,
} from "react-icons/fi";

interface UniversalDocumentViewerProps {
  fileUrl: string;
  fileName: string;
  mimeType: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

const isPrivateOrLocalHost = (url: string): boolean => {
  try {
    const { hostname } = new URL(url);

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0"
    ) {
      return true;
    }

    return (
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    );
  } catch {
    return false;
  }
};

export const UniversalDocumentViewer = ({
  fileUrl,
  fileName,
  mimeType,
  isExpanded,
  onToggleExpand,
}: UniversalDocumentViewerProps) => {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const isImage = mimeType.includes("image");
  const isPDF = mimeType === "application/pdf" || getFileExtension(fileName) === "pdf";
  const isOfficeDoc =
    mimeType.includes("word") ||
    mimeType.includes("powerpoint") ||
    mimeType.includes("excel") ||
    mimeType.includes("presentation") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("document") ||
    ["docx", "doc", "pptx", "ppt", "xlsx", "xls"].includes(
      getFileExtension(fileName),
    );
  const isPrivateDocumentUrl = isPrivateOrLocalHost(fileUrl);
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
            <FiFile className="text-slate-700" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 truncate leading-tight">
              {fileName}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">{mimeType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={fileUrl}
            download={fileName}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 hover:text-slate-900"
            title="Download file"
          >
            <FiDownload size={16} />
          </a>
          <button
            onClick={onToggleExpand}
            className="p-2 rounded-lg bg-cyan-100 hover:bg-cyan-200 transition-colors text-cyan-700 hover:text-cyan-900"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_35%)]">
        {isImage && !imageLoadFailed ? (
          <div className="flex justify-center items-center p-4 sm:p-6 h-full">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              onError={() => setImageLoadFailed(true)}
            />
          </div>
        ) : isPDF ? (
          <div className="h-full w-full p-3 sm:p-4">
            <div className="h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <object
                data={fileUrl}
                type="application/pdf"
                className="w-full h-full min-h-[500px]"
                aria-label={fileName}
              >
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Unable to Display PDF Preview
                  </h3>
                  <p className="text-slate-600 mb-4 max-w-md">
                    Open the signed URL directly or download the file.
                  </p>
                  <div className="flex items-center gap-3">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700 flex items-center gap-2"
                    >
                      <FiExternalLink size={16} />
                      Open PDF
                    </a>
                    <a
                      href={fileUrl}
                      download={fileName}
                      className="px-4 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors font-medium"
                    >
                      Download File
                    </a>
                  </div>
                </div>
              </object>
            </div>
          </div>
        ) : isOfficeDoc && !isPrivateDocumentUrl ? (
          <div className="h-full w-full p-3 sm:p-4">
            <div className="h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <iframe
                src={officeViewerUrl}
                className="w-full h-full min-h-[500px] border-0 rounded-lg"
                title={fileName}
                allowFullScreen
              />
            </div>
          </div>
        ) : isOfficeDoc && isPrivateDocumentUrl ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="p-4 bg-slate-200 rounded-full mb-4">
              <FiFile size={48} className="text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Preview Not Available For Local Office Files
            </h3>
            <p className="text-slate-600 mb-4 max-w-md">
              Office Online cannot access `localhost` or private MinIO URLs.
              Use download/open for local development preview.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700 flex items-center gap-2"
              >
                <FiExternalLink size={16} />
                Open URL
              </a>
              <a
                href={fileUrl}
                download={fileName}
                className="px-4 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors font-medium"
              >
                Download File
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="p-4 bg-slate-200 rounded-full mb-4">
              <FiFile size={48} className="text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Preview Not Available
            </h3>
            <p className="text-slate-600 mb-1">
              This file type cannot be previewed
            </p>
            <p className="text-sm text-slate-500 mb-6">{mimeType}</p>
            <a
              href={fileUrl}
              download={fileName}
              className="px-6 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors font-medium shadow-sm"
            >
              Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
