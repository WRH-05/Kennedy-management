-- Create missing payment-related tables for Kennedy Management System
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Revenue table
CREATE TABLE IF NOT EXISTS revenue (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id),
  course_id BIGINT REFERENCES course_instances(id),
  student_name VARCHAR(255),
  course_name VARCHAR(255),
  month VARCHAR(50),
  amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'paid',
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Teacher payouts table
CREATE TABLE IF NOT EXISTS teacher_payouts (
  id BIGSERIAL PRIMARY KEY,
  teacher_id BIGINT REFERENCES teachers(id),
  professor_name VARCHAR(255),
  amount DECIMAL(10,2),
  percentage INTEGER,
  total_generated DECIMAL(10,2),
  month VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  payment_date DATE,
  approved_by VARCHAR(255),
  approved_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Student payments table
CREATE TABLE IF NOT EXISTS student_payments (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id),
  course_id BIGINT REFERENCES course_instances(id),
  student_name VARCHAR(255),
  month VARCHAR(50),
  amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  payment_date DATE,
  approved_by VARCHAR(255),
  approved_date DATE,
  courses TEXT[], -- Array of course names
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Archive requests table (if not exists)
CREATE TABLE IF NOT EXISTS archive_requests (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(50), -- 'student', 'teacher', 'course'
  entity_id BIGINT,
  entity_name VARCHAR(255),
  reason TEXT,
  requested_by VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'denied'
  approved_by VARCHAR(255),
  approved_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Attendance table (if not exists)
CREATE TABLE IF NOT EXISTS attendance (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT REFERENCES course_instances(id),
  student_id BIGINT REFERENCES students(id),
  week VARCHAR(20), -- 'week1', 'week2', etc.
  attended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(course_id, student_id, week)
);

-- Insert sample revenue data
INSERT INTO revenue (student_id, course_id, student_name, course_name, month, amount, status, payment_date) VALUES
(1, 1, 'Ahmed Ben Ali', 'Mathematics 3AS', 'January 2024', 1500.00, 'paid', '2024-01-15'),
(1, 1, 'Ahmed Ben Ali', 'Mathematics 3AS', 'February 2024', 1500.00, 'paid', '2024-02-14'),
(2, 2, 'Fatima Zahra', 'Chemistry 2AS', 'January 2024', 1250.00, 'pending', NULL),
(2, 2, 'Fatima Zahra', 'Chemistry 2AS', 'February 2024', 1250.00, 'paid', '2024-02-20'),
(3, 3, 'Omar Khaled', 'Biology 1AS', 'January 2024', 800.00, 'pending', NULL);

-- Insert sample teacher payouts
INSERT INTO teacher_payouts (teacher_id, professor_name, amount, percentage, total_generated, month, status, due_date) VALUES
(1, 'Prof. Salim Benali', 4500.00, 65, 6923.00, 'January 2024', 'approved', '2024-01-31'),
(2, 'Prof. Amina Khelifi', 2700.00, 70, 3857.00, 'January 2024', 'pending', '2024-01-31'),
(3, 'Prof. Omar Bentahar', 3600.00, 60, 6000.00, 'January 2024', 'pending', '2024-01-31');

-- Insert sample student payments
INSERT INTO student_payments (student_id, student_name, month, amount, status, payment_date, courses) VALUES
(1, 'Ahmed Ben Ali', 'January 2024', 1500.00, 'paid', '2024-01-15', ARRAY['Mathematics', 'Physics']),
(1, 'Ahmed Ben Ali', 'February 2024', 1500.00, 'paid', '2024-02-14', ARRAY['Mathematics', 'Physics']),
(1, 'Ahmed Ben Ali', 'March 2024', 1500.00, 'pending', NULL, ARRAY['Mathematics', 'Physics']),
(2, 'Fatima Zahra', 'January 2024', 1250.00, 'pending', NULL, ARRAY['Chemistry', 'Biology']),
(2, 'Fatima Zahra', 'February 2024', 1250.00, 'paid', '2024-02-20', ARRAY['Chemistry', 'Biology']),
(3, 'Omar Khaled', 'January 2024', 800.00, 'pending', NULL, ARRAY['Mathematics']);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE archive_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (for now - you can restrict later)
CREATE POLICY "Allow all operations on revenue" ON revenue FOR ALL USING (true);
CREATE POLICY "Allow all operations on teacher_payouts" ON teacher_payouts FOR ALL USING (true);
CREATE POLICY "Allow all operations on student_payments" ON student_payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on archive_requests" ON archive_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations on attendance" ON attendance FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON revenue TO anon, authenticated;
GRANT ALL ON teacher_payouts TO anon, authenticated;
GRANT ALL ON student_payments TO anon, authenticated;
GRANT ALL ON archive_requests TO anon, authenticated;
GRANT ALL ON attendance TO anon, authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
