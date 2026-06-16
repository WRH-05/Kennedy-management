"use client"

import useSWR, { mutate } from 'swr'
import { paymentService } from "@/services/paymentService"
import { swrConfig } from './swr-config'
import { useStudents } from './useStudents'
import { useTeachers } from './useTeachers'
import { useCourses } from './useCourses'

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

export function useRevenue() {
  const { payments } = usePayments()
  
  // Calculate revenue from student payments
  const revenueData = payments
    .filter((p: any) => p.type === 'student' && p.status === 'paid')
    .map((p: any) => ({
      ...p,
      paid: true
    }))
  
  return {
    data: revenueData,
    error: null,
    isLoading: false
  }
}

export function usePayouts() {
  return useSWR("dashboard/payouts", () => paymentService.getAllPayouts())
}

export function usePendingArchives() {
  return {
    data: {
      student: new Set<string>(),
      teacher: new Set<string>(),
      course: new Set<string>()
    },
    isLoading: false
  }
}

// COMBINED DASHBOARD DATA HOOK
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
    refreshAll: () => {
      mutate('students')
      mutate('teachers')
      mutate('courses')
      mutate('payments')
    },
  }
}