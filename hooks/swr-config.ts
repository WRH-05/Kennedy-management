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
    mutate('students')
    mutate('teachers')
    mutate('courses')
    mutate('payments')
  } else {
    mutate(key)
  }
}