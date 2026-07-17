import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsVerifying(true);
      
      setTimeout(() => {
        try {
          const emailLower = formData.email.toLowerCase().trim();

          // 1. Check for Admin Login
          const adminCredsStr = localStorage.getItem("nappy_admin_credentials");
          let adminEmail = "admin@nappy.com";
          let adminPassword = "admin123";
          
          if (adminCredsStr) {
            try {
              const creds = JSON.parse(adminCredsStr);
              if (creds.email) adminEmail = creds.email.toLowerCase().trim();
              if (creds.password) adminPassword = creds.password;
            } catch (e) {
              console.error("Failed to parse admin credentials from local storage", e);
            }
          }

          if (emailLower === adminEmail) {
            if (formData.password === adminPassword) {
              localStorage.setItem("nappy_logged_in_admin", "true");
              
              // Maintain/Update admin profile info
              const existingProfileStr = localStorage.getItem("nappy_admin_profile");
              let fullName = "NapPy Administrator";
              let createdDate = "July 16, 2026";
              
              if (existingProfileStr) {
                try {
                  const p = JSON.parse(existingProfileStr);
                  if (p.fullName) fullName = p.fullName;
                  if (p.createdDate) createdDate = p.createdDate;
                } catch (e) {}
              }
              
              const lastLoginTime = new Date().toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
              localStorage.setItem("nappy_admin_last_login", lastLoginTime);
              
              localStorage.setItem(
                "nappy_admin_profile",
                JSON.stringify({
                  fullName,
                  email: adminEmail,
                  role: "Administrator",
                  createdDate,
                  lastLogin: lastLoginTime
                })
              );
              
              setIsSuccess(true);
              setIsVerifying(false);
              success("Login Successful", "Welcome back, Administrator! Accessing the admin console...");
              setTimeout(() => {
                window.history.pushState({}, "", "/admin-dashboard");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }, 2000);
              return;
            } else {
              setErrors({
                password: "Incorrect password.",
              });
              setIsVerifying(false);
              error("Login Failed", "Incorrect password provided for Admin.");
              return;
            }
          }

          // 2. Student Login Check
          const studentsJSON = localStorage.getItem("nappy_students");
          const students = studentsJSON ? JSON.parse(studentsJSON) : [];
          
          // Find registered student
          const student = students.find(
            (s: any) => s.email && s.email.toLowerCase().trim() === emailLower
          );

          if (!student) {
            setErrors({
              email: "No account found. Please register first.",
            });
            setIsVerifying(false);
            error("Login Failed", "No student account found with this email.");
            return;
          }

          if (student.password !== formData.password) {
            setErrors({
              password: "Incorrect password.",
            });
            setIsVerifying(false);
            error("Login Failed", "Incorrect password. Please try again.");
            return;
          }

          // Store successful student login session
          localStorage.setItem("nappy_logged_in_student", JSON.stringify(student));

          setIsSuccess(true);
          setIsVerifying(false);
          success("Login Successful", `Welcome back, ${student.fullName}! Accessing the student console...`);
          // Simulate login and redirect to the Student Dashboard after 2 seconds
          setTimeout(() => {
            window.history.pushState({}, "", "/student-dashboard");
            window.dispatchEvent(new PopStateEvent("popstate"));
          }, 2000);
        } catch (err) {
          console.error("Error logging in", err);
          setIsVerifying(false);
          error("System Error", "An unexpected network or internal error occurred during login.");
        }
      }, 1200);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-brand-black select-none">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back Link to Home */}
        <button
          onClick={() => {
            window.history.pushState({}, "", "/");
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-cyan transition-colors mb-6 cursor-pointer"
          id="back-to-home-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* Success Modal Overlay */}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 text-center glass-morphic border border-brand-cyan/30 rounded-3xl shadow-2xl shadow-black bg-brand-black/95"
            id="login-success-overlay"
          >
            <div className="w-16 h-16 bg-brand-cyan/10 border border-brand-cyan/30 rounded-full flex items-center justify-center text-brand-cyan mb-6">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold font-display text-white mb-2">Welcome Back!</h2>
            <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
              Login successful. Accessing the {(() => {
                const adminCredsStr = localStorage.getItem("nappy_admin_credentials");
                let adminEmail = "admin@nappy.com";
                if (adminCredsStr) {
                  try {
                    const creds = JSON.parse(adminCredsStr);
                    if (creds.email) adminEmail = creds.email.toLowerCase().trim();
                  } catch (e) {}
                }
                return formData.email.toLowerCase().trim() === adminEmail ? "admin" : "student";
              })()} console...
            </p>
            <div className="flex items-center gap-1.5 text-xs text-brand-cyan font-mono animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>LAUNCHING WORKSPACE...</span>
            </div>
          </motion.div>
        )}

        {/* Main Card */}
        <div className="glass-morphic rounded-3xl p-8 border border-white/5 shadow-2xl shadow-black relative" id="login-card">
          <div className="absolute top-0 right-12 w-16 h-[1.5px] bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent"></div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-display text-white tracking-tight mb-2">
              Student <span className="text-brand-cyan neon-glow-cyan">Login</span>
            </h1>
            <p className="text-gray-400 text-sm">
              Enter your credentials to enter the virtual coding sandbox.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" id="login-form">
            
            {/* Email Address */}
            <div id="login-field-email">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full bg-white/[0.02] border focus:bg-white/[0.04] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan transition-colors ${
                    errors.email ? "border-red-500/50" : "border-white/5"
                  }`}
                  placeholder="you@email.com"
                  id="login-input-email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div id="login-field-password">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full bg-white/[0.02] border focus:bg-white/[0.04] rounded-xl py-3 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-brand-cyan transition-colors ${
                    errors.password ? "border-red-500/50" : "border-white/5"
                  }`}
                  placeholder="Enter your password"
                  id="login-input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors cursor-pointer"
                  id="login-btn-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isVerifying}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                isVerifying
                  ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/20 cursor-not-allowed"
                  : "bg-brand-cyan hover:bg-brand-cyan/95 text-brand-black hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:scale-[1.01] active:scale-[0.99]"
              }`}
              id="btn-login-submit"
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-brand-cyan" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            {/* Switch to Register */}
            <div className="text-center pt-2">
              <span className="text-sm text-gray-400">Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => {
                  window.history.pushState({}, "", "/register");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                className="text-sm font-semibold text-brand-cyan hover:underline hover:neon-glow-cyan transition-all cursor-pointer"
                id="btn-switch-to-register"
              >
                Register
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
