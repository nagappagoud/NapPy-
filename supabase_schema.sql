-- =======================================================
-- NapPy Relational PostgreSQL Schema for Supabase
-- Place this script directly inside the Supabase SQL Editor.
-- =======================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to automatically manage updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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
-- ASSIGN AUTO-UPDATE TIMESTAMPS TRIGGERS
-- ==========================================
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_study_notes_updated_at BEFORE UPDATE ON study_notes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_live_classes_updated_at BEFORE UPDATE ON live_classes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_recorded_lectures_updated_at BEFORE UPDATE ON recorded_lectures FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_assignment_submissions_updated_at BEFORE UPDATE ON assignment_submissions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

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
WITH CHECK (bucket_id = 'nappy_vault');
