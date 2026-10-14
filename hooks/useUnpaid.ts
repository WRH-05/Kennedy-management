"use client"

import useSWR from 'swr'
import { unpaidService } from '@/services/unpaidService'
import { swrConfig } from './swr-config'

export function useUnpaid() {
  const { data, error, isLoading, mutate } = useSWR(
    'unpaid',
    () => unpaidService.getUnpaidOverview(),
    swrConfig
  )

  return {
    data,
    isLoading,
    error,
    mutate,
  }
}
