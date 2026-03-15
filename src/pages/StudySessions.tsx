import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/common/DashboardLayout";
import { Select, Spin, Pagination } from "antd";
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
  FiArrowRight,
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
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
        <FiPlayCircle size={10} />
        Active
      </span>
    );
  }
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-700 border border-teal-200">
        <FiCheckCircle size={10} />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
      <FiXCircle size={10} />
      Incomplete
    </span>
  );
};

const FocusBar = ({ score }: { score: number }) => {
  const clamped = Math.max(0, Math.min(100, score));
  const color =
    clamped >= 70 ? "#10b981" : clamped >= 40 ? "#f59e0b" : "#f43f5e";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold text-slate-600 w-8 text-right">
        {clamped}%
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
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-200 overflow-hidden group ${
        canViewReport
          ? "cursor-pointer hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5"
          : ""
      }`}
      onClick={() =>
        canViewReport && navigate(`/study-sessions/${session.id}/report`)
      }
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <FiFileText size={13} className="text-emerald-600" />
              </div>
              <p className="text-sm font-bold text-slate-800 truncate">
                {session.file?.filename ?? "Unknown file"}
              </p>
            </div>
            <p className="text-xs text-slate-400 ml-9">
              {formatDate(session.sessionStart)}
            </p>
          </div>
          <StatusBadge status={session.status} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-slate-50 rounded-xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
              <FiClock size={12} />
            </div>
            <p className="text-sm font-black text-slate-800">
              {formatDuration(duration)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Duration</p>
          </div>
          <div className="text-center border-x border-slate-200">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
              <FiAlertTriangle size={12} />
            </div>
            <p className="text-sm font-black text-slate-800">
              {session.summary?.distractionCount ?? session.distractionCount}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              Distractions
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-teal-500 mb-1">
              <FiTarget size={12} />
            </div>
            <p className="text-sm font-black text-slate-800">{focusScore}%</p>
            <p className="text-[10px] text-slate-400 font-medium">Focus</p>
          </div>
        </div>

        <FocusBar score={focusScore} />

        {canViewReport && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">
            <span>View Full Report</span>
            <FiArrowRight
              size={12}
              className="group-hover:translate-x-0.5 transition-transform"
            />
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
      <div className="max-w-7xl mx-auto space-y-5">
        {/* HEADER */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 md:p-7 text-white shadow-lg shadow-emerald-200">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/15 rounded-full blur-3xl" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <FiActivity size={22} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-black tracking-tight">
                Study Sessions
              </h1>
              <p className="text-white/80 text-sm mt-0.5 font-medium">
                {pagination
                  ? `${pagination.total} session${pagination.total !== 1 ? "s" : ""} recorded Ã¢â‚¬â€ review your focus & performance`
                  : "Review your past sessions, focus scores and reports"}
              </p>
            </div>

            {pagination && (
              <div className="hidden md:flex items-center gap-3">
                <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                  <p className="text-lg font-black">{pagination.total}</p>
                  <p className="text-[11px] text-white/70 font-medium">Total</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <FiBarChart2 size={15} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-600">Filter:</span>
          </div>
          <Select
            placeholder="All Sessions"
            allowClear
            style={{ width: 170 }}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val as StudySessionStatus | undefined);
              setPage(1);
            }}
            options={[
              { label: "All Sessions", value: undefined },
              { label: "Ã¢Å“â€¦ Completed", value: "COMPLETED" },
              { label: "Ã¢Å¡Â Ã¯Â¸Â Incomplete", value: "INCOMPLETE" },
              { label: "Ã°Å¸Å¸Â¢ Active", value: "ACTIVE" },
            ]}
          />
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
          >
            <FiRefreshCw
              size={13}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* CONTENT */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : errorMessage ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center py-16 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
              <FiAlertTriangle size={24} className="text-rose-400" />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-700">{errorMessage}</p>
              <p className="text-sm text-slate-400 mt-1">
                Something went wrong loading your sessions.
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 text-sm font-bold transition-colors shadow-sm shadow-emerald-200"
            >
              Try Again
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <FiActivity size={28} className="text-emerald-300" />
              </div>
              <p className="font-bold text-slate-700 mb-1">
                {statusFilter
                  ? `No ${statusFilter.toLowerCase()} sessions found`
                  : "No study sessions yet"}
              </p>
              <p className="text-sm text-slate-400">
                Start a session from any document to track your focus.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center pt-1">
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
