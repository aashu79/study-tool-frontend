import { useState } from "react";
import DashboardLayout from "../components/common/DashboardLayout";
import FileCard from "../components/dashboard/FileCard";
import { Upload as AntUpload, Button, Spin, Empty } from "antd";
import {
  FiUpload,
  FiFileText,
  FiImage,
  FiFile,
  FiCheck,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import { InboxOutlined, CloudUploadOutlined } from "@ant-design/icons";
import { useUploadFiles, useFiles } from "../lib/hooks/useFile";
import type { UploadFile } from "antd";
import toast from "react-hot-toast";

const { Dragger } = AntUpload;

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB
const MAX_FILE_SIZE_LABEL = "1 MB";

const UploadPage = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const uploadMutation = useUploadFiles();
  const { data: filesData, isLoading: filesLoading } = useFiles({
    sortOrder: "desc",
    limit: 5,
    page: 1,
  });

  const getFileIcon = (type: string) => {
    if (type.includes("image"))
      return <FiImage className="text-blue-600 shrink-0" size={16} />;
    if (type.includes("pdf"))
      return <FiFileText className="text-red-600 shrink-0" size={16} />;
    if (type.includes("document") || type.includes("word"))
      return <FiFileText className="text-green-600 shrink-0" size={16} />;
    if (type.includes("presentation") || type.includes("powerpoint"))
      return <FiFileText className="text-purple-600 shrink-0" size={16} />;
    return <FiFile className="text-teal-600 shrink-0" size={16} />;
  };

  const handleUpload = () => {
    if (fileList.length === 0) return;

    // Validate file sizes before uploading
    const oversizedFiles = fileList.filter(
      (file) => (file.size || 0) > MAX_FILE_SIZE_BYTES,
    );
    if (oversizedFiles.length > 0) {
      toast.error(
        `${oversizedFiles.length} file(s) exceed the ${MAX_FILE_SIZE_LABEL} limit. Please remove them first.`,
      );
      return;
    }

    const files = fileList.map((file) => file.originFileObj as File);
    uploadMutation.mutate(files, {
      onSuccess: () => {
        setFileList([]);
      },
    });
  };

  const removeFile = (file: UploadFile) => {
    setFileList(fileList.filter((f) => f.uid !== file.uid));
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-slate-900 via-emerald-900 to-teal-900 p-6 text-white shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-teal-500/10 rounded-full blur-[100px]" />

          <div className="relative z-10">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-lg">
                <CloudUploadOutlined className="text-2xl" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold mb-1">
                  Upload Study Materials
                </h1>
                <p className="text-white/70 text-sm font-medium">
                  Upload your notes, PDFs, or presentations. Max file size:{" "}
                  {MAX_FILE_SIZE_LABEL}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* UPLOAD SECTION */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5">
            <Dragger
              multiple
              fileList={fileList}
              onChange={({ fileList: newFileList }) => {
                // Filter out files that exceed the size limit
                const validFiles: UploadFile[] = [];
                const rejected: string[] = [];
                for (const file of newFileList) {
                  if ((file.size || 0) > MAX_FILE_SIZE_BYTES) {
                    rejected.push(file.name);
                  } else {
                    validFiles.push(file);
                  }
                }
                if (rejected.length > 0) {
                  toast.error(
                    `${rejected.join(", ")} ${rejected.length === 1 ? "exceeds" : "exceed"} the ${MAX_FILE_SIZE_LABEL} limit`,
                  );
                }
                setFileList(validFiles);
              }}
              beforeUpload={() => false}
              className="border-2! border-dashed! border-emerald-200! hover:border-emerald-400! bg-linear-to-br! from-emerald-50/30! to-teal-50/30! rounded-xl! transition-all"
              showUploadList={false}
            >
              <div className="py-6">
                <p className="ant-upload-drag-icon mb-3">
                  <InboxOutlined className="text-emerald-500 text-5xl" />
                </p>
                <p className="ant-upload-text font-semibold text-slate-800 text-lg mb-1">
                  Click or drag files to upload
                </p>
                <p className="ant-upload-hint text-slate-500 text-sm font-medium px-4">
                  PDF, DOCX, PPT, TXT, JPG, PNG — max {MAX_FILE_SIZE_LABEL} per
                  file
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                  <span className="px-2.5 py-1 bg-white rounded-full text-xs font-medium text-slate-500 border border-slate-200">
                    Documents
                  </span>
                  <span className="px-2.5 py-1 bg-white rounded-full text-xs font-medium text-slate-500 border border-slate-200">
                    Images
                  </span>
                  <span className="px-2.5 py-1 bg-white rounded-full text-xs font-medium text-slate-500 border border-slate-200">
                    Presentations
                  </span>
                </div>
              </div>
            </Dragger>

            {/* FILE LIST */}
            {fileList.length > 0 && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 text-sm">
                    Selected Files ({fileList.length})
                  </h3>
                  <Button
                    size="small"
                    danger
                    onClick={() => setFileList([])}
                    icon={<FiX size={13} />}
                  >
                    Clear All
                  </Button>
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {fileList.map((file) => {
                    const fileSize = file.size || 0;
                    const isOversized = fileSize > MAX_FILE_SIZE_BYTES;
                    return (
                      <div
                        key={file.uid}
                        className={`flex items-center justify-between p-2.5 rounded-lg border ${
                          isOversized
                            ? "bg-red-50 border-red-200"
                            : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {getFileIcon(file.type || "")}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-800 text-sm truncate">
                              {file.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-slate-500">
                                {(fileSize / 1024).toFixed(1)} KB
                              </p>
                              {isOversized && (
                                <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                                  <FiAlertCircle size={11} />
                                  Exceeds {MAX_FILE_SIZE_LABEL}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file)}
                          className="ml-2 p-1 hover:bg-red-100 rounded text-red-500 transition-colors shrink-0"
                        >
                          <FiX size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {fileList.length > 0 && (
              <div className="mt-5 flex justify-end">
                <Button
                  type="primary"
                  size="large"
                  icon={<FiUpload />}
                  onClick={handleUpload}
                  loading={uploadMutation.isPending}
                  className="bg-emerald-600! hover:bg-emerald-700! rounded-lg! h-11! px-6! font-semibold! shadow-sm! shadow-emerald-600/20! transition-all"
                >
                  Upload {fileList.length} File{fileList.length > 1 ? "s" : ""}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* LATEST UPLOADED FILES */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <FiCheck className="text-emerald-600" size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">
                Latest Uploads
              </h3>
              <p className="text-xs text-slate-500">
                Your most recent study materials
              </p>
            </div>
          </div>

          {filesLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
            </div>
          ) : filesData?.files && filesData.files.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filesData.files.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-slate-500 font-medium">
                  No files uploaded yet. Upload your first file above!
                </span>
              }
            />
          )}
        </div>

        {/* FILE TYPE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FileTypeCard
            icon={<FiFileText className="text-indigo-600" size={22} />}
            label="Documents"
            description="PDF, DOCX, TXT, RTF"
            color="from-indigo-50 to-violet-50"
          />
          <FileTypeCard
            icon={<FiImage className="text-blue-600" size={22} />}
            label="Images"
            description="JPG, PNG, GIF, SVG"
            color="from-blue-50 to-cyan-50"
          />
          <FileTypeCard
            icon={<FiFile className="text-violet-600" size={22} />}
            label="Other Files"
            description="PPT, XLS, ZIP, CSV"
            color="from-violet-50 to-pink-50"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

interface FileTypeCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}

const FileTypeCard = ({
  icon,
  label,
  description,
  color,
}: FileTypeCardProps) => {
  return (
    <div
      className={`bg-linear-to-br ${color} border border-slate-200/80 rounded-lg p-3.5 flex items-center gap-3`}
    >
      <div className="shrink-0">{icon}</div>
      <div>
        <h3 className="font-semibold text-slate-800 text-sm mb-0.5">{label}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
};

export default UploadPage;
