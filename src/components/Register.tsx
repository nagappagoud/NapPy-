import React, { useState } from "react";
import { motion } from "motion/react";
import { User, Mail, Phone, GraduationCap, IdCard, GitBranch, CalendarDays, Lock, Eye, EyeOff, CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    collegeName: "",
    studentId: "",
    branch: "",
    semester: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required check
    Object.keys(formData).forEach((key) => {
      if (!formData[key as keyof typeof formData].trim()) {
        newErrors[key] = "This field is required";
      }
    });

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password length validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    // Passwords match validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsRegistering(true);

      setTimeout(() => {
        try {
          const studentsJSON = localStorage.getItem("nappy_students");
          const students = studentsJSON ? JSON.parse(studentsJSON) : [];
          
          // Check if student with this email is already registered
          const emailExists = students.some(
            (s: any) => s.email && s.email.toLowerCase().trim() === formData.email.toLowerCase().trim()
          );

          if (emailExists) {
            setErrors((prev) => ({
              ...prev,
              email: "An account with this email already exists.",
            }));
            setIsRegistering(false);
            error("Registration Failed", "An account with this email already exists. Please login instead.");
            return;
          }

          const getOrdinalSemester = (sem: string) => {
            if (sem.endsWith("st") || sem.endsWith("nd") || sem.endsWith("rd") || sem.endsWith("th")) return sem;
            const num = parseInt(sem, 10);
            if (num === 1) return "1st";
            if (num === 2) return "2nd";
            if (num === 3) return "3rd";
            if (num >= 4 && num <= 8) return `${num}th`;
            return sem;
          };

          const newStudent = {
            fullName: formData.fullName.trim(),
            email: formData.email.toLowerCase().trim(),
            mobileNumber: formData.mobileNumber.trim(),
            college: formData.collegeName.trim(),
            usn: formData.studentId.trim(),
            branch: formData.branch.trim(),
            semester: getOrdinalSemester(formData.semester),
            password: formData.password,
            registrationDate: new Date().toISOString(),
          };

          students.push(newStudent);
          localStorage.setItem("nappy_students", JSON.stringify(students));
          
          setIsSuccess(true);
          setIsRegistering(false);
          success("Registration Successful", `Account created! Welcome to NapPy Classroom, ${newStudent.fullName}.`);
          // Simulate successful registration and redirect to /login after 2 seconds
          setTimeout(() => {
            window.history.pushState({}, "", "/login");
            window.dispatchEvent(new PopStateEvent("popstate"));
          }, 2000);
        } catch (err) {
          console.error("Error saving student to localStorage", err);
          setIsRegistering(false);
          error("System Error", "Could not complete registration. Local database is full or inaccessible.");
        }
      }, 1500);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-brand-black select-none">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl">
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
            id="register-success-overlay"
          >
            <div className="w-16 h-16 bg-brand-cyan/10 border border-brand-cyan/30 rounded-full flex items-center justify-center text-brand-cyan mb-6">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold font-display text-white mb-2">Registration Successful!</h2>
            <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
              Your student account has been created. Redirecting you to the login screen...
            </p>
            <div className="flex items-center gap-1.5 text-xs text-brand-cyan font-mono animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>PREPARING CLASSROOM...</span>
            </div>
          </motion.div>
        )}

        {/* Main Card */}
        <div className="glass-morphic rounded-3xl p-8 border border-white/5 shadow-2xl shadow-black relative" id="register-card">
          <div className="absolute top-0 right-12 w-16 h-[1.5px] bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent"></div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-display text-white tracking-tight mb-2">
              Join <span className="text-brand-cyan neon-glow-cyan">NapPy</span> Classroom
            </h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Create your free student account to access live Google Meet sessions, downloadable notes, and structured assignments.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" id="register-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div id="form-field-fullName">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full bg-white/[0.02] border focus:bg-white/[0.04] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan transition-colors ${
                      errors.fullName ? "border-red-500/50" : "border-white/5"
                    }`}
                    placeholder="Enter your full name"
                    id="input-fullName"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.fullName}</p>
                )}
              </div>

              {/* Email Address */}
              <div id="form-field-email">
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
                    placeholder="you@example.com"
                    id="input-email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div id="form-field-mobileNumber">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className={`w-full bg-white/[0.02] border focus:bg-white/[0.04] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan transition-colors ${
                      errors.mobileNumber ? "border-red-500/50" : "border-white/5"
                    }`}
                    placeholder="Enter 10-digit number"
                    id="input-mobileNumber"
                  />
                </div>
                {errors.mobileNumber && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.mobileNumber}</p>
                )}
              </div>

              {/* College Name */}
              <div id="form-field-collegeName">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  College Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                    className={`w-full bg-white/[0.02] border focus:bg-white/[0.04] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan transition-colors ${
                      errors.collegeName ? "border-red-500/50" : "border-white/5"
                    }`}
                    placeholder="Enter your college name"
                    id="input-collegeName"
                  />
                </div>
                {errors.collegeName && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.collegeName}</p>
                )}
              </div>

              {/* USN / Student ID */}
              <div id="form-field-studentId">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  USN / Student ID
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                    <IdCard className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className={`w-full bg-white/[0.02] border focus:bg-white/[0.04] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan transition-colors ${
                      errors.studentId ? "border-red-500/50" : "border-white/5"
                    }`}
                    placeholder="Enter USN or ID number"
                    id="input-studentId"
                  />
                </div>
                {errors.studentId && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.studentId}</p>
                )}
              </div>

              {/* Branch */}
              <div id="form-field-branch">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Branch
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                    <GitBranch className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className={`w-full bg-white/[0.02] border focus:bg-white/[0.04] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan transition-colors ${
                      errors.branch ? "border-red-500/50" : "border-white/5"
                    }`}
                    placeholder="e.g. CSE, ISE, ECE"
                    id="input-branch"
                  />
                </div>
                {errors.branch && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.branch}</p>
                )}
              </div>

              {/* Semester */}
              <div id="form-field-semester">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Semester
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                    <CalendarDays className="w-4 h-4" />
                  </span>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className={`w-full bg-[#0d0d0d] border focus:bg-white/[0.04] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan transition-colors appearance-none ${
                      errors.semester ? "border-red-500/50" : "border-white/5"
                    }`}
                    id="input-semester"
                  >
                    <option value="" disabled className="bg-brand-black">Select your semester</option>
                    <option value="1" className="bg-brand-black">1st Semester</option>
                    <option value="2" className="bg-brand-black">2nd Semester</option>
                    <option value="3" className="bg-brand-black">3rd Semester</option>
                    <option value="4" className="bg-brand-black">4th Semester</option>
                    <option value="5" className="bg-brand-black">5th Semester</option>
                    <option value="6" className="bg-brand-black">6th Semester</option>
                    <option value="7" className="bg-brand-black">7th Semester</option>
                    <option value="8" className="bg-brand-black">8th Semester</option>
                  </select>
                </div>
                {errors.semester && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.semester}</p>
                )}
              </div>

              {/* Password */}
              <div id="form-field-password">
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
                    placeholder="Min 8 characters"
                    id="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors cursor-pointer"
                    id="btn-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="md:col-span-2" id="form-field-confirmPassword">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full bg-white/[0.02] border focus:bg-white/[0.04] rounded-xl py-3 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-brand-cyan transition-colors ${
                      errors.confirmPassword ? "border-red-500/50" : "border-white/5"
                    }`}
                    placeholder="Re-enter password"
                    id="input-confirmPassword"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors cursor-pointer"
                    id="btn-toggle-confirmPassword"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.confirmPassword}</p>
                )}
              </div>

            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isRegistering}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                isRegistering
                  ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/20 cursor-not-allowed"
                  : "bg-brand-cyan hover:bg-brand-cyan/95 text-brand-black hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:scale-[1.01] active:scale-[0.99]"
              }`}
              id="btn-register-submit"
            >
              {isRegistering ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-brand-cyan" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>

            {/* Switch to Login */}
            <div className="text-center pt-2">
              <span className="text-sm text-gray-400">Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  window.history.pushState({}, "", "/login");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                className="text-sm font-semibold text-brand-cyan hover:underline hover:neon-glow-cyan transition-all cursor-pointer"
                id="btn-switch-to-login"
              >
                Login
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
