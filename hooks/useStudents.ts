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