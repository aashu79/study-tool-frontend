import { useState, useEffect, type ReactNode } from "react";
import { Layout, App } from "antd";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
// import Footer from "./Footer";

const { Content } = Layout;

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <App>
      <Layout hasSider style={{ minHeight: "100vh" }}>
        <Sidebar
          collapsed={collapsed}
          onCollapse={setCollapsed}
          isMobile={isMobile}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 80 : 260,
            transition: "margin-left 0.2s",
          }}
        >
          <TopNavbar
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed(!collapsed)}
            onMobileMenuOpen={() => setMobileMenuOpen(true)}
            isMobile={isMobile}
          />

          <Content className="p-4 md:p-6 bg-gray-50 min-h-[calc(100vh-64px-100px)]">
            {children}
          </Content>

          {/* <Footer /> */}
        </Layout>
      </Layout>
    </App>
  );
};

export default DashboardLayout;
