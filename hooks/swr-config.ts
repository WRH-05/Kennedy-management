import { mutate } from 'swr'

export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 30000,
  errorRetryCount: 2,
  errorRetryInterval: 5000,
}

export function invalidateAllCache() {
  mutate(() => true, undefined, { revalidate: false })
}

export type RevalidateKey =
  | 'students'
  | 'teachers'
  | 'course-instances'
  | 'courses'
  | 'grade-levels'
  | 'payments'
  | 'teacher-payouts'
  | 'student-payments'
  | 'teacher-payments'
  | 'pending-archives'
  | 'school-settings'
  | 'all'

export function revalidateData(key: RevalidateKey) {
  if (key === 'all') {
    mutate(() => true, undefined, { revalidate: true })
    return
  }

  // Mutate the exact base key
  mutate(key)

  // Also revalidate paginated variants sharing the same prefix
  const paginatedPrefixes: Record<string, string> = {
    'students': 'students-page-',
    'teachers': 'teachers-page-',
    'course-instances': 'courseInstances-page-',
    'courses': 'courses-page-',
    'grade-levels': 'grade-levels-page-',
  }

  const prefix = paginatedPrefixes[key]
  if (prefix) {
    mutate((cacheKey) => typeof cacheKey === 'string' && cacheKey.startsWith(prefix))
  }
}
