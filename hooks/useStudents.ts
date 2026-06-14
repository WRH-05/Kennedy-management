"use client"

import useSWR, { mutate } from 'swr'
import { studentService } from "@/services/studentService"
import { swrConfig } from './swr-config'

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

export function usePaginatedStudents(page: number, pageSize: number) {
  const key = `students-page-${page}-size-${pageSize}`
  const { data, error, isLoading, isValidating } = useSWR(
    key,
    () => studentService.getAllStudents(page, pageSize),
    swrConfig
  )

  return {
    students: data?.data || [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(key),
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