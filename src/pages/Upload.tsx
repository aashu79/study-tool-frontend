import { useState } from "react";
import DashboardLayout from "../components/common/DashboardLayout";
import FileCard from "../components/dashboard/FileCard";
import { Upload as AntUpload, Button, Spin, Empty } from "antd";
import {
  FiUpload,
  FiFileText,
  FiImage,
  FiFile,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import { InboxOutlined } from "@ant-design/icons";
import { useUploadFiles, useFiles } from "../lib/hooks/useFile";
import type { UploadFile } from "antd";
import toast from "react-hot-toast";

const { Dragger } = AntUpload;

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024;
const MAX_FILE_SIZE_LABEL = "1 MB";

const UploadPage = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const uploadMutation = useUploadFiles();
  const { data: filesData, isLoading: filesLoading } = useFiles({
    sortOrder: "desc",
    limit: 6,
    page: 1,
  });

  const getFileIcon = (type: string) => {
    if (type.includes("image"))
      return <FiImage className="text-blue-500 shrink-0" size={16} />;
    if (type.includes("pdf"))
      return <FiFileText className="text-rose-500 shrink-0" size={16} />;
    if (type.includes("document") || type.includes("word"))
      return <FiFileText className="text-emerald-500 shrink-0" size={16} />;
    return <FiFile className="text-slate-400 shrink-0" size={16} />;
  };

  const handleUpload = () => {
    if (fileList.length === 0) return;
    const oversizedFiles = fileList.filter(
      (f) => (f.size || 0) > MAX_FILE_SIZE_BYTES,
    );
    if (oversizedFiles.length > 0) {
      toast.error(
        `${oversizedFiles.length} file(s) exceed the ${MAX_FILE_SIZE_LABEL} limit.`,
      );
      return;
    }
    const files = fileList.map((f) => f.originFileObj as File);
    uploadMutation.mutate(files, { onSuccess: () => setFileList([]) });
  };

  const removeFile = (file: UploadFile) =>
    setFileList(fileList.filter((f) => f.uid !== file.uid));

  const acceptedTypes = [
    {
      icon: <FiFileText size={16} className="text-rose-500" />,
      label: "PDF",
      ext: ".pdf",
    },
    {
      icon: <FiFileText size={16} className="text-blue-500" />,
      label: "Word",
      ext: ".docx",
    },
    {
      icon: <FiFile size={16} className="text-violet-500" />,
      label: "PPT",
      ext: ".pptx",
    },
    {
      icon: <FiFileText size={16} className="text-slate-500" />,
      label: "Text",
      ext: ".txt",
    },
    {
      icon: <FiImage size={16} className="text-green-500" />,
      label: "Image",
      ext: ".jpg/.png",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* PAGE HEADER */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white shadow-lg shadow-emerald-200">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/15 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <FiUpload size={22} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">
                Upload Study Materials
              </h1>
              <p className="text-white/80 text-sm mt-0.5 font-medium">
                Add notes, PDFs and presentations Ã‚Â· Max file size:{" "}
                {MAX_FILE_SIZE_LABEL}
              </p>
            </div>
          </div>
        </div>

        {/* ACCEPTED FILE TYPES */}
        <div className="flex flex-wrap gap-2">
          {acceptedTypes.map((type) => (
            <div
              key={type.label}
              className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600"
            >
              {type.icon}
              <span>{type.label}</span>
              <span className="text-slate-400">{type.ext}</span>
            </div>
          ))}
        </div>

        {/* UPLOAD SECTION */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <Dragger
            multiple
            fileList={fileList}
            onChange={({ fileList: newFileList }) => {
              const valid: UploadFile[] = [];
              const rejected: string[] = [];
              for (const file of newFileList) {
                if ((file.size || 0) > MAX_FILE_SIZE_BYTES)
                  rejected.push(file.name);
                else valid.push(file);
              }
              if (rejected.length > 0) {
                toast.error(
                  `${rejected.join(", ")} exceed the ${MAX_FILE_SIZE_LABEL} limit`,
                );
              }
              setFileList(valid);
            }}
            beforeUpload={() => false}
            showUploadList={false}
            style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #f0fdfa 100%)",
              border: "2px dashed #6ee7b7",
              borderRadius: 16,
            }}
          >
            <div className="py-8 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                <InboxOutlined style={{ fontSize: 28, color: "#10b981" }} />
              </div>
              <p className="font-black text-slate-800 text-lg mb-1">
                Drop files here or click to browse
              </p>
              <p className="text-slate-500 text-sm">
                Supported: PDF, DOCX, PPT, TXT, JPG, PNG Ã¢â‚¬â€ max{" "}
                {MAX_FILE_SIZE_LABEL} per file
              </p>
            </div>
          </Dragger>

          {/* FILE LIST */}
          {fileList.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-800 text-sm">
                  Selected ({fileList.length} file
                  {fileList.length > 1 ? "s" : ""})
                </span>
                <button
                  onClick={() => setFileList([])}
                  className="text-xs text-rose-500 font-semibold hover:text-rose-700 flex items-center gap-1 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <FiX size={12} />
                  Clear All
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {fileList.map((file) => {
                  const fileSize = file.size || 0;
                  const isOversized = fileSize > MAX_FILE_SIZE_BYTES;
                  return (
                    <div
                      key={file.uid}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        isOversized
                          ? "bg-rose-50 border-rose-200"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center">
                        {getFileIcon(file.type || "")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-400">
                            {(fileSize / 1024).toFixed(1)} KB
                          </p>
                          {isOversized && (
                            <span className="flex items-center gap-1 text-xs text-rose-600 font-semibold">
                              <FiAlertCircle size={11} />
                              Exceeds {MAX_FILE_SIZE_LABEL}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition-colors shrink-0"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm rounded-xl shadow-sm shadow-emerald-200 hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FiUpload size={15} />
                      Upload {fileList.length} File
                      {fileList.length > 1 ? "s" : ""}
                      <FiArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RECENT UPLOADS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <FiCheckCircle size={15} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Latest Uploads
              </h3>
              <p className="text-xs text-slate-400">
                Your most recently added files
              </p>
            </div>
          </div>

          {filesLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
            </div>
          ) : filesData?.files && filesData.files.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filesData.files.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm font-medium">
                No files uploaded yet.
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Upload your first file above!
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UploadPage;
