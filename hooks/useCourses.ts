"use client"

import useSWR, { mutate } from 'swr'
import { coursesService } from '@/services/coursesService'
import { swrConfig } from './swr-config'

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