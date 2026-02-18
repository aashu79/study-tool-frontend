import { useQuery } from "@tanstack/react-query";
import { useProcessing } from "./useProcessing";

export const useProcessingStatus = (fileId: string | undefined) => {
  const { getStatus } = useProcessing();

  return useQuery({
    queryKey: ["processingStatus", fileId],
    queryFn: async () => {
      if (!fileId) return null;
      try {
        const status = await getStatus(fileId);
        return status;
      } catch (error: unknown) {
        console.error("Failed to fetch processing status:", error);
        return null;
      }
    },
    enabled: !!fileId,
    staleTime: 2 * 1000,
    refetchOnMount: false,
    refetchInterval: (data: unknown) => {
      const statusData = data as { processingStatus?: string } | null;
      return statusData?.processingStatus === "PROCESSING" ? 3000 : false;
    },
  });
};
