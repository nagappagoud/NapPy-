import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Share2, 
  Send, 
  Copy, 
  Check, 
  User, 
  ExternalLink, 
  Sparkles, 
  Phone, 
  Mail,
  ArrowLeft
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import { nappyDb } from "../services/nappyDb";

// Configure community URL in one central place
const WHATSAPP_COMMUNITY_URL = "https://whatsapp.com/channel/0029VbCxIwCEquiKxjQGm13z";

// Premium Custom Vector AI Assistant Robot Avatar Component
export function RobotAvatar({ 
  className = "w-10 h-10", 
  pulse = false 
}: { 
  className?: string; 
  pulse?: boolean;
}) {
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Intense neon cyan glow */}
          <filter id="avatar-cyan-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur1" />
            <feGaussianBlur stdDeviation="1.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Subtle metallic white gloss gradient */}
          <linearGradient id="avatar-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#F9FAFB" />
            <stop offset="85%" stopColor="#E5E7EB" />
            <stop offset="100%" stopColor="#9CA3AF" />
          </linearGradient>

          {/* Deep reflective dark glass gradient */}
          <linearGradient id="avatar-dark-glass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="60%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* 3D sphere glossy highlight */}
          <linearGradient id="avatar-gloss-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="26%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Antenna Pole with subtle gradient */}
        <rect x="47.5" y="12" width="5" height="15" fill="#9CA3AF" rx="2.5" />
        
        {/* Antenna Tip Glowing Ball */}
        <circle 
          cx="50" 
          cy="9" 
          r="5" 
          fill="#00E5FF" 
          filter="url(#avatar-cyan-glow)" 
          className={pulse ? "animate-pulse" : ""}
        />

        {/* Ear joints (R/L) */}
        <rect x="16" y="42" width="7" height="16" fill="#9CA3AF" rx="3.5" />
        <circle cx="19.5" cy="50" r="2.5" fill="#00E5FF" filter="url(#avatar-cyan-glow)" />
        
        <rect x="77" y="42" width="7" height="16" fill="#9CA3AF" rx="3.5" />
        <circle cx="80.5" cy="50" r="2.5" fill="#00E5FF" filter="url(#avatar-cyan-glow)" />

        {/* Rounded Metallic Glossy White Head Body */}
        <rect 
          x="20" 
          y="25" 
          width="60" 
          height="50" 
          fill="url(#avatar-metallic)" 
          rx="18" 
          stroke="#FFFFFF" 
          strokeWidth="1.5"
          className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
        />

        {/* 3D Glossy curved glass reflection overlay */}
        <rect 
          x="21" 
          y="26" 
          width="58" 
          height="48" 
          fill="url(#avatar-gloss-highlight)" 
          rx="17" 
          pointerEvents="none" 
        />

        {/* Inner Dark Glass Visor Screen */}
        <rect 
          x="26" 
          y="31" 
          width="48" 
          height="36" 
          fill="url(#avatar-dark-glass)" 
          rx="12" 
          stroke="#1E293B" 
          strokeWidth="1.5" 
        />

        {/* Headset Microphone curved arm */}
        <path 
          d="M 18,50 Q 11,64 26,73" 
          fill="none" 
          stroke="#4B5563" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />
        <circle 
          cx="27.5" 
          cy="73" 
          r="4" 
          fill="#00E5FF" 
          filter="url(#avatar-cyan-glow)" 
          className={pulse ? "animate-pulse" : ""}
        />

        {/* Glowing Eyes & Smile Face Group */}
        <g filter="url(#avatar-cyan-glow)">
          {/* Left Eye */}
          <ellipse 
            cx="39" 
            cy="45" 
            rx="4.5" 
            ry="4.5" 
            fill="#00E5FF" 
            className={pulse ? "animate-pulse" : ""}
          />
          {/* Right Eye */}
          <ellipse 
            cx="61" 
            cy="45" 
            rx="4.5" 
            ry="4.5" 
            fill="#00E5FF" 
            className={pulse ? "animate-pulse" : ""}
          />
          {/* Cute Digital Glowing Smile */}
          <path 
            d="M 44,55 Q 50,60 56,55" 
            fill="none" 
            stroke="#00E5FF" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
        </g>
      </svg>
    </div>
  );
}

interface FloatingAssistantProps {
  userType: "student" | "admin";
}

interface Message {
  id: string;
  sender: "student" | "assistant";
  text: string;
  time: string;
}

// Search and extract from dynamic existing NapPy data source layers
export function generateAIResponseWithDb(messageText: string): string {
  const msg = messageText.toLowerCase().trim();

  // 1. WHATSAPP
  if (msg.includes("whatsapp") || msg.includes("community") || msg.includes("channel") || msg.includes("group")) {
    return `💬 Official NapPy WhatsApp Community\n\nJoin our official learners community channel to connect with mentors, discuss weekly coding challenges, share resources, and receive fast updates.\n\n[Join WhatsApp Channel](https://whatsapp.com/channel/0029VbCxIwCEquiKxjQGm13z)`;
  }

  // 2. CONTACT ADMIN / SUPPORT
  if (msg.includes("contact") || msg.includes("support") || msg.includes("admin") || msg.includes("help") || msg.includes("phone") || msg.includes("email") || msg.includes("call")) {
    return `👤 Admin Support\n\nPhone:\n7338341925\n\nEmail:\nnappy0019@gmail.com`;
  }

  // 3. LIVE CLASS
  if (
    msg.includes("next class") || 
    msg.includes("live class") || 
    msg.includes("today class") || 
    msg.includes("google meet") || 
    msg.includes("meeting") || 
    msg.includes("class timing") || 
    msg.includes("live session") || 
    msg.includes("session") || 
    msg.includes("class") || 
    msg.includes("timing") || 
    msg.includes("when is")
  ) {
    const liveClasses = nappyDb.getLiveClasses();
    const upcoming = liveClasses.filter(c => c.status === "LIVE" || c.status === "UPCOMING");
    
    if (upcoming.length === 0) {
      return `📅 There are no upcoming live classes scheduled at the moment. Please check back later!`;
    }

    const activeClass = upcoming.find(c => c.status === "LIVE") || upcoming[0];
    
    return `📅 Your next live class is:\n\nSubject:\n${activeClass.subject}\n\nDate:\n${activeClass.date}\n\nTime:\n${activeClass.time}\n\nFaculty:\n${activeClass.instructor}\n\n[Join Meeting](${activeClass.meetUrl})`;
  }

  // 4. ASSIGNMENTS & HOMEWORK & SUBMISSIONS
  if (
    msg.includes("assignment") || 
    msg.includes("homework") || 
    msg.includes("pending") || 
    msg.includes("deadline") || 
    msg.includes("task") || 
    msg.includes("submission") || 
    msg.includes("submit")
  ) {
    const assignments = nappyDb.getAssignments();
    if (assignments.length === 0) {
      return `No assignments are available.`;
    }

    const storedAssigns = localStorage.getItem("nappy_submitted_assigns");
    const submittedIds: string[] = storedAssigns ? JSON.parse(storedAssigns) : [];

    let responseText = `📝 Current Assignments:\n`;
    assignments.forEach(assign => {
      const isSubmitted = submittedIds.includes(assign.id);
      const statusText = isSubmitted ? "✅ Submitted" : "⏳ Pending";
      responseText += `\n• Title: ${assign.title}\n  Subject: ${assign.subject}\n  Due Date: ${assign.dueDate}\n  Status: ${statusText}\n`;
    });

    return responseText;
  }

  // 5. STUDY NOTES
  if (
    msg.includes("study notes") || 
    msg.includes("pdf") || 
    msg.includes("notes") || 
    msg.includes("download notes") || 
    msg.includes("download")
  ) {
    const notes = nappyDb.getNotes();
    if (notes.length === 0) {
      return `No study notes have been uploaded yet.`;
    }

    let responseText = `📚 Available Notes:\n`;
    notes.forEach(note => {
      const displayTitle = note.title || note.pdfName || `${note.module} Notes`;
      responseText += `\n• ${displayTitle} (${note.subject})\n  [Download Note](download-note:${note.id})\n`;
    });

    return responseText;
  }

  // 6. RECORDED LECTURES
  if (
    msg.includes("videos") || 
    msg.includes("recorded class") || 
    msg.includes("lecture recording") || 
    msg.includes("video") || 
    msg.includes("past class") || 
    msg.includes("lectures") || 
    msg.includes("recording")
  ) {
    const lectures = nappyDb.getRecordedLectures();
    if (lectures.length === 0) {
      return `No recorded lectures are available at this moment.`;
    }

    let responseText = `🎥 Available Recorded Lectures:\n`;
    lectures.forEach(lec => {
      responseText += `\n• ${lec.title}\n  Course: ${lec.course}\n  Duration: ${lec.duration}\n  [Watch Lecture](${lec.videoLink})\n`;
    });

    return responseText;
  }

  // 7. ANNOUNCEMENTS
  if (
    msg.includes("announcement") || 
    msg.includes("notice") || 
    msg.includes("updates") || 
    msg.includes("notices")
  ) {
    const announcements = nappyDb.getAnnouncements();
    if (announcements.length === 0) {
      return `No announcements have been posted yet.`;
    }

    let responseText = `📢 Latest Announcements:\n`;
    announcements.forEach(ann => {
      const priorityLabel = ann.priority === "High" ? "🔴 High" : ann.priority === "Normal" ? "🟡 Normal" : "🟢 Low";
      responseText += `\n• Title: ${ann.title}\n  Priority: ${priorityLabel}\n  Date: ${ann.date}\n  Message: ${ann.message}\n`;
    });

    return responseText;
  }

  // 8. STUDENT PROFILE
  if (
    msg.includes("profile") || 
    msg.includes("my details") || 
    msg.includes("usn") || 
    msg.includes("semester") || 
    msg.includes("student")
  ) {
    const loggedInStudent = localStorage.getItem("nappy_logged_in_student");
    if (!loggedInStudent) {
      return `👤 I couldn't locate your profile session. Please make sure you are logged in.`;
    }
    try {
      const student = JSON.parse(loggedInStudent);
      return `👤 Your Student Profile:\n\nName: ${student.name || "N/A"}\nUSN: ${student.usn || "N/A"}\nBranch: ${student.branch || "N/A"}\nSemester: ${student.semester || "N/A"}\nEmail: ${student.email || "N/A"}\nPhone: ${student.phone || "N/A"}`;
    } catch {
      return `👤 Error parsing your profile data.`;
    }
  }

  // GREETINGS
  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey") || msg.includes("greetings")) {
    return `👋 Hello! I am your NapPy AI Assistant. How can I help you today with your courses, notes, or lectures?`;
  }

  if (msg.includes("thank") || msg.includes("thanks") || msg.includes("ty")) {
    return `You're very welcome! NapPy AI is always here to assist your learning journey. Happy coding! 🚀`;
  }

  // UNKNOWN QUESTIONS
  return `I couldn't find information related to that inside NapPy.\n\nYou can ask me about:\n\n• Live Classes\n• Assignments\n• Study Notes\n• Recorded Lectures\n• Announcements\n• Assignment Submission\n• Contact Admin\n• WhatsApp Community`;
}

// React Rich Text and Button rendering component to build premium functional cards inside chat
export function parseMessageContent(text: string, onDownloadNote?: (id: string) => void) {
  const parts: React.ReactNode[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, matchIndex)}</span>);
    }

    const label = match[1];
    const target = match[2];

    if (target.startsWith("download-note:")) {
      const noteId = target.replace("download-note:", "");
      parts.push(
        <button
          key={`btn-${matchIndex}`}
          onClick={() => onDownloadNote?.(noteId)}
          className="mt-2.5 px-3 py-1.5 bg-brand-cyan text-brand-black text-[11px] font-bold rounded-lg hover:shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-all cursor-pointer flex items-center gap-1.5 self-start"
        >
          <span>📥 {label}</span>
        </button>
      );
    } else {
      let icon = "🔗";
      let btnStyle = "bg-white/10 hover:bg-white/20 border border-white/10 text-white";
      
      if (label.toLowerCase().includes("meet") || label.toLowerCase().includes("class") || label.toLowerCase().includes("meeting")) {
        icon = "📅";
        btnStyle = "bg-brand-cyan text-brand-black hover:bg-opacity-95 font-bold hover:shadow-[0_0_12px_rgba(0,229,255,0.4)]";
      } else if (label.toLowerCase().includes("whatsapp") || label.toLowerCase().includes("community") || label.toLowerCase().includes("channel")) {
        icon = "💬";
        btnStyle = "bg-green-500 text-white hover:bg-green-600 font-bold hover:shadow-[0_0_12px_rgba(34,197,94,0.4)]";
      } else if (label.toLowerCase().includes("watch") || label.toLowerCase().includes("video") || label.toLowerCase().includes("lecture")) {
        icon = "🎥";
        btnStyle = "bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan hover:text-black font-bold border border-brand-cyan/30";
      }

      parts.push(
        <a
          key={`link-${matchIndex}`}
          href={target}
          target="_blank"
          rel="noreferrer"
          className={`mt-2.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${btnStyle}`}
        >
          <span>{icon} {label}</span>
        </a>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : [text];
}

export default function FloatingAssistant({ userType }: FloatingAssistantProps) {
  const { success, error } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  
  // Tabs: "menu" | "contact" | "whatsapp"
  const [activeTab, setActiveTab] = useState<"menu" | "contact" | "whatsapp">("menu");

  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem("nappy_assistant_chat_history_v2");
    return saved ? JSON.parse(saved) : [
      {
        id: "initial",
        sender: "assistant",
        text: "👋 Welcome to NapPy!\n\nI'm your AI Assistant.\n\nI can instantly help you with:\n\n📅 Live Classes\n\n📚 Study Notes\n\n🎥 Recorded Lectures\n\n📝 Assignments\n\n📢 Announcements\n\n👤 Contact Admin\n\n💬 WhatsApp Community\n\nJust type your question below.",
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
      }
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionStorage.setItem("nappy_assistant_chat_history_v2", JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isTyping, isOpen, activeTab]);

  const adminEmail = "nappy0019@gmail.com";
  const adminPhone = "7338341925";
  const adminName = "Nagappagoud Patil";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(adminEmail);
      setCopiedEmail(true);
      success("Copied to Clipboard", "Admin support email copied to clipboard.");
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error("Failed to copy email: ", err);
      error("Copy Failed", "Unable to copy support email.");
    }
  };

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(adminPhone);
      setCopiedPhone(true);
      success("Copied to Clipboard", "Admin support phone number copied to clipboard.");
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch (err) {
      console.error("Failed to copy phone: ", err);
      error("Copy Failed", "Unable to copy support phone number.");
    }
  };

  const handleDownloadNoteFromChat = (id: string) => {
    const notes = nappyDb.getNotes();
    const note = notes.find(n => n.id === id);
    if (!note) {
      error("Download Failed", "Selected study note could not be located in the database.");
      return;
    }

    const storedNotes = localStorage.getItem("nappy_downloaded_notes");
    const downloaded: string[] = storedNotes ? JSON.parse(storedNotes) : [];
    if (!downloaded.includes(id)) {
      const updated = [...downloaded, id];
      localStorage.setItem("nappy_downloaded_notes", JSON.stringify(updated));
    }

    // Save notes to trigger nappyDb events so the dashboard reacts in real-time
    nappyDb.saveNotes(notes);

    const title = note.title || note.module || "Syllabus Study Guide";
    const subject = note.subject || "Course Material";
    const module = note.module || "General";
    const description = note.description || "Summary Notes";
    const filename = note.pdfName || `${id}_notes.pdf`;

    if (note.pdfData) {
      const element = document.createElement("a");
      element.href = note.pdfData;
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
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
      ], {type: "text/plain"});
      element.href = URL.createObjectURL(file);
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }

    success("Download Complete", `"${title}" has been downloaded and added to your Vault.`);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const userMsg = messageText.trim();
    
    if (userMsg.toLowerCase().includes("error") || userMsg.toLowerCase().includes("fail") || userMsg.toLowerCase().includes("bug")) {
      error("AI Assistant Error", "Failed to retrieve cognitive context from database service. Please retry.");
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    const userMessageObj: Message = {
      id: "msg_user_" + Date.now(),
      sender: "student",
      text: userMsg,
      time: timeStr
    };

    setMessages(prev => [...prev, userMessageObj]);
    setMessageText("");
    setIsTyping(true);

    const delay = 1000 + Math.random() * 800;
    setTimeout(() => {
      const botResponse = generateAIResponseWithDb(userMsg);
      const botMessageObj: Message = {
        id: "msg_bot_" + Date.now(),
        sender: "assistant",
        text: botResponse,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        })
      };
      setMessages(prev => [...prev, botMessageObj]);
      setIsTyping(false);
    }, delay);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Floating Panel Backdrop Blur & Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-20 right-0 w-[380px] sm:w-[420px] h-[550px] overflow-hidden rounded-2xl border border-white/10 bg-black/95 shadow-[0_20px_50px_rgba(6,182,212,0.15)] backdrop-blur-xl flex flex-col font-sans"
          >
            {/* Header */}
            <div className="relative p-5 border-b border-white/5 bg-gradient-to-r from-brand-black to-brand-cyan/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0.8, y: 10, opacity: 0 }}
                  animate={{ scale: 1, y: [0, -3, 0], opacity: 1 }}
                  transition={{
                    scale: { duration: 0.3, ease: "easeOut" },
                    opacity: { duration: 0.3, ease: "easeOut" },
                    y: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.3
                    }
                  }}
                  className="w-11 h-11 shrink-0 p-0.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center"
                >
                  <RobotAvatar className="w-10 h-10" pulse={true} />
                </motion.div>
                <div>
                  <h3 className="text-sm font-bold font-display text-white tracking-wide">
                    NapPy AI Assistant
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Your personal learning companion
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* View Switcher / Sub-Views */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col min-h-0">
              
              {/* Back Button for Sub-Tabs */}
              {activeTab !== "menu" && (
                <div className="px-4 pt-3 shrink-0">
                  <button 
                    onClick={() => setActiveTab("menu")}
                    className="flex items-center gap-1.5 text-xs text-brand-cyan hover:text-white font-medium transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Chat Menu</span>
                  </button>
                </div>
              )}

              {/* VIEW 1: Main AI Chat Deck */}
              {activeTab === "menu" && (
                <div className="flex-1 flex flex-col min-h-0">
                  
                  {/* Persistent Quick Navigation Cards inside Main View */}
                  <div className="p-4 pb-2 grid grid-cols-2 gap-2 border-b border-white/5 shrink-0">
                    <button
                      onClick={() => setActiveTab("whatsapp")}
                      className="text-left p-2.5 rounded-xl border border-white/5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:border-green-400/40 group transition-all duration-300 cursor-pointer flex items-center gap-2"
                    >
                      <div className="p-1.5 rounded-lg bg-white/5 text-green-400 shrink-0">
                        <Share2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-bold text-white group-hover:text-brand-cyan transition-colors truncate">
                          WhatsApp Group
                        </h4>
                        <span className="text-[8px] bg-green-500/20 border border-green-500/30 rounded px-1 py-0.5 text-green-400 font-bold uppercase tracking-wider">
                          Official
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("contact")}
                      className="text-left p-2.5 rounded-xl border border-white/5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:border-blue-400/40 group transition-all duration-300 cursor-pointer flex items-center gap-2"
                    >
                      <div className="p-1.5 rounded-lg bg-white/5 text-blue-400 shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-bold text-white group-hover:text-brand-cyan transition-colors truncate">
                          Contact Support
                        </h4>
                        <span className="text-[8px] bg-brand-cyan/20 border border-brand-cyan/30 rounded px-1 py-0.5 text-brand-cyan font-bold uppercase tracking-wider">
                          Nagappa
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Scrollable Conversation Bubbles */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col min-h-0">
                    {messages.map((msg) => (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className={`flex flex-col ${msg.sender === "student" ? "items-end" : "items-start"}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm whitespace-pre-wrap break-words flex flex-col ${
                          msg.sender === "student"
                            ? "bg-brand-cyan text-black rounded-tr-none"
                            : "bg-white/5 border border-white/10 text-white rounded-tl-none"
                        }`}>
                          {msg.sender === "student" ? msg.text : parseMessageContent(msg.text, handleDownloadNoteFromChat)}
                        </div>
                        <span className="text-[9px] text-gray-500 mt-1 font-mono">
                          {msg.time}
                        </span>
                      </motion.div>
                    ))}

                    {/* Chatbot Typing Loader */}
                    {isTyping && (
                      <div className="flex flex-col items-start space-y-1.5 animate-fadeIn">
                        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-brand-cyan animate-pulse shrink-0" />
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce"></span>
                          </div>
                        </div>
                        <span className="text-[9px] text-gray-500 font-mono tracking-wider ml-1">
                          NapPy AI is compiling response...
                        </span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Bottom Textbox Chat Bar with Enter key and Shift+Enter key capability */}
                  <div className="p-3 border-t border-white/5 bg-black/40 shrink-0">
                    <div className="relative flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1 focus-within:border-brand-cyan/50 transition-all">
                      <textarea 
                        placeholder="Ask anything about NapPy..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        rows={1}
                        className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white focus:outline-none placeholder-gray-500 resize-none max-h-20 custom-scrollbar leading-relaxed"
                        id="chat-user-input-box"
                      />
                      <button 
                        onClick={handleSendMessage}
                        disabled={isTyping || !messageText.trim()}
                        className={`p-1.5 rounded-lg transition-all shrink-0 self-end mb-0.5 ${
                          isTyping 
                            ? "bg-white/5 text-gray-500 cursor-not-allowed"
                            : "bg-brand-cyan/20 hover:bg-brand-cyan hover:text-black text-brand-cyan cursor-pointer"
                        }`}
                        title="Send Message"
                        id="chat-send-btn"
                      >
                        {isTyping ? (
                          <svg className="animate-spin h-3.5 w-3.5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: WhatsApp Card */}
              {activeTab === "whatsapp" && (
                <div className="p-5 space-y-4 animate-fadeIn flex-1 flex flex-col justify-between">
                  <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 text-center relative overflow-hidden">
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-brand-cyan/20 border border-brand-cyan/30 rounded text-[8px] text-brand-cyan font-bold font-mono tracking-wider uppercase">
                      Official NapPy Community
                    </div>
                    
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3 border border-green-500/20">
                      <Share2 className="w-6 h-6 text-green-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white font-display mt-2">NapPy Learners Community</h4>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      Join our official WhatsApp group channel to connect with mentors, discuss weekly coding challenges, share resources, and receive fast updates.
                    </p>
                  </div>

                  <a 
                    href={WHATSAPP_COMMUNITY_URL} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.2)] mt-auto"
                  >
                    <span>Join WhatsApp Community</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* VIEW 3: Contact Admin Details */}
              {activeTab === "contact" && (
                <div className="p-5 space-y-4 animate-fadeIn">
                  <div className="glass-morphic border border-white/5 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-cyan/10 flex items-center justify-center border border-brand-cyan/20 shrink-0">
                        <User className="w-4 h-4 text-brand-cyan" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-mono">ADMINISTRATOR</p>
                        <p className="text-xs font-bold text-white">{adminName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-cyan/10 flex items-center justify-center border border-brand-cyan/20 shrink-0">
                        <Mail className="w-4 h-4 text-brand-cyan" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-mono">SUPPORT EMAIL</p>
                        <p className="text-xs font-mono text-white">{adminEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-cyan/10 flex items-center justify-center border border-brand-cyan/20 shrink-0">
                        <Phone className="w-4 h-4 text-brand-cyan" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-mono">SUPPORT NUMBER</p>
                        <p className="text-xs font-mono text-white">{adminPhone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href={`mailto:${adminEmail}`}
                      className="py-2.5 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan hover:text-black text-brand-cyan font-bold text-xs flex items-center justify-center gap-2 transition-all border border-brand-cyan/20 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>📧 Email Admin</span>
                    </a>
                    
                    <a 
                      href={`tel:${adminPhone}`}
                      className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-white/10 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>📞 Call Support</span>
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleCopyEmail}
                      className="py-2 rounded-lg bg-white/[0.02] hover:bg-white/5 text-gray-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all border border-white/5 cursor-pointer"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-brand-cyan" />
                          <span className="text-brand-cyan">Copied Email!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>📋 Copy Email</span>
                        </>
                      )}
                    </button>

                    <button 
                      onClick={handleCopyPhone}
                      className="py-2 rounded-lg bg-white/[0.02] hover:bg-white/5 text-gray-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all border border-white/5 cursor-pointer"
                    >
                      {copiedPhone ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-brand-cyan" />
                          <span className="text-brand-cyan">Copied Phone!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>📋 Copy Phone</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Active Online Footer */}
            <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between px-4 shrink-0">
              <span className="text-[10px] font-mono text-gray-500">SYSTEM AGENT</span>
              <span className="text-[10px] font-mono text-brand-cyan font-bold tracking-wider uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                ACTIVE ONLINE
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Circular Assistant Button */}
      <div className="relative group">
        {/* Pulse expanding ring background effect with high-quality glow */}
        <div className="absolute -inset-1.5 bg-brand-cyan/40 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
        
        {/* Outer scale and smooth breathing animations */}
        <motion.button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setActiveTab("menu");
            }
          }}
          animate={{
            y: [0, -6, 0],
            boxShadow: isOpen 
              ? [
                  "0 0 20px rgba(0, 229, 255, 0.4)",
                  "0 0 35px rgba(0, 229, 255, 0.7)",
                  "0 0 20px rgba(0, 229, 255, 0.4)"
                ]
              : [
                  "0 0 15px rgba(0, 229, 255, 0.25)",
                  "0 0 28px rgba(0, 229, 255, 0.55)",
                  "0 0 15px rgba(0, 229, 255, 0.25)"
                ]
          }}
          transition={{
            y: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            },
            boxShadow: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          whileHover={{ 
            scale: 1.1,
            boxShadow: "0 0 35px rgba(0, 229, 255, 0.8)",
          }}
          whileTap={{ scale: 0.95 }}
          className={`relative w-14 h-14 rounded-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border ${isOpen ? 'border-brand-cyan/90' : 'border-brand-cyan/35'} flex items-center justify-center text-white cursor-pointer z-50`}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                <X className="w-6 h-6 text-brand-cyan" />
              </motion.div>
            ) : (
              <motion.div
                key="avatar"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative w-10 h-10 flex items-center justify-center"
              >
                <RobotAvatar className="w-10 h-10" pulse={true} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-neutral-950 flex items-center justify-center animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-neutral-950"></span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
