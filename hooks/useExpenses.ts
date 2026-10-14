"use client"

import useSWR from 'swr'
import { expenseService } from '@/services/expenseService'
import { swrConfig } from './swr-config'

export function useExpenses(category?: string, range?: string, query?: string) {
  const { data, error, isLoading, mutate: boundMutate } = useSWR(
    ['expenses', category, range, query],
    () => expenseService.getExpenses(category, range, query),
    swrConfig
  )

  return {
    expenses: data || [],
    isLoading,
    error,
    mutate: boundMutate,
  }
}
