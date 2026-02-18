import { useQuery } from "@tanstack/react-query";
import { fileService } from "../api/file.service";

interface DocumentData {
  fileName: string;
  fileUrl: string;
  mimeType: string;
}

export const useDocumentData = (fileId: string | undefined) => {
  return useQuery<DocumentData>({
    queryKey: ["documentViewerFile", fileId],
    enabled: !!fileId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    queryFn: async () => {
      if (!fileId) {
        throw new Error("File ID is missing");
      }

      const [{ url }, filesData] = await Promise.all([
        fileService.getFileUrl(fileId),
        fileService.getFiles(),
      ]);
      const file = filesData.files.find((f) => f.id === fileId);

      return {
        fileName: file?.filename || "Document",
        fileUrl: url,
        mimeType: file?.mimetype || "application/octet-stream",
      };
    },
  });
};
