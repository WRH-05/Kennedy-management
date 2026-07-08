"use client"

import useSWR, { mutate } from 'swr'
import { coursesService } from '@/services/coursesService'
import { swrConfig } from './swr-config'

export function useCourses() {
  const { data, error, isLoading, isValidating } = useSWR(
    'courses',
    () => coursesService.getAllCourses(),
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
    () => coursesService.getAllCourses(page, pageSize),
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
    () => coursesService.getCourseById(id),
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