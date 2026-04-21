import type { ReactNode } from "react";
import { Progress, Spin } from "antd";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowRight,
  FiClock,
  FiFolder,
  FiLayers,
  FiPlus,
  FiTarget,
  FiUpload,
} from "react-icons/fi";
import { IoFlame } from "react-icons/io5";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/common/DashboardLayout";
import FileCard from "../components/dashboard/FileCard";
import StatCard from "../components/dashboard/StatCard";
import { getApiErrorMessage } from "../lib/api/error";
import { useDashboardInsights } from "../lib/hooks/useDashboardInsights";
import type { FileUploadResponse } from "../lib/api/file.service";
import { useAuthStore } from "../lib/store/auth.store";

const formatRelativeTime = (dateValue: string) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffInMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffInMs / (1000 * 60));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const formatWeekRange = (weekStart: string, weekEnd: string) => {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "This week";
  }

  return `${start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} - ${end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
};

const getDefaultGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getActivityMeta = (type: string) => {
  const normalized = type.toLowerCase();

  if (normalized === "quiz") {
    return {
      icon: <FiTarget size={16} />,
      bg: "bg-emerald-100",
      color: "text-emerald-600",
    };
  }

  if (normalized === "upload" || normalized === "file") {
    return {
      icon: <FiFolder size={16} />,
      bg: "bg-blue-100",
      color: "text-blue-600",
    };
  }

  if (normalized === "flashcards" || normalized === "flashcard") {
    return {
      icon: <FiLayers size={16} />,
      bg: "bg-amber-100",
      color: "text-amber-600",
    };
  }

  return {
    icon: <FiActivity size={16} />,
    bg: "bg-purple-100",
    color: "text-purple-600",
  };
};

const getCountTrend = (value: number) => {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value} this week`;
};

const inferMimetype = (filename: string) => {
  const extension = filename.toLowerCase().split(".").pop();

  if (extension === "pdf") return "application/pdf";
  if (extension === "png") return "image/png";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "gif") return "image/gif";
  if (extension === "webp") return "image/webp";
  if (extension === "doc") return "application/msword";
  if (extension === "docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  return "application/octet-stream";
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const displayName = user?.full_name?.split(" ")[0] || "Student";

  const { data: insights, isLoading, isError, error } = useDashboardInsights();

  const greetingMessage =
    insights?.greeting.message || `${getDefaultGreeting()}, ${displayName}!`;
  const pendingMaterials = insights?.greeting.pendingMaterials ?? 0;
  const streakDays =
    insights?.greeting.streakDays ?? insights?.stats.studyStreakDays ?? 0;

  const weeklyTarget = insights?.weeklyGoal.target ?? 20;
  const weeklyCompleted = insights?.weeklyGoal.completed ?? 0;
  const weeklyRemaining =
    insights?.weeklyGoal.remaining ??
    Math.max(weeklyTarget - weeklyCompleted, 0);
  const weeklyProgressPercent =
    weeklyTarget > 0
      ? Math.min(100, (weeklyCompleted / weeklyTarget) * 100)
      : 0;

  const weekRangeLabel = insights?.weeklyGoal
    ? formatWeekRange(
        insights.weeklyGoal.weekStart,
        insights.weeklyGoal.weekEnd,
      )
    : "This week";

  const latestMaterials = insights?.latestStudyMaterials ?? [];
  const latestMaterialCards: FileUploadResponse[] = latestMaterials.map(
    (item) => ({
      id: item.id,
      filename: item.filename,
      mimetype: inferMimetype(item.filename),
      size: item.sizeBytes,
      createdAt: item.createdAt,
      processingStatus: item.processingStatus,
    }),
  );
  const recentActivity = insights?.recentActivity ?? [];
  const weakTopics = insights?.weakTopics ?? [];

  const focusTrendDelta = insights?.trends.avgFocusTimeMinutesDelta ?? 0;
  const focusTrendLabel =
    focusTrendDelta === 0
      ? "No change"
      : `${focusTrendDelta > 0 ? "+" : "-"}${Math.abs(focusTrendDelta)} min`;

  const stats = [
    {
      icon: FiFolder,
      title: "Total Uploads",
      value: insights?.stats.totalUploads ?? 0,
      trend: {
        value: getCountTrend(insights?.trends.uploadsThisWeek ?? 0),
        isPositive: (insights?.trends.uploadsThisWeek ?? 0) >= 0,
      },
      iconColor: "#8b5cf6",
      iconBgColor: "#ede9fe",
    },
    {
      icon: FiLayers,
      title: "Active Flashcards",
      value: insights?.stats.activeFlashcards ?? 0,
      trend: {
        value: getCountTrend(insights?.trends.flashcardsThisWeek ?? 0),
        isPositive: (insights?.trends.flashcardsThisWeek ?? 0) >= 0,
      },
      iconColor: "#10b981",
      iconBgColor: "#d1fae5",
    },
    {
      icon: FiTarget,
      title: "Quizzes Taken",
      value: insights?.stats.quizzesTaken ?? 0,
      trend: {
        value: getCountTrend(insights?.trends.quizzesThisWeek ?? 0),
        isPositive: (insights?.trends.quizzesThisWeek ?? 0) >= 0,
      },
      iconColor: "#f59e0b",
      iconBgColor: "#fef3c7",
    },
    {
      icon: FiClock,
      title: "Avg. Focus Time",
      value: `${insights?.stats.avgFocusTimeMinutes ?? 0} min`,
      trend: { value: focusTrendLabel, isPositive: focusTrendDelta >= 0 },
      iconColor: "#0ea5e9",
      iconBgColor: "#e0f2fe",
    },
    {
      icon: FiAlertCircle,
      title: "Weak Topics",
      value: insights?.stats.weakTopicsCount ?? 0,
      iconColor: "#ef4444",
      iconBgColor: "#fee2e2",
    },
    {
      icon: IoFlame,
      title: "Study Streak",
      value: `${insights?.stats.studyStreakDays ?? 0} days`,
      trend: { value: "Keep it up!", isPositive: true },
      iconColor: "#f97316",
      iconBgColor: "#ffedd5",
    },
  ];

  const quickActions = [
    {
      to: "/upload",
      icon: FiUpload,
      label: "Upload Material",
      desc: "Add new notes or PDFs",
      color: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-200",
    },
    {
      to: "/my-materials",
      icon: FiFolder,
      label: "My Materials",
      desc: "Browse your library",
      color: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-200",
    },
    {
      to: "/study-sessions",
      icon: FiActivity,
      label: "Study Sessions",
      desc: "View your progress",
      color: "from-sky-500 to-cyan-600",
      shadow: "shadow-sky-200",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        {isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {getApiErrorMessage(
              error,
              "Could not load dashboard insights. Showing fallback values.",
            )}
          </div>
        )}

        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 md:p-8 text-white shadow-lg shadow-emerald-200">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <IoFlame size={13} className="text-yellow-300" />
                {streakDays > 0
                  ? `${streakDays}-day streak going strong!`
                  : "Ready for a new streak!"}
              </div>
              <h1 className="mb-1.5 text-2xl font-black tracking-tight md:text-3xl">
                {greetingMessage}
              </h1>
              <p className="text-sm font-medium text-white/85 md:text-base">
                You have{" "}
                <span className="font-bold text-white">
                  {pendingMaterials} pending materials
                </span>{" "}
                to review today.
              </p>
            </div>

            <div className="min-w-60 rounded-2xl bg-white/15 p-5 backdrop-blur-md">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-sm font-bold">Weekly Goal</span>
                <span className="text-sm font-semibold text-white/80">
                  {weeklyCompleted} / {weeklyTarget}
                </span>
              </div>
              <Progress
                percent={weeklyProgressPercent}
                strokeColor="#22c55e"
                trailColor="rgba(255,255,255,0.2)"
                showInfo={false}
                strokeWidth={8}
              />
              <p className="mt-2 text-xs font-medium text-white/70">
                {weeklyRemaining} assignments left ({weekRangeLabel})
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className={`group flex items-center gap-4 rounded-2xl bg-linear-to-r p-4 text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${action.color} ${action.shadow}`}
              >
                <div className="h-10 w-10 shrink-0 rounded-xl bg-white/20 flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{action.label}</p>
                  <p className="text-xs text-white/90">{action.desc}</p>
                </div>
                <FiArrowRight
                  size={16}
                  className="opacity-70 transition-transform group-hover:translate-x-1"
                />
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Latest Study Materials
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Your recently uploaded files
                </p>
              </div>
              <Link
                to="/my-materials"
                className="group flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
              >
                View All
                <FiArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spin size="large" />
              </div>
            ) : latestMaterialCards.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {latestMaterialCards.map((material) => (
                  <FileCard key={material.id} file={material} />
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                  <FiFolder size={24} className="text-emerald-500" />
                </div>
                <p className="mb-1 font-semibold text-slate-700">
                  No materials yet
                </p>
                <p className="mb-4 text-xs text-slate-400">
                  Start uploading your notes, PDFs and documents
                </p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-200 transition-all hover:shadow-md"
                >
                  <FiPlus size={15} />
                  Upload Now
                </Link>
              </div>
            )}
          </div>

          <div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-base font-bold text-slate-800">
                Recent Activity
              </h3>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spin size="default" />
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-1">
                  {recentActivity.map((activity) => {
                    const style = getActivityMeta(activity.type);
                    return (
                      <ActivityItem
                        key={activity.id}
                        icon={style.icon}
                        bg={style.bg}
                        color={style.color}
                        title={activity.title}
                        subtitle={`${activity.subtitle} - ${formatRelativeTime(activity.createdAt)}`}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="py-4 text-sm text-slate-500">
                  No recent activity yet.
                </p>
              )}

              {weakTopics.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="mb-2 text-xs font-bold text-slate-700">
                    Needs Attention
                  </p>
                  <div className="space-y-1.5">
                    {weakTopics.slice(0, 3).map((topic) => (
                      <div
                        key={topic.topic}
                        className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2"
                      >
                        <span className="truncate text-xs font-medium text-rose-700">
                          {topic.topic}
                        </span>
                        <span className="text-xs font-bold text-rose-600">
                          {topic.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="rounded-xl border border-amber-100 bg-linear-to-br from-amber-50 to-orange-50 p-3.5">
                  <p className="mb-1 text-xs font-bold text-amber-800">
                    Study Tip
                  </p>
                  <p className="text-xs leading-relaxed text-amber-700">
                    Review flashcards daily for 15 minutes to boost long-term
                    retention by up to 80%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const ActivityItem = ({
  icon,
  bg,
  color,
  title,
  subtitle,
}: {
  icon: ReactNode;
  bg: string;
  color: string;
  title: string;
  subtitle: string;
}) => (
  <div className="flex cursor-default items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-50">
    <div
      className={`h-9 w-9 shrink-0 rounded-xl ${bg} ${color} flex items-center justify-center`}
    >
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
    </div>
  </div>
);

export default Dashboard;
