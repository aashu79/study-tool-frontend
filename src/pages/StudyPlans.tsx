import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiBookOpen,
  FiEdit2,
  FiFileText,
  FiMap,
  FiRefreshCw,
  FiTarget,
  FiTrash2,
  FiTrendingUp,
} from "react-icons/fi";
import toast from "react-hot-toast";
import DashboardLayout from "../components/common/DashboardLayout";
import { useFiles } from "../lib/hooks/useFile";
import { useStudyPlans } from "../lib/hooks/useStudyPlans";
import type {
  GenerateStudyPlanRequest,
  StudyPlanListResponse,
} from "../lib/api/study-plan.service";

const PAGE_SIZE = 10;

const formatDate = (value?: string): string => {
  if (!value) {
    return "Unknown date";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const normalizeNumberInput = (value: string): number | undefined => {
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

const toFieldValue = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const SectionCard = ({
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

const BulletList = ({
  items,
  emptyText,
}: {
  items: string[];
  emptyText: string;
}) => {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
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

const StudyPlans = () => {
  const queryClient = useQueryClient();
  const {
    generateStudyPlan,
    listUserStudyPlans,
    getStudyPlan,
    renameStudyPlan,
    deleteStudyPlan,
  } = useStudyPlans();

  const [page, setPage] = useState(1);
  const [fileFilter, setFileFilter] = useState<string>("");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [createFileId, setCreateFileId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [currentKnowledgeLevel, setCurrentKnowledgeLevel] = useState("");
  const [targetTimelineDays, setTargetTimelineDays] = useState("");
  const [studyHoursPerWeek, setStudyHoursPerWeek] = useState("");
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState("");
  const [specialInstruction, setSpecialInstruction] = useState("");

  const [renameTitle, setRenameTitle] = useState("");

  const { data: filesData, isLoading: filesLoading } = useFiles({
    sortOrder: "desc",
    page: 1,
    limit: 100,
  });

  const availableFiles = filesData?.files ?? [];
  const selectedCreateFile = useMemo(
    () => availableFiles.find((file) => file.id === createFileId),
    [availableFiles, createFileId],
  );

  const plansQuery = useQuery({
    queryKey: ["studyPlans", page, PAGE_SIZE, fileFilter],
    queryFn: () =>
      listUserStudyPlans({
        page,
        limit: PAGE_SIZE,
        fileId: fileFilter || undefined,
      }),
    staleTime: 20 * 1000,
  });

  const plans = plansQuery.data?.data ?? [];
  const activePlanId = selectedPlanId ?? plans[0]?.id ?? null;

  const detailsQuery = useQuery({
    queryKey: ["studyPlan", activePlanId],
    queryFn: () => getStudyPlan(activePlanId!),
    enabled: !!activePlanId,
    staleTime: 30 * 1000,
  });

  const activePlan = detailsQuery.data ?? null;

  useEffect(() => {
    if (!selectedPlanId && plans.length > 0) {
      setSelectedPlanId(plans[0].id);
      return;
    }

    if (selectedPlanId && !plans.some((plan) => plan.id === selectedPlanId)) {
      setSelectedPlanId(plans[0]?.id ?? null);
    }
  }, [plans, selectedPlanId]);

  useEffect(() => {
    setRenameTitle(activePlan?.title ?? "");
  }, [activePlan?.id, activePlan?.title]);

  const generateMutation = useMutation({
    mutationFn: ({
      fileId,
      payload,
    }: {
      fileId: string;
      payload: GenerateStudyPlanRequest;
    }) => generateStudyPlan(fileId, payload),
    onSuccess: (newPlan) => {
      toast.success("Study plan generated successfully");
      setPage(1);
      setSelectedPlanId(newPlan.id);
      setFileFilter((previous) => previous || newPlan.fileId);
      queryClient.setQueryData(["studyPlan", newPlan.id], newPlan);
      queryClient.invalidateQueries({ queryKey: ["studyPlans"] });
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
      toast.success("Study plan title updated");
      queryClient.setQueryData(["studyPlan", updatedPlan.id], updatedPlan);
      queryClient.setQueriesData<StudyPlanListResponse>(
        { queryKey: ["studyPlans"] },
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
      queryClient.removeQueries({ queryKey: ["studyPlan", planId] });
      queryClient.invalidateQueries({ queryKey: ["studyPlans"] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to delete study plan";
      toast.error(message);
    },
  });

  const listError =
    plansQuery.error instanceof Error ? plansQuery.error.message : undefined;
  const detailsError =
    detailsQuery.error instanceof Error
      ? detailsQuery.error.message
      : undefined;

  const pagination = plansQuery.data?.pagination;

  const totalPlans = pagination?.total ?? plans.length;
  const uniqueFilesCount = new Set(plans.map((plan) => plan.fileId)).size;
  const averageHours =
    plans.length > 0
      ? Math.round(
          plans.reduce(
            (sum, plan) => sum + (plan.estimatedTotalHours || 0),
            0,
          ) / plans.length,
        )
      : 0;

  const createFileStatus = selectedCreateFile?.processingStatus;
  const canGenerate =
    Boolean(createFileId) &&
    createFileStatus !== "PENDING" &&
    createFileStatus !== "PROCESSING" &&
    !generateMutation.isPending;

  const handleGeneratePlan = () => {
    if (!createFileId) {
      toast.error("Please choose a document first");
      return;
    }

    const payload: GenerateStudyPlanRequest = {
      customTitle: toFieldValue(customTitle),
      objective: toFieldValue(objective),
      currentKnowledgeLevel: toFieldValue(currentKnowledgeLevel),
      targetTimelineDays: normalizeNumberInput(targetTimelineDays),
      studyHoursPerWeek: normalizeNumberInput(studyHoursPerWeek),
      dailyStudyMinutes: normalizeNumberInput(dailyStudyMinutes),
      specialInstruction: toFieldValue(specialInstruction),
    };

    generateMutation.mutate({ fileId: createFileId, payload });
  };

  const handleRename = () => {
    if (!activePlanId) {
      return;
    }

    const nextTitle = renameTitle.trim();
    if (!nextTitle) {
      toast.error("Title cannot be empty");
      return;
    }

    renameMutation.mutate({ planId: activePlanId, title: nextTitle });
  };

  const handleDelete = () => {
    if (!activePlanId || deleteMutation.isPending) {
      return;
    }

    if (window.confirm("Delete this study plan permanently?")) {
      deleteMutation.mutate(activePlanId);
    }
  };

  const resetForm = () => {
    setCustomTitle("");
    setObjective("");
    setCurrentKnowledgeLevel("");
    setTargetTimelineDays("");
    setStudyHoursPerWeek("");
    setDailyStudyMinutes("");
    setSpecialInstruction("");
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white shadow-lg shadow-emerald-200 md:p-7">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                <FiMap size={22} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight md:text-2xl">
                  AI Study Plans
                </h1>
                <p className="mt-0.5 text-sm font-medium text-white/85">
                  Generate personalized study roadmaps from your uploaded
                  documents.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 self-start md:self-auto">
              <div className="rounded-xl bg-white/20 px-3 py-2 text-center backdrop-blur">
                <p className="text-[11px] font-semibold text-white/75">Plans</p>
                <p className="text-lg font-black">{totalPlans}</p>
              </div>
              <div className="rounded-xl bg-white/20 px-3 py-2 text-center backdrop-blur">
                <p className="text-[11px] font-semibold text-white/75">
                  Avg Hours
                </p>
                <p className="text-lg font-black">{averageHours}</p>
              </div>
              <div className="rounded-xl bg-white/20 px-3 py-2 text-center backdrop-blur">
                <p className="text-[11px] font-semibold text-white/75">Files</p>
                <p className="text-lg font-black">{uniqueFilesCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[22rem,1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <FiTarget size={14} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Generate Plan
                  </h2>
                  <p className="text-xs text-slate-500">
                    Create a new variant for any file
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Document
                  </label>
                  <select
                    value={createFileId}
                    onChange={(event) => setCreateFileId(event.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-teal-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                    disabled={filesLoading}
                  >
                    <option value="">Select a document</option>
                    {availableFiles.map((file) => (
                      <option key={file.id} value={file.id}>
                        {file.filename}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Custom Title
                  </label>
                  <input
                    value={customTitle}
                    onChange={(event) => setCustomTitle(event.target.value)}
                    placeholder="e.g., Midterm revision plan"
                    className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-800 focus:border-teal-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Objective
                  </label>
                  <textarea
                    value={objective}
                    onChange={(event) => setObjective(event.target.value)}
                    rows={2}
                    placeholder="What should this plan optimize for?"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Timeline Days
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={targetTimelineDays}
                      onChange={(event) =>
                        setTargetTimelineDays(event.target.value)
                      }
                      placeholder="28"
                      className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-800 focus:border-teal-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Hours/Week
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={studyHoursPerWeek}
                      onChange={(event) =>
                        setStudyHoursPerWeek(event.target.value)
                      }
                      placeholder="8"
                      className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-800 focus:border-teal-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Daily Minutes
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={dailyStudyMinutes}
                      onChange={(event) =>
                        setDailyStudyMinutes(event.target.value)
                      }
                      placeholder="75"
                      className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-800 focus:border-teal-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Knowledge Level
                    </label>
                    <input
                      value={currentKnowledgeLevel}
                      onChange={(event) =>
                        setCurrentKnowledgeLevel(event.target.value)
                      }
                      placeholder="Beginner"
                      className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-800 focus:border-teal-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Special Instruction
                  </label>
                  <textarea
                    value={specialInstruction}
                    onChange={(event) =>
                      setSpecialInstruction(event.target.value)
                    }
                    rows={2}
                    placeholder="Any emphasis areas or constraints"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {createFileStatus && createFileStatus !== "COMPLETED" ? (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                    Selected file status is {createFileStatus}. Plan generation
                    is available after processing completes.
                  </p>
                ) : null}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGeneratePlan}
                    disabled={!canGenerate}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiTrendingUp size={14} />
                    {generateMutation.isPending ? "Generating..." : "Generate"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Saved Plans
                  </h2>
                  <p className="text-xs text-slate-500">
                    {totalPlans} total plan{totalPlans === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => plansQuery.refetch()}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <FiRefreshCw
                    size={12}
                    className={plansQuery.isFetching ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>

              <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Filter by Document
                </label>
                <select
                  value={fileFilter}
                  onChange={(event) => {
                    setFileFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-teal-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">All documents</option>
                  {availableFiles.map((file) => (
                    <option key={file.id} value={file.id}>
                      {file.filename}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                {plansQuery.isLoading ? (
                  <div className="py-6 text-center text-sm text-slate-500">
                    Loading plans...
                  </div>
                ) : listError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {listError}
                  </div>
                ) : plans.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
                    No study plans found for this filter.
                  </div>
                ) : (
                  plans.map((plan) => {
                    const isActive = plan.id === activePlanId;

                    return (
                      <button
                        type="button"
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                          isActive
                            ? "border-teal-300 bg-teal-50"
                            : "border-slate-200 bg-white hover:border-teal-200 hover:bg-teal-50/40"
                        }`}
                      >
                        <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                          {plan.title}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {plan.fileName}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{plan.estimatedWeeks} weeks</span>
                          <span>•</span>
                          <span>{plan.estimatedTotalHours} hrs</span>
                          <span>•</span>
                          <span>{formatDate(plan.createdAt)}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {pagination && pagination.totalPages > 1 ? (
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() =>
                      setPage((previous) => Math.max(1, previous - 1))
                    }
                    disabled={pagination.page <= 1}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>
                    Page {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((previous) =>
                        Math.min(pagination.totalPages, previous + 1),
                      )
                    }
                    disabled={pagination.page >= pagination.totalPages}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            {!activePlanId ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <FiBookOpen size={24} />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  No study plan selected
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Generate or select a plan from the left panel.
                </p>
              </div>
            ) : detailsQuery.isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="h-5 w-2/5 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-4 w-3/5 animate-pulse rounded bg-slate-200" />
                <div className="mt-6 space-y-3">
                  <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            ) : detailsError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {detailsError}
              </div>
            ) : activePlan ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        {activePlan.title}
                      </h2>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {activePlan.fileName}
                      </p>
                    </div>
                    <Link
                      to={`/app/document/${activePlan.fileId}`}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
                    >
                      <FiFileText size={14} />
                      Open Document
                    </Link>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold text-slate-500">
                        Estimated Hours
                      </p>
                      <p className="mt-1 text-base font-bold text-slate-800">
                        {activePlan.estimatedTotalHours}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold text-slate-500">
                        Estimated Weeks
                      </p>
                      <p className="mt-1 text-base font-bold text-slate-800">
                        {activePlan.estimatedWeeks}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold text-slate-500">
                        Source Words
                      </p>
                      <p className="mt-1 text-base font-bold text-slate-800">
                        {activePlan.sourceWordCount.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold text-slate-500">
                        Created
                      </p>
                      <p className="mt-1 text-base font-bold text-slate-800">
                        {formatDate(activePlan.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                    <input
                      value={renameTitle}
                      onChange={(event) => setRenameTitle(event.target.value)}
                      className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-800 focus:border-teal-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                      placeholder="Rename study plan"
                    />
                    <button
                      type="button"
                      onClick={handleRename}
                      disabled={renameMutation.isPending}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FiEdit2 size={14} />
                      Save Name
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FiTrash2 size={14} />
                      Delete
                    </button>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Objective
                      </p>
                      <p className="mt-1">
                        {activePlan.objective ||
                          "No explicit objective provided."}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Knowledge Level
                      </p>
                      <p className="mt-1">
                        {activePlan.currentKnowledgeLevel || "Not specified."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Overview
                    </p>
                    <p className="mt-1 leading-6">
                      {activePlan.overview ||
                        activePlan.plan.overview ||
                        "No overview provided."}
                    </p>
                  </div>
                </div>

                <SectionCard title="Prerequisites">
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
                          <p className="text-sm font-semibold text-slate-800">
                            {item.topic}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {item.whyItMatters}
                          </p>
                          <span className="mt-2 inline-flex rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
                            Priority: {item.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard title="Focus Areas">
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
                          <p className="text-sm font-semibold text-slate-800">
                            {item.topic}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {item.reason}
                          </p>
                          <span className="mt-2 inline-flex rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
                            Priority: {item.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard title="Phases">
                  {activePlan.plan.phases.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No phased schedule available.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activePlan.plan.phases.map((phase) => (
                        <div
                          key={phase.phaseNumber}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-slate-800">
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
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Topics
                              </p>
                              <BulletList
                                items={phase.topics}
                                emptyText="No topics listed."
                              />
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Activities
                              </p>
                              <BulletList
                                items={phase.activities}
                                emptyText="No activities listed."
                              />
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Checkpoints
                              </p>
                              <BulletList
                                items={phase.checkpoints}
                                emptyText="No checkpoints listed."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard title="Weekly Schedule">
                  {activePlan.plan.weeklySchedule.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No weekly schedule available.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activePlan.plan.weeklySchedule.map((week) => (
                        <div
                          key={week.weekNumber}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-slate-800">
                              Week {week.weekNumber}
                            </p>
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                              {week.primaryGoal}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Study Targets
                              </p>
                              <BulletList
                                items={week.studyTargets}
                                emptyText="No study targets listed."
                              />
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Practice
                              </p>
                              <BulletList
                                items={week.practice}
                                emptyText="No practice tasks listed."
                              />
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Revision
                              </p>
                              <BulletList
                                items={week.revision}
                                emptyText="No revision tasks listed."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <SectionCard title="Learning Objectives">
                    <BulletList
                      items={activePlan.plan.learningObjectives}
                      emptyText="No learning objectives listed."
                    />
                  </SectionCard>

                  <SectionCard title="Revision Strategy">
                    <BulletList
                      items={activePlan.plan.revisionStrategy}
                      emptyText="No revision strategy listed."
                    />
                  </SectionCard>

                  <SectionCard title="Practice Strategy">
                    <BulletList
                      items={activePlan.plan.practiceStrategy}
                      emptyText="No practice strategy listed."
                    />
                  </SectionCard>

                  <SectionCard title="Warning Areas">
                    <BulletList
                      items={activePlan.plan.warningAreas}
                      emptyText="No warning areas listed."
                    />
                  </SectionCard>

                  <SectionCard title="Success Criteria">
                    <BulletList
                      items={activePlan.plan.successCriteria}
                      emptyText="No success criteria listed."
                    />
                  </SectionCard>

                  <SectionCard title="Next Steps">
                    <BulletList
                      items={activePlan.plan.nextSteps}
                      emptyText="No next steps listed."
                    />
                  </SectionCard>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudyPlans;
