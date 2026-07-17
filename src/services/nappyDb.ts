import { supabase } from "./supabaseClient";

export interface Note {
  id: string;
  subject: string;
  module: string;
  pdfName: string;
  description: string;
  title?: string;
  uploadDate?: string;
  pdfData?: string;
}

export interface LiveClass {
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

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Late";
  description?: string;
  attachmentLink?: string;
  allowResubmission?: boolean;
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
  submittedAt: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileData?: string;
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

export interface Course {
  id: string;
  name: string;
  category: string;
  enrolledStudents: number;
  status: "Active" | "Draft";
}

export interface Student {
  fullName: string;
  email: string;
  mobileNumber: string;
  college: string;
  usn: string;
  branch: string;
  semester: string;
  status?: string;
  registrationDate?: string;
  password?: string;
}

const DB_UPDATE_EVENT = "nappy_db_update";
const SYNC_STATUS_EVENT = "nappy_sync_status_update";

const triggerUpdate = () => {
  window.dispatchEvent(new Event(DB_UPDATE_EVENT));
};

const triggerSyncUpdate = () => {
  window.dispatchEvent(new Event(SYNC_STATUS_EVENT));
};

let syncStatus: "idle" | "syncing" | "synced" | "error" = "idle";
let lastSyncedAt: Date | null = null;
let syncErrorMessage = "";

// In-Memory Database Cache (Single Source of Truth)
let localCache = {
  notes: [] as Note[],
  liveClasses: [] as LiveClass[],
  assignments: [] as Assignment[],
  announcements: [] as Announcement[],
  recordedLectures: [] as RecordedLecture[],
  assignmentSubmissions: [] as AssignmentSubmission[],
  courses: [] as Course[],
  students: [] as Student[],
  admins: [] as any[],
  adminSettings: {} as Record<string, any>
};

// Helper to make sure IDs conform to UUID requirements
function ensureUuid(id: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id;
  }
  
  try {
    let clean = id.replace(/[^a-f0-9]/gi, "").toLowerCase();
    if (clean.length < 32) {
      clean = clean.padEnd(32, "0");
    } else if (clean.length > 32) {
      clean = clean.substring(0, 32);
    }
    return `${clean.substring(0, 8)}-${clean.substring(8, 12)}-${clean.substring(12, 16)}-${clean.substring(16, 20)}-${clean.substring(20, 32)}`;
  } catch {
    return "00000000-0000-4000-8000-000000000000";
  }
}

// Helper to upload base64 file payloads directly to Supabase Storage Bucket 'nappy_vault'
export async function uploadFileToSupabase(bucketName: string, fileName: string, base64OrBlob: string | Blob): Promise<string | null> {
  if (!supabase) return null;
  try {
    let fileBlob: Blob;
    if (typeof base64OrBlob === "string") {
      const arr = base64OrBlob.split(",");
      const mime = arr[0].match(/:(.*?);/)?.[1] || "application/octet-stream";
      const bstr = atob(arr[1] || arr[0]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      fileBlob = new Blob([u8arr], { type: mime });
    } else {
      fileBlob = base64OrBlob;
    }

    const cleanedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}_${cleanedFileName}`;
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, fileBlob, {
        cacheControl: "3600",
        upsert: true
      });

    if (error) {
      console.warn("Storage upload error:", error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);

    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.warn("Storage upload exception:", err);
    return null;
  }
}

// Data Converters
function noteFromDb(row: any): Note {
  return {
    id: row.id,
    subject: row.subject,
    module: row.module,
    title: row.title,
    description: row.description,
    pdfName: row.pdf_name,
    pdfData: row.pdf_url || row.pdf_data || "",
    uploadDate: row.upload_date
  };
}

function liveClassFromDb(row: any): LiveClass {
  return {
    id: row.id,
    subject: row.subject,
    instructor: row.instructor,
    date: row.date,
    time: row.time,
    meetUrl: row.meet_url,
    status: row.status,
    course: row.course,
    module: row.module
  };
}

function assignmentFromDb(row: any): Assignment {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    dueDate: row.due_date,
    status: row.status,
    description: row.description,
    attachmentLink: row.attachment_link,
    allowResubmission: row.allow_resubmission
  };
}

function announcementFromDb(row: any): Announcement {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    priority: row.priority,
    date: row.date
  };
}

function recordedLectureFromDb(row: any): RecordedLecture {
  return {
    id: row.id,
    title: row.title,
    course: row.course,
    module: row.module,
    instructorName: row.instructor_name,
    duration: row.duration,
    description: row.description,
    thumbnail: row.thumbnail,
    videoLink: row.video_link,
    uploadDate: row.upload_date,
    status: row.status
  };
}

function submissionFromDb(row: any): AssignmentSubmission {
  return {
    id: row.id,
    assignmentId: row.assignment_id,
    assignmentTitle: row.assignment_title,
    studentName: row.student_name,
    studentUsn: row.student_usn,
    studentBranch: row.student_branch,
    studentSemester: row.student_semester,
    studentEmail: row.student_email,
    comments: row.comments,
    submittedAt: row.submitted_at,
    fileName: row.file_name,
    fileSize: row.file_size,
    fileType: row.file_type,
    fileData: row.file_url || row.file_data || "",
    status: row.status
  };
}

function courseFromDb(row: any): Course {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    enrolledStudents: row.enrolled_students,
    status: row.status
  };
}

function studentFromDb(row: any): Student {
  return {
    fullName: row.full_name,
    email: row.email,
    mobileNumber: row.mobile_number,
    college: row.college,
    usn: row.usn,
    branch: row.branch,
    semester: row.semester,
    status: row.status,
    registrationDate: row.registration_date,
    password: row.password
  };
}

// Direct Row Mapping Functions for Storage
async function mapNoteToDb(note: Note) {
  let pdfUrl = note.pdfData?.startsWith("http") ? note.pdfData : null;
  let pdfData = note.pdfData;

  if (pdfData && pdfData.startsWith("data:")) {
    const uploadedUrl = await uploadFileToSupabase("nappy_vault", note.pdfName || "note.pdf", pdfData);
    if (uploadedUrl) {
      pdfUrl = uploadedUrl;
      pdfData = null; // Purge base64
    }
  }

  return {
    id: ensureUuid(note.id),
    subject: note.subject || "",
    module: note.module || "",
    title: note.title || note.pdfName || "Untitled Note",
    description: note.description || "",
    pdf_name: note.pdfName || "",
    pdf_data: pdfData || null,
    pdf_url: pdfUrl,
    upload_date: note.uploadDate ? new Date(note.uploadDate).toISOString() : new Date().toISOString()
  };
}

async function mapLiveClassToDb(c: LiveClass) {
  return {
    id: ensureUuid(c.id),
    subject: c.subject || "",
    instructor: c.instructor || "",
    date: c.date || "",
    time: c.time || "",
    meet_url: c.meetUrl || "",
    status: c.status || "UPCOMING",
    course: c.course || "",
    module: c.module || ""
  };
}

async function mapAssignmentToDb(a: Assignment) {
  return {
    id: ensureUuid(a.id),
    title: a.title || "",
    subject: a.subject || "",
    due_date: a.dueDate || "",
    status: a.status || "Pending",
    description: a.description || "",
    attachment_link: a.attachmentLink || "",
    allow_resubmission: a.allowResubmission ?? true
  };
}

async function mapAnnouncementToDb(a: Announcement) {
  return {
    id: ensureUuid(a.id),
    title: a.title || "",
    message: a.message || "",
    priority: a.priority || "Normal",
    date: a.date || ""
  };
}

async function mapRecordedLectureToDb(l: RecordedLecture) {
  return {
    id: ensureUuid(l.id),
    title: l.title || "",
    course: l.course || "",
    module: l.module || "",
    instructor_name: l.instructorName || "",
    duration: l.duration || "",
    description: l.description || "",
    thumbnail: l.thumbnail || "",
    video_link: l.videoLink || "",
    upload_date: l.uploadDate ? new Date(l.uploadDate).toISOString() : new Date().toISOString(),
    status: l.status || "Published"
  };
}

async function mapSubmissionToDb(sub: AssignmentSubmission) {
  let fileUrl = sub.fileData?.startsWith("http") ? sub.fileData : null;
  let fileData = sub.fileData;

  if (fileData && fileData.startsWith("data:")) {
    const uploadedUrl = await uploadFileToSupabase("nappy_vault", sub.fileName || "homework.pdf", fileData);
    if (uploadedUrl) {
      fileUrl = uploadedUrl;
      fileData = null; // Clear base64
    }
  }

  return {
    id: ensureUuid(sub.id),
    assignment_id: ensureUuid(sub.assignmentId),
    assignment_title: sub.assignmentTitle || "",
    student_name: sub.studentName || "",
    student_usn: sub.studentUsn || "",
    student_branch: sub.studentBranch || "",
    student_semester: sub.studentSemester || "",
    student_email: sub.studentEmail || "",
    comments: sub.comments || "",
    submitted_at: sub.submittedAt ? new Date(sub.submittedAt).toISOString() : new Date().toISOString(),
    file_name: sub.fileName || "",
    file_size: sub.fileSize || "",
    file_type: sub.fileType || "",
    file_data: fileData || null,
    file_url: fileUrl,
    status: sub.status || "Submitted"
  };
}

async function mapCourseToDb(c: Course) {
  return {
    id: ensureUuid(c.id),
    name: c.name || "",
    category: c.category || "",
    enrolled_students: c.enrolledStudents || 0,
    status: c.status || "Active"
  };
}

async function mapStudentToDb(s: Student) {
  return {
    id: ensureUuid(s.usn || s.email),
    full_name: s.fullName || "",
    email: s.email || "",
    mobile_number: s.mobileNumber || "",
    college: s.college || "",
    usn: s.usn || "",
    branch: s.branch || "",
    semester: s.semester || "",
    status: s.status || "Active",
    registration_date: s.registrationDate ? new Date(s.registrationDate).toISOString() : new Date().toISOString(),
    password: s.password || ""
  };
}

// Bulk Sync Array Helper (Upserts changed & deletes missing)
async function syncArrayToSupabase(
  tableName: string,
  updatedArray: any[],
  mapToDbRow: (item: any) => Promise<any> | any,
  idField: string = "id"
) {
  if (!supabase) return;

  syncStatus = "syncing";
  triggerSyncUpdate();

  try {
    const dbRows = [];
    for (const item of updatedArray) {
      const row = await mapToDbRow(item);
      dbRows.push(row);
    }

    if (dbRows.length > 0) {
      const { error } = await supabase.from(tableName).upsert(dbRows, { onConflict: idField });
      if (error) throw error;
    }

    const updatedIds = dbRows.map(r => r[idField]);
    const { data: existingRows } = await supabase.from(tableName).select(idField);
    if (existingRows) {
      const idsToDelete = existingRows
        .map((r: any) => r[idField])
        .filter((id: any) => !updatedIds.includes(id));
      
      if (idsToDelete.length > 0) {
        const { error: delError } = await supabase.from(tableName).delete().in(idField, idsToDelete);
        if (delError) throw delError;
      }
    }

    syncStatus = "synced";
    lastSyncedAt = new Date();
    syncErrorMessage = "";
    triggerSyncUpdate();
    triggerUpdate();
  } catch (err: any) {
    console.error(`Sync error on table ${tableName}:`, err);
    syncStatus = "error";
    syncErrorMessage = err.message || String(err);
    triggerSyncUpdate();
  }
}

// Core DB Pull Function
export async function pullFromSupabase() {
  if (!supabase) {
    syncStatus = "error";
    syncErrorMessage = "Supabase environment variables are missing.";
    triggerSyncUpdate();
    return;
  }

  syncStatus = "syncing";
  triggerSyncUpdate();

  try {
    const [
      notesRes,
      liveRes,
      assignRes,
      annRes,
      lectRes,
      subRes,
      courseRes,
      studentRes,
      adminsRes,
      settingsRes
    ] = await Promise.all([
      supabase.from("study_notes").select("*"),
      supabase.from("live_classes").select("*"),
      supabase.from("assignments").select("*"),
      supabase.from("announcements").select("*"),
      supabase.from("recorded_lectures").select("*"),
      supabase.from("assignment_submissions").select("*"),
      supabase.from("courses").select("*"),
      supabase.from("students").select("*"),
      supabase.from("admins").select("*"),
      supabase.from("admin_settings").select("*")
    ]);

    if (notesRes.error) throw notesRes.error;
    if (liveRes.error) throw liveRes.error;
    if (assignRes.error) throw assignRes.error;
    if (annRes.error) throw annRes.error;
    if (lectRes.error) throw lectRes.error;
    if (subRes.error) throw subRes.error;
    if (courseRes.error) throw courseRes.error;
    if (studentRes.error) throw studentRes.error;

    if (notesRes.data) localCache.notes = notesRes.data.map(noteFromDb);
    if (liveRes.data) localCache.liveClasses = liveRes.data.map(liveClassFromDb);
    if (assignRes.data) localCache.assignments = assignRes.data.map(assignmentFromDb);
    if (annRes.data) localCache.announcements = annRes.data.map(announcementFromDb);
    if (lectRes.data) localCache.recordedLectures = lectRes.data.map(recordedLectureFromDb);
    if (subRes.data) localCache.assignmentSubmissions = subRes.data.map(submissionFromDb);
    if (courseRes.data) localCache.courses = courseRes.data.map(courseFromDb);
    if (studentRes.data) localCache.students = studentRes.data.map(studentFromDb);
    if (adminsRes.data) localCache.admins = adminsRes.data;

    if (settingsRes.data) {
      const settingsMap: Record<string, any> = {};
      settingsRes.data.forEach(row => {
        settingsMap[row.key] = row.value;
      });
      localCache.adminSettings = settingsMap;
    }

    // Default assignments seeding
    if (localCache.assignments.length === 0) {
      const defaultAssignments: Assignment[] = [
        {
          id: "3e59b964-b045-422d-8b01-df54cbb23395",
          title: "Python Advanced Decorators and Metaclasses",
          subject: "Advanced Python Programming",
          dueDate: "2026-07-25",
          status: "Pending",
          description: "Write a custom metaclass that validates attribute types at definition time. Include sample decorator functions for profiling execution times of high-throughput calculations.",
          attachmentLink: "https://example.com/materials/decorators_and_metaclasses.pdf",
          allowResubmission: true
        },
        {
          id: "a768e142-b0ef-4f16-928d-190b1bf599e0",
          title: "Numerical Analysis & Algorithmic Complexities",
          subject: "Computer Science Mathematics",
          dueDate: "2026-07-20",
          status: "Pending",
          description: "Analyze the runtime constraints and space complexities of different numerical integration techniques. Implement standard algorithms using memory-efficient generators.",
          attachmentLink: "https://example.com/materials/numerical_analysis_complexities.pdf",
          allowResubmission: false
        },
        {
          id: "6ef4b14d-616a-4d7a-8267-36cb9e9e190b",
          title: "Data Structure Optimization Challenge",
          subject: "Data Structures & Algorithms",
          dueDate: "2026-07-30",
          status: "Pending",
          description: "Optimize a binary search tree lookup mechanism for heavily read-biased scenarios. Compare with red-black trees.",
          attachmentLink: "https://example.com/materials/dsa_optimization.pdf",
          allowResubmission: true
        }
      ];
      const dbRows = defaultAssignments.map(a => ({
        id: a.id,
        title: a.title,
        subject: a.subject,
        due_date: a.dueDate,
        status: a.status,
        description: a.description,
        attachment_link: a.attachmentLink,
        allow_resubmission: a.allowResubmission
      }));
      await supabase.from("assignments").upsert(dbRows);
      localCache.assignments = defaultAssignments;
    }

    syncStatus = "synced";
    lastSyncedAt = new Date();
    syncErrorMessage = "";
    triggerSyncUpdate();
    triggerUpdate();
  } catch (err: any) {
    console.warn("Supabase Pull Error:", err);
    syncStatus = "error";
    if (err.code === "42P01") {
      syncErrorMessage = "Table missing in Supabase. Paste SQL schema in SQL Editor.";
    } else {
      syncErrorMessage = err.message || String(err);
    }
    triggerSyncUpdate();
  }
}

// Real-Time Postgres Changes Dispatcher
function handleRealtimePayload(payload: any) {
  const { table, eventType, new: newRow, old: oldRow } = payload;
  console.log(`Realtime event for [${table}]: ${eventType}`, newRow);

  switch (table) {
    case "study_notes": {
      if (eventType === "DELETE") {
        localCache.notes = localCache.notes.filter(item => item.id !== oldRow.id);
      } else {
        const item = noteFromDb(newRow);
        const idx = localCache.notes.findIndex(x => x.id === item.id);
        if (idx !== -1) {
          localCache.notes[idx] = item;
        } else {
          localCache.notes.push(item);
        }
      }
      break;
    }
    case "live_classes": {
      if (eventType === "DELETE") {
        localCache.liveClasses = localCache.liveClasses.filter(item => item.id !== oldRow.id);
      } else {
        const item = liveClassFromDb(newRow);
        const idx = localCache.liveClasses.findIndex(x => x.id === item.id);
        if (idx !== -1) {
          localCache.liveClasses[idx] = item;
        } else {
          localCache.liveClasses.push(item);
        }
      }
      break;
    }
    case "assignments": {
      if (eventType === "DELETE") {
        localCache.assignments = localCache.assignments.filter(item => item.id !== oldRow.id);
      } else {
        const item = assignmentFromDb(newRow);
        const idx = localCache.assignments.findIndex(x => x.id === item.id);
        if (idx !== -1) {
          localCache.assignments[idx] = item;
        } else {
          localCache.assignments.push(item);
        }
      }
      break;
    }
    case "announcements": {
      if (eventType === "DELETE") {
        localCache.announcements = localCache.announcements.filter(item => item.id !== oldRow.id);
      } else {
        const item = announcementFromDb(newRow);
        const idx = localCache.announcements.findIndex(x => x.id === item.id);
        if (idx !== -1) {
          localCache.announcements[idx] = item;
        } else {
          localCache.announcements.push(item);
        }
      }
      break;
    }
    case "recorded_lectures": {
      if (eventType === "DELETE") {
        localCache.recordedLectures = localCache.recordedLectures.filter(item => item.id !== oldRow.id);
      } else {
        const item = recordedLectureFromDb(newRow);
        const idx = localCache.recordedLectures.findIndex(x => x.id === item.id);
        if (idx !== -1) {
          localCache.recordedLectures[idx] = item;
        } else {
          localCache.recordedLectures.push(item);
        }
      }
      break;
    }
    case "assignment_submissions": {
      if (eventType === "DELETE") {
        localCache.assignmentSubmissions = localCache.assignmentSubmissions.filter(item => item.id !== oldRow.id);
      } else {
        const item = submissionFromDb(newRow);
        const idx = localCache.assignmentSubmissions.findIndex(x => x.id === item.id);
        if (idx !== -1) {
          localCache.assignmentSubmissions[idx] = item;
        } else {
          localCache.assignmentSubmissions.push(item);
        }
      }
      break;
    }
    case "courses": {
      if (eventType === "DELETE") {
        localCache.courses = localCache.courses.filter(item => item.id !== oldRow.id);
      } else {
        const item = courseFromDb(newRow);
        const idx = localCache.courses.findIndex(x => x.id === item.id);
        if (idx !== -1) {
          localCache.courses[idx] = item;
        } else {
          localCache.courses.push(item);
        }
      }
      break;
    }
    case "students": {
      if (eventType === "DELETE") {
        localCache.students = localCache.students.filter(item => item.usn !== oldRow.usn);
      } else {
        const item = studentFromDb(newRow);
        const idx = localCache.students.findIndex(x => x.usn === item.usn);
        if (idx !== -1) {
          localCache.students[idx] = item;
        } else {
          localCache.students.push(item);
        }
      }
      break;
    }
    case "admins": {
      if (eventType === "DELETE") {
        localCache.admins = localCache.admins.filter(item => item.id !== oldRow.id);
      } else {
        const idx = localCache.admins.findIndex(x => x.id === newRow.id);
        if (idx !== -1) {
          localCache.admins[idx] = newRow;
        } else {
          localCache.admins.push(newRow);
        }
      }
      break;
    }
    case "admin_settings": {
      if (eventType === "DELETE") {
        delete localCache.adminSettings[oldRow.key];
      } else {
        localCache.adminSettings[newRow.key] = newRow.value;
      }
      break;
    }
  }

  triggerUpdate();
}

// Setup Realtime Postgres Subscription Channel
if (supabase) {
  supabase
    .channel("public-db-changes")
    .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
      handleRealtimePayload(payload);
    })
    .subscribe();
}

// Session Interceptors for Chat History Backporting
const originalSessionSetItem = sessionStorage.setItem;
sessionStorage.setItem = function(key: string, value: string) {
  originalSessionSetItem.call(sessionStorage, key, value);
  if (key === "nappy_assistant_chat_history_v2") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && supabase) {
        const studentInfoStr = localStorage.getItem("nappy_logged_in_student");
        const studentObj = studentInfoStr ? JSON.parse(studentInfoStr) : null;
        const studentEmail = studentObj?.email || "anonymous_student";

        (async () => {
          try {
            await supabase.from("chatbot_messages").delete().eq("student_email", studentEmail);
            const rows = parsed.map((msg: any) => ({
              student_email: studentEmail,
              sender: msg.sender,
              text: msg.text,
              time: msg.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }));
            if (rows.length > 0) {
              await supabase.from("chatbot_messages").insert(rows);
            }
          } catch (e) {
            console.warn("Error syncing chat to Supabase:", e);
          }
        })();
      }
    } catch (e) {
      console.error("Error writing chatbot session:", e);
    }
  }
};

// Initial asynchronous fetch
pullFromSupabase();

// Export Database CRUD Operations and cache getters
export const nappyDb = {
  getNotes(): Note[] {
    return localCache.notes;
  },
  saveNotes(notes: Note[]) {
    localCache.notes = notes;
    syncArrayToSupabase("study_notes", notes, mapNoteToDb);
  },

  getLiveClasses(): LiveClass[] {
    return localCache.liveClasses;
  },
  saveLiveClasses(classes: LiveClass[]) {
    localCache.liveClasses = classes;
    syncArrayToSupabase("live_classes", classes, mapLiveClassToDb);
  },

  getAssignments(): Assignment[] {
    return localCache.assignments;
  },
  saveAssignments(assigns: Assignment[]) {
    localCache.assignments = assigns;
    syncArrayToSupabase("assignments", assigns, mapAssignmentToDb);
  },

  getAnnouncements(): Announcement[] {
    return localCache.announcements;
  },
  saveAnnouncements(anns: Announcement[]) {
    localCache.announcements = anns;
    syncArrayToSupabase("announcements", anns, mapAnnouncementToDb);
  },

  getRecordedLectures(): RecordedLecture[] {
    return localCache.recordedLectures;
  },
  saveRecordedLectures(lectures: RecordedLecture[]) {
    localCache.recordedLectures = lectures;
    syncArrayToSupabase("recorded_lectures", lectures, mapRecordedLectureToDb);
  },

  getAssignmentSubmissions(): AssignmentSubmission[] {
    return localCache.assignmentSubmissions;
  },
  saveAssignmentSubmissions(submissions: AssignmentSubmission[]) {
    localCache.assignmentSubmissions = submissions;
    syncArrayToSupabase("assignment_submissions", submissions, mapSubmissionToDb);
  },

  getCourses(): Course[] {
    return localCache.courses;
  },
  saveCourses(courses: Course[]) {
    localCache.courses = courses;
    syncArrayToSupabase("courses", courses, mapCourseToDb);
  },

  getStudents(): Student[] {
    return localCache.students;
  },
  saveStudents(students: Student[]) {
    localCache.students = students;
    syncArrayToSupabase("students", students, mapStudentToDb, "id");
  },

  getStudentQueries(): any[] {
    return localCache.adminSettings["student_queries"] || [];
  },
  saveStudentQueries(queries: any[]) {
    localCache.adminSettings["student_queries"] = queries;
    if (supabase) {
      supabase.from("admin_settings").upsert({
        key: "student_queries",
        value: queries
      }, { onConflict: "key" }).then(({ error }) => {
        if (error) console.error("Error saving student queries to Supabase:", error);
        triggerUpdate();
      });
    }
  },

  getAdminCredentials() {
    if (localCache.admins.length > 0) {
      return {
        email: localCache.admins[0].email,
        password: localCache.admins[0].password
      };
    }
    return { email: "admin@nappy.com", password: "admin123" };
  },
  async saveAdminCredentials(creds: any) {
    if (!supabase) return;
    const adminEmail = creds.email || "admin@nappy.com";
    const dbRow = {
      id: ensureUuid(adminEmail),
      name: "NapPy Administrator",
      email: adminEmail,
      password: creds.password || "admin123"
    };
    const { error } = await supabase.from("admins").upsert(dbRow, { onConflict: "id" });
    if (error) {
      console.error("Error saving admin credentials:", error);
    } else {
      const idx = localCache.admins.findIndex(a => a.email === adminEmail);
      if (idx !== -1) {
        localCache.admins[idx] = dbRow;
      } else {
        localCache.admins.push(dbRow);
      }
      triggerUpdate();
    }
  },

  getAdminProfile() {
    const defaultProfile = {
      fullName: "NapPy Administrator",
      email: "admin@nappy.com",
      role: "Administrator",
      createdDate: "July 16, 2026",
      lastLogin: new Date().toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
    };
    return localCache.adminSettings["admin_profile"] || defaultProfile;
  },
  async saveAdminProfile(profile: any) {
    localCache.adminSettings["admin_profile"] = profile;
    if (supabase) {
      const { error } = await supabase.from("admin_settings").upsert({
        key: "admin_profile",
        value: profile
      }, { onConflict: "key" });
      if (error) {
        console.error("Error saving admin profile:", error);
      } else {
        triggerUpdate();
      }
    }
  },

  subscribe(callback: () => void): () => void {
    window.addEventListener(DB_UPDATE_EVENT, callback);
    return () => {
      window.removeEventListener(DB_UPDATE_EVENT, callback);
    };
  },

  subscribeToSync(callback: () => void): () => void {
    window.addEventListener(SYNC_STATUS_EVENT, callback);
    return () => {
      window.removeEventListener(SYNC_STATUS_EVENT, callback);
    };
  },

  getSyncStatus() {
    return {
      status: syncStatus,
      lastSynced: lastSyncedAt,
      error: syncErrorMessage
    };
  },

  getSqlSchema(): string {
    return `-- =======================================================
-- NapPy Relational PostgreSQL Schema for Supabase
-- Place this script directly inside the Supabase SQL Editor.
-- =======================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADMINS
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. STUDENTS
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile_number TEXT,
  college TEXT,
  usn TEXT UNIQUE NOT NULL,
  branch TEXT,
  semester TEXT,
  status TEXT DEFAULT 'Active',
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. COURSES
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  enrolled_students INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. STUDY NOTES
CREATE TABLE IF NOT EXISTS study_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  module TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  pdf_name TEXT NOT NULL,
  pdf_url TEXT,
  pdf_data TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. LIVE CLASSES
CREATE TABLE IF NOT EXISTS live_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  instructor TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  meet_url TEXT NOT NULL,
  status TEXT DEFAULT 'UPCOMING' CHECK (status IN ('LIVE', 'UPCOMING', 'COMPLETED')),
  course TEXT,
  module TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. RECORDED LECTURES
CREATE TABLE IF NOT EXISTS recorded_lectures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  course TEXT NOT NULL,
  module TEXT NOT NULL,
  instructor_name TEXT NOT NULL,
  duration TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  video_link TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'Published' CHECK (status IN ('Published', 'Draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. ASSIGNMENTS
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Submitted', 'Late')),
  description TEXT,
  attachment_link TEXT,
  allow_resubmission BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. ASSIGNMENT SUBMISSIONS
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  assignment_title TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_usn TEXT NOT NULL,
  student_branch TEXT NOT NULL,
  student_semester TEXT NOT NULL,
  student_email TEXT NOT NULL,
  comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  file_name TEXT NOT NULL,
  file_size TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT,
  file_data TEXT,
  status TEXT DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Reviewed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('High', 'Normal', 'Low')),
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 10. CHATBOT MESSAGES
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_email TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('student', 'assistant')),
  text TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 11. ADMIN SETTINGS
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_students_usn ON students(usn);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_study_notes_subject ON study_notes(subject);
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON live_classes(status);
CREATE INDEX IF NOT EXISTS idx_recorded_lectures_course ON recorded_lectures(course);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_usn ON assignment_submissions(student_usn);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_chatbot_student ON chatbot_messages(student_email);

-- ==========================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recorded_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
CREATE POLICY "Admins full access" ON admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Students public read" ON students FOR SELECT USING (true);
CREATE POLICY "Students insert/update" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Courses read for all" ON courses FOR SELECT USING (true);
CREATE POLICY "Courses modify for admin" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Study Notes read for all" ON study_notes FOR SELECT USING (true);
CREATE POLICY "Study Notes modify for admin" ON study_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Live Classes read for all" ON live_classes FOR SELECT USING (true);
CREATE POLICY "Live Classes modify for admin" ON live_classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Recorded Lectures read for all" ON recorded_lectures FOR SELECT USING (true);
CREATE POLICY "Recorded Lectures modify for admin" ON recorded_lectures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Assignments read for all" ON assignments FOR SELECT USING (true);
CREATE POLICY "Assignments modify for admin" ON assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Submissions read for all" ON assignment_submissions FOR SELECT USING (true);
CREATE POLICY "Submissions insert/update for all" ON assignment_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Announcements read for all" ON announcements FOR SELECT USING (true);
CREATE POLICY "Announcements modify for admin" ON announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Chatbot read for all" ON chatbot_messages FOR SELECT USING (true);
CREATE POLICY "Chatbot insert/update for all" ON chatbot_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Settings full access" ON admin_settings FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- STORAGE BUCKET & STORAGE POLICIES
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('nappy_vault', 'nappy_vault', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public storage reads"
ON storage.objects FOR SELECT
USING (bucket_id = 'nappy_vault');

CREATE POLICY "Allow public storage inserts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'nappy_vault');

CREATE POLICY "Allow public storage updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'nappy_vault')
WITH CHECK (bucket_id = 'nappy_vault');`;
  },

  triggerManualPull() {
    pullFromSupabase();
  }
};
