import { useQuery } from "@tanstack/react-query";
import {
  dashboardService,
  type DashboardInsightsQueryParams,
} from "../api/dashboard.service";

const DEFAULT_INSIGHTS_PARAMS: DashboardInsightsQueryParams = {
  weeklyGoalTarget: 20,
  recentLimit: 6,
  materialsLimit: 4,
};

export const useDashboardInsights = (
  params: DashboardInsightsQueryParams = DEFAULT_INSIGHTS_PARAMS,
) => {
  return useQuery({
    queryKey: ["dashboardInsights", params],
    queryFn: () => dashboardService.getInsights(params),
    enabled: !!localStorage.getItem("auth_token"),
    staleTime: 60 * 1000,
  });
};
