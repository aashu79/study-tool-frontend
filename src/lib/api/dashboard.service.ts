import { apiClient } from "./client";

export interface DashboardInsightsQueryParams {
  weeklyGoalTarget?: number;
  recentLimit?: number;
  materialsLimit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface DashboardGreeting {
  message: string;
  pendingMaterials: number;
  streakDays: number;
}

export interface DashboardWeeklyGoal {
  target: number;
  completed: number;
  remaining: number;
  weekStart: string;
  weekEnd: string;
}

export interface DashboardStats {
  totalUploads: number;
  activeFlashcards: number;
  quizzesTaken: number;
  avgFocusTimeMinutes: number;
  weakTopicsCount: number;
  studyStreakDays: number;
}

export interface DashboardTrends {
  uploadsThisWeek: number;
  flashcardsThisWeek: number;
  quizzesThisWeek: number;
  avgFocusTimeMinutesDelta: number;
}

export interface DashboardWeakTopic {
  topic: string;
  count: number;
}

export interface DashboardMaterial {
  id: string;
  filename: string;
  sizeBytes: number;
  sizeLabel: string;
  processingStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

export interface DashboardActivity {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  createdAt: string;
}

export interface DashboardInsights {
  generatedAt: string;
  greeting: DashboardGreeting;
  weeklyGoal: DashboardWeeklyGoal;
  stats: DashboardStats;
  trends: DashboardTrends;
  weakTopics: DashboardWeakTopic[];
  latestStudyMaterials: DashboardMaterial[];
  recentActivity: DashboardActivity[];
}

const isWrappedResponse = (
  payload: DashboardInsights | ApiResponse<DashboardInsights>,
): payload is ApiResponse<DashboardInsights> => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    typeof payload.data === "object"
  );
};

export const dashboardService = {
  getInsights: async (
    params?: DashboardInsightsQueryParams,
  ): Promise<DashboardInsights> => {
    const response = await apiClient.get<
      DashboardInsights | ApiResponse<DashboardInsights>
    >("/api/dashboard/insights", { params });

    return isWrappedResponse(response.data)
      ? response.data.data
      : response.data;
  },
};
