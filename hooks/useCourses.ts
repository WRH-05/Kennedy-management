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