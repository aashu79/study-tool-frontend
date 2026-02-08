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
} from "react-icons/fi";
import { IoFlame } from "react-icons/io5";
import { useFiles } from "../lib/hooks/useFile";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const user = { name: "Alex", email: "alex@example.com" };
  const { data: filesData, isLoading: filesLoading } = useFiles({
    sortOrder: "desc",
    limit: 5,
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
      iconColor: "#4f46e5",
      iconBgColor: "#e0e7ff",
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
      iconColor: "#8b5cf6",
      iconBgColor: "#ede9fe",
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
      trend: { value: "Keep it up! 🎯", isPositive: true },
      iconColor: "#f97316",
      iconBgColor: "#ffedd5",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-xl">
          {/* subtle grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

          {/* blur blobs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-300/30 rounded-full blur-[140px]" />

          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-black mb-2">
              {getGreeting()}, {user.name}!
            </h1>

            <p className="text-white/90 mb-6 text-sm md:text-base font-medium">
              You're on a 5-day study streak 🎯
            </p>

            {/* Weekly Goal */}
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 md:p-5 max-w-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm md:text-base">
                  Weekly Goal
                </span>
                <span className="text-white/90 text-sm md:text-base">
                  12/20 assignments
                </span>
              </div>

              <Progress
                percent={60}
                strokeColor="#22c55e"
                trailColor="rgba(255,255,255,0.25)"
                showInfo={false}
              />
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LATEST STUDY MATERIALS - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Latest Study Materials
                </h3>
                <p className="text-sm text-slate-500">
                  Your recently uploaded files
                </p>
              </div>
              <Link
                to="/my-materials"
                className="flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors group"
              >
                View All
                <FiArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>

            {filesLoading ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="large" />
              </div>
            ) : filesData?.files && filesData.files.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filesData.files.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            ) : (
              <Empty
                description={
                  <div className="text-center py-8">
                    <p className="text-slate-600 font-medium mb-2">
                      No study materials yet
                    </p>
                    <p className="text-sm text-slate-500 mb-4">
                      Start uploading your notes, PDFs, and documents to begin
                      studying smarter
                    </p>
                    <Link
                      to="/upload"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
                    >
                      <FiFolder size={18} />
                      Upload Materials
                    </Link>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>

          {/* RECENT ACTIVITY - Takes 1 column */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Recent Activity
            </h3>

            <div className="space-y-3">
              <ActivityItem
                icon={<FiTarget size={20} />}
                bg="bg-emerald-100"
                color="text-emerald-600"
                title="Completed Calculus Quiz"
                subtitle="Score: 85% • 2h ago"
              />

              <ActivityItem
                icon={<FiFolder size={20} />}
                bg="bg-blue-100"
                color="text-blue-600"
                title="Uploaded new notes"
                subtitle="Organic Chemistry • 1d ago"
              />

              <ActivityItem
                icon={<FiLayers size={20} />}
                bg="bg-amber-100"
                color="text-amber-600"
                title="Reviewed flashcards"
                subtitle="Biology (25 cards) • 2d ago"
              />
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
  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
    <div
      className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0 ${color}`}
    >
      {icon}
    </div>
    <div className="flex-1">
      <p className="font-medium text-slate-800 text-sm">{title}</p>
      <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
    </div>
  </div>
);

export default Dashboard;
