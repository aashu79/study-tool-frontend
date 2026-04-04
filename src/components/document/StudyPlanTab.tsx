import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiAlertCircle,
  FiCheck,
  FiEdit2,
  FiMap,
  FiPlus,
  FiRefreshCw,
  FiSidebar,
  FiTarget,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useStudyPlans } from "../../lib/hooks/useStudyPlans";
import type {
  GenerateStudyPlanRequest,
  StudyPlan,
  StudyPlanListByFileResponse,
} from "../../lib/api/study-plan.service";
import { Drawer, Modal, SkeletonBlock } from "./DocumentOverlay";

interface StudyPlanTabProps {
  fileId: string;
  processingStatus?: string;
}

const formatDate = (value?: string) => {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const toOptionalString = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const toOptionalPositiveInt = (value: string): number | undefined => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.round(parsed);
};

const getProcessingBlockingMessage = (status?: string) => {
  if (!status || status === "COMPLETED") {
    return "";
  }

  if (status === "PROCESSING") {
    return "Study plan generation will be available after document processing completes.";
  }

  if (status === "FAILED") {
    return "Document processing failed. Reprocess this file before generating study plans.";
  }

  return "Document is not ready yet. Please process it before generating study plans.";
};

const TextList = ({ items, empty }: { items: string[]; empty: string }) => {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{empty}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={`${item}-${index + 1}`}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
        >
          {item}
        </li>
      ))}
    </ul>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <h3 className="text-sm font-bold text-slate-800">{title}</h3>
    <div className="mt-3">{children}</div>
  </section>
);

const PlansDrawer = ({
  isOpen,
  onClose,
  plans,
  activePlanId,
  onSelectPlan,
}: {
  isOpen: boolean;
  onClose: () => void;
  plans: StudyPlan[];
  activePlanId: string | null;
  onSelectPlan: (planId: string) => void;
}) => (
  <Drawer
    open={isOpen}
    onClose={onClose}
    side="left"
    title="Study Plans"
    description="All saved plans for this document."
  >
    {plans.length === 0 ? (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm font-medium text-slate-700">No plans yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Generate a plan to start your personalized roadmap.
        </p>
      </div>
    ) : (
      <div className="space-y-3">
        {plans.map((plan) => {
          const isActive = activePlanId === plan.id;

          return (
            <button
              type="button"
              key={plan.id}
              onClick={() => {
                onSelectPlan(plan.id);
                onClose();
              }}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                isActive
                  ? "border-teal-200 bg-teal-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                {plan.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {plan.estimatedWeeks} weeks • {plan.estimatedTotalHours} hours
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Updated {formatDate(plan.updatedAt)}
              </p>
            </button>
          );
        })}
      </div>
    )}
  </Drawer>
);

export const StudyPlanTab = ({
  fileId,
  processingStatus,
}: StudyPlanTabProps) => {
  const queryClient = useQueryClient();
  const {
    listFileStudyPlans,
    getStudyPlan,
    generateStudyPlan,
    renameStudyPlan,
    deleteStudyPlan,
  } = useStudyPlans();

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showPlansDrawer, setShowPlansDrawer] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  const [formState, setFormState] = useState({
    customTitle: "",
    objective: "",
    currentKnowledgeLevel: "",
    targetTimelineDays: "",
    studyHoursPerWeek: "",
    dailyStudyMinutes: "",
    specialInstruction: "",
  });

  const disableGeneration =
    Boolean(processingStatus) && processingStatus !== "COMPLETED";
  const disableReason = getProcessingBlockingMessage(processingStatus);

  const plansQuery = useQuery({
    queryKey: ["fileStudyPlans", fileId],
    queryFn: () => listFileStudyPlans(fileId),
    enabled: Boolean(fileId),
    staleTime: 20 * 1000,
  });

  const plans = plansQuery.data?.data ?? [];
  const activePlanId = selectedPlanId ?? plans[0]?.id ?? null;

  const activePlanQuery = useQuery({
    queryKey: ["studyPlanDetail", activePlanId],
    queryFn: () => getStudyPlan(activePlanId!),
    enabled: Boolean(activePlanId),
    staleTime: 20 * 1000,
  });

  const activePlan = activePlanQuery.data;

  useEffect(() => {
    if (plans.length === 0) {
      setSelectedPlanId(null);
      return;
    }

    if (!selectedPlanId || !plans.some((plan) => plan.id === selectedPlanId)) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  useEffect(() => {
    setIsEditingTitle(false);
    setTitleDraft(activePlan?.title ?? "");
  }, [activePlan?.id, activePlan?.title]);

  const createMutation = useMutation({
    mutationFn: (payload: GenerateStudyPlanRequest) =>
      generateStudyPlan(fileId, payload),
    onSuccess: (createdPlan) => {
      toast.success("Study plan generated successfully");
      setSelectedPlanId(createdPlan.id);
      setShowCreateModal(false);
      setFormState({
        customTitle: "",
        objective: "",
        currentKnowledgeLevel: "",
        targetTimelineDays: "",
        studyHoursPerWeek: "",
        dailyStudyMinutes: "",
        specialInstruction: "",
      });

      queryClient.setQueryData(
        ["studyPlanDetail", createdPlan.id],
        createdPlan,
      );
      queryClient.invalidateQueries({ queryKey: ["fileStudyPlans", fileId] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate study plan";
      toast.error(message);
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ planId, title }: { planId: string; title: string }) =>
      renameStudyPlan(planId, title),
    onSuccess: (updatedPlan) => {
      toast.success("Study plan renamed");
      setIsEditingTitle(false);
      queryClient.setQueryData(
        ["studyPlanDetail", updatedPlan.id],
        updatedPlan,
      );

      queryClient.setQueryData<StudyPlanListByFileResponse>(
        ["fileStudyPlans", fileId],
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            data: oldData.data.map((plan) =>
              plan.id === updatedPlan.id
                ? {
                    ...plan,
                    title: updatedPlan.title,
                    updatedAt: updatedPlan.updatedAt,
                  }
                : plan,
            ),
          };
        },
      );
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to rename study plan";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (planId: string) => deleteStudyPlan(planId),
    onSuccess: (result, planId) => {
      if (!result.deleted) {
        toast.error("Failed to delete study plan");
        return;
      }

      toast.success("Study plan deleted");
      if (activePlanId === planId) {
        setSelectedPlanId(null);
      }

      queryClient.setQueryData<StudyPlanListByFileResponse>(
        ["fileStudyPlans", fileId],
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          const nextData = oldData.data.filter((plan) => plan.id !== planId);
          return {
            ...oldData,
            data: nextData,
            count: nextData.length,
          };
        },
      );

      queryClient.removeQueries({ queryKey: ["studyPlanDetail", planId] });
      queryClient.invalidateQueries({ queryKey: ["fileStudyPlans", fileId] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to delete study plan";
      toast.error(message);
    },
  });

  const handleCreatePlan = () => {
    if (disableGeneration || createMutation.isPending) {
      return;
    }

    createMutation.mutate({
      customTitle: toOptionalString(formState.customTitle),
      objective: toOptionalString(formState.objective),
      currentKnowledgeLevel: toOptionalString(formState.currentKnowledgeLevel),
      targetTimelineDays: toOptionalPositiveInt(formState.targetTimelineDays),
      studyHoursPerWeek: toOptionalPositiveInt(formState.studyHoursPerWeek),
      dailyStudyMinutes: toOptionalPositiveInt(formState.dailyStudyMinutes),
      specialInstruction: toOptionalString(formState.specialInstruction),
    });
  };

  const handleSaveTitle = () => {
    if (!activePlanId) {
      return;
    }

    const nextTitle = titleDraft.trim();
    if (!nextTitle) {
      toast.error("Title cannot be empty");
      return;
    }

    renameMutation.mutate({ planId: activePlanId, title: nextTitle });
  };

  const handleDeleteActivePlan = () => {
    if (!activePlanId || !activePlan || deleteMutation.isPending) {
      return;
    }

    if (
      window.confirm(`Delete "${activePlan.title}"? This cannot be undone.`)
    ) {
      deleteMutation.mutate(activePlanId);
    }
  };

  const isLoading =
    plansQuery.isLoading ||
    (Boolean(activePlanId) && activePlanQuery.isLoading);

  return (
    <>
      <div className="flex h-full min-h-0 flex-col bg-slate-50">
        <div className="flex items-start justify-between gap-4 px-6 py-6 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
              Study Plans
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Document roadmap
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Generate and manage all plans for this document without leaving
              the viewer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPlansDrawer(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <FiSidebar size={16} />
              Plans
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <FiPlus size={16} />
              New Plan
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
          {disableGeneration ? (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {disableReason}
            </div>
          ) : null}

          {isLoading ? (
            <div className="space-y-4">
              <SkeletonBlock className="h-12 w-2/3 rounded-2xl" />
              <SkeletonBlock className="h-40 w-full rounded-3xl" />
              <SkeletonBlock className="h-64 w-full rounded-3xl" />
            </div>
          ) : plansQuery.error ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md rounded-4xl border border-rose-200 bg-rose-50 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                  <FiAlertCircle size={24} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Failed to load study plans
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {plansQuery.error instanceof Error
                    ? plansQuery.error.message
                    : "Please try again."}
                </p>
                <button
                  type="button"
                  onClick={() => plansQuery.refetch()}
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : plans.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-xl rounded-4xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <FiMap size={28} />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-slate-900">
                  Create the first plan
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Build a personalized plan for this exact document, including
                  phases, weekly schedule, and targeted focus areas.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-teal-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
                >
                  <FiPlus size={16} />
                  Generate Plan
                </button>
              </div>
            </div>
          ) : activePlanQuery.error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {activePlanQuery.error instanceof Error
                ? activePlanQuery.error.message
                : "Failed to load selected study plan."}
            </div>
          ) : activePlan ? (
            <div className="space-y-4">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {isEditingTitle ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={titleDraft}
                          onChange={(event) =>
                            setTitleDraft(event.target.value)
                          }
                          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          type="button"
                          onClick={handleSaveTitle}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
                        >
                          <FiCheck size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingTitle(false);
                            setTitleDraft(activePlan.title);
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
                          setTitleDraft(activePlan.title);
                          setIsEditingTitle(true);
                        }}
                        className="inline-flex items-center gap-2 text-left"
                      >
                        <h3 className="text-2xl font-semibold text-slate-900">
                          {activePlan.title}
                        </h3>
                        <FiEdit2 size={15} className="text-slate-400" />
                      </button>
                    )}

                    <p className="mt-1 text-sm text-slate-500">
                      Updated {formatDate(activePlan.updatedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => activePlanQuery.refetch()}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
                    >
                      <FiRefreshCw size={14} />
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteActivePlan}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700"
                    >
                      <FiTrash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Weeks
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {activePlan.estimatedWeeks}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Hours
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {activePlan.estimatedTotalHours}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Difficulty
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {activePlan.plan.difficultyLevel || "Unknown"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Created
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDate(activePlan.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Objective
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {activePlan.objective ||
                        "No explicit objective provided."}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Current Knowledge Level
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {activePlan.currentKnowledgeLevel || "Not specified."}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Overview
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {activePlan.overview ||
                      activePlan.plan.overview ||
                      "No overview provided."}
                  </p>
                </div>
              </section>

              <Section title="Prerequisites">
                {activePlan.plan.prerequisites.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No prerequisites listed.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {activePlan.plan.prerequisites.map((item, index) => (
                      <div
                        key={`${item.topic}-${index + 1}`}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="text-sm font-semibold text-slate-900">
                          {item.topic}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.whyItMatters}
                        </p>
                        <span className="mt-2 inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          Priority: {item.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Focus Areas">
                {activePlan.plan.focusAreas.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No focus areas listed.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {activePlan.plan.focusAreas.map((item, index) => (
                      <div
                        key={`${item.topic}-${index + 1}`}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="text-sm font-semibold text-slate-900">
                          {item.topic}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.reason}
                        </p>
                        <span className="mt-2 inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          Priority: {item.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Phases">
                {activePlan.plan.phases.length === 0 ? (
                  <p className="text-sm text-slate-500">No phases listed.</p>
                ) : (
                  <div className="space-y-3">
                    {activePlan.plan.phases.map((phase) => (
                      <div
                        key={phase.phaseNumber}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            Phase {phase.phaseNumber}: {phase.title}
                          </p>
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                            {phase.duration}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          {phase.goal}
                        </p>

                        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                          <div>
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Topics
                            </p>
                            <TextList
                              items={phase.topics}
                              empty="No topics listed."
                            />
                          </div>
                          <div>
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Activities
                            </p>
                            <TextList
                              items={phase.activities}
                              empty="No activities listed."
                            />
                          </div>
                          <div>
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Checkpoints
                            </p>
                            <TextList
                              items={phase.checkpoints}
                              empty="No checkpoints listed."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Weekly Schedule">
                {activePlan.plan.weeklySchedule.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No weekly schedule listed.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activePlan.plan.weeklySchedule.map((week) => (
                      <div
                        key={week.weekNumber}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            Week {week.weekNumber}
                          </p>
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                            {week.primaryGoal}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                          <div>
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Study Targets
                            </p>
                            <TextList
                              items={week.studyTargets}
                              empty="No study targets listed."
                            />
                          </div>
                          <div>
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Practice
                            </p>
                            <TextList
                              items={week.practice}
                              empty="No practice items listed."
                            />
                          </div>
                          <div>
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Revision
                            </p>
                            <TextList
                              items={week.revision}
                              empty="No revision items listed."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          ) : null}
        </div>
      </div>

      <PlansDrawer
        isOpen={showPlansDrawer}
        onClose={() => setShowPlansDrawer(false)}
        plans={plans}
        activePlanId={activePlanId}
        onSelectPlan={(planId) => setSelectedPlanId(planId)}
      />

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Generate Study Plan"
        description="Build a personalized plan for this document."
        widthClassName="w-full max-w-[620px]"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Custom Title
              </label>
              <input
                value={formState.customTitle}
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    customTitle: event.target.value,
                  }))
                }
                placeholder="e.g., Midterm prep plan"
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Knowledge Level
              </label>
              <input
                value={formState.currentKnowledgeLevel}
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    currentKnowledgeLevel: event.target.value,
                  }))
                }
                placeholder="Beginner / Intermediate / Advanced"
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Objective
            </label>
            <textarea
              value={formState.objective}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  objective: event.target.value,
                }))
              }
              rows={3}
              placeholder="What do you want to achieve with this plan?"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Timeline (days)
              </label>
              <input
                type="number"
                min={1}
                value={formState.targetTimelineDays}
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    targetTimelineDays: event.target.value,
                  }))
                }
                placeholder="28"
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Hours per week
              </label>
              <input
                type="number"
                min={1}
                value={formState.studyHoursPerWeek}
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    studyHoursPerWeek: event.target.value,
                  }))
                }
                placeholder="8"
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Daily minutes
              </label>
              <input
                type="number"
                min={1}
                value={formState.dailyStudyMinutes}
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    dailyStudyMinutes: event.target.value,
                  }))
                }
                placeholder="75"
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Special Instruction
            </label>
            <textarea
              value={formState.specialInstruction}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  specialInstruction: event.target.value,
                }))
              }
              rows={3}
              placeholder="Optional direction for the AI plan generation"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {disableGeneration ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {disableReason}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="inline-flex h-10 items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreatePlan}
              disabled={disableGeneration || createMutation.isPending}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiTarget size={14} />
              {createMutation.isPending ? "Generating..." : "Generate Plan"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
