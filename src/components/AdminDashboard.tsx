import React, { useState, useEffect } from "react";
import {
  Users, BookOpen, Video, FileSpreadsheet, Bell, LogOut,
  Plus, Edit2, Trash2, Search, Settings, Shield, User,
  Mail, Phone, GraduationCap, IdCard, GitBranch, CalendarDays,
  Sparkles, Calendar, Clock, AlertCircle, CheckCircle2, ChevronRight,
  Menu, X, Laptop, FileText, Layers, Award, Save, Upload, MessageSquare,
  Eye, EyeOff, Lock, ShieldCheck, KeyRound, Download, History, RefreshCw, ChevronLeft
} from "lucide-react";
import { motion } from "motion/react";

import { nappyDb } from "../services/nappyDb";
import { useToast } from "../context/ToastContext";
import ConfirmationModal from "./ConfirmationModal";

// Interfaces for our Admin Data
interface Course {
  id: string;
  name: string;
  category: string;
  enrolledStudents: number;
  status: "Active" | "Draft";
}

interface Student {
  fullName: string;
  email: string;
  mobileNumber: string;
  college: string;
  usn: string;
  branch: string;
  semester: string;
  status?: string; // "Active" or "Suspended"
  registrationDate?: string;
  password?: string;
}

interface Note {
  id: string;
  subject: string;
  module: string;
  pdfName: string;
  description: string;
  title?: string;
  uploadDate?: string;
  pdfData?: string;
}

interface LiveClass {
  id: string;
  subject: string;
  instructor: string;
  date: string;
  time: string;
  meetUrl: string;
  status: "LIVE" | "UPCOMING" | "COMPLETED";
  course?: string;
  module?: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Late";
  description?: string;
  attachmentLink?: string;
  allowResubmission?: boolean;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: "High" | "Normal" | "Low";
  date: string;
}

interface RecordedLecture {
  id: string;
  title: string;
  course: string;
  module: string;
  instructorName: string;
  duration: string;
  description: string;
  thumbnail: string;
  videoLink: string;
  uploadDate: string;
  status: "Published" | "Draft";
}

interface StudentQuery {
  id: string;
  message: string;
  studentName: string;
  studentEmail: string;
  date: string;
  time: string;
  status: "Pending" | "Resolved";
}

export default function AdminDashboard() {
  const { success, warning, error, info } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [formProgress, setFormProgress] = useState<number | null>(null);
  const [formStatusText, setFormStatusText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "students" | "notes" | "live" | "assignments" | "announcements" | "settings" | "recorded-lectures" | "queries" | "assignment-submissions" | "admin-account"
  >("overview");
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Admin Profile State loaded from localStorage or defaults
  const [adminProfile, setAdminProfile] = useState(() => {
    const credsStr = localStorage.getItem("nappy_admin_credentials");
    const profileStr = localStorage.getItem("nappy_admin_profile");
    let email = "admin@nappy.com";
    let fullName = "NapPy Administrator";
    let createdDate = "July 16, 2026";
    let lastLogin = localStorage.getItem("nappy_admin_last_login") || "July 16, 2026, 08:09 AM";

    if (credsStr) {
      try {
        const creds = JSON.parse(credsStr);
        if (creds.email) email = creds.email;
      } catch (e) {}
    }

    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        if (profile.fullName) fullName = profile.fullName;
        if (profile.createdDate) createdDate = profile.createdDate;
        if (profile.lastLogin) lastLogin = profile.lastLogin;
      } catch (e) {}
    }

    return {
      fullName,
      email,
      createdDate,
      lastLogin,
      role: "Administrator"
    };
  });

  // Admin Account Settings Form States
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmNewEmail, setConfirmNewEmail] = useState("");
  const [emailFormErrors, setEmailFormErrors] = useState<Record<string, string>>({});
  const [showEmailCurrentPassword, setShowEmailCurrentPassword] = useState(false);

  const [pwdCurrentPassword, setPwdCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdFormErrors, setPwdFormErrors] = useState<Record<string, string>>({});
  const [showPwdCurrentPassword, setShowPwdCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Search and filter states
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("");
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState("");
  const [submissionSearchQuery, setSubmissionSearchQuery] = useState("");
  const [selectedSubAssignmentFilter, setSelectedSubAssignmentFilter] = useState("");
  const [activeSubmissionForView, setActiveSubmissionForView] = useState<any | null>(null);

  // Modals & Forms State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"course" | "student" | "note" | "liveClass" | "assignment" | "announcement" | "viewStudent" | null>(null);
  const [modalAction, setModalAction] = useState<"add" | "edit" | "view">("add");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form Fields State
  const [courseForm, setCourseForm] = useState<Partial<Course>>({ name: "", category: "", enrolledStudents: 0, status: "Active" });
  const [studentForm, setStudentForm] = useState<Partial<Student>>({ fullName: "", email: "", mobileNumber: "", college: "", usn: "", branch: "", semester: "1st", status: "Active" });
  const [noteForm, setNoteForm] = useState<Partial<Note>>({ subject: "", module: "", pdfName: "", description: "" });
  const [liveClassForm, setLiveClassForm] = useState<Partial<LiveClass>>({ subject: "", instructor: "", date: "", time: "", meetUrl: "", status: "UPCOMING" });
  const [assignmentForm, setAssignmentForm] = useState<Partial<Assignment>>({ title: "", subject: "", dueDate: "", status: "Pending", allowResubmission: true });
  const [announcementForm, setAnnouncementForm] = useState<Partial<Announcement>>({ title: "", message: "", priority: "Normal" });

  // Recorded Lectures State
  const [recordedLectures, setRecordedLectures] = useState<RecordedLecture[]>([]);
  const [lectureSearchQuery, setLectureSearchQuery] = useState("");
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [lectureModalAction, setLectureModalAction] = useState<"add" | "edit" | "view">("add");
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [lectureForm, setLectureForm] = useState<Partial<RecordedLecture>>({
    title: "",
    course: "",
    module: "",
    instructorName: "",
    duration: "",
    description: "",
    thumbnail: "",
    videoLink: "",
    status: "Published",
  });

  // Student Queries State
  const [queries, setQueries] = useState<StudentQuery[]>([]);
  const [querySearchQuery, setQuerySearchQuery] = useState("");

  // Reusable Confirmation Modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    theme?: "red" | "cyan";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Load and initialize data
  useEffect(() => {
    // Admin Session Guard
    const isAdminLoggedIn = localStorage.getItem("nappy_logged_in_admin");
    if (isAdminLoggedIn !== "true") {
      window.history.pushState({}, "", "/login");
      window.dispatchEvent(new PopStateEvent("popstate"));
      return;
    }

    // 1. Initialize Courses
    const cachedCourses = localStorage.getItem("nappy_admin_courses");
    if (cachedCourses) {
      setCourses(JSON.parse(cachedCourses));
    } else {
      localStorage.setItem("nappy_admin_courses", JSON.stringify([]));
      setCourses([]);
    }

    // 2. Initialize Students
    const cachedStudents = localStorage.getItem("nappy_students");
    const parsedStudents = cachedStudents ? JSON.parse(cachedStudents) : [];
    // Map with status and date fallbacks, sorted newest first (using registrationDate)
    const sanitized = parsedStudents.map((s: any) => ({
      ...s,
      status: s.status || "Active",
      registrationDate: s.registrationDate || new Date("2026-07-13T12:00:00.000Z").toISOString()
    })).sort((a: any, b: any) => {
      const dateA = new Date(a.registrationDate).getTime();
      const dateB = new Date(b.registrationDate).getTime();
      return dateB - dateA;
    });
    setStudents(sanitized);

    // 3. Initialize Notes
    const cachedNotes = localStorage.getItem("nappy_admin_notes");
    if (cachedNotes) {
      setNotes(JSON.parse(cachedNotes));
    } else {
      localStorage.setItem("nappy_admin_notes", JSON.stringify([]));
      setNotes([]);
    }

    // 4. Initialize Live Classes
    const cachedLive = localStorage.getItem("nappy_admin_live_classes");
    if (cachedLive) {
      setLiveClasses(JSON.parse(cachedLive));
    } else {
      localStorage.setItem("nappy_admin_live_classes", JSON.stringify([]));
      setLiveClasses([]);
    }

    // 5. Initialize Assignments
    const cachedAssigns = nappyDb.getAssignments();
    setAssignments(cachedAssigns);

    // 6. Initialize Announcements
    const cachedAnnouncements = localStorage.getItem("nappy_announcements");
    if (cachedAnnouncements) {
      setAnnouncements(JSON.parse(cachedAnnouncements));
    } else {
      localStorage.setItem("nappy_announcements", JSON.stringify([]));
      setAnnouncements([]);
    }

    // 7. Initialize Recorded Lectures
    const cachedLectures = localStorage.getItem("nappy_recorded_lectures");
    if (cachedLectures) {
      setRecordedLectures(JSON.parse(cachedLectures));
    } else {
      localStorage.setItem("nappy_recorded_lectures", JSON.stringify([]));
      setRecordedLectures([]);
    }

    // 8. Initialize Student Queries
    const cachedQueries = localStorage.getItem("nappy_student_queries");
    if (cachedQueries) {
      setQueries(JSON.parse(cachedQueries));
    } else {
      localStorage.setItem("nappy_student_queries", JSON.stringify([]));
      setQueries([]);
    }

    // 9. Initialize Assignment Submissions
    const cachedSubs = localStorage.getItem("nappy_assignment_submissions");
    if (cachedSubs) {
      setSubmissions(JSON.parse(cachedSubs));
    } else {
      localStorage.setItem("nappy_assignment_submissions", JSON.stringify([]));
      setSubmissions([]);
    }

    const loadAllData = () => {
      const q = localStorage.getItem("nappy_student_queries");
      if (q) setQueries(JSON.parse(q));
      const c = localStorage.getItem("nappy_admin_courses");
      if (c) setCourses(JSON.parse(c));
      const s = localStorage.getItem("nappy_students");
      if (s) setStudents(JSON.parse(s));
      const n = localStorage.getItem("nappy_admin_notes");
      if (n) setNotes(JSON.parse(n));
      const l = localStorage.getItem("nappy_admin_live_classes");
      if (l) setLiveClasses(JSON.parse(l));
      const a = localStorage.getItem("nappy_admin_assignments");
      if (a) setAssignments(JSON.parse(a));
      const ann = localStorage.getItem("nappy_announcements");
      if (ann) setAnnouncements(JSON.parse(ann));
      const lec = localStorage.getItem("nappy_recorded_lectures");
      if (lec) setRecordedLectures(JSON.parse(lec));
      const subs = localStorage.getItem("nappy_assignment_submissions");
      if (subs) setSubmissions(JSON.parse(subs));
    };

    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: string; scrollId?: string }>;
      if (customEvent.detail && customEvent.detail.tab) {
        const targetTab = customEvent.detail.tab;
        const validTabs = ["overview", "courses", "students", "notes", "live", "assignments", "announcements", "settings", "recorded-lectures", "queries", "assignment-submissions", "admin-account"];
        if (validTabs.includes(targetTab)) {
          setActiveTab(targetTab as any);
        }
      }
    };

    window.addEventListener("nappy_navigate_tab", handleNavigate);
    window.addEventListener("nappy_db_update", loadAllData);

    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => {
      window.removeEventListener("nappy_navigate_tab", handleNavigate);
      window.removeEventListener("nappy_db_update", loadAllData);
      clearTimeout(loadingTimeout);
    };
  }, []);

  // Helper sync triggers
  const handleResolveQuery = (queryId: string) => {
    const updated = queries.map(q => q.id === queryId ? { ...q, status: "Resolved" as const } : q);
    setQueries(updated);
    localStorage.setItem("nappy_student_queries", JSON.stringify(updated));
    window.dispatchEvent(new Event("nappy_db_update"));
  };

  const handleDeleteQuery = (queryId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Student Query",
      description: "Are you sure you want to permanently delete this student support ticket? This action is destructive and cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      theme: "red",
      onConfirm: () => {
        const updated = queries.filter(q => q.id !== queryId);
        setQueries(updated);
        localStorage.setItem("nappy_student_queries", JSON.stringify(updated));
        window.dispatchEvent(new Event("nappy_db_update"));
      }
    });
  };

  // SUBMISSION SYSTEM HANDLERS
  const handleToggleReview = (id: string) => {
    const updated = submissions.map(s => {
      if (s.id === id) {
        return { ...s, status: (s.status === "Reviewed" ? "Submitted" : "Reviewed") as "Submitted" | "Reviewed" };
      }
      return s;
    });
    setSubmissions(updated);
    nappyDb.saveAssignmentSubmissions(updated);
  };

  const handleDownloadSubmission = (sub: any) => {
    const blob = new Blob([sub.fileData || `Abstract payload representation of: ${sub.fileName}\nSubmitted by: ${sub.studentName} (${sub.studentUsn})\nEmail: ${sub.studentEmail || "N/A"}\nBranch: ${sub.studentBranch || "N/A"}\nSemester: ${sub.studentSemester || "N/A"}\nComments: ${sub.comments || "No comments"}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sub.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteSubmission = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Student Submission",
      description: "Are you sure you want to permanently delete this student assignment submission? This action will remove the submission record and grades from databases.",
      confirmText: "Delete",
      cancelText: "Cancel",
      theme: "red",
      onConfirm: () => {
        const submission = submissions.find(s => s.id === id);
        const updated = submissions.filter(s => s.id !== id);
        setSubmissions(updated);
        nappyDb.saveAssignmentSubmissions(updated);

        if (submission) {
          const storedAssigns = localStorage.getItem("nappy_submitted_assigns");
          if (storedAssigns) {
            try {
              const list = JSON.parse(storedAssigns) as string[];
              const filtered = list.filter(item => item !== submission.assignmentId);
              localStorage.setItem("nappy_submitted_assigns", JSON.stringify(filtered));
              window.dispatchEvent(new Event("nappy_db_update"));
            } catch (e) {
              console.error(e);
            }
          }
        }
      }
    });
  };

  const syncAndSetRecordedLectures = (updated: RecordedLecture[]) => {
    setRecordedLectures(updated);
    nappyDb.saveRecordedLectures(updated);
  };

  const syncAndSetCourses = (updated: Course[]) => {
    setCourses(updated);
    localStorage.setItem("nappy_admin_courses", JSON.stringify(updated));
    window.dispatchEvent(new Event("nappy_db_update"));
  };

  const syncAndSetStudents = (updated: Student[]) => {
    const sorted = [...updated].sort((a, b) => {
      const dateA = new Date(a.registrationDate || 0).getTime();
      const dateB = new Date(b.registrationDate || 0).getTime();
      return dateB - dateA;
    });
    setStudents(sorted);
    localStorage.setItem("nappy_students", JSON.stringify(sorted));
    window.dispatchEvent(new Event("nappy_db_update"));
  };

  const syncAndSetNotes = (updated: Note[]) => {
    setNotes(updated);
    nappyDb.saveNotes(updated);
  };

  const syncAndSetLiveClasses = (updated: LiveClass[]) => {
    setLiveClasses(updated);
    nappyDb.saveLiveClasses(updated);
  };

  const syncAndSetAssignments = (updated: Assignment[]) => {
    setAssignments(updated);
    nappyDb.saveAssignments(updated);
  };

  const syncAndSetAnnouncements = (updated: Announcement[]) => {
    setAnnouncements(updated);
    nappyDb.saveAnnouncements(updated);
  };

  const handleLogout = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Admin Logout",
      description: "Are you sure you want to sign out from your NapPy Admin Dashboard session? You will need to log in again to manage student portals.",
      confirmText: "Sign Out",
      cancelText: "Stay Connected",
      theme: "cyan",
      onConfirm: () => {
        localStorage.removeItem("nappy_logged_in_admin");
        localStorage.removeItem("nappy_admin_profile");
        window.history.pushState({}, "", "/login");
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    });
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "Empty", color: "bg-gray-700/50" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1;

    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { score, label: "Medium", color: "bg-yellow-500" };
    return { score, label: "Strong", color: "bg-green-500" };
  };

  const handleChangeEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    // Load admin credentials
    const credsStr = localStorage.getItem("nappy_admin_credentials");
    let adminPassword = "admin123";
    let adminEmail = "admin@nappy.com";
    if (credsStr) {
      try {
        const creds = JSON.parse(credsStr);
        if (creds.password) adminPassword = creds.password;
        if (creds.email) adminEmail = creds.email;
      } catch (err) {}
    }

    // 1. Verify Current Password
    if (!emailCurrentPassword) {
      errors.currentPassword = "Current password is required";
    } else if (emailCurrentPassword !== adminPassword) {
      errors.currentPassword = "Incorrect current password";
    }

    // 2. Validate New Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanNewEmail = newEmail.toLowerCase().trim();
    if (!newEmail) {
      errors.newEmail = "New email is required";
    } else if (!emailRegex.test(cleanNewEmail)) {
      errors.newEmail = "Please enter a valid email address";
    } else if (cleanNewEmail === adminEmail.toLowerCase().trim()) {
      errors.newEmail = "New email must be different from current email";
    }

    // 3. Confirm New Email
    if (!confirmNewEmail) {
      errors.confirmNewEmail = "Please confirm your new email";
    } else if (confirmNewEmail.toLowerCase().trim() !== cleanNewEmail) {
      errors.confirmNewEmail = "Emails do not match";
    }

    // Check if new email already exists in students database
    const studentExist = students.some(
      (s) => s.email.toLowerCase().trim() === cleanNewEmail
    );
    if (studentExist) {
      errors.newEmail = "Email already exists (used by a student)";
    }

    if (Object.keys(errors).length > 0) {
      setEmailFormErrors(errors);
      error("Update Failed", "Please correct the errors in the form.");
      return;
    }

    setEmailFormErrors({});

    // Success! Update credentials
    const updatedCreds = {
      email: cleanNewEmail,
      password: adminPassword,
    };
    localStorage.setItem("nappy_admin_credentials", JSON.stringify(updatedCreds));

    // Update profile
    const updatedProfile = {
      ...adminProfile,
      email: cleanNewEmail,
    };
    localStorage.setItem("nappy_admin_profile", JSON.stringify(updatedProfile));

    setAdminProfile(updatedProfile);

    // Reset fields
    setEmailCurrentPassword("");
    setNewEmail("");
    setConfirmNewEmail("");

    success("Email Updated", "Admin login email has been updated successfully.");

    // Auto logout & Redirect
    setTimeout(() => {
      localStorage.removeItem("nappy_logged_in_admin");
      localStorage.removeItem("nappy_admin_profile");
      window.history.pushState({}, "", "/login");
      window.dispatchEvent(new PopStateEvent("popstate"));
      info("Session Ended", "Please sign in again with your new credentials.");
    }, 1500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    // Load admin credentials
    const credsStr = localStorage.getItem("nappy_admin_credentials");
    let adminPassword = "admin123";
    let adminEmail = "admin@nappy.com";
    if (credsStr) {
      try {
        const creds = JSON.parse(credsStr);
        if (creds.password) adminPassword = creds.password;
        if (creds.email) adminEmail = creds.email;
      } catch (err) {}
    }

    // 1. Verify Current Password
    if (!pwdCurrentPassword) {
      errors.currentPassword = "Current password is required";
    } else if (pwdCurrentPassword !== adminPassword) {
      errors.currentPassword = "Incorrect current password";
    }

    // 2. Validate New Password
    if (!newPassword) {
      errors.newPassword = "New password is required";
    } else {
      // Validate requirements
      if (newPassword.length < 8) {
        errors.newPassword = "Minimum 8 characters required";
      } else if (!/[A-Z]/.test(newPassword)) {
        errors.newPassword = "Must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(newPassword)) {
        errors.newPassword = "Must contain at least one lowercase letter";
      } else if (!/\d/.test(newPassword)) {
        errors.newPassword = "Must contain at least one number";
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        errors.newPassword = "Must contain at least one special character";
      } else if (newPassword === adminPassword) {
        errors.newPassword = "New password must be different from current password";
      }
    }

    // 3. Confirm New Password
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPwdFormErrors(errors);
      error("Update Failed", "Please correct the errors in the form.");
      return;
    }

    setPwdFormErrors({});

    // Success! Update credentials
    const updatedCreds = {
      email: adminEmail,
      password: newPassword,
    };
    localStorage.setItem("nappy_admin_credentials", JSON.stringify(updatedCreds));

    // Reset fields
    setPwdCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    success("Password Updated", "Admin login password has been changed successfully.");

    // Auto logout & Redirect
    setTimeout(() => {
      localStorage.removeItem("nappy_logged_in_admin");
      localStorage.removeItem("nappy_admin_profile");
      window.history.pushState({}, "", "/login");
      window.dispatchEvent(new PopStateEvent("popstate"));
      info("Session Ended", "Please sign in again with your new credentials.");
    }, 1500);
  };

  // Recorded Lectures CRUD Handlers
  const handleAddLectureClick = () => {
    setLectureForm({
      title: "",
      course: "",
      module: "",
      instructorName: "",
      duration: "",
      description: "",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
      videoLink: "",
      status: "Published",
    });
    setLectureModalAction("add");
    setSelectedLectureId(null);
    setIsLectureModalOpen(true);
  };

  const handleEditLectureClick = (lec: RecordedLecture) => {
    setLectureForm({ ...lec });
    setLectureModalAction("edit");
    setSelectedLectureId(lec.id);
    setIsLectureModalOpen(true);
  };

  const handleTogglePublish = (id: string) => {
    const updated = recordedLectures.map(l => {
      if (l.id === id) {
        const nextStatus = l.status === "Published" ? "Draft" : "Published";
        return { ...l, status: nextStatus };
      }
      return l;
    });
    syncAndSetRecordedLectures(updated);
  };

  const handleDeleteLecture = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Recorded Lecture",
      description: "Are you sure you want to permanently delete this recorded lecture? This action will remove the lecture stream and content indexes from student lists.",
      confirmText: "Delete",
      cancelText: "Cancel",
      theme: "red",
      onConfirm: () => {
        const updated = recordedLectures.filter(l => l.id !== id);
        syncAndSetRecordedLectures(updated);
        success("Lecture Deleted", "The recorded lecture video and stream indexing have been deleted.");
      }
    });
  };

  const handleLectureFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    simulateFormSubmission(() => {
      if (lectureModalAction === "add") {
        const newLec: RecordedLecture = {
          id: `lecture-${Date.now()}`,
          title: lectureForm.title || "Untitled Lecture",
          course: lectureForm.course || "General Course",
          module: lectureForm.module || "General Module",
          instructorName: lectureForm.instructorName || "Unknown Instructor",
          duration: lectureForm.duration || "0m",
          description: lectureForm.description || "",
          thumbnail: lectureForm.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
          videoLink: lectureForm.videoLink || "",
          uploadDate: new Date().toISOString(),
          status: lectureForm.status || "Published",
        };
        syncAndSetRecordedLectures([...recordedLectures, newLec]);
        success("Lecture Uploaded", `Recorded Lecture "${newLec.title}" has been successfully uploaded and processed.`);
      } else if (lectureModalAction === "edit" && selectedLectureId) {
        const updated = recordedLectures.map(l => {
          if (l.id === selectedLectureId) {
            return {
              ...l,
              ...lectureForm,
              title: lectureForm.title || l.title,
              course: lectureForm.course || l.course,
              module: lectureForm.module || l.module,
              instructorName: lectureForm.instructorName || l.instructorName,
              duration: lectureForm.duration || l.duration,
              description: lectureForm.description || l.description,
              thumbnail: lectureForm.thumbnail || l.thumbnail,
              videoLink: lectureForm.videoLink || l.videoLink,
              status: lectureForm.status || l.status,
            } as RecordedLecture;
          }
          return l;
        });
        syncAndSetRecordedLectures(updated);
        success("Lecture Updated", "Recorded lecture details and video stream links have been successfully updated.");
      }
      setIsLectureModalOpen(false);
    }, "Uploading recorded lecture stream & indexing chapters...");
  };

  // ---------------- CRUD Actions ----------------

  // Delete Handlers
  const handleDelete = (type: "course" | "student" | "note" | "liveClass" | "assignment" | "announcement", idOrEmail: string) => {
    const typeLabel = {
      course: "Course Handbook",
      student: "Student Enrollment",
      note: "Study Note",
      liveClass: "Live Class Session",
      assignment: "Assignment Task",
      announcement: "Broadcast Announcement",
    }[type];

    setConfirmDialog({
      isOpen: true,
      title: `Delete ${typeLabel}`,
      description: `Are you sure you want to permanently delete this ${typeLabel}? This action cannot be undone and will update related student databases instantly.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      theme: "red",
      onConfirm: () => {
        if (type === "course") {
          syncAndSetCourses(courses.filter(c => c.id !== idOrEmail));
          info("Course Deleted", "Course was successfully removed from NapPy lists.");
        } else if (type === "student") {
          syncAndSetStudents(students.filter(s => s.email !== idOrEmail));
          info("Student Deleted", "Student enrollment records have been removed.");
        } else if (type === "note") {
          syncAndSetNotes(notes.filter(n => n.id !== idOrEmail));
          success("Study Note Deleted", "Curated study note PDF resource has been removed.");
        } else if (type === "liveClass") {
          syncAndSetLiveClasses(liveClasses.filter(l => l.id !== idOrEmail));
          success("Live Class Cancelled", "Scheduled Live classroom session has been cancelled.");
        } else if (type === "assignment") {
          syncAndSetAssignments(assignments.filter(a => a.id !== idOrEmail));
          success("Assignment Deleted", "The assignment was deleted and student tasks updated.");
        } else if (type === "announcement") {
          syncAndSetAnnouncements(announcements.filter(a => a.id !== idOrEmail));
          info("Announcement Removed", "The announcement broadcast has been retracted.");
        }
      }
    });
  };

  // Open Add Modals
  const openAddModal = (type: "course" | "student" | "note" | "liveClass" | "assignment" | "announcement") => {
    setModalType(type);
    setModalAction("add");
    setSelectedId(null);
    
    // Reset Forms
    if (type === "course") setCourseForm({ name: "", category: "Programming", enrolledStudents: 0, status: "Active" });
    if (type === "student") setStudentForm({ fullName: "", email: "", mobileNumber: "", college: "", usn: "", branch: "", semester: "1st", status: "Active" });
    if (type === "note") setNoteForm({ subject: "", module: "Module 1", pdfName: "", description: "", title: "", pdfData: "" });
    if (type === "liveClass") setLiveClassForm({ subject: "", instructor: "", date: "Today", time: "", meetUrl: "https://meet.google.com/", status: "UPCOMING", course: "", module: "" });
    if (type === "assignment") setAssignmentForm({ title: "", subject: "", dueDate: "", status: "Pending", description: "", attachmentLink: "", allowResubmission: true });
    if (type === "announcement") setAnnouncementForm({ title: "", message: "", priority: "Normal" });

    setIsModalOpen(true);
  };

  // Reset Form Handlers (Confirmation required)
  const handleResetForm = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Reset Admin Form",
      description: "Are you sure you want to clear/reset all current form inputs? Any unsaved progress will be permanently lost.",
      confirmText: "Reset Form",
      cancelText: "Keep Form",
      theme: "red",
      onConfirm: () => {
        if (modalType === "course") setCourseForm({ name: "", category: "Programming", enrolledStudents: 0, status: "Active" });
        if (modalType === "student") setStudentForm({ fullName: "", email: "", mobileNumber: "", college: "", usn: "", branch: "", semester: "1st", status: "Active" });
        if (modalType === "note") setNoteForm({ subject: "", module: "Module 1", pdfName: "", description: "", title: "", pdfData: "" });
        if (modalType === "liveClass") setLiveClassForm({ subject: "", instructor: "", date: "Today", time: "", meetUrl: "https://meet.google.com/", status: "UPCOMING", course: "", module: "" });
        if (modalType === "assignment") setAssignmentForm({ title: "", subject: "", dueDate: "", status: "Pending", description: "", attachmentLink: "", allowResubmission: true });
        if (modalType === "announcement") setAnnouncementForm({ title: "", message: "", priority: "Normal" });
        info("Form Reset Successful", "All inputs on the form have been reverted to default values.");
      }
    });
  };

  const handleResetLectureForm = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Reset Lecture Form",
      description: "Are you sure you want to clear/reset all fields in the recorded lecture form?",
      confirmText: "Reset Form",
      cancelText: "Keep Form",
      theme: "red",
      onConfirm: () => {
        setLectureForm({
          title: "",
          course: "",
          module: "",
          instructorName: "",
          duration: "",
          description: "",
          thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
          videoLink: "",
          status: "Published",
        });
        info("Lecture Form Reset", "Recorded lecture entry fields have been reverted.");
      }
    });
  };

  // Open Edit Modals
  const openEditModal = (type: "course" | "student" | "note" | "liveClass" | "assignment" | "announcement", item: any) => {
    setModalType(type);
    setModalAction("edit");
    
    if (type === "course") {
      setSelectedId(item.id);
      setCourseForm(item);
    } else if (type === "student") {
      setSelectedId(item.email);
      setStudentForm(item);
    } else if (type === "note") {
      setSelectedId(item.id);
      setNoteForm(item);
    } else if (type === "liveClass") {
      setSelectedId(item.id);
      setLiveClassForm(item);
    } else if (type === "assignment") {
      setSelectedId(item.id);
      setAssignmentForm(item);
    } else if (type === "announcement") {
      setSelectedId(item.id);
      setAnnouncementForm(item);
    }

    setIsModalOpen(true);
  };

  // View Student Modal
  const openViewStudentModal = (student: Student) => {
    setModalType("viewStudent");
    setModalAction("view");
    setStudentForm(student);
    setIsModalOpen(true);
  };

  // Submit Handler for Forms
  const simulateFormSubmission = (onComplete: () => void, statusText: string) => {
    setFormStatusText(statusText);
    setFormProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 12;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setFormProgress(null);
          setFormStatusText("");
          onComplete();
        }, 500);
      }
      setFormProgress(progress);
    }, 100);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let statusMsg = "Uploading metadata and syncing database...";
    if (modalType === "note") {
      statusMsg = "Uploading study notes & scanning digital signature...";
    } else if (modalType === "assignment") {
      statusMsg = "Publishing assignment and alerting class groups...";
    } else if (modalType === "liveClass") {
      statusMsg = "Initializing classroom Meet room endpoint...";
    } else if (modalType === "announcement") {
      statusMsg = "Broadcasting announcement to student body...";
    }

    simulateFormSubmission(() => {
      if (modalType === "course") {
        if (modalAction === "add") {
          const newCourse: Course = {
            id: `c-${Date.now()}`,
            name: courseForm.name || "Untitled Course",
            category: courseForm.category || "Programming",
            enrolledStudents: Number(courseForm.enrolledStudents) || 0,
            status: courseForm.status || "Active"
          };
          syncAndSetCourses([...courses, newCourse]);
          success("Course Created", `Course "${newCourse.name}" has been successfully added.`);
        } else {
          syncAndSetCourses(courses.map(c => c.id === selectedId ? { ...c, ...courseForm } as Course : c));
          success("Course Updated", "Course details have been successfully saved.");
        }
      } 
      
      else if (modalType === "student") {
        if (modalAction === "add") {
          const newStudent: Student = {
            fullName: studentForm.fullName || "John Doe",
            email: studentForm.email || "john@doe.com",
            mobileNumber: studentForm.mobileNumber || "",
            college: studentForm.college || "",
            usn: studentForm.usn || "",
            branch: studentForm.branch || "",
            semester: studentForm.semester || "1st",
            status: studentForm.status || "Active",
            registrationDate: new Date().toISOString()
          };
          syncAndSetStudents([...students, newStudent]);
          success("Student Enrolled", `Student "${newStudent.fullName}" enrolled successfully.`);
        } else {
          syncAndSetStudents(students.map(s => s.email === selectedId ? { ...s, ...studentForm } as Student : s));
          success("Student Profile Updated", "Student profile details updated successfully.");
        }
      } 
      
      else if (modalType === "note") {
        if (modalAction === "add") {
          const newNote: Note = {
            id: `n-${Date.now()}`,
            subject: noteForm.subject || "",
            module: noteForm.module || "Module 1",
            pdfName: noteForm.pdfName || "document.pdf",
            description: noteForm.description || "",
            title: noteForm.title || noteForm.subject || "",
            uploadDate: new Date().toISOString(),
            pdfData: noteForm.pdfData || ""
          };
          syncAndSetNotes([...notes, newNote]);
          success("Study Note Uploaded", `Study Note "${newNote.title}" uploaded successfully.`);
        } else {
          syncAndSetNotes(notes.map(n => n.id === selectedId ? { ...n, ...noteForm } as Note : n));
          success("Study Note Updated", "Study note details have been updated successfully.");
        }
      } 
      
      else if (modalType === "liveClass") {
        if (modalAction === "add") {
          const newLive: LiveClass = {
            id: `l-${Date.now()}`,
            subject: liveClassForm.subject || "",
            instructor: liveClassForm.instructor || "",
            date: liveClassForm.date || "Today",
            time: liveClassForm.time || "",
            meetUrl: liveClassForm.meetUrl || "https://meet.google.com/",
            status: liveClassForm.status || "UPCOMING",
            course: liveClassForm.course || "",
            module: liveClassForm.module || ""
          };
          syncAndSetLiveClasses([...liveClasses, newLive]);
          success("Live Class Created", `Live Class for "${newLive.subject}" created successfully.`);
        } else {
          syncAndSetLiveClasses(liveClasses.map(l => l.id === selectedId ? { ...l, ...liveClassForm } as LiveClass : l));
          success("Live Class Updated", "Live class scheduling details updated successfully.");
        }
      } 
      
      else if (modalType === "assignment") {
        if (modalAction === "add") {
          const newAssign: Assignment = {
            id: `a-${Date.now()}`,
            title: assignmentForm.title || "",
            subject: assignmentForm.subject || "",
            dueDate: assignmentForm.dueDate || "",
            status: assignmentForm.status || "Pending",
            description: assignmentForm.description || "",
            attachmentLink: assignmentForm.attachmentLink || "",
            allowResubmission: assignmentForm.allowResubmission !== false
          };
          syncAndSetAssignments([...assignments, newAssign]);
          success("Assignment Published", `Assignment "${newAssign.title}" published successfully.`);
        } else {
          syncAndSetAssignments(assignments.map(a => a.id === selectedId ? { ...a, ...assignmentForm } as Assignment : a));
          success("Assignment Updated", "Assignment details have been updated successfully.");
        }
      } 
      
      else if (modalType === "announcement") {
        if (modalAction === "add") {
          const newAnn: Announcement = {
            id: `an-${Date.now()}`,
            title: announcementForm.title || "",
            message: announcementForm.message || "",
            priority: announcementForm.priority || "Normal",
            date: new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
          };
          syncAndSetAnnouncements([...announcements, newAnn]);
          success("Announcement Published", `Announcement "${newAnn.title}" published successfully.`);
        } else {
          syncAndSetAnnouncements(announcements.map(a => a.id === selectedId ? { ...a, ...announcementForm } as Announcement : a));
          success("Announcement Updated", "Announcement details have been updated successfully.");
        }
      }

      setIsModalOpen(false);
    }, statusMsg);
  };

  // Filter students based on search query, branch and semester filters
  const filteredStudents = students.filter(s => {
    // 1. Search Query (Name, Email, USN)
    const q = studentSearchQuery.toLowerCase().trim();
    if (q) {
      const matchSearch = (
        (s.fullName || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.usn || "").toLowerCase().includes(q)
      );
      if (!matchSearch) return false;
    }

    // 2. Branch Filter
    if (selectedBranchFilter && s.branch !== selectedBranchFilter) {
      return false;
    }

    // 3. Semester Filter
    if (selectedSemesterFilter) {
      // Normalize comparison (e.g. "4th" or "4th Semester" or "4")
      const studentSem = (s.semester || "").toLowerCase().replace("semester", "").trim();
      const filterSem = selectedSemesterFilter.toLowerCase().replace("semester", "").trim();
      if (studentSem !== filterSem) {
        return false;
      }
    }

    return true;
  });

  // Unique branches for the filter dropdown
  const uniqueBranches = Array.from(new Set(students.map(s => s.branch).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-black text-gray-200 flex flex-col lg:flex-row relative">
        <div className="fixed inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0"></div>
        
        {/* Sidebar Skeleton */}
        <aside className="hidden lg:flex w-72 shrink-0 border-r border-white/5 bg-[#0b0c10] flex-col p-6 space-y-8 h-screen sticky top-0 animate-pulse">
          <div className="flex items-center gap-3 pb-6 border-b border-white/5">
            <div className="w-8 h-8 rounded-xl bg-white/10 shrink-0"></div>
            <div className="h-5 bg-white/10 rounded-full w-32 font-display font-bold"></div>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="h-10 bg-white/5 rounded-xl w-full"></div>
            <div className="h-10 bg-white/5 rounded-xl w-full"></div>
            <div className="h-10 bg-white/5 rounded-xl w-full"></div>
            <div className="h-10 bg-white/5 rounded-xl w-full"></div>
            <div className="h-10 bg-white/5 rounded-xl w-full"></div>
            <div className="h-10 bg-white/5 rounded-xl w-full"></div>
          </div>

          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-white/10 rounded-full w-2/3"></div>
              <div className="h-2 bg-white/10 rounded-full w-1/2"></div>
            </div>
          </div>
        </aside>

        {/* Main Content Area Skeleton */}
        <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto h-screen animate-pulse">
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <div className="space-y-2">
              <div className="h-6 bg-white/10 rounded-full w-48"></div>
              <div className="h-3 bg-white/10 rounded-full w-80"></div>
            </div>
            <div className="w-32 h-10 bg-white/5 rounded-xl"></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#0b0c10] border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-white/10 rounded-full w-1/3"></div>
                  <div className="w-8 h-8 rounded-lg bg-white/5"></div>
                </div>
                <div className="h-7 bg-white/10 rounded-full w-1/2"></div>
              </div>
            ))}
          </div>

          {/* Large Card skeleton */}
          <div className="p-6 rounded-3xl bg-[#0b0c10] border border-white/5 space-y-4">
            <div className="h-5 bg-white/10 rounded-full w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-12 bg-white/5 rounded-xl w-full"></div>
              <div className="h-12 bg-white/5 rounded-xl w-full"></div>
              <div className="h-12 bg-white/5 rounded-xl w-full"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-gray-200 selection:bg-brand-cyan/30 selection:text-white flex flex-col lg:flex-row relative animate-fade-in">
      <div className="fixed inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0"></div>

      {/* Mobile Top Header */}
      <div className="lg:hidden w-full bg-brand-black/90 border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-cyan" />
          <span className="font-display font-bold text-white tracking-wider">NapPy <span className="text-brand-cyan">Admin</span></span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 9. Navigation Sidebar */}
      <aside className={`w-full lg:w-72 shrink-0 border-r border-white/5 bg-brand-black lg:sticky lg:top-0 h-screen z-30 flex flex-col justify-between transition-all duration-300 ${
        isMobileMenuOpen ? "fixed top-[72px] left-0 h-[calc(100vh-72px)] bg-brand-black/95 backdrop-blur-xl" : "hidden lg:flex"
      }`}>
        <div className="p-6 space-y-8 flex-1 overflow-y-auto scrollbar-thin">
          
          {/* Admin Header Title */}
          <div className="hidden lg:flex items-center gap-3 pb-6 border-b border-white/5">
            <div className="p-2 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white tracking-wide">NapPy Console</h2>
              <span className="text-[10px] font-mono text-brand-cyan uppercase tracking-wider font-semibold">Super Admin Desk</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1" id="admin-sidebar-nav">
            <button
              onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "overview" 
                  ? "bg-brand-cyan/10 text-brand-cyan font-semibold border-l-2 border-brand-cyan" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => { setActiveTab("courses"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "courses" 
                  ? "bg-brand-cyan/10 text-brand-cyan font-semibold border-l-2 border-brand-cyan" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>Courses</span>
            </button>

            <button
              onClick={() => { setActiveTab("students"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "students" 
                  ? "bg-brand-cyan/10 text-brand-cyan font-semibold border-l-2 border-brand-cyan" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Students</span>
            </button>

            <button
              onClick={() => { setActiveTab("notes"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "notes" 
                  ? "bg-brand-cyan/10 text-brand-cyan font-semibold border-l-2 border-brand-cyan" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Study Notes</span>
            </button>

            <button
              onClick={() => { setActiveTab("live"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "live" 
                  ? "bg-brand-cyan/10 text-brand-cyan font-semibold border-l-2 border-brand-cyan" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Live Classes</span>
            </button>

            <button
              onClick={() => { setActiveTab("recorded-lectures"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "recorded-lectures" 
                  ? "bg-brand-cyan/10 text-brand-cyan font-semibold border-l-2 border-brand-cyan" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
              }`}
              id="admin-sidebar-btn-recorded-lectures"
            >
              <Video className="w-4 h-4 text-brand-cyan" />
              <span>Recorded Lectures</span>
            </button>

            <button
              onClick={() => { setActiveTab("assignments"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "assignments" 
                  ? "bg-brand-cyan/10 text-brand-cyan font-semibold border-l-2 border-brand-cyan" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Assignments</span>
            </button>

            <button
              onClick={() => { setActiveTab("assignment-submissions"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "assignment-submissions" 
                  ? "bg-brand-cyan/10 text-brand-cyan font-semibold border-l-2 border-brand-cyan" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
              }`}
              id="admin-sidebar-btn-assignment-submissions"
            >
              <FileText className="w-4 h-4 text-brand-cyan" />
              <span>Assignment Submissions</span>
              {submissions.filter(s => s.status === "Submitted").length > 0 && (
                <span className="ml-auto px-1.5 py-0.5 bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 rounded-md text-[9px] font-bold animate-pulse">
                  {submissions.filter(s => s.status === "Submitted").length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab("announcements"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "announcements" 
                  ? "bg-brand-cyan/10 text-brand-cyan font-semibold border-l-2 border-brand-cyan" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Announcements</span>
            </button>

            <button
              onClick={() => { setActiveTab("queries"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "queries" 
                  ? "bg-brand-cyan/10 text-brand-cyan font-semibold border-l-2 border-brand-cyan" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-brand-cyan" />
              <span>Student Queries</span>
              {queries.filter(q => q.status === "Pending").length > 0 && (
                <span className="ml-auto px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md text-[9px] font-bold">
                  {queries.filter(q => q.status === "Pending").length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab("settings"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "settings" 
                  ? "bg-brand-cyan/10 text-brand-cyan font-semibold border-l-2 border-brand-cyan" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              id="admin-sidebar-btn-admin-account"
              onClick={() => { setActiveTab("admin-account"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "admin-account" 
                  ? "bg-brand-cyan/10 text-brand-cyan font-semibold border-l-2 border-brand-cyan" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <KeyRound className="w-4 h-4 text-brand-cyan" />
              <span>⚙ Admin Account</span>
            </button>
          </nav>
        </div>

        {/* 8. Profile Block (Logout button integrated) */}
        <div className="p-6 border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan font-bold text-sm">
              {adminProfile.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "AD"}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{adminProfile.fullName}</p>
              <p className="text-[10px] text-gray-500">{adminProfile.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Sign Out Desk</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Frame */}
      <main className="flex-1 min-h-screen p-6 sm:p-8 lg:p-10 overflow-y-auto space-y-8 relative z-10 lg:pt-10">

        {/* ----------------- TAB: OVERVIEW ----------------- */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn" id="admin-panel-overview">
            
            {/* Header Title */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full px-3 py-1 mb-3 text-[10px] font-bold text-brand-cyan uppercase tracking-widest">
                  <Shield className="w-3 h-3" />
                  <span>WORKSPACE BENCH</span>
                </div>
                <h1 className="text-3xl font-bold font-display text-white tracking-tight">
                  Admin <span className="text-brand-cyan neon-glow-cyan">Control Dashboard</span>
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Manage syllabus courses, view active registered students, post announcements, and orchestrate live classes.
                </p>
              </div>

              {/* Server Clock Metric */}
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-3">
                <Clock className="w-5 h-5 text-brand-cyan animate-pulse" />
                <div className="text-xs">
                  <span className="text-gray-500 font-mono">SYS_CLOCK: </span>
                  <span className="text-white font-mono font-bold">12:41 PM</span>
                </div>
              </div>
            </div>

            {/* 1. Statistics Cards Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6" id="overview-stats-grid">
              
              {/* Stat 1: Total Students */}
              <div className="group glass-morphic border border-white/5 rounded-2xl p-6 hover:border-brand-cyan/20 hover:scale-[1.02] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Total Students</p>
                    <p className="text-3xl font-bold font-display text-white mt-2">{students.length}</p>
                    <p className="text-[11px] text-brand-cyan mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-brand-cyan rounded-full animate-ping"></span>
                      Realtime Register
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan/20 transition-all">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Stat 2: Total Courses */}
              <div className="group glass-morphic border border-white/5 rounded-2xl p-6 hover:border-brand-cyan/20 hover:scale-[1.02] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Total Courses</p>
                    <p className="text-3xl font-bold font-display text-white mt-2">{courses.length}</p>
                    <p className="text-[11px] text-gray-400 mt-1">Syllabus catalogs</p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan/20 transition-all">
                    <Laptop className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Stat 3: Live Classes */}
              <div className="group glass-morphic border border-white/5 rounded-2xl p-6 hover:border-brand-cyan/20 hover:scale-[1.02] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Live Classrooms</p>
                    <p className="text-3xl font-bold font-display text-white mt-2">{liveClasses.length}</p>
                    <p className="text-[11px] text-brand-cyan mt-1 flex items-center gap-1">
                      <span>{liveClasses.filter(l => l.status === "LIVE").length} session live</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan/20 transition-all">
                    <Video className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Stat 4: Total Notes */}
              <div className="group glass-morphic border border-white/5 rounded-2xl p-6 hover:border-brand-cyan/20 hover:scale-[1.02] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Total Notes</p>
                    <p className="text-3xl font-bold font-display text-white mt-2">{notes.length}</p>
                    <p className="text-[11px] text-gray-400 mt-1">Syllabus PDFs</p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan/20 transition-all">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Stat 5: Assignments */}
              <div className="group glass-morphic border border-white/5 rounded-2xl p-6 hover:border-brand-cyan/20 hover:scale-[1.02] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Assignments</p>
                    <p className="text-3xl font-bold font-display text-white mt-2">{assignments.length}</p>
                    <p className="text-[11px] text-gray-400 mt-1">Due tracking</p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan/20 transition-all">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Overview Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Quick Actions List */}
              <div className="glass-morphic border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-cyan" />
                  <span>Quick Administration Actions</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => openAddModal("course")}
                    className="p-4 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-brand-cyan/20 transition-all text-left group"
                  >
                    <Plus className="w-5 h-5 text-brand-cyan mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-white">Add New Course</p>
                    <p className="text-xs text-gray-400 mt-0.5">Syllabus list catalogs</p>
                  </button>

                  <button
                    onClick={() => openAddModal("liveClass")}
                    className="p-4 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-brand-cyan/20 transition-all text-left group"
                  >
                    <Plus className="w-5 h-5 text-brand-cyan mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-white">Create Live Class</p>
                    <p className="text-xs text-gray-400 mt-0.5">Google Meet link rooms</p>
                  </button>

                  <button
                    onClick={() => openAddModal("note")}
                    className="p-4 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-brand-cyan/20 transition-all text-left group"
                  >
                    <Plus className="w-5 h-5 text-brand-cyan mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-white">Upload Notes File</p>
                    <p className="text-xs text-gray-400 mt-0.5">Publish syllabus PDFs</p>
                  </button>

                  <button
                    onClick={() => openAddModal("announcement")}
                    className="p-4 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-brand-cyan/20 transition-all text-left group"
                  >
                    <Plus className="w-5 h-5 text-brand-cyan mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-white">Post Broadcast</p>
                    <p className="text-xs text-gray-400 mt-0.5">High priority announcements</p>
                  </button>
                </div>
              </div>

              {/* Quick Announcements Feed */}
              <div className="glass-morphic border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-brand-cyan" />
                      <span>Live Broadcasts</span>
                    </h3>
                    <button onClick={() => setActiveTab("announcements")} className="text-xs text-brand-cyan hover:underline">
                      Manage All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {announcements.slice(0, 2).map(ann => (
                      <div key={ann.id} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono text-gray-500">{ann.date}</span>
                          <h4 className="text-sm font-bold text-white mt-0.5">{ann.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-1 mt-1">{ann.message}</p>
                        </div>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          ann.priority === "High" ? "bg-red-500/10 text-red-400" : "bg-white/5 text-gray-400"
                        }`}>
                          {ann.priority.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-500 font-mono">
                  Database Engine: LocalStorage Mock State Sync Active. Ready for Firebase integration.
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ----------------- TAB: COURSES ----------------- */}
        {activeTab === "courses" && (
          <div className="space-y-6 animate-fadeIn" id="admin-panel-courses">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Course Management Catalog</h2>
                <p className="text-sm text-gray-400 mt-1">Create, edit, and delete syllabus-aligned learning tracks.</p>
              </div>
              <button
                onClick={() => openAddModal("course")}
                className="px-5 py-2.5 bg-brand-cyan text-brand-black text-xs font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2 max-w-fit cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Syllabus Course</span>
              </button>
            </div>

            {/* Courses Table Container */}
            <div className="glass-morphic border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01] text-xs font-bold text-gray-400 font-mono">
                      <th className="p-4 sm:p-5">Course Name</th>
                      <th className="p-4 sm:p-5">Category</th>
                      <th className="p-4 sm:p-5 text-center">Students Enrolled</th>
                      <th className="p-4 sm:p-5">Status</th>
                      <th className="p-4 sm:p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 sm:p-5 font-bold text-white">{c.name}</td>
                        <td className="p-4 sm:p-5 font-mono text-xs text-brand-cyan">{c.category}</td>
                        <td className="p-4 sm:p-5 text-center font-mono font-medium text-gray-300">{c.enrolledStudents} registered</td>
                        <td className="p-4 sm:p-5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === "Active" ? "bg-brand-cyan/15 text-brand-cyan" : "bg-white/5 text-gray-400"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 sm:p-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal("course", c)}
                              className="p-1.5 rounded bg-white/5 hover:bg-brand-cyan/10 hover:text-brand-cyan text-gray-400 transition-all cursor-pointer"
                              title="Edit Course"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete("course", c.id)}
                              className="p-1.5 rounded bg-white/5 hover:bg-red-500/15 hover:text-red-400 text-gray-400 transition-all cursor-pointer"
                              title="Delete Course"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB: STUDENTS ----------------- */}
        {activeTab === "students" && (
          <div className="space-y-6 animate-fadeIn" id="admin-panel-students">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Student Roster</h2>
                <p className="text-sm text-gray-400 mt-1">Audit, modify, or view detailed registration records of students.</p>
              </div>
              <button
                onClick={() => openAddModal("student")}
                className="px-5 py-2.5 bg-brand-cyan text-brand-black text-xs font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2 max-w-fit cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student Record</span>
              </button>
            </div>

            {/* Search filter panel */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              <div className="flex-1 flex gap-4 bg-white/[0.01] border border-white/5 rounded-2xl px-4 py-3 items-center w-full max-w-md">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by Name, Email, or USN..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-sm text-white focus:outline-none w-full"
                />
                {studentSearchQuery && (
                  <button onClick={() => setStudentSearchQuery("")} className="text-xs text-gray-500 hover:text-white">
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <select
                  value={selectedBranchFilter}
                  onChange={(e) => setSelectedBranchFilter(e.target.value)}
                  className="bg-[#14151a] border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-cyan text-gray-300 min-w-[160px]"
                >
                  <option value="">All Branches</option>
                  {uniqueBranches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>

                <select
                  value={selectedSemesterFilter}
                  onChange={(e) => setSelectedSemesterFilter(e.target.value)}
                  className="bg-[#14151a] border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-cyan text-gray-300 min-w-[160px]"
                >
                  <option value="">All Semesters</option>
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                  <option value="3rd">3rd Semester</option>
                  <option value="4th">4th Semester</option>
                  <option value="5th">5th Semester</option>
                  <option value="6th">6th Semester</option>
                  <option value="7th">7th Semester</option>
                  <option value="8th">8th Semester</option>
                </select>
              </div>
            </div>

            {/* Students Table Container */}
            <div className="glass-morphic border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01] text-xs font-bold text-gray-400 font-mono">
                      <th className="p-4 sm:p-5">Full Name</th>
                      <th className="p-4 sm:p-5">Email / USN / Phone</th>
                      <th className="p-4 sm:p-5">College & Branch</th>
                      <th className="p-4 sm:p-5">Semester & Reg. Date</th>
                      <th className="p-4 sm:p-5">Status</th>
                      <th className="p-4 sm:p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="p-3.5 rounded-full bg-white/[0.02] border border-white/5 text-gray-400">
                              <User className="w-6 h-6 stroke-[1.5]" />
                            </div>
                            <p className="text-sm font-bold text-white tracking-tight">No Registered Students Found</p>
                            <p className="text-xs text-gray-500 max-w-md mx-auto">No student enrollment records match your search terms or course category filters. Adjust filters to search other classes.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr key={s.email} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-4 sm:p-5 font-bold text-white">{s.fullName}</td>
                          <td className="p-4 sm:p-5 font-mono text-xs">
                            <p className="text-gray-300">{s.email}</p>
                            <p className="text-brand-cyan mt-0.5">{s.usn || "No USN"}</p>
                            <p className="text-gray-400 mt-0.5">{s.mobileNumber || "No Phone"}</p>
                          </td>
                          <td className="p-4 sm:p-5">
                            <p className="text-gray-200 text-xs font-medium">{s.college}</p>
                            <p className="text-gray-500 text-xs font-mono mt-0.5">{s.branch}</p>
                          </td>
                          <td className="p-4 sm:p-5 font-mono text-xs text-gray-300">
                            <p>{s.semester} Semester</p>
                            <p className="text-gray-500 mt-1 text-[11px]">
                              {s.registrationDate ? new Date(s.registrationDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "July 13, 2026"}
                            </p>
                          </td>
                          <td className="p-4 sm:p-5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === "Active" ? "bg-green-500/10 text-green-400 border border-green-500/15" : "bg-red-500/10 text-red-400 border border-red-500/15"
                            }`}>
                              {s.status || "Active"}
                            </span>
                          </td>
                          <td className="p-4 sm:p-5 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openViewStudentModal(s)}
                                className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-brand-cyan hover:text-brand-black text-gray-400 font-bold text-xs transition-all cursor-pointer"
                              >
                                View Folder
                              </button>
                              <button
                                onClick={() => openEditModal("student", s)}
                                className="p-1.5 rounded bg-white/5 hover:bg-brand-cyan/10 hover:text-brand-cyan text-gray-400 transition-all cursor-pointer"
                                title="Edit Student"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete("student", s.email)}
                                className="p-1.5 rounded bg-white/5 hover:bg-red-500/15 hover:text-red-400 text-gray-400 transition-all cursor-pointer"
                                title="Delete Student"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB: NOTES ----------------- */}
        {activeTab === "notes" && (
          <div className="space-y-6 animate-fadeIn" id="admin-panel-notes">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Study Notes Library Desk</h2>
                <p className="text-sm text-gray-400 mt-1">Upload, update, and deploy modules, handbooks, and reference PDF notes.</p>
              </div>
              <button
                onClick={() => openAddModal("note")}
                className="px-5 py-2.5 bg-brand-cyan text-brand-black text-xs font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2 max-w-fit cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Publish New Note File</span>
              </button>
            </div>

            {/* Notes Grid Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((n) => (
                <div key={n.id} className="glass-morphic border border-white/5 p-5 rounded-2xl flex flex-col justify-between hover:border-brand-cyan/20 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-mono text-brand-cyan bg-brand-cyan/15 px-2 py-0.5 rounded font-bold uppercase">
                        {n.module}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal("note", n)}
                          className="p-1 bg-white/5 hover:bg-brand-cyan/10 hover:text-brand-cyan rounded text-gray-400 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete("note", n.id)}
                          className="p-1 bg-white/5 hover:bg-red-500/15 hover:text-red-400 rounded text-gray-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white">{n.subject} Syllabus Reference</h3>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">{n.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-mono text-[10px]">{n.pdfName}</span>
                    <span className="text-brand-cyan font-semibold flex items-center gap-1 cursor-pointer">
                      <FileText className="w-3.5 h-3.5" />
                      PDF Ready
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ----------------- TAB: LIVE CLASSES ----------------- */}
        {activeTab === "live" && (
          <div className="space-y-6 animate-fadeIn" id="admin-panel-live-classes">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Live Classroom Board</h2>
                <p className="text-sm text-gray-400 mt-1">Orchestrate Google Meet schedules and toggle live lecture status badges.</p>
              </div>
              <button
                onClick={() => openAddModal("liveClass")}
                className="px-5 py-2.5 bg-brand-cyan text-brand-black text-xs font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2 max-w-fit cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Live Session</span>
              </button>
            </div>

            {/* Live classes listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {liveClasses.map((l) => (
                <div key={l.id} className={`glass-morphic p-5 rounded-2xl border flex flex-col justify-between h-[200px] transition-all duration-300 ${
                  l.status === "LIVE" ? "border-brand-cyan/30 shadow-[0_0_15px_rgba(0,229,255,0.05)]" : "border-white/5"
                }`}>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-mono text-gray-500">BY {l.instructor.toUpperCase()}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          l.status === "LIVE" ? "bg-brand-cyan text-brand-black animate-pulse" : l.status === "UPCOMING" ? "bg-white/5 text-gray-400" : "bg-white/5 text-gray-600"
                        }`}>
                          {l.status}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openEditModal("liveClass", l)}
                            className="p-1 bg-white/5 hover:bg-brand-cyan/10 hover:text-brand-cyan rounded text-gray-400 transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete("liveClass", l.id)}
                            className="p-1 bg-white/5 hover:bg-red-500/15 hover:text-red-400 rounded text-gray-400 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white line-clamp-1">{l.subject}</h3>
                    
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-3 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>{l.date}</span>
                      <span className="text-gray-600">|</span>
                      <Clock className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>{l.time}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-gray-500 truncate max-w-[200px]">{l.meetUrl}</span>
                    <a
                      href={l.meetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1"
                    >
                      <span>Check Link</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ----------------- TAB: ASSIGNMENTS ----------------- */}
        {activeTab === "assignments" && (
          <div className="space-y-6 animate-fadeIn" id="admin-panel-assignments">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Syllabus Assignments Desk</h2>
                <p className="text-sm text-gray-400 mt-1">Syllabus code practice guidelines and targets manager.</p>
              </div>
              <button
                onClick={() => openAddModal("assignment")}
                className="px-5 py-2.5 bg-brand-cyan text-brand-black text-xs font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2 max-w-fit cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Assignment Entry</span>
              </button>
            </div>

            {/* Assignments listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((a) => (
                <div key={a.id} className="glass-morphic p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-brand-cyan/15 transition-all">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wide">{a.subject}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEditModal("assignment", a)}
                          className="p-1 bg-white/5 hover:bg-brand-cyan/10 hover:text-brand-cyan rounded text-gray-400 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete("assignment", a.id)}
                          className="p-1 bg-white/5 hover:bg-red-500/15 hover:text-red-400 rounded text-gray-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white">{a.title}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-3">Target Due: <span className="text-white">{a.dueDate}</span></p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-gray-500">Status Target:</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      a.status === "Pending" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/15" : a.status === "Late" ? "bg-red-500/10 text-red-400 border border-red-500/15" : "bg-green-500/10 text-green-400 border border-green-500/15"
                    }`}>
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ----------------- TAB: ANNOUNCEMENTS ----------------- */}
        {activeTab === "announcements" && (
          <div className="space-y-6 animate-fadeIn" id="admin-panel-announcements">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Broadcast Announcements Manager</h2>
                <p className="text-sm text-gray-400 mt-1">Publish global priorities broadcasts that display directly to students.</p>
              </div>
              <button
                onClick={() => openAddModal("announcement")}
                className="px-5 py-2.5 bg-brand-cyan text-brand-black text-xs font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2 max-w-fit cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Announcement</span>
              </button>
            </div>

            {/* Announcements List display */}
            <div className="space-y-4">
              {announcements.map((an) => (
                <div key={an.id} className="glass-morphic border border-white/5 p-5 rounded-2xl relative">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-500">{an.date}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        an.priority === "High" ? "bg-red-500/10 text-red-400 border border-red-500/15" : "bg-white/5 text-gray-400"
                      }`}>
                        {an.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal("announcement", an)}
                        className="p-1 bg-white/5 hover:bg-brand-cyan/10 hover:text-brand-cyan rounded text-gray-400 transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete("announcement", an.id)}
                        className="p-1 bg-white/5 hover:bg-red-500/15 hover:text-red-400 rounded text-gray-400 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-base mb-2">{an.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{an.message}</p>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ----------------- TAB: SETTINGS ----------------- */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fadeIn" id="admin-panel-settings">
            
            <div className="pb-4 border-b border-white/5">
              <h2 className="text-2xl font-bold font-display text-white">System & Profile Settings</h2>
              <p className="text-sm text-gray-400 mt-1">Configure security levels, check telemetry statuses, or sync localStorage databases.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Profile Card */}
              <div className="glass-morphic border border-white/5 p-6 rounded-2xl">
                <h3 className="text-lg font-bold font-display text-white mb-5 flex items-center gap-2">
                  <User className="w-5 h-5 text-brand-cyan" />
                  <span>Admin Profile Folder</span>
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center font-bold text-brand-cyan">
                      SA
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">NapPy Administrator</h4>
                      <p className="text-xs text-gray-400">Security Rank: Super Admin Administrator</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <p className="text-gray-500 font-mono">EMAIL ADDRESS</p>
                      <p className="text-white font-medium mt-1">admin@nappy.com</p>
                    </div>
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <p className="text-gray-500 font-mono">ROLE PERMISSION</p>
                      <p className="text-brand-cyan font-semibold mt-1">Full CRUD System</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Database Telemetry & Backup Status */}
              <div className="glass-morphic border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
                    <Laptop className="w-5 h-5 text-brand-cyan" />
                    <span>Future Ready Integrations</span>
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    This Admin Dashboard has been architected to sync directly with **Firebase Firestore** or **Supabase Relational Tables** in the future. High level mock state variables are separated from UI logic.
                  </p>
                  
                  <div className="space-y-2 text-xs font-mono text-gray-400">
                    <div className="flex justify-between p-2 bg-white/[0.01] rounded">
                      <span>DATALOG_CACHE:</span>
                      <span className="text-green-400">ACTIVE (LOCALSTORAGE)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/[0.01] rounded">
                      <span>SCHEMA_BLUEPRINT:</span>
                      <span className="text-brand-cyan">FIREBASE READY</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  <button
                    onClick={() => {
                      localStorage.clear();
                      sessionStorage.setItem("nappy_pending_toast", JSON.stringify({
                        type: "success",
                        title: "Hard Reset Complete",
                        message: "Mock localStorage cleared! Please sign-in again to re-initialize datasets."
                      }));
                      window.location.reload();
                    }}
                    className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 text-xs font-bold transition-all cursor-pointer"
                  >
                    Hard Reset Mock Database State
                  </button>

                  <button
                    id="factory-reset-app-btn"
                    onClick={() => {
                      // Get all localStorage keys starting with nappy_
                      const keysToRemove: string[] = [];
                      for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith("nappy_") && key !== "nappy_logged_in_admin" && key !== "nappy_admin_profile") {
                          keysToRemove.push(key);
                        }
                      }

                      // Remove student session or reset datasets to empty arrays
                      keysToRemove.forEach((key) => {
                        if (key === "nappy_logged_in_student") {
                          localStorage.removeItem(key);
                        } else {
                          localStorage.setItem(key, JSON.stringify([]));
                        }
                      });

                      // Explicitly ensure all dataset keys are set to empty arrays
                      const mainKeys = [
                        "nappy_students",
                        "nappy_admin_courses",
                        "nappy_admin_notes",
                        "nappy_admin_live_classes",
                        "nappy_admin_assignments",
                        "nappy_announcements",
                        "nappy_recorded_lectures",
                        "nappy_completed_videos",
                        "nappy_submitted_assigns",
                        "nappy_downloaded_notes"
                      ];
                      mainKeys.forEach((key) => {
                        localStorage.setItem(key, JSON.stringify([]));
                      });

                      sessionStorage.setItem("nappy_pending_toast", JSON.stringify({
                        type: "success",
                        title: "Factory Reset Successful",
                        message: "Application factory reset complete! All datasets have been cleared. Admin session preserved."
                      }));
                      window.location.reload();
                    }}
                    className="w-full py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white border border-red-600/40 text-xs font-bold transition-all cursor-pointer"
                  >
                    Factory Reset Application
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ----------------- TAB: ADMIN ACCOUNT SETTINGS ----------------- */}
        {activeTab === "admin-account" && (
          <div className="space-y-6 animate-fadeIn" id="admin-panel-admin-account">
            
            <div className="pb-4 border-b border-white/5">
              <div className="inline-flex items-center gap-1.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full px-3 py-1 mb-3 text-[10px] font-bold text-brand-cyan uppercase tracking-widest">
                <Lock className="w-3 h-3" />
                <span>System Admin Area</span>
              </div>
              <h2 className="text-2xl font-bold font-display text-white">Admin Account Settings</h2>
              <p className="text-sm text-gray-400 mt-1">Manage your login ID, credentials, and track administrative session history.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Profile Card */}
              <div className="glass-morphic border border-white/5 p-6 rounded-2xl h-fit">
                <h3 className="text-lg font-bold font-display text-white mb-5 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-cyan" />
                  <span>Profile Folder</span>
                </h3>

                <div className="flex flex-col items-center text-center p-6 bg-white/[0.01] border border-white/5 rounded-xl mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan font-bold text-2xl mb-3">
                    {adminProfile.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "AD"}
                  </div>
                  <h4 className="text-base font-bold text-white">{adminProfile.fullName}</h4>
                  <p className="text-xs text-brand-cyan font-mono mt-1 font-semibold">{adminProfile.role}</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl">
                    <p className="text-gray-500 font-mono tracking-wider">EMAIL ADDRESS (LOGIN ID)</p>
                    <p className="text-white font-medium mt-1 truncate">{adminProfile.email}</p>
                  </div>

                  <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl">
                    <p className="text-gray-500 font-mono tracking-wider">ACCOUNT CREATED</p>
                    <p className="text-white font-medium mt-1">{adminProfile.createdDate}</p>
                  </div>

                  <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl">
                    <p className="text-gray-500 font-mono tracking-wider">LAST REFRESHED LOGIN</p>
                    <p className="text-white font-medium mt-1 font-mono text-[11px]">{adminProfile.lastLogin}</p>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Change Email Form */}
                <div className="glass-morphic border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold font-display text-white mb-1.5 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-brand-cyan" />
                    <span>Change Email ID</span>
                  </h3>
                  <p className="text-xs text-gray-400 mb-6">Update the primary username used to log into the NapPy Administrative terminal.</p>

                  <form onSubmit={handleChangeEmail} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 font-mono">CURRENT PASSWORD</label>
                      <div className="relative">
                        <input
                          type={showEmailCurrentPassword ? "text" : "password"}
                          value={emailCurrentPassword}
                          onChange={(e) => setEmailCurrentPassword(e.target.value)}
                          className={`w-full bg-brand-black/40 border ${emailFormErrors.currentPassword ? "border-red-500/50" : "border-white/5"} focus:border-brand-cyan/50 text-white rounded-xl px-4 py-3 text-sm transition-all focus:outline-none`}
                          placeholder="Enter current password to authorize"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEmailCurrentPassword(!showEmailCurrentPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-all cursor-pointer"
                        >
                          {showEmailCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {emailFormErrors.currentPassword && (
                        <p className="text-red-400 text-xs mt-1.5 font-medium">{emailFormErrors.currentPassword}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 font-mono">NEW EMAIL ADDRESS</label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className={`w-full bg-brand-black/40 border ${emailFormErrors.newEmail ? "border-red-500/50" : "border-white/5"} focus:border-brand-cyan/50 text-white rounded-xl px-4 py-3 text-sm transition-all focus:outline-none`}
                          placeholder="e.g. admin.new@nappy.com"
                        />
                        {emailFormErrors.newEmail && (
                          <p className="text-red-400 text-xs mt-1.5 font-medium">{emailFormErrors.newEmail}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 font-mono">CONFIRM NEW EMAIL</label>
                        <input
                          type="email"
                          value={confirmNewEmail}
                          onChange={(e) => setConfirmNewEmail(e.target.value)}
                          className={`w-full bg-brand-black/40 border ${emailFormErrors.confirmNewEmail ? "border-red-500/50" : "border-white/5"} focus:border-brand-cyan/50 text-white rounded-xl px-4 py-3 text-sm transition-all focus:outline-none`}
                          placeholder="Re-enter new email address"
                        />
                        {emailFormErrors.confirmNewEmail && (
                          <p className="text-red-400 text-xs mt-1.5 font-medium">{emailFormErrors.confirmNewEmail}</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-2.5 bg-brand-cyan hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] text-brand-black text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Apply New Email ID</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Change Password Form */}
                <div className="glass-morphic border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold font-display text-white mb-1.5 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-brand-cyan" />
                    <span>Change Terminal Password</span>
                  </h3>
                  <p className="text-xs text-gray-400 mb-6">Keep your access secure by rotating the console administrator password regularly.</p>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 font-mono">CURRENT PASSWORD</label>
                      <div className="relative">
                        <input
                          type={showPwdCurrentPassword ? "text" : "password"}
                          value={pwdCurrentPassword}
                          onChange={(e) => setPwdCurrentPassword(e.target.value)}
                          className={`w-full bg-brand-black/40 border ${pwdFormErrors.currentPassword ? "border-red-500/50" : "border-white/5"} focus:border-brand-cyan/50 text-white rounded-xl px-4 py-3 text-sm transition-all focus:outline-none`}
                          placeholder="Confirm your current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwdCurrentPassword(!showPwdCurrentPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-all cursor-pointer"
                        >
                          {showPwdCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {pwdFormErrors.currentPassword && (
                        <p className="text-red-400 text-xs mt-1.5 font-medium">{pwdFormErrors.currentPassword}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 font-mono">NEW SECURE PASSWORD</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`w-full bg-brand-black/40 border ${pwdFormErrors.newPassword ? "border-red-500/50" : "border-white/5"} focus:border-brand-cyan/50 text-white rounded-xl px-4 py-3 text-sm transition-all focus:outline-none`}
                            placeholder="At least 8 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-all cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {pwdFormErrors.newPassword && (
                          <p className="text-red-400 text-xs mt-1.5 font-medium">{pwdFormErrors.newPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 font-mono">CONFIRM PASSWORD</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full bg-brand-black/40 border ${pwdFormErrors.confirmPassword ? "border-red-500/50" : "border-white/5"} focus:border-brand-cyan/50 text-white rounded-xl px-4 py-3 text-sm transition-all focus:outline-none`}
                            placeholder="Re-enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-all cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {pwdFormErrors.confirmPassword && (
                          <p className="text-red-400 text-xs mt-1.5 font-medium">{pwdFormErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">Password Integrity:</span>
                          <span className={`font-bold ${
                            getPasswordStrength(newPassword).label === "Strong" ? "text-green-400" :
                            getPasswordStrength(newPassword).label === "Medium" ? "text-yellow-400" : "text-red-400"
                          }`}>{getPasswordStrength(newPassword).label}</span>
                        </div>
                        
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden flex gap-1">
                          <div className={`h-full flex-1 rounded-full ${
                            getPasswordStrength(newPassword).score >= 1 ? getPasswordStrength(newPassword).color : "bg-white/5"
                          }`} />
                          <div className={`h-full flex-1 rounded-full ${
                            getPasswordStrength(newPassword).score >= 3 ? getPasswordStrength(newPassword).color : "bg-white/5"
                          }`} />
                          <div className={`h-full flex-1 rounded-full ${
                            getPasswordStrength(newPassword).score >= 5 ? getPasswordStrength(newPassword).color : "bg-white/5"
                          }`} />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-[10px] text-gray-500 font-mono">
                          <div className="flex items-center gap-1">
                            <span className={newPassword.length >= 8 ? "text-green-400 font-bold" : "text-gray-500"}>✓</span>
                            <span>8+ Characters</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={/[A-Z]/.test(newPassword) ? "text-green-400 font-bold" : "text-gray-500"}>✓</span>
                            <span>Uppercase Letter</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={/[a-z]/.test(newPassword) ? "text-green-400 font-bold" : "text-gray-500"}>✓</span>
                            <span>Lowercase Letter</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={/\d/.test(newPassword) ? "text-green-400 font-bold" : "text-gray-500"}>✓</span>
                            <span>One Number</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-green-400 font-bold" : "text-gray-500"}>✓</span>
                            <span>Special Char</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-2.5 bg-brand-cyan hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] text-brand-black text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Update Credentials</span>
                      </button>
                    </div>
                  </form>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ----------------- TAB: RECORDED LECTURES ----------------- */}
        {activeTab === "recorded-lectures" && (
          <div className="space-y-6 animate-fadeIn" id="admin-panel-recorded-lectures">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Recorded Lectures Archive</h2>
                <p className="text-sm text-gray-400 mt-1">Configure, upload, publish, and manage recorded video courses for student dashboards.</p>
              </div>
              <button
                onClick={handleAddLectureClick}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-cyan hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] text-brand-black text-xs font-bold rounded-xl transition-all cursor-pointer"
                id="admin-add-lecture-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Add Recorded Lecture</span>
              </button>
            </div>

            {/* Search Filter Controls */}
            <div className="glass-morphic border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search lectures by title, course, module, instructor..."
                  value={lectureSearchQuery}
                  onChange={(e) => setLectureSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-cyan/50 text-white"
                  id="admin-lecture-search"
                />
              </div>
              <div className="text-xs text-gray-400 font-mono">
                Total Lectures: <span className="text-brand-cyan font-bold">{recordedLectures.length}</span>
              </div>
            </div>

            {/* Lecture Archive Table / Grid */}
            <div className="glass-morphic border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thumbnail & Lecture Info</th>
                      <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Course & Module</th>
                      <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Duration</th>
                      <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Upload Date</th>
                      <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                      <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recordedLectures
                      .filter(lec => {
                        const q = lectureSearchQuery.toLowerCase().trim();
                        if (!q) return true;
                        return (
                          (lec.title || "").toLowerCase().includes(q) ||
                          (lec.course || "").toLowerCase().includes(q) ||
                          (lec.module || "").toLowerCase().includes(q) ||
                          (lec.instructorName || "").toLowerCase().includes(q)
                        );
                      })
                      .map((lec) => (
                        <tr key={lec.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={lec.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"}
                                alt={lec.title}
                                referrerPolicy="no-referrer"
                                className="w-16 h-10 rounded-lg object-cover border border-white/10"
                              />
                              <div>
                                <p className="text-sm font-bold text-white line-clamp-1">{lec.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">By {lec.instructorName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-xs font-semibold text-white">{lec.course}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{lec.module}</p>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-mono text-brand-cyan bg-brand-cyan/10 px-2.5 py-1 rounded-full">{lec.duration}</span>
                          </td>
                          <td className="p-4 text-xs text-gray-400 font-mono">
                            {new Date(lec.uploadDate).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleTogglePublish(lec.id)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                lec.status === "Published"
                                  ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                              }`}
                              title="Click to toggle Status"
                            >
                              {lec.status}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2.5">
                              <button
                                onClick={() => handleEditLectureClick(lec)}
                                className="p-1.5 bg-white/5 hover:bg-brand-cyan/10 hover:text-brand-cyan rounded-lg text-gray-400 transition-all cursor-pointer"
                                title="Edit Lecture"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteLecture(lec.id)}
                                className="p-1.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-gray-400 transition-all cursor-pointer"
                                title="Delete Lecture"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))}

                    {recordedLectures.filter(lec => {
                      const q = lectureSearchQuery.toLowerCase().trim();
                      if (!q) return true;
                      return (
                        (lec.title || "").toLowerCase().includes(q) ||
                        (lec.course || "").toLowerCase().includes(q) ||
                        (lec.module || "").toLowerCase().includes(q) ||
                        (lec.instructorName || "").toLowerCase().includes(q)
                      );
                    }).length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="p-3.5 rounded-full bg-white/[0.02] border border-white/5 text-gray-400">
                              <Video className="w-6 h-6 stroke-[1.5]" />
                            </div>
                            <p className="text-sm font-bold text-white tracking-tight">No Lectures Found</p>
                            <p className="text-xs text-gray-500 max-w-md mx-auto">No digital lecture videos match your active search filter. Clear your query or type a different keyword to browse classes.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB: STUDENT QUERIES ----------------- */}
        {activeTab === "queries" && (
          <div className="space-y-6 animate-fadeIn" id="admin-panel-queries">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Student Queries</h2>
                <p className="text-sm text-gray-400 mt-1">Review, mark resolved, and manage support messages submitted from the Floating Assistant.</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-morphic border border-white/5 p-5 rounded-2xl bg-white/[0.01]">
                <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Total Submitted Queries</p>
                <p className="text-3xl font-display font-bold text-white mt-2">{queries.length}</p>
              </div>
              <div className="glass-morphic border border-white/5 p-5 rounded-2xl bg-white/[0.01] border-l-2 border-l-amber-500">
                <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Pending Support Requests</p>
                <p className="text-3xl font-display font-bold text-amber-400 mt-2">
                  {queries.filter(q => q.status === "Pending").length}
                </p>
              </div>
              <div className="glass-morphic border border-white/5 p-5 rounded-2xl bg-white/[0.01] border-l-2 border-l-green-500">
                <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Resolved Support Requests</p>
                <p className="text-3xl font-display font-bold text-green-400 mt-2">
                  {queries.filter(q => q.status === "Resolved").length}
                </p>
              </div>
            </div>

            {/* Search Filter Controls */}
            <div className="glass-morphic border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search queries by name, email, or message..."
                  value={querySearchQuery}
                  onChange={(e) => setQuerySearchQuery(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-cyan/50 text-white"
                  id="admin-query-search"
                />
              </div>
              <div className="text-xs text-gray-400 font-mono">
                Showing: <span className="text-brand-cyan font-bold">
                  {queries.filter(q => {
                    const search = querySearchQuery.toLowerCase().trim();
                    if (!search) return true;
                    return (
                      q.studentName.toLowerCase().includes(search) ||
                      q.studentEmail.toLowerCase().includes(search) ||
                      q.message.toLowerCase().includes(search)
                    );
                  }).length}
                </span> of {queries.length} entries
              </div>
            </div>

            {/* Queries Archive Table / Grid */}
            <div className="glass-morphic border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Student Details</th>
                      <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Query Message</th>
                      <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Submitted On</th>
                      <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                      <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {queries
                      .filter(q => {
                        const search = querySearchQuery.toLowerCase().trim();
                        if (!search) return true;
                        return (
                          q.studentName.toLowerCase().includes(search) ||
                          q.studentEmail.toLowerCase().includes(search) ||
                          q.message.toLowerCase().includes(search)
                        );
                      })
                      .map((q) => (
                        <tr key={q.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="text-sm font-bold text-white">{q.studentName}</p>
                              <p className="text-xs text-gray-400 mt-0.5 font-mono">{q.studentEmail}</p>
                            </div>
                          </td>
                          <td className="p-4 max-w-md">
                            <p className="text-xs text-gray-200 bg-white/[0.02] border border-white/5 p-3 rounded-xl whitespace-pre-wrap leading-relaxed">{q.message}</p>
                          </td>
                          <td className="p-4 text-xs text-gray-400 font-mono">
                            <div>{q.date}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">{q.time}</div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              q.status === "Resolved"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                            }`}>
                              {q.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2.5">
                              {q.status === "Pending" && (
                                <button
                                  onClick={() => handleResolveQuery(q.id)}
                                  className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-black rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                                  title="Mark Resolved"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Mark Resolved</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteQuery(q.id)}
                                className="p-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-gray-400 transition-all cursor-pointer"
                                title="Delete Query"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                    {queries.filter(q => {
                      const search = querySearchQuery.toLowerCase().trim();
                      if (!search) return true;
                      return (
                        q.studentName.toLowerCase().includes(search) ||
                        q.studentEmail.toLowerCase().includes(search) ||
                        q.message.toLowerCase().includes(search)
                      );
                    }).length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="p-3.5 rounded-full bg-white/[0.02] border border-white/5 text-gray-400">
                              <MessageSquare className="w-6 h-6 stroke-[1.5]" />
                            </div>
                            <p className="text-sm font-bold text-white tracking-tight">No Support Tickets Found</p>
                            <p className="text-xs text-gray-500 max-w-md mx-auto">No student support queries, doubt requests, or tickets exist matching your search guidelines. Refresh filters to view active tickets.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB: ASSIGNMENT SUBMISSIONS ----------------- */}
        {activeTab === "assignment-submissions" && (
          <div className="space-y-6 animate-fadeIn" id="admin-panel-submissions">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Assignment Submissions</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Manage real-time student homework files, grade reviews, and resubmission requests.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-morphic border border-white/5 p-5 rounded-2xl bg-white/[0.01]">
                <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Total Submissions</p>
                <p className="text-3xl font-display font-bold text-white mt-2">{submissions.length}</p>
              </div>
              <div className="glass-morphic border border-white/5 p-5 rounded-2xl bg-white/[0.01] border-l-2 border-l-brand-cyan">
                <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Submitted / Pending Review</p>
                <p className="text-3xl font-display font-bold text-brand-cyan mt-2">
                  {submissions.filter(s => s.status === "Submitted").length}
                </p>
              </div>
              <div className="glass-morphic border border-white/5 p-5 rounded-2xl bg-white/[0.01] border-l-2 border-l-green-500">
                <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Reviewed Submissions</p>
                <p className="text-3xl font-display font-bold text-green-400 mt-2">
                  {submissions.filter(s => s.status === "Reviewed").length}
                </p>
              </div>
            </div>

            {/* Filters Section */}
            <div className="glass-morphic border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student name, USN, or file..."
                  value={submissionSearchQuery}
                  onChange={(e) => setSubmissionSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-cyan/50 text-white"
                  id="admin-submission-search"
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                {/* Assignment Title filter */}
                <select
                  value={selectedSubAssignmentFilter}
                  onChange={(e) => setSelectedSubAssignmentFilter(e.target.value)}
                  className="bg-[#0f1015] border border-white/5 text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-cyan/50"
                >
                  <option value="">All Assignments</option>
                  {Array.from(new Set(submissions.map(s => s.assignmentTitle))).map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>

                {/* Branch filter */}
                <select
                  value={selectedBranchFilter}
                  onChange={(e) => setSelectedBranchFilter(e.target.value)}
                  className="bg-[#0f1015] border border-white/5 text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-cyan/50"
                >
                  <option value="">All Branches</option>
                  <option value="CSE">CSE</option>
                  <option value="ISE">ISE</option>
                  <option value="ECE">ECE</option>
                  <option value="ME">ME</option>
                  <option value="CIV">CIV</option>
                </select>
              </div>
            </div>

            {/* Submissions Table / List */}
            <div className="glass-morphic border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01] text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                      <th className="p-4 pl-6">Student Info</th>
                      <th className="p-4">Assignment Title</th>
                      <th className="p-4">Submitted File</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                    {submissions
                      .filter(s => {
                        const search = submissionSearchQuery.toLowerCase().trim();
                        const matchesSearch = !search || (
                          s.studentName.toLowerCase().includes(search) ||
                          s.studentUsn.toLowerCase().includes(search) ||
                          s.fileName.toLowerCase().includes(search)
                        );
                        const matchesAssign = !selectedSubAssignmentFilter || s.assignmentTitle === selectedSubAssignmentFilter;
                        const matchesBranch = !selectedBranchFilter || s.studentBranch === selectedBranchFilter;
                        return matchesSearch && matchesAssign && matchesBranch;
                      })
                      .map((sub) => (
                        <tr key={sub.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">{sub.studentName}</span>
                              <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                                {sub.studentUsn} • {sub.studentBranch || "CSE"} • {sub.studentSemester || "6th Sem"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-white line-clamp-1 max-w-[200px]" title={sub.assignmentTitle}>
                              {sub.assignmentTitle}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-brand-cyan shrink-0" />
                              <div className="flex flex-col truncate max-w-[150px]">
                                <span className="font-mono text-white truncate text-[11px]" title={sub.fileName}>
                                  {sub.fileName}
                                </span>
                                <span className="text-[9px] text-gray-500">
                                  {sub.fileSize} • {sub.fileType.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-gray-400">
                            {sub.submittedAt}
                          </td>
                          <td className="p-4">
                            {sub.status === "Reviewed" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/10 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                REVIEWED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10 px-2 py-0.5 rounded-full animate-pulse">
                                <Clock className="w-3 h-3" />
                                SUBMITTED
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setActiveSubmissionForView(sub)}
                                className="p-2 bg-white/5 hover:bg-brand-cyan/10 hover:text-brand-cyan rounded-lg text-gray-400 transition-all cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDownloadSubmission(sub)}
                                className="p-2 bg-white/5 hover:bg-brand-cyan/10 hover:text-brand-cyan rounded-lg text-gray-400 transition-all cursor-pointer"
                                title="Download File"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleReview(sub.id)}
                                className={`p-2 rounded-lg transition-all cursor-pointer ${
                                  sub.status === "Reviewed" 
                                    ? "bg-green-500/10 text-green-400 hover:bg-white/5 hover:text-gray-400" 
                                    : "bg-white/5 text-gray-400 hover:bg-green-500/10 hover:text-green-400"
                                }`}
                                title={sub.status === "Reviewed" ? "Mark Submitted" : "Mark Reviewed"}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubmission(sub.id)}
                                className="p-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-gray-400 transition-all cursor-pointer"
                                title="Delete Submission"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                    {submissions.filter(s => {
                      const search = submissionSearchQuery.toLowerCase().trim();
                      const matchesSearch = !search || (
                        s.studentName.toLowerCase().includes(search) ||
                        s.studentUsn.toLowerCase().includes(search) ||
                        s.fileName.toLowerCase().includes(search)
                      );
                      const matchesAssign = !selectedSubAssignmentFilter || s.assignmentTitle === selectedSubAssignmentFilter;
                      const matchesBranch = !selectedBranchFilter || s.studentBranch === selectedBranchFilter;
                      return matchesSearch && matchesAssign && matchesBranch;
                    }).length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="p-3.5 rounded-full bg-white/[0.02] border border-white/5 text-gray-400">
                              <FileSpreadsheet className="w-6 h-6 stroke-[1.5]" />
                            </div>
                            <p className="text-sm font-bold text-white tracking-tight">No Submissions Found</p>
                            <p className="text-xs text-gray-500 max-w-md mx-auto">No student assignment uploads match your current course, task, or search filters. Change query parameters or select another syllabus task to check student answers.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ----------------- INTERACTIVE DIALOG MODAL ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b0c10] border border-white/10 rounded-3xl w-full max-w-lg p-6 relative overflow-hidden shadow-2xl animate-scaleUp">
            
            {formProgress !== null ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
                {/* Spinner */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#00E5FF"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - formProgress / 100)}
                      className="transition-all duration-150 ease-out"
                    />
                  </svg>
                  <div className="absolute font-mono text-lg font-bold text-white">
                    {formProgress}%
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
                    {formProgress < 100 ? "Uploading Metadata..." : "Upload Complete"}
                  </h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    {formStatusText}
                  </p>
                </div>

                {/* Progress bar line */}
                <div className="w-48 bg-white/5 h-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-cyan transition-all duration-150"
                    style={{ width: `${formProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                {/* Top Close Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Modal Headers */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                    <Sparkles className="w-4 h-4 text-brand-cyan" />
                    <span>
                      {modalAction === "add" ? "Create New" : modalAction === "edit" ? "Edit Existing" : "Detailed View"} {modalType?.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Fill out the fields below to update the virtual classroom databases.</p>
                </div>

                {/* Modal Forms Router */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* COURSE FORM */}
              {modalType === "course" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Course Name</label>
                    <input
                      type="text"
                      required
                      value={courseForm.name || ""}
                      onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                      placeholder="e.g. Course Title Here"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Category</label>
                      <input
                        type="text"
                        required
                        value={courseForm.category || ""}
                        onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                        placeholder="e.g. Course Category"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Students Enrolled</label>
                      <input
                        type="number"
                        required
                        value={courseForm.enrolledStudents || 0}
                        onChange={(e) => setCourseForm({ ...courseForm, enrolledStudents: Number(e.target.value) })}
                        placeholder="0"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Status</label>
                    <select
                      value={courseForm.status || "Active"}
                      onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as "Active" | "Draft" })}
                      className="w-full bg-[#14151a] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </>
              )}

              {/* STUDENT FORM */}
              {modalType === "student" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={studentForm.fullName || ""}
                      onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                      placeholder="e.g. Arjun Sharma"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email</label>
                      <input
                        type="email"
                        required
                        disabled={modalAction === "edit"}
                        value={studentForm.email || ""}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                        placeholder="student@nappy.com"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mobile</label>
                      <input
                        type="text"
                        required
                        value={studentForm.mobileNumber || ""}
                        onChange={(e) => setStudentForm({ ...studentForm, mobileNumber: e.target.value })}
                        placeholder="9876543210"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">USN</label>
                      <input
                        type="text"
                        required
                        value={studentForm.usn || ""}
                        onChange={(e) => setStudentForm({ ...studentForm, usn: e.target.value })}
                        placeholder="1RV22CS001"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Semester</label>
                      <select
                        value={studentForm.semester || "1st"}
                        onChange={(e) => setStudentForm({ ...studentForm, semester: e.target.value })}
                        className="w-full bg-[#14151a] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                      >
                        <option value="1st">1st Semester</option>
                        <option value="2nd">2nd Semester</option>
                        <option value="3rd">3rd Semester</option>
                        <option value="4th">4th Semester</option>
                        <option value="5th">5th Semester</option>
                        <option value="6th">6th Semester</option>
                        <option value="7th">7th Semester</option>
                        <option value="8th">8th Semester</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">College</label>
                    <input
                      type="text"
                      required
                      value={studentForm.college || ""}
                      onChange={(e) => setStudentForm({ ...studentForm, college: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Branch</label>
                    <input
                      type="text"
                      required
                      value={studentForm.branch || ""}
                      onChange={(e) => setStudentForm({ ...studentForm, branch: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                </>
              )}

              {/* VIEW STUDENT DETAIL MODAL */}
              {modalType === "viewStudent" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/[0.01] border border-white/5 rounded-2xl mb-4">
                    <div className="w-14 h-14 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full flex items-center justify-center font-bold text-brand-cyan text-xl">
                      {studentForm.fullName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{studentForm.fullName}</h4>
                      <p className="text-xs text-brand-cyan font-mono font-bold mt-0.5">{studentForm.usn || "NO USN"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <p className="text-gray-500 font-mono">EMAIL ADDRESS</p>
                      <p className="text-white font-medium mt-1">{studentForm.email}</p>
                    </div>
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <p className="text-gray-500 font-mono">MOBILE NUMBER</p>
                      <p className="text-white font-medium mt-1">{studentForm.mobileNumber}</p>
                    </div>
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <p className="text-gray-500 font-mono">COLLEGE NAME</p>
                      <p className="text-white font-medium mt-1">{studentForm.college}</p>
                    </div>
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <p className="text-gray-500 font-mono">ACADEMIC BRANCH</p>
                      <p className="text-white font-medium mt-1">{studentForm.branch}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <p className="text-gray-500 font-mono">SEMESTER</p>
                      <p className="text-white font-medium mt-1">{studentForm.semester} Semester</p>
                    </div>
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <p className="text-gray-500 font-mono">REGISTRATION DATE</p>
                      <p className="text-brand-cyan font-mono mt-1">
                        {studentForm.registrationDate ? new Date(studentForm.registrationDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "July 13, 2026"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 text-xs">
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <p className="text-gray-500 font-mono">ACCOUNT STATUS</p>
                      <p className="text-green-400 font-semibold mt-1">{studentForm.status || "Active"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTE FORM */}
              {modalType === "note" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Note Title</label>
                    <input
                      type="text"
                      required
                      value={noteForm.title || ""}
                      onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                      placeholder="e.g. Note Topic Title"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Subject Name</label>
                      <input
                        type="text"
                        required
                        value={noteForm.subject || ""}
                        onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                        placeholder="e.g. Subject Name"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Module Number</label>
                      <input
                        type="text"
                        required
                        value={noteForm.module || ""}
                        onChange={(e) => setNoteForm({ ...noteForm, module: e.target.value })}
                        placeholder="e.g. Module"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Upload PDF</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <input
                        type="file"
                        accept="application/pdf"
                        id="pdf-upload-input"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setNoteForm({
                                ...noteForm,
                                pdfName: file.name,
                                pdfData: reader.result as string
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="pdf-upload-input"
                        className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-cyan/30 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4 text-brand-cyan" />
                        Choose PDF
                      </label>
                      <span className="text-xs text-gray-400 truncate max-w-[240px]">
                        {noteForm.pdfName || "No PDF uploaded yet"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Description Summary</label>
                    <textarea
                      required
                      rows={3}
                      value={noteForm.description || ""}
                      onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                      placeholder="Write a brief overview of syllabus contents..."
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white resize-none"
                    ></textarea>
                  </div>
                </>
              )}

              {/* LIVE CLASS FORM */}
              {modalType === "liveClass" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Course / Subject Name</label>
                      <input
                        type="text"
                        required
                        value={liveClassForm.course || ""}
                        onChange={(e) => setLiveClassForm({ ...liveClassForm, course: e.target.value })}
                        placeholder="e.g. Course Name"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Syllabus Module</label>
                      <input
                        type="text"
                        required
                        value={liveClassForm.module || ""}
                        onChange={(e) => setLiveClassForm({ ...liveClassForm, module: e.target.value })}
                        placeholder="e.g. Module"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Subject Topic</label>
                    <input
                      type="text"
                      required
                      value={liveClassForm.subject || ""}
                      onChange={(e) => setLiveClassForm({ ...liveClassForm, subject: e.target.value })}
                      placeholder="e.g. Specific Topic Title"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Instructor</label>
                    <input
                      type="text"
                      required
                      value={liveClassForm.instructor || ""}
                      onChange={(e) => setLiveClassForm({ ...liveClassForm, instructor: e.target.value })}
                      placeholder="e.g. Instructor Name"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Date</label>
                      <input
                        type="text"
                        required
                        value={liveClassForm.date || ""}
                        onChange={(e) => setLiveClassForm({ ...liveClassForm, date: e.target.value })}
                        placeholder="e.g. Scheduled Date"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Time Range</label>
                      <input
                        type="text"
                        required
                        value={liveClassForm.time || ""}
                        onChange={(e) => setLiveClassForm({ ...liveClassForm, time: e.target.value })}
                        placeholder="e.g. Class Time"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Google Meet Url Link</label>
                    <input
                      type="text"
                      required
                      value={liveClassForm.meetUrl || ""}
                      onChange={(e) => setLiveClassForm({ ...liveClassForm, meetUrl: e.target.value })}
                      placeholder="https://meet.google.com/abc-defg-hij"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Live Status</label>
                    <select
                      value={liveClassForm.status || "UPCOMING"}
                      onChange={(e) => setLiveClassForm({ ...liveClassForm, status: e.target.value as "LIVE" | "UPCOMING" | "COMPLETED" })}
                      className="w-full bg-[#14151a] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                    >
                      <option value="LIVE">LIVE Now</option>
                      <option value="UPCOMING">UPCOMING Scheduled</option>
                      <option value="COMPLETED">COMPLETED Archived</option>
                    </select>
                  </div>
                </>
              )}

              {/* ASSIGNMENT FORM */}
              {modalType === "assignment" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Assignment Title</label>
                    <input
                      type="text"
                      required
                      value={assignmentForm.title || ""}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                      placeholder="e.g. Assignment Title"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Subject Topic</label>
                      <input
                        type="text"
                        required
                        value={assignmentForm.subject || ""}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value })}
                        placeholder="e.g. Subject Name"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Due Date</label>
                      <input
                        type="text"
                        required
                        value={assignmentForm.dueDate || ""}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                        placeholder="e.g. Due Date"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Initial Status</label>
                    <select
                      value={assignmentForm.status || "Pending"}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, status: e.target.value as "Pending" | "Submitted" | "Late" })}
                      className="w-full bg-[#14151a] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Late">Late</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Description / Instructions Summary</label>
                    <textarea
                      rows={2}
                      value={assignmentForm.description || ""}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                      placeholder="Write brief assignment criteria/instructions..."
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Attachment Link (PDF/Doc Url)</label>
                    <input
                      type="text"
                      value={assignmentForm.attachmentLink || ""}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, attachmentLink: e.target.value })}
                      placeholder="e.g. https://example.com/assignment1_details.pdf"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2" id="allow-resubmit-container">
                    <input
                      type="checkbox"
                      id="allowResubmission"
                      checked={assignmentForm.allowResubmission !== false}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, allowResubmission: e.target.checked })}
                      className="w-4 h-4 rounded border-white/10 text-brand-cyan focus:ring-brand-cyan bg-white/[0.02] cursor-pointer"
                    />
                    <label htmlFor="allowResubmission" className="text-xs text-gray-300 cursor-pointer select-none">
                      Allow Resubmission (Enable students to resubmit file even after initial completion)
                    </label>
                  </div>
                </>
              )}

              {/* ANNOUNCEMENT FORM */}
              {modalType === "announcement" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Announcement Title</label>
                    <input
                      type="text"
                      required
                      value={announcementForm.title || ""}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      placeholder="e.g. Announcement Header"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Priority Level</label>
                    <select
                      value={announcementForm.priority || "Normal"}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value as "High" | "Normal" | "Low" })}
                      className="w-full bg-[#14151a] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                    >
                      <option value="High">High Priority</option>
                      <option value="Normal">Normal Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Broadcast Message Content</label>
                    <textarea
                      required
                      rows={4}
                      value={announcementForm.message || ""}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                      placeholder="Type the message details for students..."
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white resize-none"
                    ></textarea>
                  </div>
                </>
              )}

              {/* Form Action CTA buttons */}
              <div className="pt-4 flex gap-3 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {modalAction === "view" ? "Close Folder" : "Cancel"}
                </button>
                {modalAction !== "view" && (
                  <>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-brand-cyan text-brand-black rounded-xl text-xs font-bold hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </>
                )}
              </div>

            </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ----------------- RECORDED LECTURE DIALOG MODAL ----------------- */}
      {isLectureModalOpen && (
        <div className="fixed inset-0 bg-brand-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b0c10] border border-white/10 rounded-3xl w-full max-w-lg p-6 relative overflow-hidden shadow-2xl animate-scaleUp">
            
            {formProgress !== null ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
                {/* Spinner */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#00E5FF"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - formProgress / 100)}
                      className="transition-all duration-150 ease-out"
                    />
                  </svg>
                  <div className="absolute font-mono text-lg font-bold text-white">
                    {formProgress}%
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
                    {formProgress < 100 ? "Uploading Recorded Lecture..." : "Upload Complete"}
                  </h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    {formStatusText}
                  </p>
                </div>

                {/* Progress bar line */}
                <div className="w-48 bg-white/5 h-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-cyan transition-all duration-150"
                    style={{ width: `${formProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                {/* Top Close Button */}
                <button
                  onClick={() => setIsLectureModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Modal Header */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                    <Video className="w-5 h-5 text-brand-cyan" />
                    <span>{lectureModalAction === "add" ? "Add Recorded Lecture" : "Edit Recorded Lecture"}</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Provide recording details and configure state settings below.</p>
                </div>

                <form onSubmit={handleLectureFormSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Lecture Title</label>
                <input
                  type="text"
                  required
                  value={lectureForm.title || ""}
                  onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                  placeholder="e.g. Lecture Title"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Course Name</label>
                  <input
                    type="text"
                    required
                    value={lectureForm.course || ""}
                    onChange={(e) => setLectureForm({ ...lectureForm, course: e.target.value })}
                    placeholder="e.g. Subject Name"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Module / Session</label>
                  <input
                    type="text"
                    required
                    value={lectureForm.module || ""}
                    onChange={(e) => setLectureForm({ ...lectureForm, module: e.target.value })}
                    placeholder="e.g. Module Name"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Instructor Name</label>
                  <input
                    type="text"
                    required
                    value={lectureForm.instructorName || ""}
                    onChange={(e) => setLectureForm({ ...lectureForm, instructorName: e.target.value })}
                    placeholder="e.g. Instructor Name"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Duration</label>
                  <input
                    type="text"
                    required
                    value={lectureForm.duration || ""}
                    onChange={(e) => setLectureForm({ ...lectureForm, duration: e.target.value })}
                    placeholder="e.g. 45m or 1h 15m"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Description Details</label>
                <textarea
                  required
                  rows={3}
                  value={lectureForm.description || ""}
                  onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
                  placeholder="Provide a detailed outline of what is covered in this session..."
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white resize-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Thumbnail Image URL</label>
                <input
                  type="text"
                  required
                  value={lectureForm.thumbnail || ""}
                  onChange={(e) => setLectureForm({ ...lectureForm, thumbnail: e.target.value })}
                  placeholder="e.g. https://images.unsplash.com/..."
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Video Link (YouTube/Drive)</label>
                  <input
                    type="text"
                    required
                    value={lectureForm.videoLink || ""}
                    onChange={(e) => setLectureForm({ ...lectureForm, videoLink: e.target.value })}
                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Publish Status</label>
                  <select
                    value={lectureForm.status || "Published"}
                    onChange={(e) => setLectureForm({ ...lectureForm, status: e.target.value as "Published" | "Draft" })}
                    className="w-full bg-[#14151a] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-cyan text-white"
                  >
                    <option value="Published">Published (Students see it)</option>
                    <option value="Draft">Draft (Admin only)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsLectureModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetLectureForm}
                  className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-cyan text-brand-black rounded-xl text-xs font-bold hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
                >
                  Save Recorded Lecture
                </button>
              </div>

            </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ----------------- ASSIGNMENT SUBMISSION DETAIL VIEW MODAL ----------------- */}
      {activeSubmissionForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" id="sub-view-modal-overlay">
          <div className="glass-morphic border border-brand-cyan/30 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative" id="sub-view-modal">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-lg font-bold font-display text-white">Submission Details</h3>
              </div>
              <button
                onClick={() => setActiveSubmissionForView(null)}
                className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Student Metadata */}
              <div>
                <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Student Profile</p>
                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl mt-1.5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Full Name:</span>
                    <span className="text-white text-xs font-semibold">{activeSubmissionForView.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">USN / ID:</span>
                    <span className="text-brand-cyan text-xs font-mono font-bold">{activeSubmissionForView.studentUsn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Branch & Sem:</span>
                    <span className="text-white text-xs">{activeSubmissionForView.studentBranch || "CSE"} • {activeSubmissionForView.studentSemester || "6th Sem"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Email:</span>
                    <span className="text-white text-xs font-mono">{activeSubmissionForView.studentEmail}</span>
                  </div>
                </div>
              </div>

              {/* Assignment Title */}
              <div>
                <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Assignment Title</p>
                <p className="text-sm font-bold text-white mt-1">{activeSubmissionForView.assignmentTitle}</p>
              </div>

              {/* Submitted File Details */}
              <div>
                <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Submitted Homework File</p>
                <div className="p-3.5 rounded-xl bg-brand-cyan/5 border border-brand-cyan/25 flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-cyan" />
                    <div className="flex flex-col truncate max-w-[280px]">
                      <span className="text-xs font-semibold text-white truncate">
                        {activeSubmissionForView.fileName}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {activeSubmissionForView.fileSize} • {activeSubmissionForView.fileType.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadSubmission(activeSubmissionForView)}
                    className="text-[11px] font-mono text-brand-cyan hover:underline font-bold"
                  >
                    DOWNLOAD FILE ↗
                  </button>
                </div>
              </div>

              {/* Optional Comments */}
              <div>
                <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Student Comments</p>
                <p className="text-xs text-gray-300 leading-relaxed mt-1.5 whitespace-pre-wrap bg-white/[0.01] border border-white/5 p-3 rounded-xl italic">
                  {activeSubmissionForView.comments || "No comments submitted by the student."}
                </p>
              </div>

              {/* Date & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Submission Date</p>
                  <p className="text-xs text-white font-mono mt-1">{activeSubmissionForView.submittedAt}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Status</p>
                  <div className="mt-1">
                    {activeSubmissionForView.status === "Reviewed" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        REVIEWED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10 px-2 py-0.5 rounded-full">
                        <Clock className="w-2.5 h-2.5" />
                        SUBMITTED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-8">
              <button
                type="button"
                onClick={() => setActiveSubmissionForView(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-300 text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer"
              >
                Close View
              </button>
              <button
                type="button"
                onClick={() => {
                  handleToggleReview(activeSubmissionForView.id);
                  setActiveSubmissionForView(prev => prev ? { ...prev, status: prev.status === "Reviewed" ? "Submitted" : "Reviewed" } : null);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubmissionForView.status === "Reviewed"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-brand-cyan text-brand-black hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                }`}
              >
                {activeSubmissionForView.status === "Reviewed" ? "Mark as Submitted" : "Mark as Reviewed"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable custom confirmation modal */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        theme={confirmDialog.theme}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
