// Decoupled Data Layer for NapPy
// This service abstracts localStorage operations.
// Replacing this layer with a real-time database (such as Supabase) in the future 
// can be done directly here with minimal changes to the frontend UI components.

export interface Note {
  id: string;
  subject: string; // Used as Course/Subject
  module: string;
  pdfName: string; // Used as PDF Link/File Name
  description: string;
  title?: string;
  uploadDate?: string;
  pdfData?: string; // Base64 data URL of the uploaded PDF
}

export interface LiveClass {
  id: string;
  subject: string; // Used as Class Title
  instructor: string;
  date: string;
  time: string; // Used for Start/End Time
  meetUrl: string;
  status: "LIVE" | "UPCOMING" | "COMPLETED";
  course?: string;
  module?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string; // Course/Subject
  dueDate: string;
  status: "Pending" | "Submitted" | "Late";
  description?: string;
  attachmentLink?: string;
  allowResubmission?: boolean; // Admin can toggle this to enable resubmissions
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentName: string;
  studentUsn: string;
  studentBranch: string;
  studentSemester: string;
  studentEmail: string;
  comments?: string;
  submittedAt: string; // Formatted date & time
  fileName: string;
  fileSize: string;
  fileType: string;
  fileData?: string; // Abstract storage representation (Base64 data or object URL representation)
  status: "Submitted" | "Reviewed";
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: "High" | "Normal" | "Low";
  date: string;
}

export interface RecordedLecture {
  id: string;
  title: string;
  course: string;
  module: string;
  instructorName: string;
  duration: string;
  description: string;
  thumbnail: string;
  videoLink: string;
  uploadDate?: string;
  status: "Published" | "Draft";
}

// Custom event for same-tab cross-component reactivity
const DB_UPDATE_EVENT = "nappy_db_update";

const triggerUpdate = () => {
  window.dispatchEvent(new Event(DB_UPDATE_EVENT));
};

export const nappyDb = {
  // NOTES
  getNotes(): Note[] {
    const data = localStorage.getItem("nappy_admin_notes");
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },
  saveNotes(notes: Note[]) {
    localStorage.setItem("nappy_admin_notes", JSON.stringify(notes));
    triggerUpdate();
  },

  // LIVE CLASSES
  getLiveClasses(): LiveClass[] {
    const data = localStorage.getItem("nappy_admin_live_classes");
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },
  saveLiveClasses(classes: LiveClass[]) {
    localStorage.setItem("nappy_admin_live_classes", JSON.stringify(classes));
    triggerUpdate();
  },

  // ASSIGNMENTS
  getAssignments(): Assignment[] {
    const data = localStorage.getItem("nappy_admin_assignments");
    if (!data) {
      const defaultAssignments: Assignment[] = [
        {
          id: "a-1",
          title: "Python Advanced Decorators and Metaclasses",
          subject: "Advanced Python Programming",
          dueDate: "2026-07-25",
          status: "Pending",
          description: "Write a custom metaclass that validates attribute types at definition time. Include sample decorator functions for profiling execution times of high-throughput calculations.",
          attachmentLink: "https://example.com/materials/decorators_and_metaclasses.pdf",
          allowResubmission: true
        },
        {
          id: "a-2",
          title: "Numerical Analysis & Algorithmic Complexities",
          subject: "Computer Science Mathematics",
          dueDate: "2026-07-20",
          status: "Pending",
          description: "Analyze the runtime constraints and space complexities of different numerical integration techniques. Implement standard algorithms using memory-efficient generators.",
          attachmentLink: "https://example.com/materials/numerical_analysis_complexities.pdf",
          allowResubmission: false
        },
        {
          id: "a-3",
          title: "Data Structure Optimization Challenge",
          subject: "Data Structures & Algorithms",
          dueDate: "2026-07-30",
          status: "Pending",
          description: "Optimize a binary search tree lookup mechanism for heavily read-biased scenarios. Compare with red-black trees.",
          attachmentLink: "https://example.com/materials/dsa_optimization.pdf",
          allowResubmission: true
        }
      ];
      localStorage.setItem("nappy_admin_assignments", JSON.stringify(defaultAssignments));
      return defaultAssignments;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },
  saveAssignments(assigns: Assignment[]) {
    localStorage.setItem("nappy_admin_assignments", JSON.stringify(assigns));
    triggerUpdate();
  },

  // ANNOUNCEMENTS
  getAnnouncements(): Announcement[] {
    const data = localStorage.getItem("nappy_announcements");
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },
  saveAnnouncements(anns: Announcement[]) {
    localStorage.setItem("nappy_announcements", JSON.stringify(anns));
    triggerUpdate();
  },

  // RECORDED LECTURES
  getRecordedLectures(): RecordedLecture[] {
    const data = localStorage.getItem("nappy_recorded_lectures");
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },
  saveRecordedLectures(lectures: RecordedLecture[]) {
    localStorage.setItem("nappy_recorded_lectures", JSON.stringify(lectures));
    triggerUpdate();
  },

  // ASSIGNMENT SUBMISSIONS
  getAssignmentSubmissions(): AssignmentSubmission[] {
    const data = localStorage.getItem("nappy_assignment_submissions");
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },
  saveAssignmentSubmissions(submissions: AssignmentSubmission[]) {
    localStorage.setItem("nappy_assignment_submissions", JSON.stringify(submissions));
    triggerUpdate();
  },

  // SUBSCRIPTION MECHANISM
  subscribe(callback: () => void): () => void {
    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("nappy_")) {
        callback();
      }
    };
    window.addEventListener(DB_UPDATE_EVENT, callback);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(DB_UPDATE_EVENT, callback);
      window.removeEventListener("storage", handleStorage);
    };
  }
};
