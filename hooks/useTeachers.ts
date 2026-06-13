"use client"

import useSWR, { mutate } from 'swr'
import { teacherService } from "@/services/teacherService"
import { swrConfig } from './swr-config'

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