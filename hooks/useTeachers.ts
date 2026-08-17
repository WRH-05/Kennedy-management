"use client"

import useSWR, { mutate } from 'swr'
import { teacherService } from "@/services/teacherService"
import { swrConfig } from './swr-config'

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