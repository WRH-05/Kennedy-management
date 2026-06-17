"use client"

import useSWR, { mutate } from 'swr'
import { courseService } from "@/services/courseService"
import { swrConfig } from './swr-config'

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

export function usePaginatedCourses(page: number, pageSize: number) {
  const key = `courses-page-${page}-size-${pageSize}`
  const { data, error, isLoading, isValidating } = useSWR(
    key,
    () => courseService.getAllCourseInstances(page, pageSize),
    swrConfig
  )

  return {
    courses: data?.data || [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(key),
  }
}

export function useCourse(id: string) {
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

export function useCoursesByTeacher(teacherId: string) {
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

export function useCoursesByStudent(studentId: string ) {
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