import { useState } from "react";
import {
  FiFile,
  FiFileText,
  FiImage,
  FiDownload,
  FiTrash2,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiEye,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import type { FileUploadResponse } from "../../lib/api/file.service";
import { useDeleteFile } from "../../lib/hooks/useFile";
import { fileService } from "../../lib/api/file.service";
import { Modal } from "antd";

interface FileCardProps {
  file: FileUploadResponse;
}

const FileCard = ({ file }: FileCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteFile = useDeleteFile();

  const getFileColor = (mimetype: string) => {
    if (mimetype.includes("image")) return "text-blue-600 bg-blue-50";
    if (mimetype.includes("pdf")) return "text-red-600 bg-red-50";
    if (mimetype.includes("document")) return "text-green-600 bg-green-50";
    return "text-slate-600 bg-slate-50";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = () => {
    const status = file.processingStatus;
    if (!status) return null;

    const badges = {
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: <FiClock size={12} />,
        label: "Pending",
      },
      PROCESSING: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: <FiLoader size={12} className="animate-spin" />,
        label: "Processing",
      },
      COMPLETED: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: <FiCheckCircle size={12} />,
        label: "Ready",
      },
      FAILED: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: <FiAlertCircle size={12} />,
        label: "Failed",
      },
    };

    const badge = badges[status];
    return (
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-full ${badge.bg} ${badge.text} text-xs font-medium`}
        title={file.errorMessage || status}
      >
        {badge.icon}
        <span>{badge.label}</span>
      </div>
    );
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete File",
      content: `Are you sure you want to delete "${file.filename}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        setIsDeleting(true);
        await deleteFile.mutateAsync(file.id);
        setIsDeleting(false);
      },
    });
  };

  const handleDownload = async () => {
    try {
      const { url } = await fileService.getFileDownloadUrl(file.id);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const iconType = file.mimetype.includes("image")
    ? "image"
    : file.mimetype.includes("pdf") || file.mimetype.includes("document")
      ? "document"
      : "file";
  const colorClass = getFileColor(file.mimetype);

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Gradient Accent on Hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-4">
        {/* Icon and Actions Row */}
        <div className="flex items-start justify-between mb-3">
          <div
            className={`p-3 rounded-lg ${colorClass} transition-transform group-hover:scale-110 duration-300`}
          >
            {iconType === "image" && <FiImage size={24} />}
            {iconType === "document" && <FiFileText size={24} />}
            {iconType === "file" && <FiFile size={24} />}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Link
              to={`/app/document/${file.id}`}
              className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition-colors"
              title="View Document"
            >
              <FiEye size={16} />
            </Link>
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-teal-50 rounded-lg text-teal-600 transition-colors"
              title="Download"
            >
              <FiDownload size={16} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors disabled:opacity-50"
              title="Delete"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>

        {/* File Info */}
        <div className="space-y-2">
          <Link
            to={`/app/document/${file.id}`}
            className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition-colors"
            title="View Document"
          >
            <h3 className="font-semibold text-slate-800 text-sm truncate group-hover:text-teal-700 transition-colors">
              {file.filename}
            </h3>
          </Link>

          {/* Status Badge */}
          {getStatusBadge()}

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">{formatFileSize(file.size)}</span>
            <div className="flex items-center gap-1">
              <FiClock size={12} />
              <span>{formatDate(file.uploadedAt || file.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom colored bar */}
      <div className={`h-1 w-full ${colorClass.split(" ")[1]} opacity-50`} />
    </div>
  );
};

export default FileCard;
