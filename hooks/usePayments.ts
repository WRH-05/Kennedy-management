"use client"

import useSWR, { mutate } from 'swr'
import { paymentService, UnifiedPaymentActivity } from "@/services/paymentService"
import { swrConfig } from './swr-config'
import { useStudents } from './useStudents'
import { useTeachers } from './useTeachers'
import { useCourseInstances } from './useCourseInstances'
import { studentPaymentService } from '@/services/studentPaymentService'
import { teacherPayoutService } from '@/services/teacherPayoutService'
import { archiveService } from '@/services/archiveService'

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

export function useStudentsPayments() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    'students-payments',
    () => studentPaymentService.getAllStudentsPayments(),
    swrConfig
  )

  return {
    payments: data,
    isLoading,
    isValidating,
    error,
    mutate, // Returns the bound mutator for this specific key
  }
}

export function useTeachersPayments() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    'teachers-payments', // ✨ Fixed cache key collision
    () => teacherPayoutService.getAllTeachersPayments(),
    swrConfig
  )

  return {
    payments: data,
    isLoading,
    isValidating,
    error,
    mutate, // Returns the bound mutator for this specific key
  }
}

export function useStudentsData(billing_period_id: string) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    billing_period_id ? ['payment-students-data', billing_period_id] : null, // Guard against empty IDs
    ([_, id]) => studentPaymentService.getStudentData(id),
    {
      ...swrConfig,
      revalidateOnMount: true,
      revalidateIfStale: true,
      dedupingInterval: 0,
    }
  )

  return {
    payments: data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(),
  }
}

export function useRevenue() {
  const { payments } = usePayments()

  const revenueData = payments
    .filter((p: UnifiedPaymentActivity) => p.type === 'student' && p.status === 'paid')
    .map((p: UnifiedPaymentActivity) => ({
      ...p,
      paid: true
    }))

  return {
    data: revenueData,
    error: null,
    isLoading: false
  }
}

export function usePendingArchives() {
  const { data, error, isLoading } = useSWR(
    'pending-archives',
    () => archiveService.getPendingArchiveEntityIds(),
    swrConfig
  )
  return {
    data: data || { student: new Set<string>(), teacher: new Set<string>(), course: new Set<string>() },
    isLoading,
  }
}


export function useTeachersPayouts() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    'teachers-payouts',
    () => teacherPayoutService.getAllTeachersPayouts(),
    swrConfig
  )

  return {
    payments: data || [],
    isLoading,
    isValidating,
    error,
    mutate, // Returns the bound mutator for this specific key
  }
}

// COMBINED DASHBOARD DATA HOOK
export function useDashboardData() {
  const { students, isLoading: studentsLoading, error: studentsError } = useStudents()
  const { teachers, isLoading: teachersLoading, error: teachersError } = useTeachers()
  const { data: courseInstances, isLoading: coursesLoading, error: coursesError } = useCourseInstances()
  const { payments, isLoading: paymentsLoading, error: paymentsError } = usePayments()

  const isLoading = studentsLoading || teachersLoading || coursesLoading || paymentsLoading
  const error = studentsError || teachersError || coursesError || paymentsError

  return {
    students,
    teachers,
    courseInstances,
    payments,
    isLoading,
    error,
    refreshAll: () => {
      mutate('students')
      mutate('teachers')
      mutate('courseInstances')
      mutate('payments')
    },
  }
}