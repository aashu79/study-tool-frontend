import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Button, Input } from "antd";
import { FiLock, FiArrowRight } from "react-icons/fi";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useResetPassword } from "../lib/hooks/useAuth";

const resetPasswordSchema = yup.object().shape({
  otp: yup
    .string()
    .required("OTP is required")
    .matches(/^\d{6}$/, "OTP must be 6 digits"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("newPassword")], "Passwords must match"),
});

interface ResetPasswordFormData {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const resetPasswordMutation = useResetPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!email) return;
    resetPasswordMutation.mutate({
      email,
      otp: data.otp,
      newPassword: data.newPassword,
    });
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
              <FiLock className="text-3xl text-teal-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              Reset Password
            </h1>
            <p className="text-slate-600 font-medium">Enter the code sent to</p>
            <p className="text-teal-600 font-bold mt-1">{email}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-bold text-slate-800 mb-2.5"
              >
                Verification Code
              </label>
              <Controller
                name="otp"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="otp"
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    placeholder="Enter 6-digit code"
                    size="large"
                    maxLength={6}
                    status={errors.otp ? "error" : ""}
                    className="!rounded-2xl !h-14 hover:!border-teal-400 focus:!border-teal-500 !border-2 !text-center !text-2xl !font-bold !tracking-widest"
                  />
                )}
              />
              {errors.otp && (
                <p
                  className="text-sm text-red-500 mt-2 font-semibold"
                  role="alert"
                >
                  {errors.otp.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-bold text-slate-800 mb-2.5"
              >
                New Password
              </label>
              <Controller
                name="newPassword"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    id="newPassword"
                    prefix={<FiLock className="text-slate-400 text-lg" />}
                    placeholder="Enter new password"
                    size="large"
                    status={errors.newPassword ? "error" : ""}
                    className="!rounded-2xl !h-14 hover:!border-teal-400 focus:!border-teal-500 !border-2 !text-base font-medium"
                  />
                )}
              />
              {errors.newPassword && (
                <p
                  className="text-sm text-red-500 mt-2 font-semibold"
                  role="alert"
                >
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold text-slate-800 mb-2.5"
              >
                Confirm Password
              </label>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    id="confirmPassword"
                    prefix={<FiLock className="text-slate-400 text-lg" />}
                    placeholder="Confirm new password"
                    size="large"
                    status={errors.confirmPassword ? "error" : ""}
                    className="!rounded-2xl !h-14 hover:!border-teal-400 focus:!border-teal-500 !border-2 !text-base font-medium"
                  />
                )}
              />
              {errors.confirmPassword && (
                <p
                  className="text-sm text-red-500 mt-2 font-semibold"
                  role="alert"
                >
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={resetPasswordMutation.isPending}
              className="!h-14 !rounded-2xl !text-base !font-bold !shadow-lg !shadow-teal-500/30 hover:!shadow-teal-500/50 !mt-6"
              icon={<FiArrowRight className="text-lg" />}
              iconPosition="end"
            >
              Reset Password
            </Button>

            <div className="text-center pt-4 border-t">
              <Link
                to="/forgot-password"
                className="text-sm text-slate-600 hover:text-teal-600 font-semibold transition-colors"
              >
                Request new code
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
