import { Navigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import RegisterForm from "../components/auth/RegisterForm";
import { useAuthStore } from "../lib/store/auth.store";
import { useCurrentUser } from "../lib/hooks/useAuth";

const Register = () => {
  const { isAuthenticated } = useAuthStore();

  // Ensure authentication state is checked
  useCurrentUser();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
