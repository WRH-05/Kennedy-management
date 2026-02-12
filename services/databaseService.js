// Database Service Layer using Supabase
// This service provides database operations using Supabase client

import { supabase } from '../lib/supabase'
import { authService } from './authService'

// Helper function to get current user's school_id
async function getCurrentUserSchoolId() {
  try {
    // Use a simpler approach to avoid circular dependencies
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    // Get school_id directly from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.warn('No profile found for user:', user.id)
      return null
    }

    return profile?.school_id || null
  } catch (error) {
    console.error('Error getting user school_id:', error)
    return null
  }
}

// Helper function to get current user's profile (id, name, role)
async function getCurrentUserProfile() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role, school_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.warn('No profile found for user:', user.id)
      return null
    }

    return profile
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Student Services
export const studentService = {
  // Get all students (excluding archived unless specified)
  async getAllStudents(includeArchived = false) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      let query = supabase.from('students').select('*').eq('school_id', schoolId)
      
      if (!includeArchived) {
        query = query.eq('archived', false)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Get student by ID
  async getStudentById(id) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .eq('school_id', schoolId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Add new student
  async addStudent(studentData) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('students')
        .insert([{ ...studentData, school_id: schoolId }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Update student
  async updateStudent(id, updatedData) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('students')
        .update(updatedData)
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Delete student
  async deleteStudent(id) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Archive student
  async archiveStudent(id) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('students')
        .update({ 
          archived: true, 
          archived_date: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Unarchive student
  async unarchiveStudent(id) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('students')
        .update({ 
          archived: false, 
          archived_date: null 
        })
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      // Error handled
      throw error
    }
  },
}

// Teacher Services
export const teacherService = {
  // Get all teachers (excluding archived unless specified)
  async getAllTeachers(includeArchived = false) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      let query = supabase.from('teachers').select('*').eq('school_id', schoolId)
      
      if (!includeArchived) {
        query = query.eq('archived', false)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Get teacher by ID
  async getTeacherById(id) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', id)
        .eq('school_id', schoolId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Add new teacher
  async addTeacher(teacherData) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('teachers')
        .insert([{ ...teacherData, school_id: schoolId }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Update teacher
  async updateTeacher(id, updatedData) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('teachers')
        .update(updatedData)
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  },

  // Delete teacher
  async deleteTeacher(id) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  },

  // Archive teacher
  async archiveTeacher(id) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('teachers')
        .update({ 
          archived: true, 
          archived_date: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  },

  // Unarchive teacher
  async unarchiveTeacher(id) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('teachers')
        .update({ 
          archived: false, 
          archived_date: null 
        })
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  },
}

// Course Services
export const courseService = {
  // Get all course instances (excluding archived unless specified)
  async getAllCourseInstances(includeArchived = false) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      let query = supabase.from('course_instances').select('*').eq('school_id', schoolId)
      
      if (!includeArchived) {
        query = query.eq('archived', false)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw error
    }
  },

  // Get course instance by ID
  async getCourseInstanceById(id) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('course_instances')
        .select('*')
        .eq('id', id)
        .eq('school_id', schoolId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  },

  // Get courses by teacher ID
  async getCoursesByTeacherId(teacherId) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('course_instances')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('school_id', schoolId)
        .eq('archived', false)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw error
    }
  },

  // Get courses by student ID
  async getCoursesByStudentId(studentId) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('course_instances')
        .select('*')
        .eq('school_id', schoolId)
        .contains('student_ids', [studentId])
        .eq('archived', false)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Add new course instance
  async addCourseInstance(instanceData) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('course_instances')
        .insert([{ ...instanceData, school_id: schoolId }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  },

  // Update course instance
  async updateCourseInstance(id, updatedData) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('course_instances')
        .update(updatedData)
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  },

  // Archive course
  async archiveCourse(id) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('course_instances')
        .update({ 
          archived: true, 
          archived_date: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  },

  // Unarchive course
  async unarchiveCourse(id) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('course_instances')
        .update({ 
          archived: false, 
          archived_date: null 
        })
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  },
}

// Archive Request Services
export const archiveService = {
  // Get all archive requests
  async getAllArchiveRequests() {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('archive_requests')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw error
    }
  },

  // Get pending archive request entity IDs (for disabling archive buttons)
  async getPendingArchiveEntityIds() {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('archive_requests')
        .select('entity_type, entity_id')
        .eq('school_id', schoolId)
        .eq('status', 'pending')
      
      if (error) throw error
      
      // Return a map of entity_type -> Set of entity_ids
      const pendingMap = {
        student: new Set(),
        teacher: new Set(),
        course: new Set()
      }
      
      (data || []).forEach(req => {
        if (pendingMap[req.entity_type]) {
          pendingMap[req.entity_type].add(req.entity_id)
        }
      })
      
      return pendingMap
    } catch (error) {
      throw error
    }
  },

  // Create archive request with current user info
  async createArchiveRequest(entityType, entityId, entityName, reason = null) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const userProfile = await getCurrentUserProfile()
      if (!userProfile) throw new Error('No user profile')

      // Check if there's already a pending request for this entity
      const { data: existingRequest, error: checkError } = await supabase
        .from('archive_requests')
        .select('id')
        .eq('school_id', schoolId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('status', 'pending')
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError
      
      if (existingRequest) {
        throw new Error('An archive request is already pending for this item')
      }

      const { data, error } = await supabase
        .from('archive_requests')
        .insert([{
          school_id: schoolId,
          entity_type: entityType,
          entity_id: entityId,
          entity_name: entityName,
          reason: reason,
          requested_by: userProfile.id,
          requested_by_name: userProfile.full_name,
          status: 'pending'
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  },

  // Approve archive request and perform actual archive
  async approveArchiveRequest(requestId) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const userProfile = await getCurrentUserProfile()
      if (!userProfile) throw new Error('No user profile')

      // Get the archive request first
      const { data: request, error: fetchError } = await supabase
        .from('archive_requests')
        .select('*')
        .eq('id', requestId)
        .eq('school_id', schoolId)
        .single()
      
      if (fetchError) throw fetchError
      if (!request) throw new Error('Archive request not found')

      // Perform the actual archive based on entity type
      if (request.entity_type === 'student') {
        await supabase
          .from('students')
          .update({ archived: true, archived_date: new Date().toISOString() })
          .eq('id', request.entity_id)
          .eq('school_id', schoolId)
      } else if (request.entity_type === 'teacher') {
        await supabase
          .from('teachers')
          .update({ archived: true, archived_date: new Date().toISOString() })
          .eq('id', request.entity_id)
          .eq('school_id', schoolId)
      } else if (request.entity_type === 'course') {
        await supabase
          .from('course_instances')
          .update({ archived: true, archived_date: new Date().toISOString() })
          .eq('id', request.entity_id)
          .eq('school_id', schoolId)
      }

      // Update the archive request status
      const { data, error } = await supabase
        .from('archive_requests')
        .update({
          status: 'approved',
          approved_by: userProfile.id,
          approved_by_name: userProfile.full_name,
          approved_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('school_id', schoolId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  },

  // Deny archive request
  async denyArchiveRequest(requestId) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const userProfile = await getCurrentUserProfile()
      if (!userProfile) throw new Error('No user profile')

      const { data, error } = await supabase
        .from('archive_requests')
        .update({
          status: 'denied',
          approved_by: userProfile.id,
          approved_by_name: userProfile.full_name,
          approved_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('school_id', schoolId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  },
}

// Payment Services
export const paymentService = {
  // Get all teacher payouts
  async getAllPayouts() {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('teacher_payouts')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw error
    }
  },

  // Update payout status
  async updatePayoutStatus(id, status, approverName = null) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

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
        .eq('school_id', schoolId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  },

  // Get revenue data
  async getRevenueData() {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('revenue')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw error
    }
  },

  // Get pending payouts
  async getPendingPayouts() {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('teacher_payouts')
        .select('*')
        .eq('school_id', schoolId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw error
    }
  },

  // Get student payment history
  async getStudentPaymentHistory(studentId) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('student_payments')
        .select('*')
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .order('payment_date', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw error
    }
  },

  // Get professor payment history
  async getProfessorPaymentHistory(professorId) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('teacher_payouts')
        .select('*')
        .eq('teacher_id', professorId)
        .eq('school_id', schoolId)
        .order('payment_date', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw error
    }
  },

  // Get student data for management
  async getStudentData() {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          student_payments (*)
        `)
        .eq('school_id', schoolId)
        .eq('archived', false)
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw error
    }
  },

  // Get teacher data for management
  async getTeacherData() {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          teacher_payouts (*)
        `)
        .eq('school_id', schoolId)
        .eq('archived', false)
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw error
    }
  },

  // Update payment status
  async updatePaymentStatus(paymentId, status, approverName = null) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

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
        .eq('school_id', schoolId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  },

  // Get all payments combined and sorted by timeline
  async getAllPayments() {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const [studentPayments, teacherPayouts] = await Promise.all([
        supabase.from('student_payments').select('*').eq('school_id', schoolId).order('payment_date', { ascending: false }),
        supabase.from('teacher_payouts').select('*').eq('school_id', schoolId).order('payment_date', { ascending: false })
      ])
      
      if (studentPayments.error) throw studentPayments.error
      if (teacherPayouts.error) throw teacherPayouts.error
      
      const allPayments = [
        ...(studentPayments.data || []).map(p => ({ ...p, type: 'student' })),
        ...(teacherPayouts.data || []).map(p => ({ ...p, type: 'teacher' }))
      ].sort((a, b) => new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at))
      
      return allPayments
    } catch (error) {
      throw error
    }
  },

  // Toggle student payment for course
  async toggleStudentPayment(courseId, studentId) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      // Get current user profile for tracking
      const userProfile = await getCurrentUserProfile()

      // Get course info for price and details
      const { data: courseData, error: courseError } = await supabase
        .from('course_instances')
        .select('price, subject, school_year')
        .eq('id', courseId)
        .eq('school_id', schoolId)
        .single()
      
      if (courseError) throw courseError

      // Get student info
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('name')
        .eq('id', studentId)
        .eq('school_id', schoolId)
        .single()
      
      if (studentError) throw studentError

      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

      // Check if payment exists in student_payments
      const { data: existingPayment, error: fetchError } = await supabase
        .from('student_payments')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      
      if (existingPayment) {
        const newStatus = existingPayment.status === 'paid' ? 'pending' : 'paid'
        const { data, error } = await supabase
          .from('student_payments')
          .update({ 
            status: newStatus,
            amount: courseData.price || 0,
            month: currentMonth,
            updated_at: new Date().toISOString(),
            ...(newStatus === 'paid' && userProfile && {
              recorded_by_id: userProfile.id,
              recorded_by_name: userProfile.full_name
            })
          })
          .eq('id', existingPayment.id)
          .eq('school_id', schoolId)
          .select()
          .single()
        
        if (error) throw error

        // Update revenue table - check if exists first
        const { data: existingRevenue } = await supabase
          .from('revenue')
          .select('id')
          .eq('school_id', schoolId)
          .eq('student_id', studentId)
          .eq('course_id', courseId)
          .eq('month', currentMonth)
          .single()

        if (existingRevenue) {
          await supabase
            .from('revenue')
            .update({
              student_name: studentData.name,
              course: `${courseData.subject} - ${courseData.school_year}`,
              amount: courseData.price || 0,
              paid: newStatus === 'paid',
              updated_at: new Date().toISOString(),
              ...(newStatus === 'paid' && userProfile && {
                recorded_by_id: userProfile.id,
                recorded_by_name: userProfile.full_name
              })
            })
            .eq('id', existingRevenue.id)
        } else {
          await supabase
            .from('revenue')
            .insert({
              school_id: schoolId,
              student_id: studentId,
              course_id: courseId,
              student_name: studentData.name,
              course: `${courseData.subject} - ${courseData.school_year}`,
              amount: courseData.price || 0,
              month: currentMonth,
              paid: newStatus === 'paid',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...(newStatus === 'paid' && userProfile && {
                recorded_by_id: userProfile.id,
                recorded_by_name: userProfile.full_name
              })
            })
        }

        return data
      } else {
        const { data, error } = await supabase
          .from('student_payments')
          .insert([{
            course_id: courseId,
            student_id: studentId,
            school_id: schoolId,
            amount: courseData.price || 0,
            month: currentMonth,
            status: 'paid',
            payment_date: new Date().toISOString(),
            ...(userProfile && {
              recorded_by_id: userProfile.id,
              recorded_by_name: userProfile.full_name
            })
          }])
          .select()
          .single()
        
        if (error) throw error

        // Insert into revenue table - check if exists first
        const { data: existingRevenue } = await supabase
          .from('revenue')
          .select('id')
          .eq('school_id', schoolId)
          .eq('student_id', studentId)
          .eq('course_id', courseId)
          .eq('month', currentMonth)
          .single()

        if (existingRevenue) {
          await supabase
            .from('revenue')
            .update({
              student_name: studentData.name,
              course: `${courseData.subject} - ${courseData.school_year}`,
              amount: courseData.price || 0,
              paid: true,
              updated_at: new Date().toISOString(),
              ...(userProfile && {
                recorded_by_id: userProfile.id,
                recorded_by_name: userProfile.full_name
              })
            })
            .eq('id', existingRevenue.id)
        } else {
          await supabase
            .from('revenue')
            .insert({
              school_id: schoolId,
              student_id: studentId,
              course_id: courseId,
              student_name: studentData.name,
              course: `${courseData.subject} - ${courseData.school_year}`,
              amount: courseData.price || 0,
              month: currentMonth,
              paid: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...(userProfile && {
                recorded_by_id: userProfile.id,
                recorded_by_name: userProfile.full_name
              })
            })
        }

        return data
      }
    } catch (error) {
      throw error
    }
  },

  // Toggle teacher payment for a course (creates/updates teacher_payouts)
  async toggleTeacherPayment(courseId, teacherId, amount, percentage) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      // Get current user profile for tracking
      const userProfile = await getCurrentUserProfile()

      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

      // Get teacher info
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('name')
        .eq('id', teacherId)
        .eq('school_id', schoolId)
        .single()
      
      if (teacherError) throw teacherError

      // Check if payout exists for this teacher and month
      const { data: existingPayout, error: fetchError } = await supabase
        .from('teacher_payouts')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('school_id', schoolId)
        .eq('month', currentMonth)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      
      if (existingPayout) {
        // Toggle status: pending -> paid, paid/approved -> pending
        // 'approved' is also a terminal paid state
        const isPaidState = existingPayout.status === 'paid' || existingPayout.status === 'approved'
        const newStatus = isPaidState ? 'pending' : 'paid'
        const { data, error } = await supabase
          .from('teacher_payouts')
          .update({ 
            status: newStatus,
            amount: amount,
            percentage: percentage,
            payment_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null,
            updated_at: new Date().toISOString(),
            ...(newStatus === 'paid' && userProfile && {
              recorded_by_id: userProfile.id,
              recorded_by_name: userProfile.full_name
            })
          })
          .eq('id', existingPayout.id)
          .eq('school_id', schoolId)
          .select()
          .single()
        
        if (error) throw error
        return { ...data, isPaid: newStatus === 'paid' }
      } else {
        // Create new payout record with status 'paid'
        const { data, error } = await supabase
          .from('teacher_payouts')
          .insert([{
            teacher_id: teacherId,
            school_id: schoolId,
            professor_name: teacherData?.name || 'Unknown',
            percentage: percentage,
            amount: amount,
            month: currentMonth,
            status: 'paid',
            payment_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...(userProfile && {
              recorded_by_id: userProfile.id,
              recorded_by_name: userProfile.full_name
            })
          }])
          .select()
          .single()
        
        if (error) throw error
        return { ...data, isPaid: true }
      }
    } catch (error) {
      throw error
    }
  },

  // Check if teacher is paid for current month
  async isTeacherPaidForMonth(teacherId, month = null) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const targetMonth = month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

      const { data, error } = await supabase
        .from('teacher_payouts')
        .select('status')
        .eq('teacher_id', teacherId)
        .eq('school_id', schoolId)
        .eq('month', targetMonth)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      // Both 'paid' and 'approved' are terminal paid states
      return data?.status === 'paid' || data?.status === 'approved'
    } catch (error) {
      return false
    }
  },

  // Get student payments
  async getStudentPayments() {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          students(name),
          course_instances(subject)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw error
    }
  },
}

// Attendance Services
export const attendanceService = {
  // Update attendance for student in course
  async updateAttendance(courseId, studentId, week, attended) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      // Check if attendance record exists
      const { data: existingRecord, error: fetchError } = await supabase
        .from('attendance')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .eq('week', week)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      
      if (existingRecord) {
        const { data, error } = await supabase
          .from('attendance')
          .update({ attended })
          .eq('id', existingRecord.id)
          .eq('school_id', schoolId)
          .select()
          .single()
        
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('attendance')
          .insert([{
            course_id: courseId,
            student_id: studentId,
            school_id: schoolId,
            week,
            attended
          }])
          .select()
          .single()
        
        if (error) throw error
        return data
      }
    } catch (error) {
      throw error
    }
  },

  // Get attendance for course
  async getCourseAttendance(courseId) {
    try {
      const schoolId = await getCurrentUserSchoolId()
      if (!schoolId) throw new Error('No school access')

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('course_id', courseId)
        .eq('school_id', schoolId)
      
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
