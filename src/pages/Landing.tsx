import { Link } from "react-router-dom";
import { Button } from "antd";
import { IoSchool } from "react-icons/io5";
import {
  FiBookOpen,
  FiTarget,
  FiLayers,
  FiMessageCircle,
  FiTrendingUp,
  FiFileText,
  FiCheck,
  FiArrowRight,
  FiStar,
  FiUsers,
  FiZap,
  FiHeart,
} from "react-icons/fi";
import PublicLayout from "../components/common/PublicLayout";
import { DiSpark } from "react-icons/di";

const Landing = () => {
  const features = [
    {
      icon: FiBookOpen,
      title: "Smart Summaries",
      description:
        "AI extracts key concepts from your notes instantly, saving hours of study time",
      gradient: "from-emerald-500 to-teal-500",
      lightGradient: "from-emerald-50 to-teal-50",
    },
    {
      icon: FiTarget,
      title: "Auto-Generated Quizzes",
      description:
        "Test yourself with adaptive MCQs that focus on your weak areas",
      gradient: "from-teal-500 to-cyan-500",
      lightGradient: "from-teal-50 to-cyan-50",
    },
    {
      icon: FiLayers,
      title: "Smart Flashcards",
      description:
        "Spaced repetition algorithm ensures you remember what matters most",
      gradient: "from-orange-500 to-amber-500",
      lightGradient: "from-orange-50 to-amber-50",
    },
    {
      icon: FiMessageCircle,
      title: "24/7 AI Tutor",
      description:
        "Get instant explanations and answers to your questions anytime",
      gradient: "from-cyan-500 to-blue-500",
      lightGradient: "from-cyan-50 to-blue-50",
    },
    {
      icon: FiTrendingUp,
      title: "Progress Analytics",
      description:
        "Visual insights into your learning journey and improvement areas",
      gradient: "from-lime-500 to-emerald-500",
      lightGradient: "from-lime-50 to-emerald-50",
    },
    {
      icon: FiFileText,
      title: "Multi-Format Support",
      description:
        "Works seamlessly with PDFs, PowerPoints, and text documents",
      gradient: "from-amber-500 to-yellow-500",
      lightGradient: "from-amber-50 to-yellow-50",
    },
  ];

  const stats = [
    { value: "50K+", label: "Active Students", icon: FiUsers },
    { value: "1M+", label: "Notes Processed", icon: FiFileText },
    { value: "98%", label: "Satisfaction Rate", icon: FiHeart },
    { value: "4.9", label: "App Rating", icon: FiStar },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Medical Student",
      avatar: "SC",
      content:
        "StudyAI transformed how I prepare for exams. The AI summaries save me hours every week!",
      rating: 5,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      name: "Marcus Johnson",
      role: "Law Student",
      avatar: "MJ",
      content:
        "The flashcard system is incredible. I've improved my retention by 40% since using it.",
      rating: 5,
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      name: "Emily Rodriguez",
      role: "Engineering Student",
      avatar: "ER",
      content:
        "Having a 24/7 AI tutor feels like cheating (but it's not!). Best study tool ever.",
      rating: 5,
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-gradient-to-br from-teal-50 via-white to-orange-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-emerald-300/30 to-teal-300/30 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-orange-300/30 to-amber-300/30 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-cyan-200/20 to-lime-200/20 rounded-full blur-3xl" />
        </div>

        {/* Floating shapes */}
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full animate-float" />
        <div
          className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full animate-float"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute top-1/3 left-1/4 w-2 h-2 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left animate-fade-in space-y-8">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/80 backdrop-blur-xl rounded-full shadow-lg shadow-teal-100/50 border border-teal-100/50">
                <DiSpark className="text-teal-600 animate-pulse" />
                <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-orange-600 bg-clip-text text-transparent">
                  AI-Powered Learning Platform
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1]">
                Master Your Studies with{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-emerald-600 via-teal-600 to-orange-600 bg-clip-text text-transparent">
                    AI Power
                  </span>
                  <span className="absolute bottom-2 left-0 w-full h-4 bg-gradient-to-r from-emerald-200 via-teal-200 to-orange-200 -z-0 rounded-lg blur-sm" />
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-600 leading-relaxed font-medium">
                Upload your notes and let AI create summaries, flashcards,
                quizzes & provide personalized tutoring—all in one powerful
                platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link to="/register">
                  <Button
                    type="primary"
                    size="large"
                    className="group !bg-gradient-to-r !from-orange-500 !via-amber-500 !to-yellow-500 hover:!from-orange-600 hover:!via-amber-600 hover:!to-yellow-600 !text-white font-bold !px-10 !h-16 !text-lg hover:scale-105 transition-all duration-500 shadow-2xl shadow-orange-300/50 hover:shadow-amber-400/50 !rounded-2xl w-full sm:w-auto !border-0"
                  >
                    Get Started Free
                    <FiArrowRight className="ml-2 inline group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="large"
                    className="font-bold !px-10 !h-16 !text-lg !border-2 !border-teal-300 !text-slate-700 hover:!border-teal-400 hover:!text-teal-700 hover:scale-105 transition-all duration-500 !rounded-2xl w-full sm:w-auto !bg-white/80 backdrop-blur-sm hover:!bg-white shadow-lg"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-5 justify-center lg:justify-start pt-6">
                <div className="flex -space-x-4">
                  {[
                    "bg-gradient-to-br from-emerald-400 to-teal-500",
                    "bg-gradient-to-br from-cyan-400 to-blue-500",
                    "bg-gradient-to-br from-orange-400 to-amber-500",
                    "bg-gradient-to-br from-lime-400 to-emerald-500",
                  ].map((gradient, i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 ${gradient} rounded-full border-4 border-white flex items-center justify-center text-white text-sm font-bold shadow-lg hover:scale-110 transition-transform duration-300`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className="w-5 h-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 font-semibold">
                    Loved by{" "}
                    <span className="text-teal-600 font-bold">50,000+</span>{" "}
                    students
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Visual */}
            <div
              className="relative animate-slide-in-right hidden lg:block"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="relative">
                {/* Main Card */}
                <div className="relative bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-teal-200/50 p-8 border border-teal-100/50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-300/50">
                      <IoSchool className="text-3xl text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">
                        Your Study Dashboard
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        AI-powered insights
                      </p>
                    </div>
                  </div>

                  {/* Progress Card */}
                  <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 rounded-2xl p-5 mb-4 border border-teal-100/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-slate-700">
                        Today's Progress
                      </span>
                      <span className="text-sm font-black text-teal-700 bg-white px-3 py-1 rounded-full">
                        78%
                      </span>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                      <div className="h-full w-[78%] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full shadow-lg" />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        value: "24",
                        label: "Flashcards",
                        gradient: "from-orange-500 to-amber-500",
                        bg: "from-orange-50 to-amber-50",
                      },
                      {
                        value: "12",
                        label: "Quizzes",
                        gradient: "from-cyan-500 to-blue-500",
                        bg: "from-cyan-50 to-blue-50",
                      },
                      {
                        value: "3h",
                        label: "Studied",
                        gradient: "from-lime-500 to-emerald-500",
                        bg: "from-lime-50 to-emerald-50",
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-4 text-center border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-300`}
                      >
                        <p
                          className={`text-3xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                        >
                          {stat.value}
                        </p>
                        <p className="text-xs text-slate-600 font-bold mt-1">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 animate-float border border-teal-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                      <FiCheck className="text-teal-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      Quiz Completed!
                    </span>
                  </div>
                </div>

                <div
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 animate-float border border-orange-100"
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
                      <FiZap className="text-orange-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      +15 XP Earned
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="w-7 h-7 text-orange-500 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-orange-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
                <p className="text-slate-600 font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 px-4 bg-gradient-to-br from-slate-50 to-teal-50/30"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <span className="inline-block px-5 py-2.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-teal-700 rounded-full text-sm font-bold mb-4 border border-teal-200/50">
              ✨ Features
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
              Powerful AI tools designed to help you learn faster, retain more,
              and achieve your academic goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-teal-100/50 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.lightGradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white shadow-lg`}
                >
                  <feature.icon
                    className={`text-3xl bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`}
                  />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-teal-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-5 py-2.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-full text-sm font-bold mb-4 border border-orange-200/50">
              🚀 How It Works
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6">
              Start Learning in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-1 bg-gradient-to-r from-emerald-200 via-teal-200 to-orange-200 rounded-full" />

            {[
              {
                step: "01",
                title: "Upload Your Notes",
                description:
                  "Simply upload your PDFs, PowerPoints, or text documents. Our AI handles the rest.",
                icon: FiFileText,
                gradient: "from-emerald-500 to-teal-500",
                lightGradient: "from-emerald-50 to-teal-50",
              },
              {
                step: "02",
                title: "AI Processes Content",
                description:
                  "Our AI analyzes your materials and creates summaries, flashcards, and quizzes automatically.",
                icon: FiZap,
                gradient: "from-cyan-500 to-blue-500",
                lightGradient: "from-cyan-50 to-blue-50",
              },
              {
                step: "03",
                title: "Study Smarter",
                description:
                  "Use personalized study tools and track your progress as you master every topic.",
                icon: FiTrendingUp,
                gradient: "from-orange-500 to-amber-500",
                lightGradient: "from-orange-50 to-amber-50",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div
                      className={`w-24 h-24 bg-gradient-to-br ${item.lightGradient} rounded-3xl flex items-center justify-center shadow-lg border-2 border-white`}
                    >
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center shadow-xl`}
                      >
                        <item.icon className="text-3xl text-white" />
                      </div>
                    </div>
                    <span className="absolute -top-2 -right-2 w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-black shadow-lg">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 max-w-xs mx-auto font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-teal-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-5 py-2.5 bg-white text-teal-700 rounded-full text-sm font-bold mb-4 shadow-lg border-2 border-teal-200/50">
              💬 Testimonials
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6">
              Loved by Students Worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-teal-100/50 hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar
                      key={i}
                      className="w-5 h-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed text-lg font-medium">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${testimonial.gradient} rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg`}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-slate-500 font-semibold">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-orange-300/30 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur rounded-3xl mb-8 shadow-2xl">
            <IoSchool className="text-5xl text-white" />
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-2xl text-white/95 mb-10 max-w-2xl mx-auto font-medium">
            Join thousands of students already using StudyAI to achieve better
            grades and master their subjects.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link to="/register">
              <Button
                size="large"
                className="!bg-gradient-to-r !from-orange-500 !via-amber-500 !to-yellow-500 hover:!from-orange-600 hover:!via-amber-600 hover:!to-yellow-600 !text-white font-black !px-12 !h-16 !text-lg hover:scale-105 hover:!shadow-2xl transition-all duration-500 !rounded-2xl !border-0 w-full sm:w-auto shadow-2xl shadow-orange-400/50"
              >
                <FiUsers className="mr-2 inline" />
                Start Learning Free
              </Button>
            </Link>
            <p className="text-white/90 text-base font-bold">
              ✨ No credit card required • Free forever plan available
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Landing;
