import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FiZoomIn, FiZoomOut, FiMaximize, FiMinimize } from "react-icons/fi";

import "./PDFViewer.css";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  fileUrl: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const PDFViewer = ({
  fileUrl,
  isExpanded,
  onToggleExpand,
}: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4">
          {/* Page Navigation */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              disabled={pageNumber <= 1}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-slate-700 font-medium">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={() =>
                setPageNumber((prev) => Math.min(prev + 1, numPages))
              }
              disabled={pageNumber >= numPages}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            title="Zoom Out"
          >
            <FiZoomOut size={18} />
          </button>
          <span className="text-sm text-slate-700 font-medium min-w-15 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            title="Zoom In"
          >
            <FiZoomIn size={18} />
          </button>
          <div className="w-px h-6 bg-slate-300 mx-2" />
          <button
            onClick={onToggleExpand}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
          </button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex justify-center">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
              </div>
            }
            error={
              <div className="text-center p-8 text-red-600">
                Failed to load PDF. Please try again.
              </div>
            }
          >
            <Page pageNumber={pageNumber} scale={scale} className="shadow-lg" />
          </Document>
        </div>
      </div>
    </div>
  );
};
