import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  authService,
  type RegisterRequest,
  type LoginRequest,
  type VerifyOTPRequest,
  type ResendOTPRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
} from "../api/auth.service";
import { useAuthStore } from "../store/auth.store";
import { useEffect } from "react";

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      toast.success(data.message);
      navigate("/verify-email", { state: { email: data.email } });
    },
  });
};

export const useVerifyEmail = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: VerifyOTPRequest) => authService.verifyEmail(data),
    onSuccess: (data) => {
      toast.success(data.message);
      navigate("/login");
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: (data: ResendOTPRequest) => authService.resendOTP(data),
    onSuccess: (data) => {
      toast.success(data.message);
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: () => {
      toast.success("Login successful!");
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      navigate("/dashboard");
    },
  });
};

export const useCurrentUser = () => {
  const { setUser, clearUser } = useAuthStore();

  const query = useQuery({
    queryKey: ["currentUser"],
    queryFn: authService.getCurrentUser,
    enabled: !!localStorage.getItem("auth_token"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    } else if (query.isError) {
      clearUser();
    }
  }, [query.data, query.isError, setUser, clearUser]);

  return query;
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearUser } = useAuthStore();

  return useMutation({
    mutationFn: () => {
      authService.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      clearUser();
      queryClient.clear();
      toast.success("Logged out successfully");
      navigate("/login");
    },
  });
};

export const useForgotPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) =>
      authService.forgotPassword(data),
    onSuccess: (_, variables) => {
      toast.success("Password reset instructions sent to your email");
      navigate("/reset-password", { state: { email: variables.email } });
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    onSuccess: (data) => {
      toast.success(data.message);
      navigate("/login");
    },
  });
};
