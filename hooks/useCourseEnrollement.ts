"use client"

import useSWR, { mutate } from 'swr'
import { swrConfig } from './swr-config'
import { courseEnrollmentService } from '@/services/courseEnrollmentService'

export function useCourseEnrollementStudentsByCourseId(course_id: string) {
    const { data, error, isLoading, isValidating } = useSWR(
        'course-enrolled-students',
        () => courseEnrollmentService.getAllStudentsEnrolledInACourse(course_id),
        swrConfig
    )
    return {
        students: data || [],
        isLoading,
        isValidating,
        error,
        mutate: () => mutate('course-enrolled-students'),
    }
}