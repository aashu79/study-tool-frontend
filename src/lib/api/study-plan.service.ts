import { apiClient } from "./client";

export interface GenerateStudyPlanRequest {
  customTitle?: string;
  objective?: string;
  currentKnowledgeLevel?: string;
  targetTimelineDays?: number;
  studyHoursPerWeek?: number;
  dailyStudyMinutes?: number;
  specialInstruction?: string;
}

export interface StudyPlanPrerequisite {
  topic: string;
  whyItMatters: string;
  priority: string;
}

export interface StudyPlanFocusArea {
  topic: string;
  reason: string;
  priority: string;
}

export interface StudyPlanPhase {
  phaseNumber: number;
  title: string;
  goal: string;
  duration: string;
  topics: string[];
  activities: string[];
  checkpoints: string[];
}

export interface StudyPlanWeeklySchedule {
  weekNumber: number;
  primaryGoal: string;
  studyTargets: string[];
  practice: string[];
  revision: string[];
}

export interface StudyPlanStructure {
  title: string;
  overview: string;
  difficultyLevel: string;
  estimatedTotalHours: number;
  estimatedWeeks: number;
  prerequisites: StudyPlanPrerequisite[];
  learningObjectives: string[];
  focusAreas: StudyPlanFocusArea[];
  phases: StudyPlanPhase[];
  weeklySchedule: StudyPlanWeeklySchedule[];
  revisionStrategy: string[];
  practiceStrategy: string[];
  warningAreas: string[];
  successCriteria: string[];
  nextSteps: string[];
}

export interface StudyPlan {
  id: string;
  fileId: string;
  fileName: string;
  title: string;
  objective: string | null;
  currentKnowledgeLevel: string | null;
  targetTimelineDays: number | null;
  studyHoursPerWeek: number | null;
  dailyStudyMinutes: number | null;
  specialInstruction: string | null;
  overview: string;
  estimatedTotalHours: number;
  estimatedWeeks: number;
  modelUsed: string;
  sourceWordCount: number;
  sourceTokensUsed: number;
  plan: StudyPlanStructure;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlanListByFileResponse {
  data: StudyPlan[];
  count: number;
}

export interface StudyPlanListQueryParams {
  page?: number;
  limit?: number;
  fileId?: string;
}

export interface StudyPlanPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudyPlanListResponse {
  data: StudyPlan[];
  pagination: StudyPlanPagination;
}

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;

const asNullableString = (value: unknown): string | null =>
  typeof value === "string" ? value.trim() : null;

const asNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const asBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }

  return false;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);
};

const mapPrerequisite = (value: unknown): StudyPlanPrerequisite => {
  const source = asRecord(value);

  return {
    topic: asString(source.topic) ?? "",
    whyItMatters: asString(source.whyItMatters) ?? "",
    priority: asString(source.priority) ?? "medium",
  };
};

const mapFocusArea = (value: unknown): StudyPlanFocusArea => {
  const source = asRecord(value);

  return {
    topic: asString(source.topic) ?? "",
    reason: asString(source.reason) ?? "",
    priority: asString(source.priority) ?? "medium",
  };
};

const mapPhase = (value: unknown, index: number): StudyPlanPhase => {
  const source = asRecord(value);

  return {
    phaseNumber: asNumber(source.phaseNumber, index + 1),
    title: asString(source.title) ?? `Phase ${index + 1}`,
    goal: asString(source.goal) ?? "",
    duration: asString(source.duration) ?? "",
    topics: asStringArray(source.topics),
    activities: asStringArray(source.activities),
    checkpoints: asStringArray(source.checkpoints),
  };
};

const mapWeeklySchedule = (
  value: unknown,
  index: number,
): StudyPlanWeeklySchedule => {
  const source = asRecord(value);

  return {
    weekNumber: asNumber(source.weekNumber, index + 1),
    primaryGoal: asString(source.primaryGoal) ?? "",
    studyTargets: asStringArray(source.studyTargets),
    practice: asStringArray(source.practice),
    revision: asStringArray(source.revision),
  };
};

const mapPlanStructure = (value: unknown): StudyPlanStructure => {
  const source = asRecord(value);

  const prerequisites = Array.isArray(source.prerequisites)
    ? source.prerequisites.map((item) => mapPrerequisite(item))
    : [];
  const focusAreas = Array.isArray(source.focusAreas)
    ? source.focusAreas.map((item) => mapFocusArea(item))
    : [];
  const phases = Array.isArray(source.phases)
    ? source.phases.map((item, index) => mapPhase(item, index))
    : [];
  const weeklySchedule = Array.isArray(source.weeklySchedule)
    ? source.weeklySchedule.map((item, index) => mapWeeklySchedule(item, index))
    : [];

  return {
    title: asString(source.title) ?? "Study Plan",
    overview: asString(source.overview) ?? "",
    difficultyLevel: asString(source.difficultyLevel) ?? "Unknown",
    estimatedTotalHours: asNumber(source.estimatedTotalHours, 0),
    estimatedWeeks: asNumber(source.estimatedWeeks, 0),
    prerequisites,
    learningObjectives: asStringArray(source.learningObjectives),
    focusAreas,
    phases,
    weeklySchedule,
    revisionStrategy: asStringArray(source.revisionStrategy),
    practiceStrategy: asStringArray(source.practiceStrategy),
    warningAreas: asStringArray(source.warningAreas),
    successCriteria: asStringArray(source.successCriteria),
    nextSteps: asStringArray(source.nextSteps),
  };
};

const mapStudyPlan = (value: unknown): StudyPlan => {
  const source = asRecord(value);
  const createdAt = asString(source.createdAt) ?? new Date().toISOString();
  const updatedAt = asString(source.updatedAt) ?? createdAt;
  const plan = mapPlanStructure(source.plan);
  const title = asString(source.title) ?? plan.title;

  return {
    id: asString(source.id) ?? "",
    fileId: asString(source.fileId) ?? "",
    fileName: asString(source.fileName) ?? "Document",
    title,
    objective: asNullableString(source.objective),
    currentKnowledgeLevel: asNullableString(source.currentKnowledgeLevel),
    targetTimelineDays: asNullableNumber(source.targetTimelineDays),
    studyHoursPerWeek: asNullableNumber(source.studyHoursPerWeek),
    dailyStudyMinutes: asNullableNumber(source.dailyStudyMinutes),
    specialInstruction: asNullableString(source.specialInstruction),
    overview: asString(source.overview) ?? plan.overview,
    estimatedTotalHours: asNumber(
      source.estimatedTotalHours,
      plan.estimatedTotalHours,
    ),
    estimatedWeeks: asNumber(source.estimatedWeeks, plan.estimatedWeeks),
    modelUsed: asString(source.modelUsed) ?? "",
    sourceWordCount: asNumber(source.sourceWordCount, 0),
    sourceTokensUsed: asNumber(source.sourceTokensUsed, 0),
    plan,
    createdAt,
    updatedAt,
  };
};

const mapPagination = (
  value: unknown,
  fallbackTotal = 0,
  fallbackPage = 1,
  fallbackLimit = 10,
): StudyPlanPagination => {
  const source = asRecord(value);
  const total = asNumber(source.total, fallbackTotal);
  const limit = asNumber(source.limit, fallbackLimit);
  const totalPages =
    asNumber(source.totalPages, 0) ||
    (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);

  return {
    total,
    page: asNumber(source.page, fallbackPage),
    limit,
    totalPages,
  };
};

export const studyPlanService = {
  async generateStudyPlan(
    fileId: string,
    payload?: GenerateStudyPlanRequest,
  ): Promise<StudyPlan> {
    const response = await apiClient.post(
      `/api/study-plans/file/${fileId}`,
      payload ?? {},
    );
    return mapStudyPlan(asRecord(response.data).data);
  },

  async listFileStudyPlans(
    fileId: string,
  ): Promise<StudyPlanListByFileResponse> {
    const response = await apiClient.get(`/api/study-plans/file/${fileId}`);
    const data = asRecord(response.data);
    const rawPlans = Array.isArray(data.data) ? data.data : [];

    return {
      data: rawPlans.map((item) => mapStudyPlan(item)),
      count: asNumber(data.count, rawPlans.length),
    };
  },

  async getStudyPlan(planId: string): Promise<StudyPlan> {
    const response = await apiClient.get(`/api/study-plans/${planId}`);
    return mapStudyPlan(asRecord(response.data).data);
  },

  async listUserStudyPlans(
    params?: StudyPlanListQueryParams,
  ): Promise<StudyPlanListResponse> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const response = await apiClient.get("/api/study-plans", {
      params,
    });
    const data = asRecord(response.data);
    const rawPlans = Array.isArray(data.data) ? data.data : [];

    return {
      data: rawPlans.map((item) => mapStudyPlan(item)),
      pagination: mapPagination(data.pagination, rawPlans.length, page, limit),
    };
  },

  async renameStudyPlan(planId: string, title: string): Promise<StudyPlan> {
    const response = await apiClient.patch(`/api/study-plans/${planId}`, {
      title,
    });
    return mapStudyPlan(asRecord(response.data).data);
  },

  async deleteStudyPlan(
    planId: string,
  ): Promise<{ id: string; deleted: boolean }> {
    const response = await apiClient.delete(`/api/study-plans/${planId}`);
    const data = asRecord(asRecord(response.data).data);
    const deletedFlag = data.deleted;
    const deleted =
      typeof deletedFlag === "boolean" ? deletedFlag : asBoolean(deletedFlag);

    return {
      id: asString(data.id) ?? planId,
      deleted,
    };
  },
};
