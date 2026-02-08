import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "react-router-dom";
import {
  Button,
  Input,
  Checkbox,
  Progress,
  Select,
  Upload,
  Avatar,
} from "antd";
import {
  FiMail,
  FiLock,
  FiUser,
  FiArrowRight,
  FiBookOpen,
  FiCamera,
} from "react-icons/fi";
import { registerSchema } from "../../lib/validators/auth";
import type { RegisterFormData } from "../../lib/validators/auth";
import { useRegister } from "../../lib/hooks/useAuth";

const RegisterForm = () => {
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const registerMutation = useRegister();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: "onBlur",
  });

  const password = watch("password");

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password) && /[!@#$%^&*]/.test(password)) strength += 25;

    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "#EF4444";
    if (passwordStrength <= 50) return "#F59E0B";
    if (passwordStrength <= 75) return "#14B8A6";
    return "#10B981";
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate({
      email: data.email,
      password: data.password,
      full_name: data.fullName,
      educationLevel: data.educationLevel,
      profilePicture: profilePicture || undefined,
    });
  };

  const handleFileChange = (file: File) => {
    setProfilePicture(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-y-auto md:overflow-hidden p-3 md:p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-4 md:mb-5">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-1.5 md:mb-2">
            Create Account ✨
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-medium">
            Start your AI-powered learning journey today
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 md:space-y-3.5"
        >
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="relative">
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleFileChange}
                className="cursor-pointer"
              >
                <div className="relative group">
                  {previewUrl ? (
                    <Avatar
                      size={90}
                      src={previewUrl}
                      className="border-4 border-teal-100 group-hover:border-teal-300 transition-all"
                    />
                  ) : (
                    <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center border-4 border-teal-100 group-hover:border-teal-300 transition-all">
                      <FiUser className="text-4xl text-teal-600" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full p-2 border-4 border-white group-hover:scale-110 transition-transform shadow-lg">
                    <FiCamera className="text-white text-sm" />
                  </div>
                </div>
              </Upload>
              <p className="text-xs text-center text-slate-500 mt-1.5 font-medium">
                {profilePicture ? "Click to change" : "Add profile picture"}
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-bold text-slate-800 mb-1.5"
            >
              Full Name
            </label>
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="fullName"
                  prefix={<FiUser className="text-slate-400 text-lg" />}
                  placeholder="Enter your full name"
                  size="large"
                  status={errors.fullName ? "error" : ""}
                  className="!rounded-2xl !h-11 hover:!border-teal-400 focus:!border-teal-500 !border-2 !text-base font-medium"
                />
              )}
            />
            {errors.fullName && (
              <p
                className="text-xs text-red-500 mt-1 font-semibold"
                role="alert"
              >
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-slate-800 mb-1.5"
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
                  className="!rounded-2xl !h-11 hover:!border-teal-400 focus:!border-teal-500 !border-2 !text-base font-medium"
                />
              )}
            />
            {errors.email && (
              <p
                className="text-xs text-red-500 mt-1 font-semibold"
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="educationLevel"
              className="block text-sm font-bold text-slate-800 mb-1.5"
            >
              Education Level
            </label>
            <Controller
              name="educationLevel"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  id="educationLevel"
                  placeholder="Select your education level"
                  size="large"
                  status={errors.educationLevel ? "error" : ""}
                  className="w-full [&_.ant-select-selector]:!rounded-2xl [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!border-2 hover:[&_.ant-select-selector]:!border-teal-400 [&_.ant-select-selector.ant-select-focused]:!border-teal-500"
                  options={[
                    { value: "High School", label: "High School" },
                    { value: "Undergraduate", label: "Undergraduate" },
                    { value: "Graduate", label: "Graduate" },
                    { value: "PhD", label: "PhD" },
                    { value: "Professional", label: "Professional" },
                    { value: "Other", label: "Other" },
                  ]}
                  suffixIcon={<FiBookOpen className="text-slate-400 text-lg" />}
                />
              )}
            />
            {errors.educationLevel && (
              <p
                className="text-xs text-red-500 mt-1 font-semibold"
                role="alert"
              >
                {errors.educationLevel.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-slate-800 mb-1.5"
            >
              Password
            </label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  id="password"
                  prefix={<FiLock className="text-slate-400 text-lg" />}
                  placeholder="Create a strong password"
                  size="large"
                  status={errors.password ? "error" : ""}
                  className="!rounded-2xl !h-11 hover:!border-teal-400 focus:!border-teal-500 !border-2 !text-base font-medium"
                />
              )}
            />
            {password && (
              <div className="mt-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600 font-bold">
                    Password strength
                  </span>
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-full"
                    style={{
                      color: getPasswordStrengthColor(),
                      backgroundColor: `${getPasswordStrengthColor()}20`,
                    }}
                  >
                    {getPasswordStrengthLabel()}
                  </span>
                </div>
                <Progress
                  percent={passwordStrength}
                  showInfo={false}
                  strokeColor={getPasswordStrengthColor()}
                  trailColor="#E2E8F0"
                  strokeWidth={5}
                  className="[&_.ant-progress-bg]:!rounded-full"
                />
              </div>
            )}
            {errors.password && (
              <p
                className="text-xs text-red-500 mt-1 font-semibold"
                role="alert"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-bold text-slate-800 mb-1.5"
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
                  placeholder="Confirm your password"
                  size="large"
                  status={errors.confirmPassword ? "error" : ""}
                  className="!rounded-2xl !h-11 hover:!border-teal-400 focus:!border-teal-500 !border-2 !text-base font-medium"
                />
              )}
            />
            {errors.confirmPassword && (
              <p
                className="text-xs text-red-500 mt-1 font-semibold"
                role="alert"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="pt-1">
            <Controller
              name="terms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  {...field}
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="text-sm font-medium"
                >
                  <span className="text-slate-600 text-sm font-medium">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-teal-600 hover:text-teal-700 font-bold"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-teal-600 hover:text-teal-700 font-bold"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </Checkbox>
              )}
            />
            {errors.terms && (
              <p
                className="text-xs text-red-500 mt-1 font-semibold"
                role="alert"
              >
                {errors.terms.message}
              </p>
            )}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={registerMutation.isPending}
            className="w-full !bg-gradient-to-r !from-orange-500 !via-amber-500 !to-yellow-500 hover:!from-orange-600 hover:!via-amber-600 hover:!to-yellow-600 !text-white font-black hover:scale-[1.02] transition-all duration-500 shadow-xl shadow-orange-300/50 hover:shadow-2xl hover:shadow-amber-400/50 !h-11 !rounded-2xl !border-0 !text-base !mt-1"
          >
            Create Account <FiArrowRight className="ml-2 inline" />
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-3 font-medium">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-teal-600 hover:text-teal-700 font-black transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
