"use client"

import useSWR, { mutate } from 'swr'
import { courseInstancesService } from "@/services/courseInstancesService"
import { swrConfig } from './swr-config'

export function useCourses() {
  const { data, error, isLoading, isValidating } = useSWR(
    'courseInstances',
    () => courseInstancesService.getAllCourseInstances(),
    swrConfig
  )

  return {
    data: data?.data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate('courseInstances'),
  }
}

export function usePaginatedCourses(page: number, pageSize: number) {
  const key = `courseInstances-page-${page}-size-${pageSize}`
  const { data, error, isLoading, isValidating } = useSWR(
    key,
    () => courseInstancesService.getAllCourseInstances(page, pageSize),
    swrConfig
  )

  return {
    courseInstances: data?.data || [],
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
    () => courseInstancesService.getCourseInstanceById(id),
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
    teacherId ? `courseInstances-teacher-${teacherId}` : null,
    () => courseInstancesService.getCourseInstancesByTeacherId(teacherId),
    swrConfig
  )

  return {
    courseInstances: data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(`courseInstances-teacher-${teacherId}`),
  }
}

export function useCoursesByStudent(studentId: string ) {
  const { data, error, isLoading, isValidating } = useSWR(
    studentId ? `courseInstances-student-${studentId}` : null,
    () => courseInstancesService.getCourseInstancesByStudentId(studentId),
    swrConfig
  )

  return {
    courseInstances: data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(`courseInstances-student-${studentId}`),
  }
}