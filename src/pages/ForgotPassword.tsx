import { useForm, Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button, Input } from "antd";
import { FiMail, FiArrowRight, FiLock } from "react-icons/fi";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForgotPassword } from "../lib/hooks/useAuth";

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
});

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword = () => {
  const forgotPasswordMutation = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
              <FiLock className="text-3xl text-teal-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-slate-600 font-medium">
              Enter your email to receive a password reset code
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-slate-800 mb-2.5"
              >
                Email Address
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    prefix={<FiMail className="text-slate-400 text-lg" />}
                    placeholder="Enter your email"
                    size="large"
                    status={errors.email ? "error" : ""}
                    className="!rounded-2xl !h-14 hover:!border-teal-400 focus:!border-teal-500 !border-2 !text-base font-medium"
                  />
                )}
              />
              {errors.email && (
                <p
                  className="text-sm text-red-500 mt-2 font-semibold"
                  role="alert"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={forgotPasswordMutation.isPending}
              className="!h-14 !rounded-2xl !text-base !font-bold !shadow-lg !shadow-teal-500/30 hover:!shadow-teal-500/50"
              icon={<FiArrowRight className="text-lg" />}
              iconPosition="end"
            >
              Send Reset Code
            </Button>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-slate-600 mb-2">
                Remember your password?
              </p>
              <Link
                to="/login"
                className="text-sm text-teal-600 hover:text-teal-700 font-bold transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
