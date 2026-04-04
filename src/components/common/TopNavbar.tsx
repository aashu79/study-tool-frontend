import { Badge, Avatar, Dropdown, Popover } from "antd";
import {
  FiBell,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiSettings,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import type { MenuProps } from "antd";
import { useAuthStore } from "../../lib/store/auth.store";
import { useLogout } from "../../lib/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfilePicture } from "../../lib/hooks/useFile";
import { Layout } from "antd";

const { Header } = Layout;

interface TopNavbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onMobileMenuOpen: () => void;
  isMobile: boolean;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/my-materials": "My Study Materials",
  "/upload": "Upload Materials",
  "/study-sessions": "Study Sessions",
  "/profile": "Profile",
};

const getPageTitle = (pathname: string) => {
  for (const [key, title] of Object.entries(pageTitles)) {
    if (
      pathname === key ||
      (key !== "/dashboard" && pathname.startsWith(key))
    ) {
      return title;
    }
  }
  return "Dashboard";
};

const TopNavbar = ({
  collapsed,
  onToggleSidebar,
  onMobileMenuOpen,
  isMobile,
}: TopNavbarProps) => {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profilePicData } = useProfilePicture();

  const pageTitle = getPageTitle(location.pathname);

  const notifications = [
    {
      id: 1,
      title: "New quiz available",
      description: "Your Calculus quiz is ready",
      time: "5 min ago",
      dot: "bg-emerald-500",
    },
    {
      id: 2,
      title: "Study streak milestone!",
      description: "You've reached a 5-day streak",
      time: "2 hours ago",
      dot: "bg-teal-500",
    },
  ];

  const handleLogout = () => logoutMutation.mutate();

  const userMenuItems: MenuProps["items"] = [
    {
      key: "header",
      label: (
        <div className="px-1 py-2 border-b border-slate-100 mb-1 cursor-default">
          <p className="font-semibold text-slate-800 text-sm">
            {user?.full_name || "User"}
          </p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
      ),
      disabled: true,
    },
    {
      key: "profile",
      icon: <FiUser size={14} />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      icon: <FiSettings size={14} />,
      label: "Settings",
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <FiLogOut size={14} />,
      label: "Sign Out",
      onClick: handleLogout,
      danger: true,
    },
  ];

  const notificationContent = (
    <div className="w-80">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <h4 className="font-bold text-slate-800">Notifications</h4>
        <span className="text-xs text-emerald-600 font-semibold cursor-pointer hover:text-emerald-700">
          Mark all read
        </span>
      </div>
      <div className="space-y-1">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
          >
            <span
              className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.dot}`}
            />
            <div className="flex-1">
              <p className="font-semibold text-slate-800 text-sm">
                {notif.title}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                {notif.description}
              </p>
              <p className="text-slate-400 text-[11px] mt-1">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-slate-100 text-center">
        <span className="text-xs text-emerald-600 font-semibold cursor-pointer hover:text-emerald-700">
          View all notifications
        </span>
      </div>
    </div>
  );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const displayName = user?.full_name || "User";

  return (
    <Header
      style={{
        background: "white",
        borderBottom: "1px solid #f1f5f9",
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {isMobile ? (
          <button
            onClick={onMobileMenuOpen}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <FiMenu size={20} />
          </button>
        ) : (
          <button
            onClick={onToggleSidebar}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            {collapsed ? (
              <FiChevronRight size={18} />
            ) : (
              <FiChevronLeft size={18} />
            )}
          </button>
        )}

        <div className="hidden md:flex items-center gap-2">
          <h1 className="text-base font-bold text-slate-800">{pageTitle}</h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Search button - desktop */}
        {!isMobile && (
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors">
            <FiSearch size={15} />
            <span className="text-xs">Search...</span>
          </button>
        )}

        {/* Notifications */}
        <Popover
          content={notificationContent}
          trigger="click"
          placement="bottomRight"
          overlayInnerStyle={{ borderRadius: 16, padding: 16 }}
        >
          <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
            <FiBell size={18} />
            <Badge count={2} size="small" className="absolute top-1 right-1" />
          </button>
        </Popover>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block" />

        {/* User */}
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <button className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-50 transition-colors">
            <Avatar
              size={34}
              className="shrink-0"
              src={profilePicData?.url}
              style={{
                background: "linear-gradient(135deg, #10b981, #0d9488)",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {!profilePicData?.url ? getInitials(displayName) : undefined}
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                {displayName.split(" ")[0]}
              </p>
              <p className="text-[11px] text-slate-400 leading-tight">
                Student
              </p>
            </div>
          </button>
        </Dropdown>
      </div>
    </Header>
  );
};

export default TopNavbar;
