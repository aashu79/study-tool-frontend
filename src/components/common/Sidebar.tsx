import { Link, useLocation } from "react-router-dom";
import { Layout, Drawer, Tooltip } from "antd";
import {
  FiActivity,
  FiBarChart2,
  FiUpload,
  FiUser,
  FiX,
  FiFolder,
} from "react-icons/fi";
import { IoSchool } from "react-icons/io5";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  {
    path: "/dashboard",
    icon: FiBarChart2,
    label: "Dashboard",
    exact: true,
  },
  {
    path: "/my-materials",
    icon: FiFolder,
    label: "My Materials",
  },
  {
    path: "/upload",
    icon: FiUpload,
    label: "Upload",
  },
  {
    path: "/study-sessions",
    icon: FiActivity,
    label: "Study Sessions",
  },
  {
    path: "/profile",
    icon: FiUser,
    label: "Profile",
  },
];

const Sidebar = ({
  collapsed,
  onCollapse,
  isMobile,
  mobileOpen,
  onMobileClose,
}: SidebarProps) => {
  const location = useLocation();

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return location.pathname === item.path;
    return (
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + "/")
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Brand */}
      <div
        className={`h-16 flex items-center shrink-0 border-b border-slate-100 ${collapsed ? "justify-center px-0" : "px-5"}`}
      >
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 group"
          onClick={isMobile ? onMobileClose : undefined}
        >
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200 shrink-0 group-hover:scale-105 transition-transform">
            <IoSchool className="text-white" size={18} />
          </div>
          {!collapsed && (
            <div>
              <span className="text-[17px] font-black text-slate-800 leading-none block">
                Study<span className="text-emerald-500">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-none">
                Smart Learning
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-0.5">
        {!collapsed && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">
            Menu
          </p>
        )}

        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          const navLink = (
            <Link
              to={item.path}
              onClick={isMobile ? onMobileClose : undefined}
              className={`flex items-center gap-3 rounded-xl transition-all duration-150 group ${
                collapsed ? "justify-center px-0 py-3 mx-0" : "px-3 py-2.5"
              } ${
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {/* Active indicator */}
              {!collapsed && active && (
                <span className="absolute left-0 w-1 h-7 bg-emerald-500 rounded-r-full -ml-2.5" />
              )}

              <span
                className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all ${
                  active
                    ? "bg-emerald-100 text-emerald-600"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              >
                <Icon size={17} />
              </span>

              {!collapsed && (
                <span
                  className={`text-sm font-semibold tracking-tight ${
                    active
                      ? "text-emerald-700"
                      : "text-slate-600 group-hover:text-slate-800"
                  }`}
                >
                  {item.label}
                </span>
              )}

              {!collapsed && active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </Link>
          );

          return (
            <div key={item.path} className="relative">
              {collapsed ? (
                <Tooltip title={item.label} placement="right">
                  {navLink}
                </Tooltip>
              ) : (
                navLink
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom decoration */}
      {!collapsed && (
        <div className="mx-3 mb-4 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 p-4 text-white">
          <p className="text-xs font-bold mb-1">ðŸŽ“ Keep Learning!</p>
          <p className="text-[11px] text-emerald-100 leading-relaxed">
            Upload materials to unlock AI-powered summaries & quizzes.
          </p>
        </div>
      )}
    </div>
  );

  // Mobile drawer
  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={onMobileClose}
        closeIcon={<FiX size={20} />}
        width={256}
        styles={{
          body: { padding: 0 },
          header: { display: "none" },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  // Desktop sidebar
  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={256}
      collapsedWidth={72}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        background: "white",
        borderRight: "1px solid #f1f5f9",
        boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
      }}
      trigger={null}
    >
      {sidebarContent}
    </Sider>
  );
};

export default Sidebar;
