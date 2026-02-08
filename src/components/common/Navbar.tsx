import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Avatar, Dropdown } from "antd";
import { IoSchool } from "react-icons/io5";
import { FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";
import { useAuthStore } from "../../lib/store/auth.store";
import { useLogout, useCurrentUser } from "../../lib/hooks/useAuth";
import { useProfilePicture } from "../../lib/hooks/useFile";
import type { MenuProps } from "antd";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();
  const { data: profilePicData } = useProfilePicture();
  // Ensure authentication state is loaded
  useCurrentUser();
  const navItems = [
    { label: "Home", path: "/" },
    { label: "Features", path: "/#features" },
    { label: "Pricing", path: "/pricing" },
    { label: "Resources", path: "/resources" },
    { label: "Community", path: "/community" },
    { label: "About", path: "/about" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "dashboard",
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "profile",
      label: "Profile",
      onClick: () => navigate("/profile"),
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

  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-teal-100/50 sticky top-0 z-50 shadow-sm shadow-teal-100/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:scale-105 transition-all duration-500 group"
          >
            <div className="relative p-3 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl shadow-lg shadow-emerald-200/50 group-hover:shadow-xl group-hover:shadow-teal-300/50 transition-all duration-500 group-hover:rotate-6">
              <IoSchool className="text-2xl text-white relative z-10" />
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-orange-600 bg-clip-text text-transparent">
                StudyAI
              </span>
              <span className="text-xs text-slate-500 -mt-1 tracking-wide">
                Smart Learning
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-5 py-2.5 text-sm font-semibold transition-all duration-300 rounded-full relative overflow-hidden group ${
                  isActive(item.path)
                    ? "text-teal-700"
                    : "text-slate-600 hover:text-teal-600"
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                {isActive(item.path) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-full" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded-full px-3 py-2 transition-colors">
                  <Avatar
                    size="default"
                    className="bg-teal-600"
                    src={profilePicData?.url}
                  >
                    {getInitials(user.full_name)}
                  </Avatar>
                  <span className="text-sm font-semibold text-slate-700">
                    {user.full_name}
                  </span>
                </div>
              </Dropdown>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    type="text"
                    className="text-sm font-semibold !text-slate-700 hover:!text-teal-600 transition-all duration-300 !h-11 !px-6"
                  >
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    type="primary"
                    className="!bg-gradient-to-r !from-orange-500 !via-amber-500 !to-yellow-500 hover:!from-orange-600 hover:!via-amber-600 hover:!to-yellow-600 !text-white font-bold hover:scale-105 transition-all duration-500 shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-amber-300/50 !border-0 !rounded-full !h-11 !px-8"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 rounded-xl hover:bg-teal-50 transition-all duration-300 border border-transparent hover:border-teal-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <FiX className="w-6 h-6 text-slate-700" />
            ) : (
              <FiMenu className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-teal-100/50 animate-fade-in">
            <nav className="flex flex-col gap-2 mb-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 text-teal-700 shadow-sm"
                      : "text-slate-600 hover:bg-teal-50/50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3 px-2">
              {isAuthenticated && user ? (
                <>
                  <Button
                    block
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/dashboard");
                    }}
                    className="!h-12 font-semibold !rounded-2xl border-2 !border-teal-200 hover:!border-teal-300 hover:!bg-teal-50"
                  >
                    Dashboard
                  </Button>
                  <Button
                    block
                    danger
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="!h-12 font-semibold !rounded-2xl"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      block
                      className="!h-12 font-semibold !rounded-2xl border-2 !border-teal-200 hover:!border-teal-300 hover:!bg-teal-50"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      type="primary"
                      block
                      className="!bg-gradient-to-r !from-orange-500 !via-amber-500 !to-yellow-500 !text-white font-bold !h-12 !border-0 !rounded-2xl shadow-lg shadow-orange-200/50"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
