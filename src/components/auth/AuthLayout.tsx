import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { IoSchool } from "react-icons/io5";
import { FiArrowLeft, FiBookOpen, FiTarget, FiZap } from "react-icons/fi";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const features = [
    { icon: FiBookOpen, text: "Smart Summaries" },
    { icon: FiTarget, text: "Auto Quizzes" },
    { icon: FiZap, text: "AI Tutor" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* LEFT SIDE – MATCHED LANDING GRADIENT */}
      <div className="relative hidden lg:flex lg:w-1/2 overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
        {/* Grid Overlay (same vibe as landing CTA) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Gradient Blobs */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-white/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[620px] h-[620px] bg-orange-300/30 rounded-full blur-[140px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-14 text-white">
          <div className="mb-10 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
              <IoSchool className="text-4xl text-white" />
            </div>

            <h1 className="text-4xl font-black mb-4 tracking-tight">StudyAI</h1>

            <p className="text-lg text-white/90 max-w-md leading-relaxed font-medium">
              AI-powered learning platform that helps you study smarter, not
              harder.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-white/15 backdrop-blur-md rounded-xl px-6 py-3 shadow-lg"
              >
                <feature.icon className="text-xl text-white" />
                <span className="font-semibold">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-14 flex gap-12">
            <div className="text-center">
              <p className="text-3xl font-black">50K+</p>
              <p className="text-white/70 text-sm font-semibold">Students</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black">4.9</p>
              <p className="text-white/70 text-sm font-semibold">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black">98%</p>
              <p className="text-white/70 text-sm font-semibold">
                Satisfaction
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE – FORM */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link
            to="/"
            className="lg:hidden flex items-center justify-center gap-3 mb-8"
          >
            <div className="p-3 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-xl shadow-lg">
              <IoSchool className="text-2xl text-white" />
            </div>
            <span className="text-2xl font-black text-slate-800">StudyAI</span>
          </Link>

          {/* Form Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-teal-100/60 p-8">
            {children}
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors font-semibold"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
