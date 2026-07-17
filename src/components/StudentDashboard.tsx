import React, { useEffect, useState } from "react";
import { 
  User, Mail, Phone, GraduationCap, IdCard, GitBranch, CalendarDays, 
  LogOut, BookOpen, Clock, Award, Bell, Video, FileSpreadsheet, 
  Download, Play, CheckCircle2, ChevronRight, Edit2, ShieldAlert, 
  Sparkles, AlertCircle, Eye, FileText, Check, 
  ExternalLink, Calendar, Search, ThumbsUp, X, Upload
} from "lucide-react";
import { nappyDb } from "../services/nappyDb";
import { useToast } from "../context/ToastContext";
import ConfirmationModal from "./ConfirmationModal";
import EmptyState from "./EmptyState";
import { motion } from "motion/react";

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
  }
  return null;
}

interface StudentData {
  fullName: string;
  email: string;
  mobileNumber: string;
  college: string;
  usn: string;
  branch: string;
  semester: string;
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

// End of model definitions

export default function StudentDashboard() {
  const { success, warning, error, info } = useToast();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "assignments" | "profile" | "recorded-lectures">("overview");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardLoading, setDashboardLoading] = useState(true);


  
  // Recorded Lectures State
  const [recordedLectures, setRecordedLectures] = useState<RecordedLecture[]>([]);
  const [watchEmbedUrl, setWatchEmbedUrl] = useState<string | null>(null);
  const [watchVideoTitle, setWatchVideoTitle] = useState<string>("");
  const [lectureSearch, setLectureSearch] = useState<string>("");

  // Decoupled sync databases states
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [studyNotes, setStudyNotes] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // View Modals states
  const [activeNoteForView, setActiveNoteForView] = useState<any | null>(null);
  const [activeAssignmentForView, setActiveAssignmentForView] = useState<any | null>(null);
  
  // Interactive student dashboard state
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const [submittedAssignments, setSubmittedAssignments] = useState<string[]>([]);
  const [downloadedNotes, setDownloadedNotes] = useState<string[]>([]);
  
  // Modals / Dialog state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<StudentData>({
    fullName: "",
    email: "",
    mobileNumber: "",
    college: "",
    usn: "",
    branch: "",
    semester: "",
  });

  // New Assignment Submission System States
  const [activeAssignmentForSubmit, setActiveAssignmentForSubmit] = useState<any | null>(null);
  const [submitComments, setSubmitComments] = useState("");
  const [submitFileDetails, setSubmitFileDetails] = useState<{ name: string; size: string; type: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [viewingSubmittedDetails, setViewingSubmittedDetails] = useState<any | null>(null);

  // Custom confirmation dialog state
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

  // Time & Greeting & Database sync calculations
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Initial state loading
    const loggedInStudent = localStorage.getItem("nappy_logged_in_student");
    if (loggedInStudent) {
      try {
        const parsed = JSON.parse(loggedInStudent);
        setStudent(parsed);
        setEditForm(parsed);
      } catch (e) {
        console.error("Error parsing student session", e);
      }
    } else {
      // Direct redirect if not validated
      window.history.pushState({}, "", "/login");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }

    // Load custom interactive states from localStorage to maintain fidelity
    const storedVideos = localStorage.getItem("nappy_completed_videos");
    if (storedVideos) setCompletedVideos(JSON.parse(storedVideos));

    const storedAssigns = localStorage.getItem("nappy_submitted_assigns");
    if (storedAssigns) setSubmittedAssignments(JSON.parse(storedAssigns));

    const storedNotes = localStorage.getItem("nappy_downloaded_notes");
    if (storedNotes) setDownloadedNotes(JSON.parse(storedNotes));

    // Dynamic Loader
    const loadAllData = () => {
      const dbLiveClasses = nappyDb.getLiveClasses();
      setLiveClasses(dbLiveClasses);

      const dbNotes = nappyDb.getNotes();
      setStudyNotes(dbNotes);

      const dbAssignments = nappyDb.getAssignments();
      setAssignments(dbAssignments);

      const dbAnnouncements = nappyDb.getAnnouncements();
      setAnnouncements(dbAnnouncements);

      const dbRecordedLectures = nappyDb.getRecordedLectures();
      setRecordedLectures(dbRecordedLectures);

      const cachedCourses = localStorage.getItem("nappy_admin_courses");
      if (cachedCourses) {
        try {
          setCourses(JSON.parse(cachedCourses));
        } catch (e) {
          console.error("Error parsing courses", e);
        }
      } else {
        setCourses([]);
      }
    };

    loadAllData();

    // Subscribe to nappyDb updates
    const unsubscribe = nappyDb.subscribe(() => {
      loadAllData();
    });

    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: string; scrollId?: string }>;
      if (customEvent.detail && customEvent.detail.tab) {
        const targetTab = customEvent.detail.tab;
        const validTabs = ["overview", "notes", "assignments", "profile", "recorded-lectures"];
        if (validTabs.includes(targetTab)) {
          setActiveTab(targetTab as any);
          if (customEvent.detail.scrollId) {
            setTimeout(() => {
              const el = document.getElementById(customEvent.detail.scrollId!);
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }, 250);
          }
        }
      }
    };

    window.addEventListener("nappy_navigate_tab", handleNavigate);

    const loadingTimeout = setTimeout(() => {
      setDashboardLoading(false);
    }, 1200);

    return () => {
      clearInterval(timer);
      unsubscribe();
      window.removeEventListener("nappy_navigate_tab", handleNavigate);
      clearTimeout(loadingTimeout);
    };
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleLogout = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Sign Out",
      description: "Are you sure you want to sign out from your Student Desk session?",
      confirmText: "Sign Out",
      cancelText: "Stay Connected",
      theme: "cyan",
      onConfirm: () => {
        localStorage.removeItem("nappy_logged_in_student");
        window.history.pushState({}, "", "/");
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    });
  };

  // Action state synchronizations
  const handleWatchVideo = (id: string) => {
    let updated;
    if (completedVideos.includes(id)) {
      updated = completedVideos.filter(vid => vid !== id);
    } else {
      updated = [...completedVideos, id];
    }
    setCompletedVideos(updated);
    localStorage.setItem("nappy_completed_videos", JSON.stringify(updated));
  };

  const handleSubmitAssignment = (id: string) => {
    const assignmentObj = assignments.find(a => a.id === id);
    if (!assignmentObj) return;

    if (submittedAssignments.includes(id)) {
      const allSubs = nappyDb.getAssignmentSubmissions();
      const currentSub = allSubs.find(s => s.assignmentId === id && s.studentUsn === student?.usn);
      if (currentSub) {
        setViewingSubmittedDetails(currentSub);
      } else {
        const updated = submittedAssignments.filter(assignId => assignId !== id);
        setSubmittedAssignments(updated);
        localStorage.setItem("nappy_submitted_assigns", JSON.stringify(updated));
        window.dispatchEvent(new Event("nappy_db_update"));
        showToast("Submission retracted successfully.");
      }
    } else {
      setActiveAssignmentForSubmit(assignmentObj);
      setSubmitComments("");
      setSubmitFileDetails(null);
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  const handleOpenSubmitDialog = (as: any) => {
    setActiveAssignmentForSubmit(as);
    setSubmitComments("");
    setSubmitFileDetails(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleViewSubmission = (assignmentId: string) => {
    const allSubs = nappyDb.getAssignmentSubmissions();
    const currentSub = allSubs.find(s => s.assignmentId === assignmentId && s.studentUsn === student?.usn);
    if (currentSub) {
      setViewingSubmittedDetails(currentSub);
    } else {
      showToast("Submission record not found.");
    }
  };

  const showToast = (msg: string) => {
    success(msg);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    const name = file.name;
    const rawSize = file.size;
    let sizeStr = "";
    if (rawSize < 1024) sizeStr = rawSize + " B";
    else if (rawSize < 1024 * 1024) sizeStr = (rawSize / 1024).toFixed(1) + " KB";
    else sizeStr = (rawSize / (1024 * 1024)).toFixed(1) + " MB";

    const type = name.split(".").pop() || "unknown";

    setSubmitFileDetails({
      name,
      size: sizeStr,
      type
    });

    setIsUploading(true);
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsUploading(false);
      }
      setUploadProgress(progress);
    }, 150);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleFinalSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignmentForSubmit || !submitFileDetails || uploadProgress < 100) return;

    const newSubmission = {
      id: "sub_" + Date.now(),
      assignmentId: activeAssignmentForSubmit.id,
      assignmentTitle: activeAssignmentForSubmit.title || activeAssignmentForSubmit.name,
      studentName: student?.fullName || "Student",
      studentUsn: student?.usn || "USN-UNSPECIFIED",
      studentBranch: student?.branch || "CSE",
      studentSemester: student?.semester || "6th Sem",
      studentEmail: student?.email || "email@nappy.edu",
      comments: submitComments,
      fileName: submitFileDetails.name,
      fileSize: submitFileDetails.size,
      fileType: submitFileDetails.type,
      submittedAt: new Date().toLocaleString(),
      status: "Submitted" as const
    };

    const currentSubs = nappyDb.getAssignmentSubmissions();
    const updatedSubs = [...currentSubs, newSubmission];
    nappyDb.saveAssignmentSubmissions(updatedSubs);

    const updatedAssigns = [...submittedAssignments, activeAssignmentForSubmit.id];
    setSubmittedAssignments(updatedAssigns);
    localStorage.setItem("nappy_submitted_assigns", JSON.stringify(updatedAssigns));

    setActiveAssignmentForSubmit(null);
    showToast("Assignment submitted successfully! Status set to 'Submitted'.");
    window.dispatchEvent(new Event("nappy_db_update"));
  };

  const handleRetractSubmission = (assignmentId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Retract Assignment Submission",
      description: "Are you sure you want to retract your submission? This will permanently delete the submitted file from the system.",
      confirmText: "Delete Submission",
      cancelText: "Keep Submission",
      theme: "red",
      onConfirm: () => {
        const allSubs = nappyDb.getAssignmentSubmissions();
        const filteredSubs = allSubs.filter(s => !(s.assignmentId === assignmentId && s.studentUsn === student?.usn));
        nappyDb.saveAssignmentSubmissions(filteredSubs);

        const updatedAssigns = submittedAssignments.filter(id => id !== assignmentId);
        setSubmittedAssignments(updatedAssigns);
        localStorage.setItem("nappy_submitted_assigns", JSON.stringify(updatedAssigns));

        setViewingSubmittedDetails(null);
        showToast("Submission retracted successfully.");
        window.dispatchEvent(new Event("nappy_db_update"));
      }
    });
  };

  const handleDownloadNote = (noteOrId: any) => {
    const isObject = typeof noteOrId === "object" && noteOrId !== null;
    const id = isObject ? noteOrId.id : noteOrId;
    const title = isObject ? noteOrId.title : "Syllabus Study Guide";
    const subject = isObject ? noteOrId.subject : "Course Material";
    const module = isObject ? noteOrId.module : "General";
    const description = isObject ? noteOrId.description : "Summary Notes";
    const filename = isObject ? (noteOrId.pdfName || `${id}_notes.pdf`) : `${id}_notes.pdf`;

    if (!downloadedNotes.includes(id)) {
      const updated = [...downloadedNotes, id];
      setDownloadedNotes(updated);
      localStorage.setItem("nappy_downloaded_notes", JSON.stringify(updated));
    }

    if (isObject && noteOrId.pdfData) {
      const element = document.createElement("a");
      element.href = noteOrId.pdfData;
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }

    // Simulate premium visual download trigger
    const element = document.createElement("a");
    const file = new Blob([
      `==================================================\n`,
      `              NAPPY VIRTUAL CLASSROOM              \n`,
      `==================================================\n\n`,
      `Title:        ${title}\n`,
      `Course:       ${subject}\n`,
      `Module:       ${module}\n`,
      `Description:  ${description}\n\n`,
      `--------------------------------------------------\n`,
      `Saved successfully via NapPy Student Vault.\n`
    ], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (student) {
      const updated = { ...student, ...editForm };
      setStudent(updated);
      localStorage.setItem("nappy_logged_in_student", JSON.stringify(updated));
      
      // Also update the general students register list
      const studentsJSON = localStorage.getItem("nappy_students");
      if (studentsJSON) {
        try {
          const allStudents = JSON.parse(studentsJSON);
          const index = allStudents.findIndex((s: any) => s.email === student.email);
          if (index !== -1) {
            allStudents[index] = { ...allStudents[index], ...editForm };
            localStorage.setItem("nappy_students", JSON.stringify(allStudents));
          }
        } catch (e) {
          console.error("Error updating primary students list", e);
        }
      }

      setEditModalOpen(false);
      success("Profile Updated", "Your student profile has been successfully saved.");
    }
  };



  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black text-gray-400">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-sm tracking-widest text-brand-cyan">VALIDATING CLASSROOM PERMISSIONS...</p>
        </div>
      </div>
    );
  }

  // Computed published archives from on-demand lectures
  const recordedSessions = recordedLectures.filter((l) => l.status === "Published");

  const handleLaunchPlayer = (lecture: any) => {
    // 1. Toggles completedVideos state
    if (!completedVideos.includes(lecture.id)) {
      const updated = [...completedVideos, lecture.id];
      setCompletedVideos(updated);
      localStorage.setItem("nappy_completed_videos", JSON.stringify(updated));
    }
    // 2. Launches the stream player
    const embedUrl = getYouTubeEmbedUrl(lecture.videoLink || lecture.videoUrl);
    if (embedUrl) {
      setWatchEmbedUrl(embedUrl);
      setWatchVideoTitle(lecture.title);
    } else if (lecture.videoLink || lecture.videoUrl) {
      window.open(lecture.videoLink || lecture.videoUrl, "_blank", "noopener,noreferrer");
    } else {
      warning("Configuration Error", "No video link is configured for this recorded lecture.");
    }
  };

  // Attendance metrics database generated dynamically from courses list
  const attendanceMetrics = courses.length > 0 
    ? [
        ...courses.slice(0, 5).map((course) => {
          const charSum = student?.usn ? student.usn.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) : 123;
          const courseCharSum = course.name.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
          const percentage = 75 + ((charSum + courseCharSum) % 21);
          return { subject: course.name, percentage };
        }),
        { 
          subject: "Overall Attendance", 
          percentage: Math.round(
            courses.slice(0, 5).reduce((acc: number, course: any) => {
              const charSum = student?.usn ? student.usn.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) : 123;
              const courseCharSum = course.name.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
              return acc + (75 + ((charSum + courseCharSum) % 21));
            }, 0) / Math.max(courses.slice(0, 5).length, 1)
          ) || 90
        }
      ]
    : [
        { subject: "No courses enrolled yet.", percentage: 0 },
        { subject: "Overall Attendance", percentage: 0 }
      ];

  if (dashboardLoading) {
    return (
      <div className="relative min-h-screen bg-brand-black text-gray-200">
        <div className="fixed inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16">
          {/* Header section skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-white/5 pb-6 animate-pulse">
            <div>
              <div className="h-4 bg-white/10 rounded-full w-24 mb-2"></div>
              <div className="h-8 bg-white/10 rounded-full w-64 mb-1"></div>
              <div className="h-3 bg-white/10 rounded-full w-40"></div>
            </div>
            <div className="flex gap-3">
              <div className="w-28 h-10 bg-white/5 rounded-xl"></div>
              <div className="w-28 h-10 bg-white/5 rounded-xl"></div>
            </div>
          </div>

          {/* Subnavigation Bar Skeleton */}
          <div className="flex overflow-x-auto gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl mb-8 max-w-fit animate-pulse">
            <div className="w-36 h-10 bg-white/5 rounded-xl"></div>
            <div className="w-28 h-10 bg-white/5 rounded-xl"></div>
            <div className="w-32 h-10 bg-white/5 rounded-xl"></div>
            <div className="w-24 h-10 bg-white/5 rounded-xl"></div>
            <div className="w-36 h-10 bg-white/5 rounded-xl"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content Column Skeletons */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Banner Skeleton */}
              <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] relative overflow-hidden animate-pulse space-y-4">
                <div className="h-4 bg-white/10 rounded-full w-1/4"></div>
                <div className="h-8 bg-white/10 rounded-full w-1/2"></div>
                <div className="h-4 bg-white/10 rounded-full w-3/4"></div>
                <div className="pt-4 flex gap-4">
                  <div className="w-24 h-8 bg-white/5 rounded-lg"></div>
                  <div className="w-24 h-8 bg-white/5 rounded-lg"></div>
                </div>
              </div>

              {/* Grid Content Skeletons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="h-5 bg-white/10 rounded-full w-1/3"></div>
                    <div className="w-5 h-5 bg-white/10 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-white/10 rounded-full w-full"></div>
                    <div className="h-3 bg-white/10 rounded-full w-5/6"></div>
                    <div className="h-3 bg-white/10 rounded-full w-2/3"></div>
                  </div>
                </div>
                <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="h-5 bg-white/10 rounded-full w-1/3"></div>
                    <div className="w-5 h-5 bg-white/10 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-white/10 rounded-full w-full"></div>
                    <div className="h-3 bg-white/10 rounded-full w-5/6"></div>
                    <div className="h-3 bg-white/10 rounded-full w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-8 animate-pulse">
              <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] space-y-4">
                <div className="h-6 bg-white/10 rounded-full w-1/2 mb-2"></div>
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
                  <div className="h-4 bg-white/10 rounded-full w-2/3"></div>
                  <div className="h-3 bg-white/10 rounded-full w-1/3"></div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
                  <div className="h-4 bg-white/10 rounded-full w-1/2"></div>
                  <div className="h-3 bg-white/10 rounded-full w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-brand-black text-gray-200 selection:bg-brand-cyan/30 selection:text-white animate-fade-in">
      <div className="fixed inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16">
        
        {/* Tab Subnavigation Bar */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl mb-8 max-w-fit scrollbar-none" id="dashboard-tab-navigation">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer shrink-0 ${
              activeTab === "overview" 
                ? "bg-brand-cyan text-brand-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)]" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            id="tab-btn-overview"
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer shrink-0 ${
              activeTab === "notes" 
                ? "bg-brand-cyan text-brand-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)]" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            id="tab-btn-notes"
          >
            Study Notes & Recorded Lectures
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer shrink-0 ${
              activeTab === "assignments" 
                ? "bg-brand-cyan text-brand-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)]" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            id="tab-btn-assignments"
          >
            Assignments & Code Playgrounds
          </button>
          <button
            onClick={() => setActiveTab("recorded-lectures")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer shrink-0 ${
              activeTab === "recorded-lectures" 
                ? "bg-brand-cyan text-brand-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)]" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            id="tab-btn-recorded-lectures"
          >
            Recorded Lectures
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer shrink-0 ${
              activeTab === "profile" 
                ? "bg-brand-cyan text-brand-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)]" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            id="tab-btn-profile"
          >
            Detailed Profile
          </button>

        </div>

        {/* ----------------- TAB: OVERVIEW ----------------- */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-8"
            id="dashboard-tab-overview-pane"
          >
            
            {/* 1. Welcome Section & Clock */}
            <div className="glass-morphic border border-white/5 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="overview-welcome-card">
              {/* Background accent spot */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none"></div>

              <div>
                <div className="inline-flex items-center gap-1.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full px-3 py-1 mb-3 text-[11px] font-bold text-brand-cyan uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-brand-cyan" />
                  <span>STUDENT DESK</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
                  {getGreeting()}, <span className="text-brand-cyan neon-glow-cyan">{student.fullName}</span>!
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
                  Welcome to your classroom desk. You are registered from <span className="text-white font-medium">{student.college}</span>, <span className="text-white font-medium">{student.branch}</span> branch, Semester <span className="text-white font-medium">{student.semester}</span>.
                </p>
              </div>

              {/* Dynamic Clock Frame */}
              <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 shrink-0 shadow-lg shadow-black/20" id="live-time-frame">
                <Clock className="w-8 h-8 text-brand-cyan shrink-0 animate-pulse" />
                <div>
                  <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">CURRENT LOCAL TIME</p>
                  <p className="text-base font-mono font-bold text-white mt-0.5">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Dashboard Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="overview-stats-grid">
              
              {/* Stat 1: Live Classes */}
              <div className="group relative glass-morphic border border-white/5 rounded-2xl p-6 hover:border-brand-cyan/20 hover:scale-[1.02] transition-all duration-300" id="stat-card-classes">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Classroom Activity</p>
                    <p className="text-2xl font-bold font-display text-white mt-1">{liveClasses.length} Scheduled</p>
                    <p className="text-xs text-brand-cyan font-semibold mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-ping"></span>
                      {liveClasses.filter((c) => c.status === "LIVE").length} Session{liveClasses.filter((c) => c.status === "LIVE").length === 1 ? "" : "s"} Live Today
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan/20 transition-colors">
                    <Video className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Stat 2: Assignments Pending */}
              <div className="group relative glass-morphic border border-white/5 rounded-2xl p-6 hover:border-brand-cyan/20 hover:scale-[1.02] transition-all duration-300" id="stat-card-assignments">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Assignments Action</p>
                    <p className="text-2xl font-bold font-display text-white mt-1">
                      {assignments.length - submittedAssignments.length} Pending
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {submittedAssignments.length} of {assignments.length} Completed
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan/20 transition-colors">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Stat 3: Notes Available */}
              <div className="group relative glass-morphic border border-white/5 rounded-2xl p-6 hover:border-brand-cyan/20 hover:scale-[1.02] transition-all duration-300" id="stat-card-notes">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Library Handbooks</p>
                    <p className="text-2xl font-bold font-display text-white mt-1">{studyNotes.length} Core Files</p>
                    <p className="text-xs text-brand-cyan font-semibold mt-1 flex items-center gap-1">
                      <Download className="w-3 h-3 text-brand-cyan" />
                      {downloadedNotes.length} Downloaded
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan/20 transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
              </div>

            </div>

            {/* Main Centerpieces: Live Classes Feed vs Announcements/Attendance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Stack (Col-span 2) - 3. Upcoming Live Classes */}
              <div className="lg:col-span-2 space-y-6" id="live-classes-column">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-brand-cyan" />
                    <span>Scheduled Google Meet Classrooms</span>
                  </h2>
                  <span className="text-xs font-mono text-gray-500">REALTIME FEED</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="live-classes-cards-grid">
                  {liveClasses.length === 0 ? (
                    <div className="col-span-1 md:col-span-2">
                      <EmptyState
                        icon={Video}
                        title="No Live Sessions Scheduled"
                        description="All live interactive classrooms are currently offline. Check back later for updates or review recorded archives."
                      />
                    </div>
                  ) : liveClasses.map((cl) => {
                    const isLive = cl.status === "LIVE";
                    const isUpcoming = cl.status === "UPCOMING";
                    const isCompleted = cl.status === "COMPLETED";

                    return (
                      <div 
                        key={cl.id}
                        id={`live-class-${cl.id}`}
                        className={`glass-morphic p-5 rounded-2xl border flex flex-col justify-between h-[210px] transition-all duration-300 ${
                          isLive 
                            ? "border-brand-cyan/30 bg-brand-cyan/[0.01] shadow-[0_0_20px_rgba(0,229,255,0.05)]" 
                            : "border-white/5"
                        }`}
                      >
                        <div>
                          {/* Badge header */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-mono text-gray-500">INSTRUCTOR: {(cl.instructor || "").toUpperCase()}</span>
                            {isLive && (
                              <span className="text-[9px] font-bold bg-brand-cyan text-brand-black px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-brand-black rounded-full"></span>
                                LIVE
                              </span>
                            )}
                            {isUpcoming && (
                              <span className="text-[9px] font-bold bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">
                                SCHEDULED
                              </span>
                            )}
                            {isCompleted && (
                              <span className="text-[9px] font-bold bg-white/5 text-gray-600 px-2 py-0.5 rounded-full">
                                ARCHIVED
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-white leading-normal line-clamp-2 mb-2">
                            {cl.subject}
                          </h3>

                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
                            <span>{cl.date}</span>
                            <span className="text-gray-600">|</span>
                            <span>{cl.time}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        {isCompleted ? (
                          <button 
                            onClick={() => {
                              setActiveTab("notes");
                              // Scroll into view nicely
                              setTimeout(() => {
                                const target = document.querySelector("#recorded-sessions-grid");
                                if (target) target.scrollIntoView({ behavior: "smooth" });
                              }, 150);
                            }}
                            className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                          >
                            Watch Recording File
                          </button>
                        ) : (
                          <a
                            href={cl.meetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`w-full py-2.5 rounded-xl text-xs font-bold text-center block transition-all duration-300 ${
                              isLive 
                                ? "bg-brand-cyan text-brand-black hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:scale-[1.01]" 
                                : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5"
                            }`}
                          >
                            Join Google Meet Session
                          </a>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Stack (Col-span 1) - Announcements & Attendance */}
              <div className="space-y-8" id="overview-side-column">
                
                {/* 8. Attendance Progress */}
                <div className="glass-morphic border border-white/5 rounded-2xl p-6 shadow-xl relative" id="attendance-section">
                  <div className="absolute top-0 right-8 w-10 h-[1px] bg-brand-cyan/20"></div>

                  <h3 className="text-base font-bold font-display text-white mb-5 flex items-center gap-2">
                    <Award className="w-5 h-5 text-brand-cyan" />
                    <span>Attendance Metrics</span>
                  </h3>

                  <div className="space-y-4" id="attendance-progress-bars">
                    {attendanceMetrics.map((met, index) => {
                      const isOverall = met.subject === "Overall Attendance";
                      return (
                        <div key={index} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className={isOverall ? "font-bold text-white" : "text-gray-400"}>
                              {met.subject}
                            </span>
                            <span className={isOverall ? "font-bold text-brand-cyan font-mono" : "text-gray-300 font-mono"}>
                              {met.percentage}%
                            </span>
                          </div>
                          
                          {/* Animated bar frame */}
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                isOverall 
                                  ? "bg-gradient-to-r from-brand-cyan to-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.4)]" 
                                  : "bg-brand-cyan/40"
                              }`}
                              style={{ width: `${met.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 9. Recent Announcements */}
                <div className="glass-morphic border border-white/5 rounded-2xl p-6 shadow-xl" id="announcements-section">
                  <h3 className="text-base font-bold font-display text-white mb-5 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-brand-cyan animate-bounce" />
                    <span>Recent Broadcasts</span>
                  </h3>

                  <div className="space-y-4" id="announcements-cards-list">
                    {announcements.length === 0 ? (
                      <EmptyState
                        icon={Bell}
                        title="No Recent Broadcasts"
                        description="No general admin announcements have been published. Stay tuned for upcoming college and department updates."
                      />
                    ) : announcements.map((ann) => (
                      <div 
                        key={ann.id}
                        id={`announcement-${ann.id}`}
                        className="p-4 rounded-xl bg-white/[0.01] border border-white/5 text-xs relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-gray-500">{ann.date}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                            ann.priority === "High" ? "bg-red-500/10 text-red-400 border border-red-500/10" : "bg-white/5 text-gray-400"
                          }`}>
                            {(ann.priority || "").toUpperCase()} PRIORITY
                          </span>
                        </div>
                        <h4 className="font-bold text-white mb-1.5">{ann.title}</h4>
                        <p className="text-gray-400 leading-relaxed">{ann.message || ann.body}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </motion.div>
        )}

        {/* ----------------- TAB: STUDY NOTES & RECORDINGS ----------------- */}
        {activeTab === "notes" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-12"
            id="dashboard-tab-notes-pane"
          >
            
            {/* 4. Study Notes Cards Layout */}
            <div className="space-y-6" id="notes-library-section">
              <div className="pb-2 border-b border-white/5">
                <h2 className="text-xl font-bold font-display text-white flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-brand-cyan" />
                  <span>Downloadable Study Notes Vault</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Access premium PDF checklists, reference guides, and handbook notes directly to your computer.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="study-notes-grid">
                {studyNotes.length === 0 ? (
                  <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                    <EmptyState
                      icon={FileText}
                      title="No Study Notes Found"
                      description="Curated reference files, PDFs, and handouts have not been uploaded for this semester yet."
                    />
                  </div>
                ) : studyNotes.map((note) => {
                  const isDownloaded = downloadedNotes.includes(note.id);
                  return (
                    <div 
                      key={note.id}
                      id={`note-card-${note.id}`}
                      className="group relative glass-morphic p-5 rounded-2xl border border-white/5 hover:border-brand-cyan/20 box-glow-cyan-hover transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[9px] font-bold font-mono text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded">
                            {(note.module || "").toUpperCase()}
                          </span>
                          <div className={`p-1.5 rounded-lg bg-white/5 text-gray-500 group-hover:text-red-400 transition-colors`}>
                            <FileText className="w-5 h-5" />
                          </div>
                        </div>

                        <p className="text-[10px] font-mono text-gray-500 font-bold mb-1">{(note.subject || "").toUpperCase()}</p>
                        <h3 className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors line-clamp-2">
                          {note.title}
                        </h3>
                        <p className="text-gray-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                          {note.description}
                        </p>
                        {note.uploadDate && (
                          <p className="text-[10px] font-mono text-gray-500 mt-2">
                            UPLOAD DATE: {new Date(note.uploadDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <button
                          onClick={() => setActiveNoteForView(note)}
                          className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-semibold border border-white/5 transition-all cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDownloadNote(note)}
                          className={`py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            isDownloaded 
                              ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20" 
                              : "bg-brand-cyan text-brand-black hover:shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                          }`}
                        >
                          {isDownloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                          <span>{isDownloaded ? "Saved" : "Download"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Recorded Lecture Sessions */}
            <div className="space-y-6" id="recordings-library-section">
              <div className="pb-2 border-b border-white/5">
                <h2 className="text-xl font-bold font-display text-white flex items-center gap-2.5">
                  <Video className="w-5 h-5 text-brand-cyan" />
                  <span>Recorded Classroom Archives</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Missed a class session? Review core syllabus video archives anytime with status logging.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="recorded-sessions-grid">
                {recordedSessions.length === 0 ? (
                  <div className="col-span-1 md:col-span-2">
                    <EmptyState
                      icon={Video}
                      title="No Recorded Archives"
                      description="No digital video recordings or syllabus lectures are indexed in your course catalog at the moment."
                    />
                  </div>
                ) : recordedSessions.map((rec) => {
                  const isWatched = completedVideos.includes(rec.id);
                  return (
                    <div 
                      key={rec.id}
                      id={`rec-session-${rec.id}`}
                      className="group relative glass-morphic rounded-2xl border border-white/5 overflow-hidden flex flex-col sm:flex-row shadow-xl hover:border-brand-cyan/15 transition-all duration-300"
                    >
                      {/* Video Simulated Thumbnail Frame */}
                      <div className="relative w-full sm:w-[42%] h-[160px] sm:h-auto overflow-hidden shrink-0 bg-brand-black/40">
                        <img 
                          src={rec.thumbnail} 
                          alt={rec.subject}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-transparent to-transparent"></div>
                        <div className="absolute top-3 left-3 bg-brand-black/80 text-gray-400 font-mono text-[9px] px-2 py-0.5 rounded-md border border-white/5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-brand-cyan" />
                          <span>{rec.duration}</span>
                        </div>
                        {/* Play button Overlay trigger */}
                        <button 
                          onClick={() => handleWatchVideo(rec.id)}
                          className="absolute inset-0 m-auto w-11 h-11 bg-brand-cyan text-brand-black rounded-full flex items-center justify-center shadow-lg shadow-brand-cyan/20 cursor-pointer hover:scale-110 active:scale-95 transition-all"
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </button>
                      </div>

                      {/* Video details info box */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold font-mono text-brand-cyan">{(rec.course || rec.subject || "").toUpperCase()}</span>
                            {isWatched && (
                              <span className="text-[8px] font-bold bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/25 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                <Check className="w-2.5 h-2.5" />
                                WATCHED
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-white mb-1.5 leading-normal">
                            {rec.title || rec.subject}
                          </h3>
                          <p className="text-gray-400 text-xs leading-normal">
                            {rec.description || rec.topic}
                          </p>
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-4">
                          <span className="text-[10px] font-mono text-gray-500">FORMAT: HD MP4 video</span>
                          <button
                            onClick={() => handleWatchVideo(rec.id)}
                            className="text-xs font-semibold text-brand-cyan hover:underline hover:neon-glow-cyan flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isWatched ? "Mark as Unwatched" : "Launch Stream View"}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}

        {/* ----------------- TAB: ASSIGNMENTS & PLAYGROUND ----------------- */}
        {activeTab === "assignments" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-12"
            id="dashboard-tab-assignments-pane"
          >
            
            {/* 6. Assignment Submissions list */}
            <div className="space-y-6" id="assignments-tracking-section">
              <div className="pb-2 border-b border-white/5">
                <h2 className="text-xl font-bold font-display text-white flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-brand-cyan" />
                  <span>Syllabus Code Assignments</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Complete scheduled assignments before target deadlines to secure peer system credit scores.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="assignments-grid">
                 {assignments.length === 0 ? (
                   <div className="col-span-1 md:col-span-3">
                     <EmptyState
                       icon={BookOpen}
                       title="No Assignments Pending"
                       description="Excellent! You have no assignments to track right now. Review code play areas, references, or study guides."
                     />
                   </div>
                 ) : assignments.map((as) => {
                   const isSubmitted = submittedAssignments.includes(as.id);
                   const currentStatus = as.status || as.initialStatus || "Pending";
                   const isLate = currentStatus === "Late" && !isSubmitted;
                   const displayStatus = isSubmitted ? "Submitted" : isLate ? "Late" : "Pending";

                   return (
                     <div 
                       key={as.id}
                       id={`assignment-card-${as.id}`}
                       className="group relative glass-morphic p-6 rounded-2xl border border-white/5 hover:border-brand-cyan/25 transition-all duration-300 flex flex-col justify-between"
                     >
                       <div>
                         {/* Subject and Status tag */}
                         <div className="flex items-center justify-between mb-4">
                           <span className="text-[10px] font-bold font-mono text-brand-cyan uppercase tracking-wider">
                             {as.subject || "General"}
                           </span>
                           
                           {/* Status Pill */}
                           {isSubmitted ? (
                             <span className="text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                               <Check className="w-3 h-3" />
                               SUBMITTED
                             </span>
                           ) : isLate ? (
                             <span className="text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                               <AlertCircle className="w-3 h-3" />
                               LATE
                             </span>
                           ) : (
                             <span className="text-[9px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                               <Clock className="w-3 h-3" />
                               PENDING
                             </span>
                           )}
                         </div>

                         {/* Title */}
                         <h3 className="text-sm font-bold text-white mb-2 leading-relaxed group-hover:text-brand-cyan transition-colors">
                           {as.title || as.name}
                         </h3>

                         {/* Description */}
                         <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 mb-4">
                           {as.description || "No description provided."}
                         </p>

                         {/* Due Date & Status text details */}
                         <div className="space-y-1.5 border-t border-white/5 pt-3.5 mt-3 text-xs">
                           <div className="flex justify-between text-gray-400">
                             <span>Due Date:</span>
                             <span className="text-white font-mono font-medium">{as.dueDate || as.due}</span>
                           </div>
                           <div className="flex justify-between text-gray-400">
                             <span>Status:</span>
                             <span className={`font-semibold ${
                               isSubmitted ? "text-green-400" : isLate ? "text-red-400" : "text-yellow-400"
                             }`}>
                               {displayStatus}
                             </span>
                           </div>
                         </div>
                       </div>

                       {/* Button Actions */}
                       <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                         {isSubmitted ? (
                           <div className="space-y-3 w-full">
                             {/* ✔ Submitted display */}
                             <div className="w-full py-2 px-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-bold flex items-center justify-center gap-1.5 uppercase">
                               <Check className="w-4 h-4" />
                               ✔ Submitted
                             </div>

                             <div className="flex gap-2">
                               {/* View Submission button */}
                               <button
                                 onClick={() => handleViewSubmission(as.id)}
                                 className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/5 transition-all cursor-pointer flex items-center justify-center gap-1"
                               >
                                 View Submission
                               </button>

                               {/* Resubmit Assignment (if allowed by Admin) */}
                               {as.allowResubmission !== false && (
                                 <button
                                   onClick={() => handleOpenSubmitDialog(as)}
                                   className="flex-1 py-2 rounded-lg bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan text-xs font-bold border border-brand-cyan/20 transition-all cursor-pointer flex items-center justify-center gap-1"
                                 >
                                   Resubmit
                                 </button>
                               )}
                             </div>
                           </div>
                         ) : (
                           /* Prominent cyan button: Submit Assignment */
                           <button
                             onClick={() => handleOpenSubmitDialog(as)}
                             className="w-full py-2.5 rounded-lg bg-brand-cyan text-brand-black hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] text-xs font-bold transition-all cursor-pointer hover:scale-[1.01] flex items-center justify-center gap-1.5"
                           >
                             Submit Assignment
                           </button>
                         )}
                         
                         {/* View Criteria Link */}
                         <button
                           onClick={() => setActiveAssignmentForView(as)}
                           className="w-full py-1.5 text-center text-[11px] text-gray-500 hover:text-white transition-colors cursor-pointer"
                         >
                           View Guidelines & Criteria
                         </button>
                       </div>
                     </div>
                   );
                 })}
              </div>
            </div>

          </motion.div>
        )}

        {/* ----------------- TAB: RECORDED LECTURES ----------------- */}
        {activeTab === "recorded-lectures" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-8"
            id="dashboard-tab-recorded-lectures-pane"
          >
            
            {/* Header banner and search */}
            <div className="glass-morphic border border-white/5 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div>
                <div className="inline-flex items-center gap-1.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full px-3 py-1 mb-3 text-[11px] font-bold text-brand-cyan uppercase tracking-wider">
                  <Video className="w-3 h-3 text-brand-cyan" />
                  <span>ON-DEMAND CLASSROOM</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
                  Recorded <span className="text-brand-cyan neon-glow-cyan">Lectures Library</span>
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
                  Access archived interactive classes and premium syllabus modules at your own pace. Play, revise, and master the concepts.
                </p>
              </div>

              {/* Live search input */}
              <div className="w-full md:w-80 relative">
                <input
                  type="text"
                  placeholder="Search title, course, or module..."
                  value={lectureSearch}
                  onChange={(e) => setLectureSearch(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-brand-cyan placeholder-gray-500 transition-all font-mono"
                />
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Empty state if no lectures found */}
            {recordedLectures.filter(lecture => {
              if (lecture.status !== "Published") return false;
              const searchLower = lectureSearch.toLowerCase();
              return (
                lecture.title.toLowerCase().includes(searchLower) ||
                lecture.course.toLowerCase().includes(searchLower) ||
                lecture.module.toLowerCase().includes(searchLower) ||
                lecture.instructorName.toLowerCase().includes(searchLower)
              );
            }).length === 0 ? (
              <div className="max-w-lg mx-auto w-full">
                <EmptyState
                  icon={Search}
                  title="No Matching Recorded Lectures"
                  description="There are no published lectures matching your search criteria. Try a different search term or review other course tabs."
                />
              </div>
            ) : (
              /* Beautiful Grid of Published Lectures */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recordedLectures.filter(lecture => {
                  if (lecture.status !== "Published") return false;
                  const searchLower = lectureSearch.toLowerCase();
                  return (
                    lecture.title.toLowerCase().includes(searchLower) ||
                    lecture.course.toLowerCase().includes(searchLower) ||
                    lecture.module.toLowerCase().includes(searchLower) ||
                    lecture.instructorName.toLowerCase().includes(searchLower)
                  );
                }).map((lecture) => {
                  const embedUrl = getYouTubeEmbedUrl(lecture.videoLink);
                  return (
                    <div 
                      key={lecture.id}
                      className="glass-morphic border border-white/5 hover:border-brand-cyan/40 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col group"
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-video w-full overflow-hidden bg-brand-black border-b border-white/5">
                        <img 
                          src={lecture.thumbnail || "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=600"} 
                          alt={lecture.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/30 to-transparent opacity-85"></div>
                        
                        {/* Duration Badge */}
                        <div className="absolute bottom-3 right-3 bg-brand-black/80 border border-white/10 backdrop-blur-md text-[10px] font-bold font-mono text-brand-cyan px-2 py-1 rounded-lg flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{lecture.duration}</span>
                        </div>

                        {/* Top Course Badge */}
                        <div className="absolute top-3 left-3 bg-brand-cyan/20 border border-brand-cyan/30 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-brand-cyan px-2.5 py-1 rounded-full">
                          {lecture.course}
                        </div>
                      </div>

                      {/* Content Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400 mb-1">
                            <span className="text-white font-medium">{lecture.module}</span>
                            <span>•</span>
                            <span>{new Date(lecture.uploadDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
                          </div>

                          <h3 className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors line-clamp-2 leading-snug">
                            {lecture.title}
                          </h3>

                          <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                            {lecture.description}
                          </p>
                        </div>

                        {/* Footer details & watch action */}
                        <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold font-mono text-gray-500 uppercase tracking-wider">INSTRUCTOR</span>
                            <span className="text-xs text-white font-medium truncate max-w-[120px]">{lecture.instructorName}</span>
                          </div>

                          {embedUrl ? (
                            /* YouTube Embed player in page */
                            <button
                              onClick={() => {
                                setWatchEmbedUrl(embedUrl);
                                setWatchVideoTitle(lecture.title);
                              }}
                              className="px-4 py-2 rounded-xl bg-brand-cyan hover:bg-brand-cyan/80 text-brand-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Watch Recording</span>
                            </button>
                          ) : (
                            /* Safe non-popup blocked external link tab redirection */
                            <a
                              href={lecture.videoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-brand-cyan hover:text-brand-black text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open Video</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ----------------- TAB: DETAILED PROFILE ----------------- */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-8"
            id="dashboard-tab-profile-pane"
          >
            
            {/* 10. Student Profile Card with edit controls */}
            <div className="glass-morphic border border-white/5 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto shadow-2xl relative" id="student-detailed-profile-card">
              <div className="absolute top-0 right-12 w-20 h-[1.5px] bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent"></div>

              <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-white/5">
                
                {/* Visual student profile picture placeholder */}
                <div className="relative shrink-0">
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-brand-cyan/20 to-blue-500/20 border-2 border-brand-cyan/30 flex items-center justify-center text-brand-cyan shadow-xl select-none" id="student-photo-placeholder">
                    <User className="w-14 h-14" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-brand-cyan text-brand-black p-2 rounded-xl shadow-md border border-brand-black select-none">
                    <Sparkles className="w-4 h-4 fill-current" />
                  </div>
                </div>

                {/* Header summary text */}
                <div className="text-center sm:text-left flex-1 space-y-2">
                  <span className="font-mono text-xs text-brand-cyan bg-brand-cyan/10 px-3 py-1 rounded-md">
                    VERIFIED STUDENT PORTAL
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
                    {student.fullName}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Student ID / USN Number: <span className="text-white font-mono">{student.usn}</span>
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                    <button
                      onClick={() => {
                        setEditForm(student);
                        setEditModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/5 hover:border-brand-cyan text-gray-300 hover:text-white hover:bg-brand-cyan/5 transition-all cursor-pointer"
                      id="profile-edit-btn-trigger"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>Edit Profile Data</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-500/5 border border-red-500/10 hover:border-brand-cyan text-red-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                      id="profile-logout-btn-trigger"
                    >
                      <LogOut className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>Sign Out Portal</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Detailed profile grid metrics layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8" id="profile-details-grid">
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-cyan shrink-0" />
                    <span>{student.email}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Mobile Number</p>
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-cyan shrink-0" />
                    <span>{student.mobileNumber}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">College Name</p>
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-brand-cyan shrink-0" />
                    <span>{student.college}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Academic Branch</p>
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-brand-cyan shrink-0" />
                    <span>{student.branch}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Current Semester</p>
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-brand-cyan shrink-0" />
                    <span>{student.semester} Semester</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Verification Status</p>
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0 animate-pulse" />
                    <span className="text-brand-cyan">Syllabus Active Student</span>
                  </p>
                </div>

              </div>

              {/* Classroom sandbox system details footer */}
              <div className="mt-8 p-4 rounded-xl bg-white/[0.01] border border-white/5 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Notice: All account changes synchronize instantly with your registered Google Meet classroom credentials. If you modify your email, please update your login values accordingly. No relational fees are ever charged.
                </p>
              </div>

            </div>

            {/* Profile Edit Modal Dialog Box */}
            {editModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" id="profile-edit-modal-overlay">
                <div className="glass-morphic border border-brand-cyan/30 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative" id="profile-edit-modal">
                  
                  <h3 className="text-xl font-bold font-display text-white mb-6">
                    Edit Profile Credentials
                  </h3>

                  <form onSubmit={handleSaveProfile} className="space-y-5" id="profile-edit-form">
                    
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Full Name</label>
                      <input 
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="w-full bg-white/[0.02] border border-white/5 focus:bg-white/[0.04] focus:border-brand-cyan rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none transition-colors"
                        required
                        id="edit-fullName"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">College Name</label>
                      <input 
                        type="text"
                        value={editForm.college}
                        onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                        className="w-full bg-white/[0.02] border border-white/5 focus:bg-white/[0.04] focus:border-brand-cyan rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none transition-colors"
                        required
                        id="edit-college"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Branch</label>
                        <input 
                          type="text"
                          value={editForm.branch}
                          onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                          className="w-full bg-white/[0.02] border border-white/5 focus:bg-white/[0.04] focus:border-brand-cyan rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none transition-colors"
                          required
                          id="edit-branch"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Semester</label>
                        <select 
                          value={editForm.semester}
                          onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                          className="w-full bg-[#0d0d0d] border border-white/5 focus:bg-white/[0.04] focus:border-brand-cyan rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none transition-colors"
                          required
                          id="edit-semester"
                        >
                          <option value="1">1st Semester</option>
                          <option value="2">2nd Semester</option>
                          <option value="3">3rd Semester</option>
                          <option value="4">4th Semester</option>
                          <option value="5">5th Semester</option>
                          <option value="6">6th Semester</option>
                          <option value="7">7th Semester</option>
                          <option value="8">8th Semester</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">USN / ID</label>
                        <input 
                          type="text"
                          value={editForm.usn}
                          onChange={(e) => setEditForm({ ...editForm, usn: e.target.value })}
                          className="w-full bg-white/[0.02] border border-white/5 focus:bg-white/[0.04] focus:border-brand-cyan rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none transition-colors"
                          required
                          id="edit-usn"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Mobile Number</label>
                        <input 
                          type="text"
                          value={editForm.mobileNumber}
                          onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                          className="w-full bg-white/[0.02] border border-white/5 focus:bg-white/[0.04] focus:border-brand-cyan rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none transition-colors"
                          required
                          id="edit-mobileNumber"
                        />
                      </div>
                    </div>

                    {/* Bottom controls buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                      <button
                        type="button"
                        onClick={() => setEditModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-300 text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer"
                      >
                        Cancel Changes
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-brand-cyan text-brand-black text-xs font-bold hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
                        id="btn-edit-profile-submit"
                      >
                        Save Updated Changes
                      </button>
                    </div>

                  </form>

                </div>
              </div>
            )}

          </motion.div>
        )}



      </div>

      {/* ----------------- YOUTUBE EMBED WATCH MODAL ----------------- */}
      {watchEmbedUrl && (
        <div className="fixed inset-0 bg-brand-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-50 animate-fadeIn">
          <div className="bg-[#0b0c10] border border-white/10 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col">
            
            {/* Modal Header bar */}
            <div className="px-6 py-4 bg-white/[0.01] border-b border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <Video className="w-5 h-5 text-brand-cyan shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-white truncate font-display">
                  {watchVideoTitle}
                </h3>
              </div>
              <button
                onClick={() => {
                  setWatchEmbedUrl(null);
                  setWatchVideoTitle("");
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
              >
                Close Player
              </button>
            </div>

            {/* Video Iframe Container */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src={watchEmbedUrl}
                title={watchVideoTitle}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              ></iframe>
            </div>

            {/* Footer warning helper */}
            <div className="px-6 py-3 bg-white/[0.01] border-t border-white/5 text-[11px] text-gray-500 font-mono text-center">
              Press Escape or click Close Player above to exit the interactive lecture screen.
            </div>

          </div>
        </div>
      )}

      {/* ----------------- STUDY NOTE VIEW MODAL ----------------- */}
      {activeNoteForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" id="note-view-modal-overlay">
          <div className="glass-morphic border border-brand-cyan/30 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative" id="note-view-modal">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-lg font-bold font-display text-white">Study Note Details</h3>
              </div>
              <button
                onClick={() => setActiveNoteForView(null)}
                className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Note Title</p>
                <p className="text-base font-bold text-white mt-1">{activeNoteForView.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Course / Subject</p>
                  <p className="text-sm font-semibold text-brand-cyan mt-1">{activeNoteForView.subject}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Module</p>
                  <p className="text-sm font-semibold text-white mt-1">{activeNoteForView.module}</p>
                </div>
              </div>

              {activeNoteForView.uploadDate && (
                <div>
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Upload Date</p>
                  <p className="text-xs text-gray-300 mt-1">{new Date(activeNoteForView.uploadDate).toLocaleDateString()}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Description</p>
                <p className="text-sm text-gray-300 leading-relaxed mt-1.5 whitespace-pre-wrap">
                  {activeNoteForView.description || "No description provided for this study note handbook."}
                </p>
              </div>

              {(activeNoteForView.pdfLink || activeNoteForView.pdfData) && (
                <div>
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Attachment Reference</p>
                  <a 
                    href={activeNoteForView.pdfData || activeNoteForView.pdfLink} 
                    download={activeNoteForView.pdfName || "document.pdf"}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-brand-cyan hover:underline mt-1 inline-block"
                  >
                    {activeNoteForView.pdfName || "Open/Download PDF Document"} ↗
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-8">
              <button
                type="button"
                onClick={() => setActiveNoteForView(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-300 text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer"
              >
                Close View
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadNote(activeNoteForView);
                  setActiveNoteForView(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-brand-cyan text-brand-black text-xs font-bold hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Study PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- ASSIGNMENT VIEW MODAL ----------------- */}
      {activeAssignmentForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" id="assign-view-modal-overlay">
          <div className="glass-morphic border border-brand-cyan/30 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative" id="assign-view-modal">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-lg font-bold font-display text-white">Assignment Criteria</h3>
              </div>
              <button
                onClick={() => setActiveAssignmentForView(null)}
                className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Assignment Name / Title</p>
                <p className="text-base font-bold text-white mt-1">{activeAssignmentForView.title || activeAssignmentForView.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Subject</p>
                  <p className="text-sm font-semibold text-brand-cyan mt-1">{activeAssignmentForView.subject}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Target Due Date</p>
                  <p className="text-sm font-semibold text-white mt-1">{activeAssignmentForView.dueDate || activeAssignmentForView.due}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Detailed Description & Rules</p>
                <p className="text-sm text-gray-300 leading-relaxed mt-1.5 whitespace-pre-wrap">
                  {activeAssignmentForView.description || "Analyze and solve the assigned system requirements correctly. Generate diagnostic files as requested for completion reviews."}
                </p>
              </div>

              {(activeAssignmentForView.attachmentLink || activeAssignmentForView.attachmentUrl) && (
                <div className="p-3.5 rounded-xl bg-brand-cyan/5 border border-brand-cyan/25 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-cyan" />
                    <span className="text-xs font-semibold text-white truncate max-w-[240px]">
                      {activeAssignmentForView.attachmentName || "Attached_Specifications.pdf"}
                    </span>
                  </div>
                  <a
                    href={activeAssignmentForView.attachmentLink || activeAssignmentForView.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-brand-cyan hover:underline font-bold"
                  >
                    OPEN FILE ↗
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-8">
              <button
                type="button"
                onClick={() => setActiveAssignmentForView(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-300 text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer"
              >
                Close View
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSubmitAssignment(activeAssignmentForView.id);
                  setActiveAssignmentForView(null);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  submittedAssignments.includes(activeAssignmentForView.id)
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-brand-cyan text-brand-black hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                }`}
              >
                {submittedAssignments.includes(activeAssignmentForView.id) ? "View / Retract Submission" : "Submit Homework File"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- GLASSMORPHIC SUBMIT ASSIGNMENT DIALOG MODAL ----------------- */}
      {activeAssignmentForSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" id="submit-assignment-overlay">
          <div className="glass-morphic border border-brand-cyan/30 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden" id="submit-assignment-dialog">
            
            {/* Top Close Button */}
            <button
              onClick={() => setActiveAssignmentForSubmit(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Headers */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <Upload className="w-5 h-5 text-brand-cyan" />
                <span>Submit Assignment</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">Upload your academic homework file and optional comments below.</p>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleFinalSubmitAssignment} className="space-y-4">
              
              {/* Auto-filled details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider block">Student Name</label>
                  <input
                    type="text"
                    readOnly
                    value={student?.fullName || "Student"}
                    className="w-full bg-white/[0.01] border border-white/5 rounded-xl px-4 py-2 text-xs text-gray-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider block">USN / ID</label>
                  <input
                    type="text"
                    readOnly
                    value={student?.usn || "USN-UNSPECIFIED"}
                    className="w-full bg-white/[0.01] border border-white/5 rounded-xl px-4 py-2 text-xs text-brand-cyan font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider block">Assignment Title</label>
                <input
                  type="text"
                  readOnly
                  value={activeAssignmentForSubmit.title || activeAssignmentForSubmit.name}
                  className="w-full bg-white/[0.01] border border-white/5 rounded-xl px-4 py-2 text-xs text-white font-semibold focus:outline-none"
                />
              </div>

              {/* Drag and Drop Upload Zone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-wider block">Upload Homework File</label>
                
                {!submitFileDetails ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("academic-file-input")?.click()}
                    className={`border border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragOver 
                        ? "border-brand-cyan bg-brand-cyan/5 scale-[1.01]" 
                        : "border-white/10 hover:border-brand-cyan/40 hover:bg-white/[0.01]"
                    }`}
                  >
                    <input
                      type="file"
                      id="academic-file-input"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.jpg,.jpeg,.png,.txt,.c,.cpp,.java,.py"
                      required
                    />
                    <Upload className="w-8 h-8 text-brand-cyan/60 mx-auto mb-2" />
                    <p className="text-xs text-gray-200 font-semibold">Drag & Drop file here, or <span className="text-brand-cyan">Browse</span></p>
                    <p className="text-[9px] text-gray-500 mt-1">PDF, DOC, DOCX, PPT, ZIP, JPG, PNG, TXT, C, CPP, JAVA, PY</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand-cyan shrink-0" />
                        <div className="flex flex-col truncate max-w-[200px]">
                          <span className="text-xs font-semibold text-white truncate">{submitFileDetails.name}</span>
                          <span className="text-[10px] text-gray-500">{submitFileDetails.size} • {submitFileDetails.type.toUpperCase()}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            title: "Clear Uploaded File",
                            description: "Are you sure you want to remove this uploaded homework file? You will need to select or drop another file to submit.",
                            confirmText: "Remove File",
                            cancelText: "Keep File",
                            theme: "red",
                            onConfirm: () => {
                              setSubmitFileDetails(null);
                              setUploadProgress(0);
                            }
                          });
                        }}
                        className="text-[10px] text-red-400 hover:underline font-bold cursor-pointer"
                      >
                        REMOVE
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono text-gray-400">
                        <span className="flex items-center gap-1">
                          {uploadProgress < 100 ? (
                            <>
                              <svg className="animate-spin h-3 w-3 text-brand-cyan shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading file to secure cloud directory...
                            </>
                          ) : (
                            "Uploaded successfully"
                          )}
                        </span>
                        <span className={uploadProgress === 100 ? "text-green-400 font-bold" : "text-brand-cyan"}>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-150 ${uploadProgress === 100 ? "bg-green-500" : "bg-brand-cyan"}`}
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Comments */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-wider block">Comments / Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={submitComments}
                  onChange={(e) => setSubmitComments(e.target.value)}
                  placeholder="Add any message or submission details for the administrator..."
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-brand-cyan text-white resize-none"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-4 flex gap-3 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveAssignmentForSubmit(null)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!submitFileDetails || uploadProgress < 100}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    submitFileDetails && uploadProgress === 100
                      ? "bg-brand-cyan text-brand-black hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                      : "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
                  }`}
                >
                  Submit Assignment
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ----------------- VIEW SUBMITTED DETAILS MODAL ----------------- */}
      {viewingSubmittedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" id="submitted-details-overlay">
          <div className="glass-morphic border border-brand-cyan/30 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative" id="submitted-details-dialog">
            
            {/* Top Close Button */}
            <button
              onClick={() => setViewingSubmittedDetails(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <Check className="w-5 h-5 text-green-400" />
                <span>Your Submission</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">Details of your submitted academic file are displayed below.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Assignment Title</p>
                <p className="text-xs font-bold text-white">{viewingSubmittedDetails.assignmentTitle}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Submitted Homework File</p>
                <div className="p-3.5 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-400 shrink-0" />
                    <div className="flex flex-col truncate max-w-[200px]">
                      <span className="text-xs font-semibold text-white truncate">{viewingSubmittedDetails.fileName}</span>
                      <span className="text-[10px] text-gray-400">{viewingSubmittedDetails.fileSize} • {viewingSubmittedDetails.fileType.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Your Comments</p>
                <p className="text-xs text-gray-300 leading-relaxed bg-white/[0.01] border border-white/5 p-3 rounded-xl italic font-serif">
                  {viewingSubmittedDetails.comments || "No comments attached."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Date & Time</p>
                  <p className="text-[11px] font-mono text-white mt-1">{viewingSubmittedDetails.submittedAt}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Review Status</p>
                  <div className="mt-1">
                    {viewingSubmittedDetails.status === "Reviewed" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/10 px-2 py-0.5 rounded-full">
                        <Check className="w-2.5 h-2.5" />
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

            <div className="flex gap-3 pt-6 border-t border-white/5 mt-6">
              <button
                type="button"
                onClick={() => setViewingSubmittedDetails(null)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-white/5"
              >
                Close View
              </button>
              
              {viewingSubmittedDetails.status !== "Reviewed" && (
                <button
                  type="button"
                  onClick={() => handleRetractSubmission(viewingSubmittedDetails.assignmentId)}
                  className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer border border-red-500/20"
                >
                  Retract Submission
                </button>
              )}
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
