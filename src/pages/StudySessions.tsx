import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/common/DashboardLayout";
import { Select, Spin, Empty, Pagination } from "antd";
import {
  FiActivity,
  FiClock,
  FiTarget,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiPlayCircle,
  FiFileText,
  FiRefreshCw,
  FiBarChart2,
} from "react-icons/fi";
import { useStudySessions } from "../lib/hooks/useStudySessions";
import type {
  SessionListItem,
  StudySessionStatus,
} from "../lib/api/study-session.service";

const formatDuration = (seconds: number) => {
  if (seconds <= 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s > 0 ? `${s}s` : ""}`.trim();
  return `${s}s`;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const StatusBadge = ({ status }: { status: StudySessionStatus }) => {
  if (status === "ACTIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
        <FiPlayCircle size={11} />
        Active
      </span>
    );
  }
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
        <FiCheckCircle size={11} />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
      <FiXCircle size={11} />
      Incomplete
    </span>
  );
};

const FocusBar = ({ score }: { score: number }) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color =
    clampedScore >= 70
      ? "bg-emerald-500"
      : clampedScore >= 40
        ? "bg-amber-500"
        : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-8 text-right">
        {clampedScore}%
      </span>
    </div>
  );
};

const SessionCard = ({ session }: { session: SessionListItem }) => {
  const navigate = useNavigate();
  const duration =
    session.summary?.totalDurationSeconds ??
    session.focusTimeSeconds + session.idleTimeSeconds;
  const focusScore = session.summary?.focusScore ?? 0;
  const canViewReport = session.status !== "ACTIVE";

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${canViewReport ? "cursor-pointer hover:border-emerald-300" : ""}`}
      onClick={() =>
        canViewReport && navigate(`/study-sessions/${session.id}/report`)
      }
    >
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FiFileText size={14} className="text-slate-400 shrink-0" />
              <p className="text-sm font-semibold text-slate-800 truncate">
                {session.file?.filename ?? "Unknown file"}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              {formatDate(session.sessionStart)}
            </p>
          </div>
          <StatusBadge status={session.status} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-3 pt-3 border-t border-slate-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
              <FiClock size={12} />
            </div>
            <p className="text-sm font-bold text-slate-800">
              {formatDuration(duration)}
            </p>
            <p className="text-[10px] text-slate-500">Duration</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
              <FiAlertTriangle size={12} />
            </div>
            <p className="text-sm font-bold text-slate-800">
              {session.summary?.distractionCount ?? session.distractionCount}
            </p>
            <p className="text-[10px] text-slate-500">Distractions</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
              <FiTarget size={12} />
            </div>
            <p className="text-sm font-bold text-slate-800">{focusScore}%</p>
            <p className="text-[10px] text-slate-500">Focus</p>
          </div>
        </div>

        {/* Focus bar */}
        <FocusBar score={focusScore} />

        {canViewReport && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-emerald-600 font-medium text-center">
              View full report →
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const StudySessions = () => {
  const [statusFilter, setStatusFilter] = useState<
    StudySessionStatus | undefined
  >();
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, isFetching, refetch, error } = useStudySessions({
    page,
    limit,
    status: statusFilter,
  });

  const sessions = data?.data ?? [];
  const pagination = data?.pagination;

  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "Failed to load sessions"
        : undefined;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-emerald-900 to-teal-900 p-6 md:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-400/20 rounded-full blur-[140px]" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-3 bg-white/15 backdrop-blur-sm rounded-xl">
              <FiActivity className="text-3xl" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black mb-1">
                Study Sessions
              </h1>
              <p className="text-emerald-200 text-sm">
                Review your past sessions, focus scores, and detailed
                performance reports
              </p>
              {pagination && (
                <div className="mt-3 flex items-center gap-4">
                  <div className="bg-white/15 rounded-xl px-3 py-1.5 flex items-center gap-2">
                    <FiBarChart2 size={14} className="text-emerald-300" />
                    <span className="text-sm font-bold">
                      {pagination.total}
                    </span>
                    <span className="text-xs text-emerald-200">
                      total sessions
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 180 }}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val as StudySessionStatus | undefined);
              setPage(1);
            }}
            options={[
              { label: "All Sessions", value: undefined },
              { label: "Completed", value: "COMPLETED" },
              { label: "Incomplete", value: "INCOMPLETE" },
              { label: "Active", value: "ACTIVE" },
            ]}
          />
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <FiRefreshCw
              size={14}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : errorMessage ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <FiAlertTriangle size={32} className="text-rose-400" />
            <p className="text-slate-600">{errorMessage}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16">
            <Empty
              description={
                <span className="text-slate-500 text-sm">
                  {statusFilter
                    ? `No ${statusFilter.toLowerCase()} sessions found`
                    : "No study sessions yet. Start a session from a document to begin tracking."}
                </span>
              }
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center pt-2">
                <Pagination
                  current={pagination.page}
                  total={pagination.total}
                  pageSize={limit}
                  onChange={(p) => setPage(p)}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudySessions;
