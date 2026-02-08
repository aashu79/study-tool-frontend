import { Navigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";
import { useAuthStore } from "../lib/store/auth.store";
import { useCurrentUser } from "../lib/hooks/useAuth";

const Login = () => {
  const { isAuthenticated } = useAuthStore();

  // Ensure authentication state is checked
  useCurrentUser();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
