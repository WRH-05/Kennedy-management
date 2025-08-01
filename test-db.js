// Simple test to check database connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgmjwmxslbrafalpqfjb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbWp3bXhzbGJyYWZhbHBxZmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDM4MTMsImV4cCI6MjA2OTU3OTgxM30.n0-gp6qTKOyVJbEOzxr-3ClMWIs2TpjCMWFGdgLq8uo'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('students')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Database connection error:', error)
    } else {
      console.log('Database connected successfully:', data)
    }
    
    // Test adding a course with correct schema
    console.log('Testing course addition with correct schema...')
    const { data: courseData, error: courseError } = await supabase
      .from('course_instances')
      .insert([{
        teacher_id: 4,
        teacher_name: 'Test Teacher',
        subject: 'Mathematics',
        school_year: '1AS',
        percentage_cut: 50,
        course_type: 'Group',
        duration: 2,
        schedule: 'Monday 09:00-11:00',
        price: 500,
        monthly_price: 500,
        student_ids: [],
        status: 'active'
      }])
      .select()
    
    if (courseError) {
      console.error('Error adding course:', courseError)
    } else {
      console.log('Course added successfully:', courseData)
    }
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testConnection()
