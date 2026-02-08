import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, App as AntApp } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Routes from "./components/Routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const theme = {
  token: {
    colorPrimary: "#FF6B35",
    colorSuccess: "#10B981",
    colorWarning: "#F59E0B",
    colorError: "#EF4444",
    colorInfo: "#3B82F6",
    colorBgContainer: "#FFFFFF",
    colorBgElevated: "#FFFFFF",
    colorBorder: "#E5E7EB",
    colorText: "#1F2937",
    colorTextSecondary: "#6B7280",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    fontSize: 14,
    borderRadius: 12,
  },
  components: {
    Button: {
      borderRadius: 12,
      fontWeight: 600,
      controlHeight: 44,
    },
    Input: {
      borderRadius: 10,
      controlHeight: 44,
    },
  },
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <AntApp>
          <BrowserRouter>
            <Routes />
          </BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#1F2937",
                borderRadius: "12px",
                padding: "16px",
                fontWeight: 600,
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
