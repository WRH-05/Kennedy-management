"use client"

import useSWR, { mutate } from 'swr'
import { statsService, DateRangeKey } from "@/services/statsService"
import { swrConfig } from './swr-config'

export function useStats(range: DateRangeKey) {
  const key = `stats-${range}`
  const { data, error, isLoading, isValidating } = useSWR(
    key,
    () => statsService.getStats(range),
    swrConfig
  )

  return {
    stats: data,
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(key),
  }
}
