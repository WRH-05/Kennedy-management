"use client"

import useSWR, { mutate } from 'swr'
import { courseInstancesService } from "@/services/courseInstancesService"
import { swrConfig } from './swr-config'

export function useCourseInstances() {
  const { data, error, isLoading, isValidating } = useSWR(
    'course-instances',
    () => courseInstancesService.getAllCourseInstances(),
    swrConfig
  )

  return {
    data: data?.data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate('course-instance'),
  }
}

export function usePaginatedCourseInstances(page: number, pageSize: number) {
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

export function useCourseInstance(id: string) {
  const { data, error, isLoading, isValidating } = useSWR(
    id ? `course-instance-${id}` : null,
    () => courseInstancesService.getCourseInstanceById(id),
    swrConfig
  )
  return {
    course: data,
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(`course-instance-${id}`),
  }
}

export function useCourseInstancesByTeacher(teacherId: string) {
  const { data, error, isLoading, isValidating } = useSWR(
    teacherId ? `course-instances-teacher-${teacherId}` : null,
    () => courseInstancesService.getCourseInstancesByTeacherId(teacherId),
    swrConfig
  )

  return {
    courseInstances: data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(`course-instances-teacher-${teacherId}`),
  }
}

export function useCourseInstancesByStudent(studentId: string ) {
  const { data, error, isLoading, isValidating } = useSWR(
    studentId ? `course-instances-student-${studentId}` : null,
    () => courseInstancesService.getCourseInstancesByStudentId(studentId),
    swrConfig
  )

  return {
    courseInstances: data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(`course-instances-student-${studentId}`),
  }
}