"use client"

import useSWR from 'swr'
import { timetableService } from '@/services/timetableService'
import { swrConfig } from './swr-config'

export function useTimetable() {
  const { data, error, isLoading, mutate } = useSWR(
    'timetable',
    () => timetableService.getTimetable(),
    swrConfig
  )

  return {
    instances: data || [],
    isLoading,
    error,
    mutate,
  }
}
