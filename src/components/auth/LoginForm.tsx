import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "react-router-dom";
import { Button, Input } from "antd";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { loginSchema } from "../../lib/validators/auth";
import type { LoginFormData } from "../../lib/validators/auth";
import { useLogin } from "../../lib/hooks/useAuth";

const LoginForm = () => {
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-3">
            Welcome Back 👋
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Sign in to continue your learning journey
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

          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label
                htmlFor="password"
                className="block text-sm font-bold text-slate-800"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-teal-600 hover:text-teal-700 font-bold transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  id="password"
                  prefix={<FiLock className="text-slate-400 text-lg" />}
                  placeholder="Enter your password"
                  size="large"
                  status={errors.password ? "error" : ""}
                  className="!rounded-2xl !h-14 hover:!border-teal-400 focus:!border-teal-500 !border-2 !text-base font-medium"
                />
              )}
            />
            {errors.password && (
              <p
                className="text-sm text-red-500 mt-2 font-semibold"
                role="alert"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loginMutation.isPending}
            className="w-full !bg-gradient-to-r !from-orange-500 !via-amber-500 !to-yellow-500 hover:!from-orange-600 hover:!via-amber-600 hover:!to-yellow-600 !text-white font-black hover:scale-[1.02] transition-all duration-500 shadow-xl shadow-orange-300/50 hover:shadow-2xl hover:shadow-amber-400/50 !h-14 !rounded-2xl !border-0 !text-base"
          >
            Sign In <FiArrowRight className="ml-2 inline" />
          </Button>
        </form>

        {/* <Divider className="!my-8">
          <span className="text-sm text-slate-400 px-3 font-semibold">
            Or continue with
          </span>
        </Divider> */}

        {/* <Button
          size="large"
          disabled
          className="w-full font-bold !border-2 !border-teal-200 !text-slate-700 !h-14 !rounded-2xl hover:!border-teal-300 hover:!bg-teal-50/50 transition-all duration-300"
          icon={<FcGoogle className="text-2xl mr-3" />}
        >
          Sign in with Google
        </Button> */}

        <p className="text-center text-base text-slate-600 mt-8 font-medium">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-teal-600 hover:text-teal-700 font-black transition-colors"
          >
            Sign up for free
          </Link>
        </p>

        <p className="text-center text-sm text-slate-500 mt-4">
          <Link
            to="/forgot-password"
            className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
          >
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
