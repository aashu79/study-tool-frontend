import {
  documentChatService,
  type CreateDocumentChatThreadRequest,
  type DocumentChatThread,
  type GetThreadMessagesParams,
  type GetThreadMessagesResponse,
  type ListDocumentChatThreadsParams,
  type ListDocumentChatThreadsResponse,
  type SendDocumentChatMessageRequest,
  type SendDocumentChatMessageResponse,
} from "../api/document-chat.service";
import { getApiErrorMessage } from "../api/error";

const toError = (error: unknown, fallback: string) =>
  new Error(getApiErrorMessage(error, fallback));

export const useDocumentChat = () => {
  const listThreads = async (
    fileId: string,
    params?: ListDocumentChatThreadsParams,
  ): Promise<ListDocumentChatThreadsResponse> => {
    try {
      return await documentChatService.listThreads(fileId, params);
    } catch (error: unknown) {
      throw toError(error, "Failed to load chat threads");
    }
  };

  const createThread = async (
    fileId: string,
    payload?: CreateDocumentChatThreadRequest,
  ): Promise<DocumentChatThread> => {
    try {
      return await documentChatService.createThread(fileId, payload);
    } catch (error: unknown) {
      throw toError(error, "Failed to create chat thread");
    }
  };

  const sendMessage = async (
    fileId: string,
    payload: SendDocumentChatMessageRequest,
  ): Promise<SendDocumentChatMessageResponse> => {
    try {
      return await documentChatService.sendMessage(fileId, payload);
    } catch (error: unknown) {
      throw toError(error, "Failed to get assistant response");
    }
  };

  const getThreadMessages = async (
    threadId: string,
    params?: GetThreadMessagesParams,
  ): Promise<GetThreadMessagesResponse> => {
    try {
      return await documentChatService.getThreadMessages(threadId, params);
    } catch (error: unknown) {
      throw toError(error, "Failed to load chat messages");
    }
  };

  const renameThread = async (
    threadId: string,
    title: string,
  ): Promise<DocumentChatThread> => {
    try {
      return await documentChatService.renameThread(threadId, title);
    } catch (error: unknown) {
      throw toError(error, "Failed to rename chat thread");
    }
  };

  const deleteThread = async (
    threadId: string,
  ): Promise<{ threadId: string; deleted: boolean }> => {
    try {
      return await documentChatService.deleteThread(threadId);
    } catch (error: unknown) {
      throw toError(error, "Failed to delete chat thread");
    }
  };

  return {
    listThreads,
    createThread,
    sendMessage,
    getThreadMessages,
    renameThread,
    deleteThread,
  };
};
