// Database Service Layer using Supabase
// This service provides database operations using Supabase client

import { supabase } from '../../lib/supabase'

// Student Services
export const studentService = {
  // Get all students (excluding archived unless specified)
  async getAllStudents(includeArchived = false) {
    try {
      let query = supabase.from('students').select('*')
      
      if (!includeArchived) {
        query = query.eq('archived', false)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error
    }
  },

  // Get student by ID
  async getStudentById(id) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching student:', error)
      throw error
    }
  },

  // Add new student
  async addStudent(studentData) {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding student:', error)
      throw error
    }
  },

  // Update student
  async updateStudent(id, updatedData) {
    try {
      const { data, error } = await supabase
        .from('students')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    }
  },

  // Delete student
  async deleteStudent(id) {
    try {
      const { data, error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error deleting student:', error)
      throw error
    }
  },

  // Archive student
  async archiveStudent(id) {
    try {
      const { data, error } = await supabase
        .from('students')
        .update({ 
          archived: true, 
          archived_date: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error archiving student:', error)
      throw error
    }
  },

  // Unarchive student
  async unarchiveStudent(id) {
    try {
      const { data, error } = await supabase
        .from('students')
        .update({ 
          archived: false, 
          archived_date: null 
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error unarchiving student:', error)
      throw error
    }
  },
}

// Teacher Services
export const teacherService = {
  // Get all teachers (excluding archived unless specified)
  async getAllTeachers(includeArchived = false) {
    try {
      let query = supabase.from('teachers').select('*')
      
      if (!includeArchived) {
        query = query.eq('archived', false)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching teachers:', error)
      throw error
    }
  },

  // Get teacher by ID
  async getTeacherById(id) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching teacher:', error)
      throw error
    }
  },

  // Add new teacher
  async addTeacher(teacherData) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .insert([teacherData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding teacher:', error)
      throw error
    }
  },

  // Update teacher
  async updateTeacher(id, updatedData) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating teacher:', error)
      throw error
    }
  },

  // Delete teacher
  async deleteTeacher(id) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error deleting teacher:', error)
      throw error
    }
  },

  // Archive teacher
  async archiveTeacher(id) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .update({ 
          archived: true, 
          archived_date: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error archiving teacher:', error)
      throw error
    }
  },

  // Unarchive teacher
  async unarchiveTeacher(id) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .update({ 
          archived: false, 
          archived_date: null 
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error unarchiving teacher:', error)
      throw error
    }
  },
}

// Course Services
export const courseService = {
  // Get all course instances (excluding archived unless specified)
  async getAllCourseInstances(includeArchived = false) {
    try {
      let query = supabase.from('course_instances').select('*')
      
      if (!includeArchived) {
        query = query.eq('archived', false)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching course instances:', error)
      throw error
    }
  },

  // Get course instance by ID
  async getCourseInstanceById(id) {
    try {
      const { data, error } = await supabase
        .from('course_instances')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching course instance:', error)
      throw error
    }
  },

  // Get courses by teacher ID
  async getCoursesByTeacherId(teacherId) {
    try {
      const { data, error } = await supabase
        .from('course_instances')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('archived', false)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching teacher courses:', error)
      throw error
    }
  },

  // Get courses by student ID
  async getCoursesByStudentId(studentId) {
    try {
      const { data, error } = await supabase
        .from('course_instances')
        .select('*')
        .contains('enrolled_students', [studentId])
        .eq('archived', false)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching student courses:', error)
      throw error
    }
  },

  // Add new course instance
  async addCourseInstance(instanceData) {
    try {
      const { data, error } = await supabase
        .from('course_instances')
        .insert([instanceData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding course instance:', error)
      throw error
    }
  },

  // Update course instance
  async updateCourseInstance(id, updatedData) {
    try {
      const { data, error } = await supabase
        .from('course_instances')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating course instance:', error)
      throw error
    }
  },

  // Archive course
  async archiveCourse(id) {
    try {
      const { data, error } = await supabase
        .from('course_instances')
        .update({ 
          archived: true, 
          archived_date: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error archiving course:', error)
      throw error
    }
  },

  // Unarchive course
  async unarchiveCourse(id) {
    try {
      const { data, error } = await supabase
        .from('course_instances')
        .update({ 
          archived: false, 
          archived_date: null 
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error unarchiving course:', error)
      throw error
    }
  },
}

// Archive Request Services
export const archiveService = {
  // Get all archive requests
  async getAllArchiveRequests() {
    try {
      const { data, error } = await supabase
        .from('archive_requests')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching archive requests:', error)
      throw error
    }
  },

  // Create archive request
  async createArchiveRequest(requestData) {
    try {
      const { data, error } = await supabase
        .from('archive_requests')
        .insert([requestData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating archive request:', error)
      throw error
    }
  },

  // Update archive request status
  async updateArchiveRequestStatus(id, status, approverName = null) {
    try {
      const updateData = {
        status,
        ...(approverName && status === 'approved' && {
          approved_by: approverName,
          approved_date: new Date().toISOString()
        })
      }

      const { data, error } = await supabase
        .from('archive_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating archive request:', error)
      throw error
    }
  },
}

// Payment Services
export const paymentService = {
  // Get all teacher payouts
  async getAllPayouts() {
    try {
      const { data, error } = await supabase
        .from('teacher_payouts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching payouts:', error)
      throw error
    }
  },

  // Update payout status
  async updatePayoutStatus(id, status, approverName = null) {
    try {
      const updateData = {
        status,
        ...(approverName && status === 'approved' && {
          approved_by: approverName,
          approved_date: new Date().toISOString().split('T')[0]
        })
      }

      const { data, error } = await supabase
        .from('teacher_payouts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating payout status:', error)
      throw error
    }
  },

  // Get revenue data
  async getRevenueData() {
    try {
      const { data, error } = await supabase
        .from('revenue')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching revenue data:', error)
      throw error
    }
  },

  // Get pending payouts
  async getPendingPayouts() {
    try {
      const { data, error } = await supabase
        .from('teacher_payouts')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching pending payouts:', error)
      throw error
    }
  },

  // Get student payment history
  async getStudentPaymentHistory(studentId) {
    try {
      const { data, error } = await supabase
        .from('student_payments')
        .select('*')
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching student payment history:', error)
      throw error
    }
  },

  // Get professor payment history
  async getProfessorPaymentHistory(professorId) {
    try {
      const { data, error } = await supabase
        .from('teacher_payouts')
        .select('*')
        .eq('teacher_id', professorId)
        .order('payment_date', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching professor payment history:', error)
      throw error
    }
  },

  // Get student data for management
  async getStudentData() {
    try {
      // This would typically aggregate payment data per student
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          student_payments (*)
        `)
        .eq('archived', false)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching student data:', error)
      throw error
    }
  },

  // Get teacher data for management
  async getTeacherData() {
    try {
      // This would typically aggregate earnings data per teacher
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          teacher_payouts (*)
        `)
        .eq('archived', false)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching teacher data:', error)
      throw error
    }
  },

  // Update payment status
  async updatePaymentStatus(paymentId, status, approverName = null) {
    try {
      const updateData = {
        status,
        ...(approverName && {
          approved_by: approverName,
          approved_date: new Date().toISOString()
        })
      }

      const { data, error } = await supabase
        .from('student_payments')
        .update(updateData)
        .eq('id', paymentId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw error
    }
  },

  // Get all payments combined and sorted by timeline
  async getAllPayments() {
    try {
      const [studentPayments, teacherPayouts] = await Promise.all([
        supabase.from('student_payments').select('*').order('payment_date', { ascending: false }),
        supabase.from('teacher_payouts').select('*').order('payment_date', { ascending: false })
      ])
      
      if (studentPayments.error) throw studentPayments.error
      if (teacherPayouts.error) throw teacherPayouts.error
      
      // Combine and sort all payments by date
      const allPayments = [
        ...(studentPayments.data || []).map(p => ({ ...p, type: 'student' })),
        ...(teacherPayouts.data || []).map(p => ({ ...p, type: 'teacher' }))
      ].sort((a, b) => new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at))
      
      return allPayments
    } catch (error) {
      console.error('Error fetching all payments:', error)
      throw error
    }
  },

  // Toggle student payment for course
  async toggleStudentPayment(courseId, studentId) {
    try {
      // Check if payment exists
      const { data: existingPayment, error: fetchError } = await supabase
        .from('student_payments')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      
      if (existingPayment) {
        // Update payment status
        const { data, error } = await supabase
          .from('student_payments')
          .update({ status: existingPayment.status === 'paid' ? 'pending' : 'paid' })
          .eq('id', existingPayment.id)
          .select()
          .single()
        
        if (error) throw error
        return data
      } else {
        // Create new payment record
        const { data, error } = await supabase
          .from('student_payments')
          .insert([{
            course_id: courseId,
            student_id: studentId,
            status: 'paid',
            payment_date: new Date().toISOString()
          }])
          .select()
          .single()
        
        if (error) throw error
        return data
      }
    } catch (error) {
      console.error('Error toggling student payment:', error)
      throw error
    }
  },

  // Get student payments
  async getStudentPayments() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          students(name),
          course_instances(subject)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching student payments:', error)
      throw error
    }
  },
}

// Attendance Services
export const attendanceService = {
  // Update attendance for student in course
  async updateAttendance(courseId, studentId, week, attended) {
    try {
      // Check if attendance record exists
      const { data: existingRecord, error: fetchError } = await supabase
        .from('attendance')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .eq('week', week)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      
      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('attendance')
          .update({ attended })
          .eq('id', existingRecord.id)
          .select()
          .single()
        
        if (error) throw error
        return data
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('attendance')
          .insert([{
            course_id: courseId,
            student_id: studentId,
            week,
            attended
          }])
          .select()
          .single()
        
        if (error) throw error
        return data
      }
    } catch (error) {
      console.error('Error updating attendance:', error)
      throw error
    }
  },

  // Get attendance for course
  async getCourseAttendance(courseId) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('course_id', courseId)
      
      if (error) throw error
      
      // Transform to expected format: { studentId: { week1: true, week2: false, ... } }
      const attendanceMap = {}
      data?.forEach(record => {
        if (!attendanceMap[record.student_id]) {
          attendanceMap[record.student_id] = {}
        }
        attendanceMap[record.student_id][record.week] = record.attended
      })
      
      return attendanceMap
    } catch (error) {
      console.error('Error fetching course attendance:', error)
      throw error
    }
  },
}

// Export all services
export const databaseService = {
  students: studentService,
  teachers: teacherService,
  courses: courseService,
  archives: archiveService,
  payments: paymentService,
  attendance: attendanceService,
}

export default databaseService
