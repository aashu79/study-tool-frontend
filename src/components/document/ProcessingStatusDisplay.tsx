import { useMutation } from "@tanstack/react-query";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";
import { useProcessing } from "../../lib/hooks/useProcessing";

interface ProcessingStatusDisplayProps {
  processingStatus: string;
  fileId: string;
}

const ProcessingStatusDisplay = ({
  processingStatus,
  fileId,
}: ProcessingStatusDisplayProps) => {
  const { triggerProcessing } = useProcessing();

  const triggerMutation = useMutation({
    mutationFn: triggerProcessing,
    onSuccess: () => {
      toast.success("Processing started successfully!");
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to trigger processing";
      toast.error(errorMessage);
    },
  });

  const handleTriggerProcessing = () => {
    triggerMutation.mutate(fileId);
  };

  const statusConfig = {
    PENDING: {
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-200",
      icon: FiAlertCircle,
      message: "Document is pending processing",
    },
    PROCESSING: {
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-200",
      icon: FiRefreshCw,
      message: "Document is being processed...",
    },
    FAILED: {
      bg: "bg-red-50",
      text: "text-red-800",
      border: "border-red-200",
      icon: FiAlertCircle,
      message: "Processing failed. Try triggering it again.",
    },
    COMPLETED: null,
  };

  const config = statusConfig[processingStatus as keyof typeof statusConfig];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.text} border ${config.border} p-4 rounded-xl flex items-center justify-between shadow-sm`}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={20}
          className={processingStatus === "PROCESSING" ? "animate-spin" : ""}
        />
        <span className="font-medium">{config.message}</span>
      </div>
      {processingStatus !== "PROCESSING" && (
        <button
          onClick={handleTriggerProcessing}
          disabled={triggerMutation.isPending}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
        >
          {triggerMutation.isPending ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            "Process Now"
          )}
        </button>
      )}
    </div>
  );
};

export default ProcessingStatusDisplay;
