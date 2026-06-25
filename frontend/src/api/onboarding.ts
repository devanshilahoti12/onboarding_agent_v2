import client from './client'
import type { CrawlStatus, OnboardingResponse, ScriptData, SiteSummary } from '../types'

export async function submitOnboarding(
  full_name: string,
  work_email: string,
  website_url: string
): Promise<OnboardingResponse> {
  const { data } = await client.post<OnboardingResponse>('/onboarding/submit', {
    full_name,
    work_email,
    website_url,
  })
  return data
}

export async function getCrawlStatus(jobId: string): Promise<CrawlStatus> {
  const { data } = await client.get<CrawlStatus>(`/crawl/${jobId}/status`)
  return data
}

export async function getScript(customerId: number): Promise<ScriptData> {
  const { data } = await client.get<ScriptData>(`/script/${customerId}`)
  return data
}

export function getDownloadUrl(customerId: number): string {
  return `/api/script/${customerId}/download`
}

export async function getMySites(): Promise<SiteSummary[]> {
  const { data } = await client.get<SiteSummary[]>('/onboarding/sites')
  return data
}
