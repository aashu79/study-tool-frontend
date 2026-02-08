import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button, Input } from "antd";
import { FiMail, FiArrowRight } from "react-icons/fi";
import { useVerifyEmail, useResendOTP } from "../lib/hooks/useAuth";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendOTP();

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = () => {
    if (!email || !otp) return;
    verifyMutation.mutate({ email, otp });
  };

  const handleResend = () => {
    if (!email || countdown > 0) return;
    resendMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setCountdown(60);
        },
      }
    );
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
              <FiMail className="text-3xl text-teal-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-slate-600 font-medium">
              We've sent a verification code to
            </p>
            <p className="text-teal-600 font-bold mt-1">{email}</p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-bold text-slate-800 mb-2.5"
              >
                Verification Code
              </label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter 6-digit code"
                size="large"
                maxLength={6}
                className="!rounded-2xl !h-14 hover:!border-teal-400 focus:!border-teal-500 !border-2 !text-center !text-2xl !font-bold !tracking-widest"
              />
            </div>

            <Button
              type="primary"
              size="large"
              block
              onClick={handleVerify}
              loading={verifyMutation.isPending}
              disabled={otp.length !== 6}
              className="!h-14 !rounded-2xl !text-base !font-bold !shadow-lg !shadow-teal-500/30 hover:!shadow-teal-500/50"
              icon={<FiArrowRight className="text-lg" />}
              iconPosition="end"
            >
              Verify Email
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">
                Didn't receive the code?
              </p>
              <Button
                type="link"
                onClick={handleResend}
                loading={resendMutation.isPending}
                disabled={countdown > 0}
                className="!text-teal-600 !font-bold"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <Link
                to="/register"
                className="text-sm text-slate-600 hover:text-teal-600 font-semibold transition-colors"
              >
                Use a different email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
