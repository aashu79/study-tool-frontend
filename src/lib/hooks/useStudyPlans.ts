import {
  studyPlanService,
  type GenerateStudyPlanRequest,
  type StudyPlan,
  type StudyPlanListByFileResponse,
  type StudyPlanListQueryParams,
  type StudyPlanListResponse,
} from "../api/study-plan.service";
import { getApiErrorMessage } from "../api/error";

const toError = (error: unknown, fallback: string) =>
  new Error(getApiErrorMessage(error, fallback));

export const useStudyPlans = () => {
  const generateStudyPlan = async (
    fileId: string,
    payload?: GenerateStudyPlanRequest,
  ): Promise<StudyPlan> => {
    try {
      return await studyPlanService.generateStudyPlan(fileId, payload);
    } catch (error: unknown) {
      throw toError(error, "Failed to generate study plan");
    }
  };

  const listFileStudyPlans = async (
    fileId: string,
  ): Promise<StudyPlanListByFileResponse> => {
    try {
      return await studyPlanService.listFileStudyPlans(fileId);
    } catch (error: unknown) {
      throw toError(error, "Failed to load file study plans");
    }
  };

  const getStudyPlan = async (planId: string): Promise<StudyPlan> => {
    try {
      return await studyPlanService.getStudyPlan(planId);
    } catch (error: unknown) {
      throw toError(error, "Failed to load study plan");
    }
  };

  const listUserStudyPlans = async (
    params?: StudyPlanListQueryParams,
  ): Promise<StudyPlanListResponse> => {
    try {
      return await studyPlanService.listUserStudyPlans(params);
    } catch (error: unknown) {
      throw toError(error, "Failed to load study plans");
    }
  };

  const renameStudyPlan = async (
    planId: string,
    title: string,
  ): Promise<StudyPlan> => {
    try {
      return await studyPlanService.renameStudyPlan(planId, title);
    } catch (error: unknown) {
      throw toError(error, "Failed to rename study plan");
    }
  };

  const deleteStudyPlan = async (
    planId: string,
  ): Promise<{ id: string; deleted: boolean }> => {
    try {
      return await studyPlanService.deleteStudyPlan(planId);
    } catch (error: unknown) {
      throw toError(error, "Failed to delete study plan");
    }
  };

  return {
    generateStudyPlan,
    listFileStudyPlans,
    getStudyPlan,
    listUserStudyPlans,
    renameStudyPlan,
    deleteStudyPlan,
  };
};
