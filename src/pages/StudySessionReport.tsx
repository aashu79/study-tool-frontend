import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/common/DashboardLayout";
import { Spin } from "antd";
import toast from "react-hot-toast";
import {
  FiActivity,
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowLeft,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiMail,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { useStudySessionReport } from "../lib/hooks/useStudySessionReport";
import type { SessionReport } from "../lib/api/study-session.service";

// Ã¢â€â‚¬Ã¢â€â‚¬ helpers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const formatDuration = (seconds: number) => {
  if (seconds <= 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s > 0 ? `${s}s` : ""}`.trim();
  return `${s}s`;
};

const formatDate = (value?: string) => {
  if (!value) return "Ã¢â‚¬â€";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const humaniseEventType = (type: string) =>
  type
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

// Ã¢â€â‚¬Ã¢â€â‚¬ sub-components Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const MiniStatCard = ({
  icon,
  label,
  value,
  sub,
  color = "emerald",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: "emerald" | "teal" | "amber" | "rose" | "sky";
}) => {
  const palette: Record<string, string> = {
    emerald: "bg-emerald-50 border-emerald-200",
    teal: "bg-teal-50 border-teal-200",
    amber: "bg-amber-50 border-amber-200",
    rose: "bg-rose-50 border-rose-200",
    sky: "bg-sky-50 border-sky-200",
  };
  const iconPalette: Record<string, string> = {
    emerald: "text-emerald-600",
    teal: "text-teal-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
    sky: "text-sky-600",
  };

  return (
    <div className={`rounded-2xl border p-4 ${palette[color]}`}>
      <div className={`flex items-center gap-2 mb-2 ${iconPalette[color]}`}>
        {icon}
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
          {label}
        </p>
      </div>
      <p className="text-2xl font-black text-slate-900 tracking-tight">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-slate-500 mt-0.5 font-medium">{sub}</p>
      )}
    </div>
  );
};

const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
      <span className="text-emerald-600">{icon}</span>
      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
        {title}
      </h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const FocusGauge = ({ score }: { score: number }) => {
  const clamped = Math.max(0, Math.min(100, score));
  const color =
    clamped >= 70 ? "#10b981" : clamped >= 40 ? "#f59e0b" : "#f43f5e";
  const bgColor =
    clamped >= 70
      ? "bg-emerald-50 border-emerald-200"
      : clamped >= 40
        ? "bg-amber-50 border-amber-200"
        : "bg-rose-50 border-rose-200";
  const textColor =
    clamped >= 70
      ? "text-emerald-700"
      : clamped >= 40
        ? "text-amber-700"
        : "text-rose-700";
  const label =
    clamped >= 70
      ? "Great Focus! Keep it up Ã°Å¸Å½Â¯"
      : clamped >= 40
        ? "Fair Ã¢â‚¬â€ room for improvement"
        : "Needs Improvement";

  return (
    <div className={`rounded-2xl border p-5 ${bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Focus Score
          </p>
          <p className={`text-3xl font-black mt-0.5 ${textColor}`}>
            {clamped}%
          </p>
        </div>
        <div
          className={`px-3 py-1.5 rounded-full bg-white/70 text-xs font-bold ${textColor}`}
        >
          {label}
        </div>
      </div>
      <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// Ã¢â€â‚¬Ã¢â€â‚¬ main page Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const StudySessionReport = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { reportQuery, sendEmailMutation } = useStudySessionReport(sessionId);

  const isLoading = reportQuery.isLoading;
  const error = reportQuery.error;
  const report = reportQuery.data as SessionReport | undefined;

  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "Failed to load report"
        : undefined;

  const handleSendEmail = async (force = false) => {
    try {
      const result = await sendEmailMutation.mutateAsync({ force });
      toast.success(result.message ?? "Report email sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send email");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 px-3 py-2 rounded-xl transition-all"
        >
          <FiArrowLeft size={15} />
          Back to Sessions
        </button>

        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 md:p-8 text-white shadow-lg shadow-emerald-200">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/15 rounded-full blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <FiActivity size={22} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight mb-1">
                  Session Report
                </h1>
                {report && (
                  <>
                    <p className="text-white/85 text-sm flex items-center gap-1.5 font-medium">
                      <FiFileText size={13} />
                      {report.session.file?.filename ?? "Unknown file"}
                    </p>
                    <p className="text-white/65 text-xs mt-1">
                      {formatDate(report.session.sessionStart)}
                      {report.session.sessionEnd &&
                        ` Ã¢â‚¬â€ ${formatDate(report.session.sessionEnd)}`}
                    </p>
                  </>
                )}
              </div>
            </div>

            {report && (
              <div className="shrink-0">
                {report.emailDelivery.sent ? (
                  <div className="flex flex-col items-end gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-semibold">
                      <FiCheckCircle size={12} />
                      Report emailed
                    </span>
                    <button
                      onClick={() => handleSendEmail(true)}
                      disabled={sendEmailMutation.isPending}
                      className="text-xs text-white/75 hover:text-white underline underline-offset-2 transition-colors disabled:opacity-50"
                    >
                      Resend
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSendEmail(false)}
                    disabled={sendEmailMutation.isPending}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/25 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    <FiMail size={14} />
                    {sendEmailMutation.isPending ? "SendingÃ¢â‚¬Â¦" : "Email Report"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Loading / Error */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        )}

        {errorMessage && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center py-16 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
              <FiAlertTriangle size={24} className="text-rose-400" />
            </div>
            <p className="font-bold text-slate-700">{errorMessage}</p>
            <button
              onClick={() => reportQuery.refetch()}
              className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200"
            >
              Retry
            </button>
          </div>
        )}

        {report && (
          <>
            {/* OVERVIEW STATS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStatCard
                icon={<FiClock size={15} />}
                label="Duration"
                value={formatDuration(
                  report.session.summary?.totalDurationSeconds ??
                    report.session.focusTimeSeconds +
                      report.session.idleTimeSeconds,
                )}
                color="emerald"
              />
              <MiniStatCard
                icon={<FiTarget size={15} />}
                label="Focus Score"
                value={`${report.session.summary?.focusScore ?? 0}%`}
                sub={`${report.session.summary?.distractionRatioPercentage ?? 0}% distraction`}
                color="teal"
              />
              <MiniStatCard
                icon={<FiAlertTriangle size={15} />}
                label="Distractions"
                value={String(
                  report.session.summary?.distractionCount ??
                    report.session.distractionCount,
                )}
                sub={formatDuration(
                  report.distractions.totalDurationSeconds || 0,
                )}
                color="amber"
              />
              <MiniStatCard
                icon={<FiBarChart2 size={15} />}
                label="Quiz Attempts"
                value={String(report.quiz.totalAttempts)}
                sub={
                  report.quiz.totalAttempts > 0
                    ? `Avg ${report.quiz.averageScore.toFixed(1)}%`
                    : "None yet"
                }
                color="sky"
              />
            </div>

            {/* FOCUS GAUGE */}
            <FocusGauge score={report.session.summary?.focusScore ?? 0} />

            {/* ACTIVITY + DISTRACTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SectionCard
                title="Activity Breakdown"
                icon={<FiZap size={15} />}
              >
                {Object.keys(report.activity.countByType || {}).length === 0 ? (
                  <p className="text-sm text-slate-400 font-medium">
                    No activity recorded
                  </p>
                ) : (
                  <dl className="space-y-2.5">
                    {Object.entries(report.activity.countByType || {}).map(
                      ([type, count]) => (
                        <div
                          key={type}
                          className="flex items-center justify-between group"
                        >
                          <dt className="text-sm text-slate-600">
                            {humaniseEventType(type)}
                          </dt>
                          <dd className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5">
                            {count}
                          </dd>
                        </div>
                      ),
                    )}
                  </dl>
                )}
              </SectionCard>

              <SectionCard
                title="Distraction Breakdown"
                icon={<FiAlertCircle size={15} />}
              >
                {Object.keys(report.distractions.countByType || {}).length ===
                0 ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold">
                    <FiCheckCircle size={16} className="text-emerald-500" />
                    No distractions recorded
                  </div>
                ) : (
                  <dl className="space-y-2.5">
                    {Object.entries(report.distractions.countByType || {}).map(
                      ([type, count]) => (
                        <div
                          key={type}
                          className="flex items-center justify-between"
                        >
                          <dt className="text-sm text-slate-600">
                            {humaniseEventType(type)}
                          </dt>
                          <dd className="text-sm font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-full px-2.5 py-0.5">
                            {count}
                          </dd>
                        </div>
                      ),
                    )}
                    <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between">
                      <dt className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Total distraction time
                      </dt>
                      <dd className="text-sm font-black text-rose-700">
                        {formatDuration(
                          report.distractions.totalDurationSeconds || 0,
                        )}
                      </dd>
                    </div>
                  </dl>
                )}
              </SectionCard>
            </div>

            {/* QUIZ PERFORMANCE */}
            {report.quiz.totalAttempts > 0 && (
              <SectionCard
                title="Quiz Performance"
                icon={<FiTrendingUp size={15} />}
              >
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    {
                      label: "Best Score",
                      value: `${report.quiz.bestScore.toFixed(1)}%`,
                      color: "from-emerald-50 to-teal-50",
                      border: "border-emerald-200",
                      text: "text-emerald-700",
                    },
                    {
                      label: "Avg Score",
                      value: `${report.quiz.averageScore.toFixed(1)}%`,
                      color: "from-teal-50 to-cyan-50",
                      border: "border-teal-200",
                      text: "text-teal-700",
                    },
                    {
                      label: "Attempts",
                      value: String(report.quiz.totalAttempts),
                      color: "from-sky-50 to-blue-50",
                      border: "border-sky-200",
                      text: "text-sky-700",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className={`text-center p-4 bg-linear-to-br ${s.color} rounded-2xl border ${s.border}`}
                    >
                      <p className={`text-2xl font-black ${s.text}`}>
                        {s.value}
                      </p>
                      <p
                        className={`text-xs font-semibold mt-1 ${s.text} opacity-70`}
                      >
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {report.quiz.attempts.map((attempt, i) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl text-sm border border-slate-100"
                    >
                      <span className="text-slate-700 font-medium">
                        {attempt.quiz?.title ?? `Attempt ${i + 1}`}
                        {attempt.quiz?.difficulty && (
                          <span className="ml-2 text-xs text-slate-400">
                            ({attempt.quiz.difficulty})
                          </span>
                        )}
                      </span>
                      <span
                        className={`font-black text-sm ${attempt.percentage >= 70 ? "text-emerald-700" : attempt.percentage >= 50 ? "text-amber-700" : "text-rose-700"}`}
                      >
                        {attempt.correctAnswers}/{attempt.totalQuestions} (
                        {attempt.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* RECOMMENDATIONS */}
            {(report.improvement.recommendations.length > 0 ||
              report.improvement.nextSessionChecklist.length > 0) && (
              <SectionCard
                title="Recommendations & Next Steps"
                icon={<FiCheckCircle size={15} />}
              >
                {report.improvement.overallRating && (
                  <div className="mb-5 inline-flex items-center gap-2 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm font-bold text-emerald-700">
                    <FiTarget size={14} />
                    Overall Rating: {report.improvement.overallRating}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {report.improvement.recommendations.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                        Recommendations
                      </p>
                      <ul className="space-y-2.5">
                        {report.improvement.recommendations.map((r, i) => (
                          <li
                            key={i}
                            className="flex gap-2.5 text-sm text-slate-700"
                          >
                            <FiCheckCircle
                              size={15}
                              className="text-emerald-500 shrink-0 mt-0.5"
                            />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.improvement.nextSessionChecklist.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                        Next Session Checklist
                      </p>
                      <ul className="space-y-2.5">
                        {report.improvement.nextSessionChecklist.map(
                          (item, i) => (
                            <li
                              key={i}
                              className="flex gap-2.5 text-sm text-slate-700"
                            >
                              <FiCheckCircle
                                size={15}
                                className="text-teal-500 shrink-0 mt-0.5"
                              />
                              {item}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* EMAIL SECTION */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <FiMail size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    Email This Report
                  </p>
                  {report.emailDelivery.sent ? (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sent to{" "}
                      <span className="font-semibold text-slate-700">
                        {report.emailDelivery.emailAddress ?? "your email"}
                      </span>{" "}
                      on {formatDate(report.emailDelivery.sentAt)}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Send a copy to your email for future reference.
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleSendEmail(report.emailDelivery.sent)}
                disabled={sendEmailMutation.isPending}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-bold transition-all hover:shadow-md shadow-sm shadow-emerald-200 disabled:opacity-50"
              >
                <FiMail size={14} />
                {sendEmailMutation.isPending
                  ? "SendingÃ¢â‚¬Â¦"
                  : report.emailDelivery.sent
                    ? "Resend Email"
                    : "Send Email"}
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudySessionReport;
