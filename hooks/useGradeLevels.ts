"use client"

import useSWR, { mutate } from 'swr'
import { swrConfig } from './swr-config'
import { gradeLevelsService } from '@/services/gradeLevelsService'

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