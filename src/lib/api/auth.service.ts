import { apiClient } from "./client";

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  educationLevel: string;
  profilePicture?: File;
}

export interface RegisterResponse {
  user_id: number;
  email: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface ResendOTPRequest {
  email: string;
}

export interface User {
  user_id: number;
  email: string;
  full_name: string;
  educationLevel: string;
  created_at: string;
  last_login: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export const authService = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("full_name", data.full_name);
    formData.append("educationLevel", data.educationLevel);
    if (data.profilePicture) {
      formData.append("profilePicture", data.profilePicture);
    }

    const response = await apiClient.post("/api/auth/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  verifyEmail: async (data: VerifyOTPRequest): Promise<{ message: string }> => {
    const response = await apiClient.post("/api/auth/verify", data);
    return response.data;
  },

  resendOTP: async (data: ResendOTPRequest): Promise<{ message: string }> => {
    const response = await apiClient.post("/api/auth/resend-otp", data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post("/api/auth/login", data);
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
    }
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get("/api/auth/me");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("auth_token");
  },

  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<{ message: string }> => {
    const response = await apiClient.post("/api/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<{ message: string }> => {
    const response = await apiClient.post("/api/auth/reset-password", data);
    return response.data;
  },
};
