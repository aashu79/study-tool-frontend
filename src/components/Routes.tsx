import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import UploadPage from "../pages/Upload";
import Profile from "../pages/Profile";
import MyMaterials from "../pages/MyMaterials";
import DocumentViewer from "../pages/DocumentViewer";
import { ProtectedRoute } from "../lib/components/ProtectedRoute";

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-materials"
        element={
          <ProtectedRoute>
            <MyMaterials />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/document/:fileId"
        element={
          <ProtectedRoute>
            <DocumentViewer />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </RouterRoutes>
  );
};

export default Routes;
