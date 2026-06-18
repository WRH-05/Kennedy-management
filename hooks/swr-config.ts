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


export function revalidateData(key: 'students' | 'teachers' | 'courses' | 'payments' | 'all') {
  if (key === 'all') {
    mutate(() => true, undefined, { revalidate: true })
    return
  }

  mutate(key)

  if (key === 'students') {
    mutate((cacheKey) => typeof cacheKey === 'string' && cacheKey.startsWith('students-page-'))
  }

  if (key === 'teachers') {
    mutate((cacheKey) => typeof cacheKey === 'string' && cacheKey.startsWith('teachers-page-'))
  }

  if (key === 'courses') {
    mutate((cacheKey) => typeof cacheKey === 'string' && cacheKey.startsWith('courses-page-'))
  }
}