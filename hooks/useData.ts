"use client"

import useSWR, { mutate } from 'swr'
import { studentService, teacherService, courseService, paymentService } from '@/services/appDataService'

// SWR configuration for optimal caching
const swrConfig = {
  revalidateOnFocus: false,      // Don't refetch when window gains focus
  revalidateOnReconnect: true,   // Refetch when network reconnects
  dedupingInterval: 30000,       // 30 seconds deduplication
  errorRetryCount: 2,            // Retry failed requests twice
  errorRetryInterval: 5000,      // 5 seconds between retries
}

// ============================================================================
// STUDENTS HOOKS
// ============================================================================

export function useStudents() {
  const { data, error, isLoading, isValidating } = useSWR(
    'students',
    () => studentService.getAllStudents(),
    swrConfig
  )

  return {
    students: data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate('students'),
  }
}

export function useStudent(id: string | number) {
  const { data, error, isLoading, isValidating } = useSWR(
    id ? `student-${id}` : null,
    () => studentService.getStudentById(id),
    swrConfig
  )

  return {
    student: data,
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(`student-${id}`),
  }
}

// ============================================================================
// TEACHERS HOOKS
// ============================================================================

export function useTeachers() {
  const { data, error, isLoading, isValidating } = useSWR(
    'teachers',
    () => teacherService.getAllTeachers(),
    swrConfig
  )

  return {
    teachers: data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate('teachers'),
  }
}

export function useTeacher(id: string | number) {
  const { data, error, isLoading, isValidating } = useSWR(
    id ? `teacher-${id}` : null,
    () => teacherService.getTeacherById(id),
    swrConfig
  )

  return {
    teacher: data,
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(`teacher-${id}`),
  }
}

// ============================================================================
// COURSES HOOKS
// ============================================================================

export function useCourses() {
  const { data, error, isLoading, isValidating } = useSWR(
    'courses',
    () => courseService.getAllCourseInstances(),
    swrConfig
  )

  return {
    courses: data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate('courses'),
  }
}

export function useCourse(id: string | number) {
  const { data, error, isLoading, isValidating } = useSWR(
    id ? `course-${id}` : null,
    () => courseService.getCourseInstanceById(id),
    swrConfig
  )

  return {
    course: data,
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(`course-${id}`),
  }
}

export function useCoursesByTeacher(teacherId: string | number) {
  const { data, error, isLoading, isValidating } = useSWR(
    teacherId ? `courses-teacher-${teacherId}` : null,
    () => courseService.getCoursesByTeacherId(teacherId),
    swrConfig
  )

  return {
    courses: data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(`courses-teacher-${teacherId}`),
  }
}

export function useCoursesByStudent(studentId: string | number) {
  const { data, error, isLoading, isValidating } = useSWR(
    studentId ? `courses-student-${studentId}` : null,
    () => courseService.getCoursesByStudentId(studentId),
    swrConfig
  )

  return {
    courses: data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(`courses-student-${studentId}`),
  }
}

// ============================================================================
// PAYMENTS HOOKS
// ============================================================================

export function usePayments() {
  const { data, error, isLoading, isValidating } = useSWR(
    'payments',
    () => paymentService.getAllPayments(),
    swrConfig
  )

  return {
    payments: data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate('payments'),
  }
}

export function useTeacherPaymentData() {
  const { data, error, isLoading, isValidating } = useSWR(
    'teacher-payment-data',
    () => paymentService.getTeacherData(),
    swrConfig
  )

  return {
    paymentData: data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate('teacher-payment-data'),
  }
}

// ============================================================================
// COMBINED DASHBOARD DATA HOOK
// ============================================================================

export function useDashboardData() {
  const { students, isLoading: studentsLoading, error: studentsError } = useStudents()
  const { teachers, isLoading: teachersLoading, error: teachersError } = useTeachers()
  const { courses, isLoading: coursesLoading, error: coursesError } = useCourses()
  const { payments, isLoading: paymentsLoading, error: paymentsError } = usePayments()

  const isLoading = studentsLoading || teachersLoading || coursesLoading || paymentsLoading
  const error = studentsError || teachersError || coursesError || paymentsError

  return {
    students,
    teachers,
    courses,
    payments,
    isLoading,
    error,
    // Refresh all data
    refreshAll: () => {
      mutate('students')
      mutate('teachers')
      mutate('courses')
      mutate('payments')
    },
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Invalidate all cached data (useful after logout or major changes)
 */
export function invalidateAllCache() {
  mutate(() => true, undefined, { revalidate: false })
}

/**
 * Revalidate specific data type
 */
export function revalidateData(key: 'students' | 'teachers' | 'courses' | 'payments' | 'all') {
  if (key === 'all') {
    mutate('students')
    mutate('teachers')
    mutate('courses')
    mutate('payments')
  } else {
    mutate(key)
  }
}
