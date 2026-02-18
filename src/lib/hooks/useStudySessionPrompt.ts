import { useState, useEffect } from "react";

export const useStudySessionPrompt = (
  documentData: unknown,
  fileId: string | undefined,
  isSessionBootstrapLoading: boolean,
  studySessionId: string | null,
) => {
  const [showStudySessionPrompt, setShowStudySessionPrompt] = useState(false);
  const [hasShownStudySessionPrompt, setHasShownStudySessionPrompt] =
    useState(false);

  useEffect(() => {
    if (
      !fileId ||
      !documentData ||
      isSessionBootstrapLoading ||
      hasShownStudySessionPrompt ||
      studySessionId
    ) {
      return;
    }

    setShowStudySessionPrompt(true);
    setHasShownStudySessionPrompt(true);
  }, [
    documentData,
    fileId,
    hasShownStudySessionPrompt,
    isSessionBootstrapLoading,
    studySessionId,
  ]);

  return {
    showStudySessionPrompt,
    setShowStudySessionPrompt,
  };
};
