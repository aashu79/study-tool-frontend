import { useState, useEffect } from "react";
import { FiFileText, FiHelpCircle, FiCreditCard } from "react-icons/fi";
import type { StudyEventType } from "../api/study-session.service";

export type TabType = "summary" | "quiz" | "flashcards";

export interface Tab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  activeClasses: string;
  iconClasses: string;
  glowClasses: string;
}

export const useTabs = (
  studySessionId: string | null,
  logStudyEvent: (
    eventType: StudyEventType,
    eventData?: Record<string, unknown>,
  ) => void,
) => {
  const [activeTab, setActiveTab] = useState<TabType>("summary");

  const tabs: Tab[] = [
    {
      id: "summary" as TabType,
      label: "Summary",
      icon: FiFileText,
      activeClasses:
        "text-cyan-700 bg-cyan-50 border-cyan-200 shadow-cyan-100/70",
      iconClasses: "bg-cyan-100 text-cyan-700",
      glowClasses: "from-cyan-500 to-blue-500",
    },
    {
      id: "quiz" as TabType,
      label: "Quiz",
      icon: FiHelpCircle,
      activeClasses:
        "text-orange-700 bg-orange-50 border-orange-200 shadow-orange-100/70",
      iconClasses: "bg-orange-100 text-orange-700",
      glowClasses: "from-orange-500 to-amber-500",
    },
    {
      id: "flashcards" as TabType,
      label: "Flashcards",
      icon: FiCreditCard,
      activeClasses:
        "text-emerald-700 bg-emerald-50 border-emerald-200 shadow-emerald-100/70",
      iconClasses: "bg-emerald-100 text-emerald-700",
      glowClasses: "from-emerald-500 to-teal-500",
    },
  ];

  useEffect(() => {
    if (!studySessionId) {
      return;
    }

    if (activeTab === "summary") {
      logStudyEvent("VIEW_SUMMARY", { source: "document_viewer" });
      return;
    }

    if (activeTab === "quiz") {
      logStudyEvent("START_QUIZ", { source: "document_viewer" });
      return;
    }

    logStudyEvent("CUSTOM_ACTIVITY", {
      source: "document_viewer",
      activity: "OPEN_FLASHCARDS_TAB",
    });
  }, [activeTab, logStudyEvent, studySessionId]);

  return {
    activeTab,
    setActiveTab,
    tabs,
  };
};
