import useSWR from 'swr'
import { schoolSettingsService } from '@/services/schoolSettingsService'
import { swrConfig } from '@/hooks/swr-config'

export function useSchoolSettings() {
  const { data, error, isLoading, mutate } = useSWR(
    'school-settings',
    () => schoolSettingsService.getSettings(),
    swrConfig
  )

  return {
    settings: data || null,
    isLoading,
    isError: !!error,
    mutate,
  }
}
