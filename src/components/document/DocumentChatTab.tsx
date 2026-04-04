import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiAlertCircle,
  FiCheck,
  FiEdit2,
  FiMessageCircle,
  FiPlus,
  FiSend,
  FiSidebar,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { useDocumentChat } from "../../lib/hooks/useDocumentChat";
import type {
  DocumentChatMessage,
  DocumentChatThread,
  GetThreadMessagesResponse,
  ListDocumentChatThreadsResponse,
} from "../../lib/api/document-chat.service";
import {
  Drawer,
  SkeletonBlock,
} from "./DocumentOverlay";

interface DocumentChatTabProps {
  fileId: string;
  processingStatus?: string;
}

const THREAD_PAGE_SIZE = 10;
const MESSAGE_PAGE_SIZE = 50;

const formatDate = (value?: string): string => {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (value?: string): string => {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTimestamp = (value: string): number => {
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const deriveThreadTitle = (message: string): string => {
  const normalized = message.replace(/\s+/g, " ").trim();
  if (normalized.length <= 60) {
    return normalized;
  }
  return `${normalized.slice(0, 57)}...`;
};

const mergeMessages = (
  existing: DocumentChatMessage[],
  additions: DocumentChatMessage[],
): DocumentChatMessage[] => {
  const byId = new Map<string, DocumentChatMessage>();

  [...existing, ...additions].forEach((message, index) => {
    const key =
      message.id || `${message.role}-${message.createdAt}-${index + 1}`;
    byId.set(key, message);
  });

  return Array.from(byId.values()).sort(
    (a, b) => getTimestamp(a.createdAt) - getTimestamp(b.createdAt),
  );
};

const CitationButtons = ({
  message,
  openCitationKey,
  setOpenCitationKey,
}: {
  message: DocumentChatMessage;
  openCitationKey: string | null;
  setOpenCitationKey: (value: string | null) => void;
}) => {
  if (message.citations.length === 0) {
    return null;
  }

  return (
    <span className="relative ml-1 inline-flex gap-1 align-super">
      {message.citations.map((citation, index) => {
        const key = `${message.id}-${citation.refId}-${index + 1}`;
        const isOpen = openCitationKey === key;

        return (
          <span key={key} className="relative inline-block">
            <button
              type="button"
              onClick={() => setOpenCitationKey(isOpen ? null : key)}
              className="text-[11px] font-semibold text-teal-600 transition hover:text-teal-700"
            >
              [{index + 1}]
            </button>

            {isOpen ? (
              <div className="absolute left-0 top-6 z-20 w-72 rounded-2xl border border-slate-200 bg-white p-4 text-left text-xs text-slate-600 shadow-xl">
                <p className="font-semibold text-slate-900">
                  {citation.refId}
                  {citation.pageStart ? `, page ${citation.pageStart}` : ""}
                </p>
                <p className="mt-2 leading-6">
                  {citation.excerpt || "No excerpt provided."}
                </p>
              </div>
            ) : null}
          </span>
        );
      })}
    </span>
  );
};

const ChatBubble = ({
  message,
  isLatestAssistant,
  openCitationKey,
  setOpenCitationKey,
  onUseFollowUp,
}: {
  message: DocumentChatMessage;
  isLatestAssistant: boolean;
  openCitationKey: string | null;
  setOpenCitationKey: (value: string | null) => void;
  onUseFollowUp: (question: string) => void;
}) => {
  const isUser = message.role === "USER";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[85%] rounded-[24px] px-5 py-4 shadow-sm ${
          isUser
            ? "bg-teal-600 text-white"
            : "border border-slate-200 bg-white text-slate-800"
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-4">
          <span className={`text-xs font-semibold ${isUser ? "text-white/80" : "text-slate-500"}`}>
            {isUser ? "You" : "Assistant"}
          </span>
          <span className={`text-xs ${isUser ? "text-white/70" : "text-slate-400"}`}>
            {formatTime(message.createdAt)}
          </span>
        </div>

        <div
          className={`text-sm leading-7 [&_p]:mb-2 [&_p:last-child]:mb-0 ${
            isUser ? "text-white" : "text-slate-700"
          }`}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
          {!isUser ? (
            <CitationButtons
              message={message}
              openCitationKey={openCitationKey}
              setOpenCitationKey={setOpenCitationKey}
            />
          ) : null}
        </div>

        {!isUser && isLatestAssistant && message.followUpQuestions.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.followUpQuestions.map((question) => (
              <button
                type="button"
                key={`${message.id}-${question}`}
                onClick={() => onUseFollowUp(question)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                {question}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const ThreadsDrawer = ({
  isOpen,
  onClose,
  threads,
  activeThreadId,
  page,
  totalPages,
  currentPage,
  onPreviousPage,
  onNextPage,
  onCreateThread,
  onSelectThread,
  onStartEdit,
  onDeleteThread,
  editingThreadId,
  editingTitle,
  setEditingTitle,
  onSaveEdit,
  onCancelEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  threads: DocumentChatThread[];
  activeThreadId: string | null;
  page: number;
  totalPages: number;
  currentPage: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onCreateThread: () => void;
  onSelectThread: (threadId: string) => void;
  onStartEdit: (thread: DocumentChatThread) => void;
  onDeleteThread: (threadId: string) => void;
  editingThreadId: string | null;
  editingTitle: string;
  setEditingTitle: (value: string) => void;
  onSaveEdit: (threadId: string) => void;
  onCancelEdit: () => void;
}) => (
  <Drawer
    open={isOpen}
    onClose={onClose}
    side="left"
    title="Threads"
    description="Saved conversations for this document."
  >
    <button
      type="button"
      onClick={onCreateThread}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
    >
      <FiPlus size={16} />
      New Thread
    </button>

    <div className="mt-5 space-y-3">
      {threads.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-700">No threads yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Ask your first question to start one.
          </p>
        </div>
      ) : (
        threads.map((thread) => {
          const isActive = thread.id === activeThreadId;
          const isEditing = editingThreadId === thread.id;

          return (
            <div
              key={thread.id}
              className={`rounded-2xl border p-4 ${
                isActive ? "border-teal-200 bg-teal-50" : "border-slate-200 bg-white"
              }`}
            >
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onSaveEdit(thread.id)}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white"
                    >
                      <FiCheck size={14} />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
                    >
                      <FiX size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectThread(thread.id);
                      onClose();
                    }}
                    className="w-full text-left"
                  >
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {thread.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {thread.latestMessagePreview || "No messages yet."}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {thread.messageCount} messages
                      <span className="mx-2 inline-block h-1 w-1 rounded-full bg-slate-300" />
                      {formatDate(thread.lastMessageAt)}
                    </p>
                  </button>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onStartEdit(thread)}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
                    >
                      <FiEdit2 size={14} />
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteThread(thread.id)}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700"
                    >
                      <FiTrash2 size={14} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })
      )}
    </div>

    {totalPages > 1 ? (
      <div className="mt-5 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onPreviousPage}
          disabled={page <= 1}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-slate-500">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={onNextPage}
          disabled={page >= totalPages}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    ) : null}
  </Drawer>
);

export const DocumentChatTab = ({
  fileId,
}: DocumentChatTabProps) => {
  const queryClient = useQueryClient();
  const {
    listThreads,
    createThread,
    sendMessage,
    getThreadMessages,
    renameThread,
    deleteThread,
  } = useDocumentChat();

  const [page, setPage] = useState(1);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showThreadsDrawer, setShowThreadsDrawer] = useState(false);
  const [openCitationKey, setOpenCitationKey] = useState<string | null>(null);

  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const threadsQuery = useQuery({
    queryKey: ["documentChatThreads", fileId, page, THREAD_PAGE_SIZE],
    queryFn: () => listThreads(fileId, { page, limit: THREAD_PAGE_SIZE }),
    enabled: !!fileId,
    staleTime: 20 * 1000,
  });

  const threads = threadsQuery.data?.data ?? [];
  const activeThreadId = selectedThreadId ?? threads[0]?.id ?? null;

  const messagesQuery = useQuery({
    queryKey: ["documentChatMessages", activeThreadId, 1, MESSAGE_PAGE_SIZE],
    queryFn: () =>
      getThreadMessages(activeThreadId!, { page: 1, limit: MESSAGE_PAGE_SIZE }),
    enabled: !!activeThreadId,
    staleTime: 10 * 1000,
  });

  const messages = messagesQuery.data?.data ?? [];

  const activeThread = useMemo(() => {
    const fromThreadList = threads.find((thread) => thread.id === activeThreadId);
    if (fromThreadList) {
      return fromThreadList;
    }

    return messagesQuery.data?.thread ?? null;
  }, [activeThreadId, messagesQuery.data?.thread, threads]);

  const latestAssistantMessage = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === "ASSISTANT") {
        return messages[index];
      }
    }
    return null;
  }, [messages]);

  useEffect(() => {
    if (!selectedThreadId && threads.length > 0) {
      setSelectedThreadId(threads[0].id);
    }
  }, [selectedThreadId, threads]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThreadId, messages.length]);

  const createThreadMutation = useMutation({
    mutationFn: (title?: string) =>
      createThread(fileId, title ? { title } : undefined),
    onSuccess: (thread) => {
      toast.success("Document chat thread created");
      setPage(1);
      setSelectedThreadId(thread.id);
      setEditingThreadId(null);
      setEditingTitle("");
      setShowThreadsDrawer(false);

      queryClient.setQueryData<GetThreadMessagesResponse>(
        ["documentChatMessages", thread.id, 1, MESSAGE_PAGE_SIZE],
        {
          data: [],
          thread,
          pagination: {
            total: 0,
            page: 1,
            limit: MESSAGE_PAGE_SIZE,
            totalPages: 1,
          },
        },
      );

      queryClient.invalidateQueries({ queryKey: ["documentChatThreads", fileId] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to create chat thread";
      toast.error(message);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ message, threadId }: { message: string; threadId?: string }) =>
      sendMessage(fileId, {
        message,
        threadId,
        title: threadId ? undefined : deriveThreadTitle(message),
      }),
    onSuccess: (response) => {
      const responseThreadId = response.thread.id;

      setPage(1);
      setSelectedThreadId(responseThreadId);
      setDraftMessage("");

      queryClient.setQueryData<GetThreadMessagesResponse>(
        ["documentChatMessages", responseThreadId, 1, MESSAGE_PAGE_SIZE],
        (oldData) => {
          const currentMessages = oldData?.data ?? [];
          const merged = mergeMessages(currentMessages, [
            response.userMessage,
            response.assistantMessage,
          ]);

          return {
            data: merged,
            thread: response.thread,
            pagination: {
              total: merged.length,
              page: 1,
              limit: MESSAGE_PAGE_SIZE,
              totalPages: 1,
            },
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["documentChatThreads", fileId] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate assistant response";
      toast.error(message);
    },
  });

  const renameThreadMutation = useMutation({
    mutationFn: ({ threadId, title }: { threadId: string; title: string }) =>
      renameThread(threadId, title),
    onSuccess: (updatedThread) => {
      toast.success("Thread title updated");
      setEditingThreadId(null);
      setEditingTitle("");

      queryClient.setQueriesData<ListDocumentChatThreadsResponse>(
        { queryKey: ["documentChatThreads", fileId] },
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            data: oldData.data.map((thread) =>
              thread.id === updatedThread.id ? updatedThread : thread,
            ),
          };
        },
      );

      queryClient.setQueryData<GetThreadMessagesResponse>(
        ["documentChatMessages", updatedThread.id, 1, MESSAGE_PAGE_SIZE],
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            thread: {
              ...oldData.thread,
              title: updatedThread.title,
              updatedAt: updatedThread.updatedAt,
            },
          };
        },
      );
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to rename thread";
      toast.error(message);
    },
  });

  const deleteThreadMutation = useMutation({
    mutationFn: (threadId: string) => deleteThread(threadId),
    onSuccess: (result, threadId) => {
      if (!result.deleted) {
        toast.error("Failed to delete thread");
        return;
      }

      toast.success("Thread deleted");

      queryClient.removeQueries({ queryKey: ["documentChatMessages", threadId] });
      queryClient.setQueriesData<ListDocumentChatThreadsResponse>(
        { queryKey: ["documentChatThreads", fileId] },
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          const nextData = oldData.data.filter((thread) => thread.id !== threadId);
          const nextTotal = Math.max(0, oldData.pagination.total - 1);
          const nextTotalPages =
            oldData.pagination.limit > 0
              ? Math.max(1, Math.ceil(nextTotal / oldData.pagination.limit))
              : 1;

          return {
            ...oldData,
            data: nextData,
            pagination: {
              ...oldData.pagination,
              total: nextTotal,
              totalPages: nextTotalPages,
              page: Math.min(oldData.pagination.page, nextTotalPages),
            },
          };
        },
      );

      if (activeThreadId === threadId) {
        setSelectedThreadId(null);
      }

      queryClient.invalidateQueries({ queryKey: ["documentChatThreads", fileId] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to delete thread";
      toast.error(message);
    },
  });

  const handleSendMessage = (prefilledMessage?: string) => {
    const nextMessage = (prefilledMessage ?? draftMessage).trim();

    if (!nextMessage) {
      toast.error("Please enter a question before sending");
      return;
    }

    if (sendMessageMutation.isPending) {
      return;
    }

    sendMessageMutation.mutate({
      message: nextMessage,
      threadId: activeThreadId ?? undefined,
    });
  };

  const handleComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartEdit = (thread: DocumentChatThread) => {
    setEditingThreadId(thread.id);
    setEditingTitle(thread.title);
  };

  const handleSaveEdit = (threadId: string) => {
    const nextTitle = editingTitle.trim();
    if (!nextTitle) {
      toast.error("Thread title cannot be empty");
      return;
    }
    renameThreadMutation.mutate({ threadId, title: nextTitle });
  };

  const handleDeleteThread = (threadId: string) => {
    if (deleteThreadMutation.isPending) {
      return;
    }

    if (window.confirm("Delete this thread and all its messages?")) {
      deleteThreadMutation.mutate(threadId);
    }
  };

  const handleUseFollowUp = (question: string) => {
    setDraftMessage(question);
    requestAnimationFrame(() => composerRef.current?.focus());
  };

  const handleInlineTitleSave = () => {
    if (!activeThreadId) {
      return;
    }
    handleSaveEdit(activeThreadId);
  };

  return (
    <>
      <div className="flex h-full min-h-0 flex-col bg-slate-50">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
              {activeThread?.fileName ?? "Document"}
            </p>

            {activeThreadId && editingThreadId === activeThreadId ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(event) => setEditingTitle(event.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-2 text-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={handleInlineTitleSave}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
                >
                  <FiCheck size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingThreadId(null);
                    setEditingTitle("");
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
                >
                  <FiX size={15} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!activeThread) {
                    return;
                  }
                  setEditingThreadId(activeThread.id);
                  setEditingTitle(activeThread.title);
                }}
                className="mt-2 text-left"
              >
                <h2 className="truncate text-2xl font-semibold text-slate-900">
                  {activeThread?.title ?? "New conversation"}
                </h2>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowThreadsDrawer(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <FiSidebar size={16} />
              Threads
            </button>
            <button
              type="button"
              onClick={() => createThreadMutation.mutate(undefined)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <FiPlus size={16} />
              New Thread
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {messagesQuery.isLoading && activeThreadId ? (
            <div className="space-y-4">
              <SkeletonBlock className="h-24 w-2/3 rounded-[28px]" />
              <SkeletonBlock className="ml-auto h-24 w-1/2 rounded-[28px]" />
              <SkeletonBlock className="h-28 w-3/4 rounded-[28px]" />
            </div>
          ) : messagesQuery.error ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md rounded-[32px] border border-rose-200 bg-rose-50 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                  <FiAlertCircle size={24} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Failed to load messages
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {messagesQuery.error instanceof Error
                    ? messagesQuery.error.message
                    : "Please try again."}
                </p>
                <button
                  type="button"
                  onClick={() => messagesQuery.refetch()}
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <FiMessageCircle size={28} />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-slate-900">
                  Ask about this document
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Start a thread with a direct question, then open the thread drawer
                  only when you want to revisit earlier conversations.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  isLatestAssistant={
                    message.role === "ASSISTANT" &&
                    latestAssistantMessage?.id === message.id
                  }
                  openCitationKey={openCitationKey}
                  setOpenCitationKey={setOpenCitationKey}
                  onUseFollowUp={handleUseFollowUp}
                />
              ))}

              {sendMessageMutation.isPending ? (
                <div className="flex justify-start">
                  <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
                    Thinking...
                  </div>
                </div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white px-6 py-4 sm:px-8">
          <div className="rounded-[28px] border border-slate-300 bg-white p-3 shadow-sm">
            <div className="flex items-end gap-3">
              <textarea
                ref={composerRef}
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder="Ask a question about this document..."
                rows={2}
                maxLength={4000}
                title="Press Enter to send. Press Shift+Enter for a new line."
                className="min-h-[52px] w-full resize-none border-0 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={sendMessageMutation.isPending || !draftMessage.trim()}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-teal-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSend size={16} />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      <ThreadsDrawer
        isOpen={showThreadsDrawer}
        onClose={() => setShowThreadsDrawer(false)}
        threads={threads}
        activeThreadId={activeThreadId}
        page={page}
        totalPages={threadsQuery.data?.pagination.totalPages ?? 1}
        currentPage={threadsQuery.data?.pagination.page ?? 1}
        onPreviousPage={() => setPage((prev) => Math.max(1, prev - 1))}
        onNextPage={() =>
          setPage((prev) =>
            Math.min(threadsQuery.data?.pagination.totalPages ?? 1, prev + 1),
          )
        }
        onCreateThread={() => createThreadMutation.mutate(undefined)}
        onSelectThread={(threadId) => setSelectedThreadId(threadId)}
        onStartEdit={handleStartEdit}
        onDeleteThread={handleDeleteThread}
        editingThreadId={editingThreadId}
        editingTitle={editingTitle}
        setEditingTitle={setEditingTitle}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={() => {
          setEditingThreadId(null);
          setEditingTitle("");
        }}
      />
    </>
  );
};
