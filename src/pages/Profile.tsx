import DashboardLayout from "../components/common/DashboardLayout";
import { Avatar, Spin } from "antd";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiBookOpen,
  FiClock,
  FiShield,
  FiEdit2,
} from "react-icons/fi";
import { IoSchool } from "react-icons/io5";
import { useAuthStore } from "../lib/store/auth.store";
import { useCurrentUser } from "../lib/hooks/useAuth";
import { useProfilePicture } from "../lib/hooks/useFile";

const Profile = () => {
  const { user } = useAuthStore();
  const { isLoading } = useCurrentUser();
  const { data: profilePicData } = useProfilePicture();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const profileFields = [
    {
      icon: FiUser,
      label: "Full Name",
      value: user?.full_name,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: FiMail,
      label: "Email Address",
      value: user?.email,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      icon: FiBookOpen,
      label: "Education Level",
      value: user?.educationLevel,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      icon: FiCalendar,
      label: "Member Since",
      value: user?.created_at ? formatDate(user.created_at) : "N/A",
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      icon: FiClock,
      label: "Last Login",
      value: user?.last_login ? formatDate(user.last_login) : "N/A",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      icon: FiShield,
      label: "Account Status",
      value: user?.is_verified ? "Verified" : "Unverified",
      color: user?.is_verified ? "text-emerald-600" : "text-rose-600",
      bg: user?.is_verified ? "bg-emerald-50" : "bg-rose-50",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* PROFILE HERO */}
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

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar
                size={100}
                src={profilePicData?.url}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
                  border: "3px solid rgba(255,255,255,0.5)",
                  fontSize: 32,
                  fontWeight: 800,
                }}
              >
                {!profilePicData?.url && user?.full_name
                  ? getInitials(user.full_name)
                  : "U"}
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                <IoSchool size={16} className="text-emerald-600" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-black mb-1 tracking-tight">
                {user?.full_name || "User"}
              </h1>
              <p className="text-white/80 text-sm font-medium mb-3">
                {user?.email}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <FiBookOpen size={12} />
                  {user?.educationLevel || "Student"}
                </span>
                {user?.is_verified && (
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    <FiShield size={12} />
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Edit button */}
            <button className="shrink-0 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
              <FiEdit2 size={14} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* PROFILE DETAILS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <FiUser size={15} className="text-emerald-600" />
            </div>
            <h2 className="font-bold text-slate-800">Account Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileFields.map((field) => {
              const Icon = field.icon;
              return (
                <div
                  key={field.label}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${field.bg} flex items-center justify-center shrink-0`}
                  >
                    <Icon size={17} className={field.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">
                      {field.label}
                    </p>
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {field.value || "-"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STUDY STATS PLACEHOLDER */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <FiBookOpen size={15} className="text-teal-600" />
            </div>
            <h2 className="font-bold text-slate-800">Study Statistics</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Total Sessions",
                value: "-",
                color: "from-emerald-50 to-teal-50",
                border: "border-emerald-100",
              },
              {
                label: "Materials Uploaded",
                value: "-",
                color: "from-violet-50 to-purple-50",
                border: "border-violet-100",
              },
              {
                label: "Quizzes Taken",
                value: "-",
                color: "from-amber-50 to-orange-50",
                border: "border-amber-100",
              },
              {
                label: "Study Streak",
                value: "-",
                color: "from-sky-50 to-cyan-50",
                border: "border-sky-100",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-xl bg-linear-to-br ${stat.color} border ${stat.border} p-4 text-center`}
              >
                <p className="text-2xl font-black text-slate-700">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
