"use client"

import useSWR, { mutate } from 'swr'
import { courseInstancesService } from "@/services/courseInstancesService"
import { swrConfig } from './swr-config'

export function useCourseInstances() {
  const { data, error, isLoading, isValidating } = useSWR(
    'course-instances',
    () => courseInstancesService.getAllCourseInstances(),
    swrConfig
  )

  return {
    data: data?.data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate('course-instances'),
  }
}

export function useTodaySchedule() {
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const key = `today-schedule-${day}`
  const { data, error, isLoading, isValidating } = useSWR(
    key,
    () => courseInstancesService.getTodaysSchedule(day),
    swrConfig
  )

  return {
    schedule: data || [],
    isLoading,
    isValidating,
    error,
    mutate: () => mutate(key),
  }
}