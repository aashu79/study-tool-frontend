import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = yup.object().shape({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  educationLevel: yup.string().required("Education level is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
  terms: yup
    .boolean()
    .required("You must accept the terms and conditions")
    .oneOf([true], "You must accept the terms and conditions"),
});

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  educationLevel: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}
