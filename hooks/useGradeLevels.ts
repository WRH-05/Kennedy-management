"use client"

import useSWR, { mutate } from 'swr'
import { swrConfig } from './swr-config'
import { gradeLevelsService } from '@/services/gradeLevelsService'

export function useGradeLevels() {
  const { data, error, isLoading, isValidating } = useSWR(
    'grade-levels',
    () => gradeLevelsService.getAllGradeLevels(),
    swrConfig
  )

  return {
    gradeLevels: data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate('grade-levels'),
  }
}

export function usePaginatedGradeLevels(page: number, pageSize: number) {
  const key = `grade-levels-page-${page}-size-${pageSize}`
  const { data, error, isLoading, isValidating } = useSWR(
    key,
    () => gradeLevelsService.getAllGradeLevels(page, pageSize),
    swrConfig
  )

  return {
    gradeLevels: data?.data || [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(key),
  }
}

export function useGradeLevel(id: string) {
  const { data, error, isLoading, isValidating } = useSWR(
    id ? `grade-levels-${id}` : null,
    () => gradeLevelsService.getGradeLevelById(id),
    swrConfig
  )

  return {
    gradeLevels: data,
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(`grade-levels-${id}`),
  }
}