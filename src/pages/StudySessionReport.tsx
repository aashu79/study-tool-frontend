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

// ── helpers ───────────────────────────────────────────────────────────────────

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
  if (!value) return "—";
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

// ── sub-components ────────────────────────────────────────────────────────────

const StatCard = ({
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
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-600",
    teal: "bg-teal-50 border-teal-200 text-teal-600",
    amber: "bg-amber-50 border-amber-200 text-amber-600",
    rose: "bg-rose-50 border-rose-200 text-rose-600",
    sky: "bg-sky-50 border-sky-200 text-sky-600",
  };

  return (
    <div className={`rounded-xl border p-4 ${palette[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
          {label}
        </p>
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      {sub && <p className="text-xs mt-0.5 opacity-70">{sub}</p>}
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
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
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
    clamped >= 70
      ? "bg-emerald-500"
      : clamped >= 40
        ? "bg-amber-500"
        : "bg-rose-500";
  const label =
    clamped >= 70 ? "Good" : clamped >= 40 ? "Fair" : "Needs Improvement";
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-slate-500 font-medium">Focus Score</span>
        <span className="text-sm font-bold text-slate-800">
          {clamped}% — {label}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

// ── main page ─────────────────────────────────────────────────────────────────

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
      const msg = err instanceof Error ? err.message : "Failed to send email";
      toast.error(msg);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <FiArrowLeft size={16} />
            Back
          </button>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-emerald-900 to-teal-900 p-6 md:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-400/20 rounded-full blur-[140px]" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/15 backdrop-blur-sm rounded-xl">
                <FiActivity className="text-3xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black mb-1">
                  Session Report
                </h1>
                {report && (
                  <>
                    <p className="text-emerald-200 text-sm flex items-center gap-1.5">
                      <FiFileText size={13} />
                      {report.session.file?.filename ?? "Unknown file"}
                    </p>
                    <p className="text-emerald-300 text-xs mt-1">
                      {formatDate(report.session.sessionStart)}
                      {report.session.sessionEnd &&
                        ` – ${formatDate(report.session.sessionEnd)}`}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Send email */}
            {report && (
              <div className="shrink-0">
                {report.emailDelivery.sent ? (
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5 text-xs font-medium">
                      <FiMail size={12} />
                      Report emailed
                    </span>
                    <button
                      onClick={() => handleSendEmail(true)}
                      disabled={sendEmailMutation.isPending}
                      className="text-xs text-emerald-300 hover:text-white underline underline-offset-2 transition-colors disabled:opacity-50"
                    >
                      Resend
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSendEmail(false)}
                    disabled={sendEmailMutation.isPending}
                    className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <FiMail size={14} />
                    {sendEmailMutation.isPending ? "Sending…" : "Email Report"}
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
          <div className="flex flex-col items-center py-16 gap-3">
            <FiAlertTriangle size={32} className="text-rose-400" />
            <p className="text-slate-600">{errorMessage}</p>
            <button
              onClick={() => reportQuery.refetch()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {report && (
          <>
            {/* Overview stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={<FiClock size={16} />}
                label="Duration"
                value={formatDuration(
                  report.session.summary?.totalDurationSeconds ??
                    report.session.focusTimeSeconds +
                      report.session.idleTimeSeconds,
                )}
                color="emerald"
              />
              <StatCard
                icon={<FiTarget size={16} />}
                label="Focus Score"
                value={`${report.session.summary?.focusScore ?? 0}%`}
                sub={`${report.session.summary?.distractionRatioPercentage ?? 0}% distraction`}
                color="teal"
              />
              <StatCard
                icon={<FiAlertTriangle size={16} />}
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
              <StatCard
                icon={<FiBarChart2 size={16} />}
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

            {/* Focus bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <FocusGauge score={report.session.summary?.focusScore ?? 0} />
            </div>

            {/* Activity + Distractions side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Activity */}
              <SectionCard
                title="Activity Breakdown"
                icon={<FiZap size={16} />}
              >
                {Object.keys(report.activity.countByType || {}).length === 0 ? (
                  <p className="text-sm text-slate-500">No activity recorded</p>
                ) : (
                  <dl className="space-y-2">
                    {Object.entries(report.activity.countByType || {}).map(
                      ([type, count]) => (
                        <div
                          key={type}
                          className="flex items-center justify-between"
                        >
                          <dt className="text-sm text-slate-600">
                            {humaniseEventType(type)}
                          </dt>
                          <dd className="text-sm font-semibold text-slate-900 bg-slate-100 rounded-full px-2.5 py-0.5">
                            {count}
                          </dd>
                        </div>
                      ),
                    )}
                  </dl>
                )}
              </SectionCard>

              {/* Distractions */}
              <SectionCard
                title="Distraction Breakdown"
                icon={<FiAlertCircle size={16} />}
              >
                {Object.keys(report.distractions.countByType || {}).length ===
                0 ? (
                  <p className="text-sm text-slate-500">
                    No distractions recorded
                  </p>
                ) : (
                  <dl className="space-y-2">
                    {Object.entries(report.distractions.countByType || {}).map(
                      ([type, count]) => (
                        <div
                          key={type}
                          className="flex items-center justify-between"
                        >
                          <dt className="text-sm text-slate-600">
                            {humaniseEventType(type)}
                          </dt>
                          <dd className="text-sm font-semibold text-rose-700 bg-rose-50 rounded-full px-2.5 py-0.5">
                            {count}
                          </dd>
                        </div>
                      ),
                    )}
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                      <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Total distraction time
                      </dt>
                      <dd className="text-sm font-bold text-rose-700">
                        {formatDuration(
                          report.distractions.totalDurationSeconds || 0,
                        )}
                      </dd>
                    </div>
                  </dl>
                )}
              </SectionCard>
            </div>

            {/* Quiz performance */}
            {report.quiz.totalAttempts > 0 && (
              <SectionCard
                title="Quiz Performance"
                icon={<FiTrendingUp size={16} />}
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-xl font-black text-emerald-700">
                        {report.quiz.bestScore.toFixed(1)}%
                      </p>
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">
                        Best Score
                      </p>
                    </div>
                    <div className="text-center p-3 bg-teal-50 rounded-xl border border-teal-100">
                      <p className="text-xl font-black text-teal-700">
                        {report.quiz.averageScore.toFixed(1)}%
                      </p>
                      <p className="text-xs text-teal-600 font-medium mt-0.5">
                        Avg Score
                      </p>
                    </div>
                    <div className="text-center p-3 bg-sky-50 rounded-xl border border-sky-100">
                      <p className="text-xl font-black text-sky-700">
                        {report.quiz.totalAttempts}
                      </p>
                      <p className="text-xs text-sky-600 font-medium mt-0.5">
                        Attempts
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {report.quiz.attempts.map((attempt, i) => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm"
                      >
                        <span className="text-slate-600">
                          {attempt.quiz?.title ?? `Attempt ${i + 1}`}{" "}
                          <span className="text-xs text-slate-400">
                            ({attempt.quiz?.difficulty ?? ""})
                          </span>
                        </span>
                        <span
                          className={`font-bold ${attempt.percentage >= 70 ? "text-emerald-700" : attempt.percentage >= 50 ? "text-amber-700" : "text-rose-700"}`}
                        >
                          {attempt.correctAnswers}/{attempt.totalQuestions} (
                          {attempt.percentage.toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Improvement / Recommendations */}
            {(report.improvement.recommendations.length > 0 ||
              report.improvement.nextSessionChecklist.length > 0) && (
              <SectionCard
                title="Recommendations & Next Steps"
                icon={<FiCheckCircle size={16} />}
              >
                {report.improvement.overallRating && (
                  <div className="mb-4 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    <FiTarget size={14} />
                    Overall: {report.improvement.overallRating}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {report.improvement.recommendations.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                        Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {report.improvement.recommendations.map((r, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-sm text-slate-700"
                          >
                            <span className="text-emerald-500 shrink-0 mt-0.5">
                              <FiCheckCircle size={14} />
                            </span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.improvement.nextSessionChecklist.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                        Next Session Checklist
                      </h3>
                      <ul className="space-y-2">
                        {report.improvement.nextSessionChecklist.map(
                          (item, i) => (
                            <li
                              key={i}
                              className="flex gap-2 text-sm text-slate-700"
                            >
                              <span className="text-teal-500 shrink-0 mt-0.5">
                                <FiCheckCircle size={14} />
                              </span>
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

            {/* Email delivery status */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <FiMail size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Report Email
                  </p>
                  {report.emailDelivery.sent ? (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sent to{" "}
                      <span className="font-medium text-slate-700">
                        {report.emailDelivery.emailAddress ?? "your email"}
                      </span>{" "}
                      on {formatDate(report.emailDelivery.sentAt)}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Not sent yet. Send a copy to your email.
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleSendEmail(report.emailDelivery.sent)}
                disabled={sendEmailMutation.isPending}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <FiMail size={14} />
                {sendEmailMutation.isPending
                  ? "Sending…"
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
