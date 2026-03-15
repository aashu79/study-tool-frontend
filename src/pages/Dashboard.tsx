import DashboardLayout from "../components/common/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import FileCard from "../components/dashboard/FileCard";
import { Progress, Spin, Empty } from "antd";
import {
  FiFolder,
  FiLayers,
  FiTarget,
  FiClock,
  FiAlertCircle,
  FiArrowRight,
  FiUpload,
  FiActivity,
  FiPlus,
} from "react-icons/fi";
import { IoFlame } from "react-icons/io5";
import { useFiles } from "../lib/hooks/useFile";
import { Link } from "react-router-dom";
import { useAuthStore } from "../lib/store/auth.store";

const Dashboard = () => {
  const { user } = useAuthStore();
  const displayName = user?.full_name?.split(" ")[0] || "Student";

  const { data: filesData, isLoading: filesLoading } = useFiles({
    sortOrder: "desc",
    limit: 4,
    page: 1,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const stats = [
    {
      icon: FiFolder,
      title: "Total Uploads",
      value: "14",
      trend: { value: "+2 this week", isPositive: true },
      iconColor: "#8b5cf6",
      iconBgColor: "#ede9fe",
    },
    {
      icon: FiLayers,
      title: "Active Flashcards",
      value: "87",
      trend: { value: "+12 this week", isPositive: true },
      iconColor: "#10b981",
      iconBgColor: "#d1fae5",
    },
    {
      icon: FiTarget,
      title: "Quizzes Taken",
      value: "23",
      trend: { value: "+5 this week", isPositive: true },
      iconColor: "#f59e0b",
      iconBgColor: "#fef3c7",
    },
    {
      icon: FiClock,
      title: "Avg. Focus Time",
      value: "24 min",
      trend: { value: "+3 min", isPositive: true },
      iconColor: "#0ea5e9",
      iconBgColor: "#e0f2fe",
    },
    {
      icon: FiAlertCircle,
      title: "Weak Topics",
      value: "2",
      iconColor: "#ef4444",
      iconBgColor: "#fee2e2",
    },
    {
      icon: IoFlame,
      title: "Study Streak",
      value: "5 days",
      trend: { value: "Keep it up! ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¯", isPositive: true },
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
        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 md:p-8 text-white shadow-lg shadow-emerald-200">
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Blobs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-cyan-300/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold mb-3">
                <IoFlame size={13} className="text-yellow-300" />
                5-day streak going strong!
              </div>
              <h1 className="text-2xl md:text-3xl font-black mb-1.5 tracking-tight">
                {getGreeting()}, {displayName}! ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ¢â‚¬Â¹
              </h1>
              <p className="text-white/85 text-sm md:text-base font-medium">
                You have <span className="font-bold text-white">3 pending materials</span> to review today.
              </p>
            </div>

            {/* Weekly goal */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 min-w-[240px]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-bold text-sm">Weekly Goal</span>
                <span className="text-white/80 text-sm font-semibold">12 / 20</span>
              </div>
              <Progress
                percent={60}
                strokeColor="#22c55e"
                trailColor="rgba(255,255,255,0.2)"
                showInfo={false}
                strokeWidth={8}
              />
              <p className="text-white/70 text-xs mt-2 font-medium">8 assignments left this week</p>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className={`group flex items-center gap-4 p-4 rounded-2xl bg-linear-to-r ${action.color} text-white shadow-md ${action.shadow} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{action.label}</p>
                  <p className="text-white/75 text-xs">{action.desc}</p>
                </div>
                <FiArrowRight size={16} className="opacity-70 group-hover:translate-x-1 transition-transform" />
              </Link>
            );
          })}
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Latest Materials */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-800">Latest Study Materials</h3>
                <p className="text-xs text-slate-400 mt-0.5">Your recently uploaded files</p>
              </div>
              <Link
                to="/my-materials"
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors group bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl"
              >
                View All
                <FiArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {filesLoading ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="large" />
              </div>
            ) : filesData?.files && filesData.files.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filesData.files.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <FiFolder size={24} className="text-emerald-500" />
                </div>
                <p className="font-semibold text-slate-700 mb-1">No materials yet</p>
                <p className="text-xs text-slate-400 mb-4">Start uploading your notes, PDFs and documents</p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm rounded-xl shadow-sm shadow-emerald-200 hover:shadow-md transition-all"
                >
                  <FiPlus size={15} />
                  Upload Now
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-base font-bold text-slate-800 mb-4">Recent Activity</h3>
            <div className="space-y-1">
              <ActivityItem
                icon={<FiTarget size={16} />}
                bg="bg-emerald-100"
                color="text-emerald-600"
                title="Completed Calculus Quiz"
                subtitle="Score: 85% Ãƒâ€šÃ‚Â· 2h ago"
              />
              <ActivityItem
                icon={<FiFolder size={16} />}
                bg="bg-blue-100"
                color="text-blue-600"
                title="Uploaded new notes"
                subtitle="Organic Chemistry Ãƒâ€šÃ‚Â· 1d ago"
              />
              <ActivityItem
                icon={<FiLayers size={16} />}
                bg="bg-amber-100"
                color="text-amber-600"
                title="Reviewed flashcards"
                subtitle="Biology (25 cards) Ãƒâ€šÃ‚Â· 2d ago"
              />
              <ActivityItem
                icon={<FiActivity size={16} />}
                bg="bg-purple-100"
                color="text-purple-600"
                title="Study session ended"
                subtitle="Focus score: 92% Ãƒâ€šÃ‚Â· 3d ago"
              />
            </div>

            {/* Study tip */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="rounded-xl bg-linear-to-br from-amber-50 to-orange-50 border border-amber-100 p-3.5">
                <p className="text-xs font-bold text-amber-800 mb-1">ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¡ Study Tip</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Review flashcards daily for 15 minutes to boost long-term retention by up to 80%.
                </p>
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
  icon: React.ReactNode;
  bg: string;
  color: string;
  title: string;
  subtitle: string;
}) => (
  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
    <div
      className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0 ${color}`}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-slate-800 text-sm truncate">{title}</p>
      <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>
    </div>
  </div>
);

export default Dashboard;
