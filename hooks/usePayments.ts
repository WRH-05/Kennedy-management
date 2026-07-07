"use client"

import useSWR, { mutate } from 'swr'
import { paymentService } from "@/services/paymentService"
import { swrConfig } from './swr-config'
import { useStudents } from './useStudents'
import { useTeachers } from './useTeachers'
import { useCourses } from './useCourses'
import { studentPaymentService } from '@/services/studentPaymentService'
import { teacherPayoutService } from '@/services/teacherPayoutService'

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
    payments: data || [],
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
    payments: data || [],
    isLoading,
    isValidating,
    error,
    mutate, // Returns the bound mutator for this specific key
  }
}

export function useStudentsData(billing_period_id: string) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    billing_period_id ? ['payment-students-data', billing_period_id] : null,
    ([_, id]) => studentPaymentService.getStudentData(id),
    {
      ...swrConfig,                // Keep your other configs if necessary
      revalidateOnMount: true,     // Forces revalidation when the component mounts
      revalidateIfStale: true,     // Always revalidate even if data is cached
      dedupingInterval: 0,         // Disables request deduping (no caching time window)
    }
  )

  return {
    payments: data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(['payment-students-data', billing_period_id]),
  }
}

export function useRevenue() {
  const { payments } = usePayments()

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
  const { courseInstances, isLoading: coursesLoading, error: coursesError } = useCourses()
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