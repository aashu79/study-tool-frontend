import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fileService } from "../api/file.service";
import type { FileQueryParams } from "../api/file.service";

export const useUploadFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) => fileService.uploadFiles(files),
    onSuccess: (data) => {
      toast.success(`Successfully uploaded ${data.length} file(s)`);
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
};

export const useFiles = (params?: FileQueryParams) => {
  return useQuery({
    queryKey: ["files", params],
    queryFn: () => fileService.getFiles(params),
    enabled: !!localStorage.getItem("auth_token"),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => fileService.deleteFile(fileId),
    onSuccess: () => {
      toast.success("File deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: () => {
      toast.error("Failed to delete file");
    },
  });
};

export const useProfilePicture = () => {
  return useQuery({
    queryKey: ["profilePicture"],
    queryFn: fileService.getProfilePicture,
    enabled: !!localStorage.getItem("auth_token"),
    retry: false,
    staleTime: 10 * 60 * 1000,
  });
};

export const useFileUrl = (fileId: string | null) => {
  return useQuery({
    queryKey: ["fileUrl", fileId],
    queryFn: () => fileService.getFileUrl(fileId!),
    enabled: !!fileId && !!localStorage.getItem("auth_token"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFileDownloadUrl = (fileId: string | null) => {
  return useQuery({
    queryKey: ["fileDownloadUrl", fileId],
    queryFn: () => fileService.getFileDownloadUrl(fileId!),
    enabled: !!fileId && !!localStorage.getItem("auth_token"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
