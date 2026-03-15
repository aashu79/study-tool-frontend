import { useState, useEffect, type ReactNode } from "react";
import { Layout, App } from "antd";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

const { Content } = Layout;

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <App>
      <Layout hasSider style={{ minHeight: "100vh", background: "#f1f5f9" }}>
        <Sidebar
          collapsed={collapsed}
          onCollapse={setCollapsed}
          isMobile={isMobile}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 72 : 256,
            transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "#f1f5f9",
            minHeight: "100vh",
          }}
        >
          <TopNavbar
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed(!collapsed)}
            onMobileMenuOpen={() => setMobileMenuOpen(true)}
            isMobile={isMobile}
          />

          <Content
            style={{ background: "#f1f5f9" }}
            className="min-h-[calc(100vh-64px)] px-4 md:px-6 py-5"
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </App>
  );
};

export default DashboardLayout;
