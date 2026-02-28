import { useCallback, useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";
import {
  studySessionService,
  type DistractionType,
  type StudyEventType,
} from "../api/study-session.service";

type EndableSessionStatus = "COMPLETED" | "INCOMPLETE";

// const INACTIVITY_TIMEOUT_MS = 60 * 1000;
const getStudySessionStorageKey = (id: string) => `study_session:${id}`;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export const useStudySession = (fileId: string | undefined) => {
  //   const { triggerProcessing } = useProcessing();
  const [studySessionId, setStudySessionId] = useState<string | null>(null);
  const [isSessionEnding, setIsSessionEnding] = useState(false);
  const [isManuallyStarting, setIsManuallyStarting] = useState(false);
  const [isSessionBootstrapLoading, setIsSessionBootstrapLoading] =
    useState(false);

  const isMountedRef = useRef(true);
  const sessionIdRef = useRef<string | null>(null);
  const fileIdRef = useRef<string | null>(fileId ?? null);
  const endingSessionRef = useRef(false);
  const isStartingRef = useRef(false);

  const persistStudySessionId = useCallback(
    (currentFileId: string, currentSessionId: string) => {
      try {
        sessionStorage.setItem(
          getStudySessionStorageKey(currentFileId),
          currentSessionId,
        );
      } catch (error: unknown) {
        console.error("Failed to persist study session id:", error);
      }
    },
    [],
  );

  const clearStoredStudySessionId = useCallback((currentFileId: string) => {
    try {
      sessionStorage.removeItem(getStudySessionStorageKey(currentFileId));
    } catch (error: unknown) {
      console.error("Failed to clear stored study session id:", error);
    }
  }, []);

  const logStudyEvent = useCallback(
    (eventType: StudyEventType, eventData?: Record<string, unknown>) => {
      const currentSessionId = sessionIdRef.current;
      if (!currentSessionId) {
        return;
      }

      void studySessionService
        .logStudyEvent(currentSessionId, {
          eventType,
          eventData,
          timestamp: new Date().toISOString(),
        })
        .catch((error: unknown) => {
          console.error("Failed to log study event:", error);
        });
    },
    [],
  );

  const logDistraction = useCallback(
    (
      distractionType: DistractionType,
      durationSeconds: number,
      metadata?: Record<string, unknown>,
    ) => {
      const currentSessionId = sessionIdRef.current;
      if (!currentSessionId || durationSeconds <= 0) {
        return;
      }

      void studySessionService
        .logDistraction(currentSessionId, {
          distractionType,
          durationSeconds,
          metadata,
          timestamp: new Date().toISOString(),
        })
        .catch((error: unknown) => {
          console.error("Failed to log distraction:", error);
        });
    },
    [],
  );

  const endStudySession = useCallback(
    async (
      status: EndableSessionStatus,
      options?: { notify?: boolean; silentOnError?: boolean },
    ) => {
      const currentSessionId = sessionIdRef.current;
      const currentFileId = fileIdRef.current;

      if (!currentSessionId || !currentFileId || endingSessionRef.current) {
        return;
      }

      endingSessionRef.current = true;
      if (isMountedRef.current) {
        setIsSessionEnding(true);
      }

      try {
        await studySessionService.endStudySession(currentSessionId, {
          status,
          sessionEnd: new Date().toISOString(),
        });

        if (options?.notify) {
          toast.success(
            status === "COMPLETED"
              ? "Study session completed"
              : "Study session ended",
          );
        }
      } catch (error: unknown) {
        if (!options?.silentOnError) {
          const err = error as {
            response?: { data?: { message?: string } };
            message?: string;
          };
          const errorMessage =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to end study session";
          toast.error(errorMessage);
        }
      } finally {
        clearStoredStudySessionId(currentFileId);
        sessionIdRef.current = null;

        if (isMountedRef.current) {
          setStudySessionId(null);
          setIsSessionEnding(false);
        }

        endingSessionRef.current = false;
      }
    },
    [clearStoredStudySessionId],
  );

  const fetchActiveSessionWithRetry = useCallback(async () => {
    if (!fileId) {
      return null;
    }

    const retryDelaysMs = [0, 150, 350, 700];

    for (const delayMs of retryDelaysMs) {
      if (delayMs > 0) {
        await wait(delayMs);
      }

      try {
        const activeSession =
          await studySessionService.getActiveStudySession(fileId);
        if (activeSession?.id) {
          return activeSession;
        }
      } catch (error: unknown) {
        console.error("Failed to fetch active study session:", error);
      }
    }

    return null;
  }, [fileId]);

  const startStudySession = useCallback(async () => {
    if (!fileId || isStartingRef.current) {
      return;
    }

    isStartingRef.current = true;
    if (isMountedRef.current) {
      setIsManuallyStarting(true);
    }

    try {
      // Call the service directly — avoids TanStack mutation state racing
      // with our own isManuallyStarting state flag.
      const session = await studySessionService.startStudySession({
        fileId,
        initialEventData: { source: "document_viewer" },
      });

      const confirmedSessionId = session?.id ?? null;

      if (!confirmedSessionId) {
        throw new Error("Study session started but no session id was returned");
      }

      sessionIdRef.current = confirmedSessionId;
      endingSessionRef.current = false;
      persistStudySessionId(fileId, confirmedSessionId);

      // Set session ID and clear starting flag in the same render cycle
      if (isMountedRef.current) {
        setStudySessionId(confirmedSessionId);
        setIsManuallyStarting(false);
      }

      toast.success("Study session started");
      logStudyEvent("SESSION_STARTED", { source: "document_viewer" });
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to start study session";
      toast.error(errorMessage);

      if (isMountedRef.current) {
        setIsManuallyStarting(false);
      }
    } finally {
      isStartingRef.current = false;
    }
  }, [fileId, logStudyEvent, persistStudySessionId]);

  // Bootstrap session on mount
  useEffect(() => {
    if (!fileId) {
      return;
    }

    let isCancelled = false;
    setIsSessionBootstrapLoading(true);
    setStudySessionId(null);

    const loadActiveSession = async () => {
      const storageKey = getStudySessionStorageKey(fileId);
      let storedSessionId: string | null = null;
      try {
        storedSessionId = sessionStorage.getItem(storageKey);
      } catch (error: unknown) {
        console.error("Failed to read stored study session id:", error);
      }

      try {
        const activeSession =
          await studySessionService.getActiveStudySession(fileId);

        if (isCancelled) {
          return;
        }

        if (activeSession?.id) {
          sessionIdRef.current = activeSession.id;
          setStudySessionId(activeSession.id);
          persistStudySessionId(fileId, activeSession.id);
          return;
        }

        if (sessionIdRef.current) {
          setStudySessionId(sessionIdRef.current);
          return;
        }

        if (storedSessionId) {
          // Keep locally known session immediately, then validate with retries.
          sessionIdRef.current = storedSessionId;
          setStudySessionId(storedSessionId);

          const retriedActiveSession = await fetchActiveSessionWithRetry();
          if (isCancelled) {
            return;
          }

          if (retriedActiveSession?.id) {
            sessionIdRef.current = retriedActiveSession.id;
            setStudySessionId(retriedActiveSession.id);
            persistStudySessionId(fileId, retriedActiveSession.id);
            return;
          }

          if (sessionIdRef.current === storedSessionId) {
            clearStoredStudySessionId(fileId);
            sessionIdRef.current = null;
            setStudySessionId(null);
          }
          return;
        }

        sessionIdRef.current = null;
        setStudySessionId(null);
      } catch (error: unknown) {
        console.error("Failed to bootstrap active study session:", error);

        if (isCancelled) {
          return;
        }

        if (storedSessionId) {
          sessionIdRef.current = storedSessionId;
          setStudySessionId(storedSessionId);
        } else {
          setStudySessionId(null);
        }
      } finally {
        if (!isCancelled) {
          setIsSessionBootstrapLoading(false);
        }
      }
    };

    void loadActiveSession();

    return () => {
      isCancelled = true;
    };
  }, [
    clearStoredStudySessionId,
    fetchActiveSessionWithRetry,
    fileId,
    persistStudySessionId,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Update refs
  useEffect(() => {
    sessionIdRef.current = studySessionId;
  }, [studySessionId]);

  useEffect(() => {
    fileIdRef.current = fileId ?? null;
  }, [fileId]);

  return {
    studySessionId,
    isSessionStarting: isManuallyStarting,
    isSessionEnding,
    isSessionBootstrapLoading,
    logStudyEvent,
    logDistraction,
    endStudySession,
    startStudySession,
  };
};
