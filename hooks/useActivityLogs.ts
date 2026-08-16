"use client"

import useSWR from 'swr'
import { activityLogService } from '@/services/activityLogService'
import { swrConfig } from './swr-config'

export function useActivityLogs(filterCategory: string, dateRange: string, searchQuery: string) {
  const { data, error, isLoading, mutate: boundMutate } = useSWR(
    ['activity-logs', filterCategory, dateRange, searchQuery],
    () => activityLogService.getLogs(filterCategory, dateRange, searchQuery),
    swrConfig
  )

  return {
    logs: data || [],
    isLoading,
    error,
    mutate: boundMutate,
  }
}
