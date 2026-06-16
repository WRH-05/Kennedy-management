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

export function usePaginatedTeachers(page: number, pageSize: number) {
  const key = `teachers-page-${page}-size-${pageSize}`
  const { data, error, isLoading, isValidating } = useSWR(
    key,
    () => teacherService.getAllTeachers(page, pageSize),
    swrConfig
  )

  return {
    teachers: data?.data || [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(key),
  }
}

export function useTeacher(id: string) {
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