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
} from "react-icons/fi";
import { InboxOutlined, CloudUploadOutlined } from "@ant-design/icons";
import { useUploadFiles, useFiles } from "../lib/hooks/useFile";
import type { UploadFile } from "antd";

const { Dragger } = AntUpload;

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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-xl">
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

          {/* Blur blobs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-300/30 rounded-full blur-[140px]" />

          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <CloudUploadOutlined className="text-3xl" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-black mb-2">
                  Upload Study Materials
                </h1>
                <p className="text-white/90 text-sm md:text-base font-medium">
                  Upload your notes, PDFs, presentations, or images and let
                  StudyAI transform them into powerful study tools.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* UPLOAD SECTION */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <Dragger
              multiple
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
              className="!border-2 !border-dashed !border-teal-300 hover:!border-teal-500 !bg-gradient-to-br !from-teal-50/50 !to-cyan-50/50 !rounded-xl transition-all"
              showUploadList={false}
            >
              <div className="py-8">
                <p className="ant-upload-drag-icon mb-4">
                  <InboxOutlined className="text-teal-600 text-6xl" />
                </p>
                <p className="ant-upload-text font-bold text-slate-800 text-xl mb-2">
                  Click or drag files to upload
                </p>
                <p className="ant-upload-hint text-slate-600 font-medium px-4">
                  Support for single or bulk upload. Accepts PDF, DOCX, PPT,
                  TXT, JPG, PNG and more.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-slate-600 border border-slate-200">
                    📄 Documents
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-slate-600 border border-slate-200">
                    🖼️ Images
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-slate-600 border border-slate-200">
                    📊 Presentations
                  </span>
                </div>
              </div>
            </Dragger>

            {/* FILE LIST */}
            {fileList.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">
                    Selected Files ({fileList.length})
                  </h3>
                  <Button
                    size="small"
                    danger
                    onClick={() => setFileList([])}
                    icon={<FiX size={14} />}
                  >
                    Clear All
                  </Button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {fileList.map((file) => (
                    <div
                      key={file.uid}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(file.type || "")}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800 text-sm truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {((file.size || 0) / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file)}
                        className="ml-2 p-1 hover:bg-red-100 rounded text-red-600 transition-colors flex-shrink-0"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fileList.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button
                  type="primary"
                  size="large"
                  icon={<FiUpload />}
                  onClick={handleUpload}
                  loading={uploadMutation.isPending}
                  className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 hover:!from-emerald-700 hover:!to-teal-700 !rounded-xl !h-12 !px-8 !font-bold !shadow-lg hover:!shadow-xl transition-all"
                >
                  Upload {fileList.length} File{fileList.length > 1 ? "s" : ""}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* LATEST UPLOADED FILES */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-teal-100 rounded-lg">
              <FiCheck className="text-teal-600 text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                Latest Uploaded Files
              </h3>
              <p className="text-sm text-slate-500">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FileTypeCard
            icon={<FiFileText className="text-emerald-600" size={28} />}
            label="Documents"
            description="PDF, DOCX, TXT, RTF"
            color="from-emerald-50 to-teal-50"
          />
          <FileTypeCard
            icon={<FiImage className="text-blue-600" size={28} />}
            label="Images"
            description="JPG, PNG, GIF, SVG"
            color="from-blue-50 to-cyan-50"
          />
          <FileTypeCard
            icon={<FiFile className="text-purple-600" size={28} />}
            label="Other Files"
            description="PPT, XLS, ZIP, CSV"
            color="from-purple-50 to-pink-50"
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
      className={`bg-gradient-to-br ${color} border border-slate-200 rounded-xl p-4 flex items-center gap-4`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <h3 className="font-bold text-slate-800 mb-1">{label}</h3>
        <p className="text-xs text-slate-600">{description}</p>
      </div>
    </div>
  );
};

export default UploadPage;
