import { Link, useLocation } from "react-router-dom";
import { Layout, Menu, Drawer } from "antd";
import { FiBarChart2, FiUpload, FiUser, FiX, FiFolder } from "react-icons/fi";
import { IoSchool } from "react-icons/io5";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar = ({
  collapsed,
  onCollapse,
  isMobile,
  mobileOpen,
  onMobileClose,
}: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <FiBarChart2 size={18} />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: "/my-materials",
      icon: <FiFolder size={18} />,
      label: <Link to="/my-materials">My Study Materials</Link>,
    },
    {
      key: "/upload",
      icon: <FiUpload size={18} />,
      label: <Link to="/upload">Upload Study Materials</Link>,
    },
    {
      key: "/profile",
      icon: <FiUser size={18} />,
      label: <Link to="/profile">Profile</Link>,
    },
  ];

  const sidebarContent = (
    <>
      {/* Logo */}
      <div
        className={`h-16 flex items-center ${
          collapsed ? "justify-center" : "justify-start px-6"
        } border-b border-slate-200 bg-white`}
      >
        <Link
          to="/dashboard"
          className="flex items-center gap-3 hover:scale-105 transition-transform duration-300"
        >
          <div className="p-2 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl shadow-md">
            <IoSchool className="text-xl text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-primary-600">StudyAI</span>
          )}
        </Link>
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        className="border-0 pt-4"
        style={{
          fontSize: "15px",
        }}
      />
    </>
  );

  // Mobile drawer
  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={onMobileClose}
        closeIcon={<FiX size={20} />}
        width={260}
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
      width={260}
      collapsedWidth={80}
      className="!bg-white border-r border-slate-200"
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
      trigger={null}
    >
      {sidebarContent}
    </Sider>
  );
};

export default Sidebar;
