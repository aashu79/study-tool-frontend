import { Layout, Input, Badge, Avatar, Dropdown, Popover, Button } from "antd";
import {
  FiSearch,
  FiBell,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import type { MenuProps } from "antd";
import { useAuthStore } from "../../lib/store/auth.store";
import { useLogout } from "../../lib/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useProfilePicture } from "../../lib/hooks/useFile";

const { Header } = Layout;

interface TopNavbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onMobileMenuOpen: () => void;
  isMobile: boolean;
}

const TopNavbar = ({
  collapsed,
  onToggleSidebar,
  onMobileMenuOpen,
  isMobile,
}: TopNavbarProps) => {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const { data: profilePicData } = useProfilePicture();

  const notifications = [
    {
      id: 1,
      title: "New quiz available",
      description: "Your Calculus quiz is ready",
      time: "5 min ago",
    },
    {
      id: 2,
      title: "Study streak milestone!",
      description: "You've reached a 5-day streak ",
      time: "2 hours ago",
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      onClick: handleLogout,
      danger: true,
    },
  ];

  const notificationContent = (
    <div className="w-80">
      <div className="flex items-center justify-between mb-3 pb-3 border-b">
        <h4 className="font-semibold text-slate-800">Notifications</h4>
        <Button type="link" size="small" className="text-slate-600">
          Mark all as read
        </Button>
      </div>
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
          >
            <div className="font-medium text-slate-800 text-sm">
              {notif.title}
            </div>
            <div className="text-slate-600 text-xs mt-1">
              {notif.description}
            </div>
            <div className="text-slate-400 text-xs mt-1">{notif.time}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t text-center">
        <Button type="link" size="small">
          View all notifications
        </Button>
      </div>
    </div>
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.full_name || "User";
  const displayEmail = user?.email || "";

  return (
    <Header className="!bg-white border-b border-slate-200 !px-4 md:!px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Left: Toggle Button */}
      <div className="flex items-center gap-3">
        {isMobile ? (
          <Button
            type="text"
            icon={<FiMenu size={20} />}
            onClick={onMobileMenuOpen}
            className="text-slate-600"
          />
        ) : (
          <Button
            type="text"
            icon={
              collapsed ? (
                <FiChevronRight size={20} />
              ) : (
                <FiChevronLeft size={20} />
              )
            }
            onClick={onToggleSidebar}
            className="text-slate-600"
          />
        )}

        {/* Search Bar - Desktop Only */}
        {!isMobile && (
          <Input
            placeholder="Search assignments…"
            prefix={<FiSearch className="text-slate-400" />}
            className="w-64"
            disabled
          />
        )}
      </div>

      {/* Right: Notifications + User Menu */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Notifications */}
        <Popover
          content={notificationContent}
          trigger="click"
          placement="bottomRight"
        >
          <Badge count={2} size="small">
            <Button
              type="text"
              icon={<FiBell size={20} />}
              className="text-slate-600"
            />
          </Badge>
        </Popover>

        {/* User Dropdown */}
        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded-lg px-2 py-1 transition-colors">
            <Avatar
              size="default"
              className="bg-primary-600"
              src={profilePicData?.url}
            >
              {getInitials(displayName)}
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-slate-800">
                {displayName}
              </div>
              <div className="text-xs text-slate-500">{displayEmail}</div>
            </div>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default TopNavbar;
