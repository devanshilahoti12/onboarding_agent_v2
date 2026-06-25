import { useEffect, useState } from 'react'
import { getCrawlStatus } from '../api/onboarding'
import type { CrawlStatus } from '../types'

export function useCrawlPoller(jobId: string | null) {
  const [status, setStatus] = useState<CrawlStatus | null>(null)

  useEffect(() => {
    if (!jobId) return

    const poll = async () => {
      try {
        const data = await getCrawlStatus(jobId)
        setStatus(data)
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval)
        }
      } catch {
        // silently retry
      }
    }

    poll() // immediate first call
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [jobId])

  return status
}
