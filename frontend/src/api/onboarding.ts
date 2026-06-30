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

export interface DataSourceItem {
  url: string
  type: string
  priority: string
  frequency: string
}

export interface DeployWizardPayload {
  // Step 1 — Entity
  full_name: string
  work_email: string
  municipality_name: string
  entity_type: string
  department: string
  technical_contact_email: string
  phone: string
  // Step 2 — Configuration
  website_url: string
  website_platform: string
  chat_placement: string
  chat_display_name: string
  welcome_message: string
  business_hours: string
  after_hours_message: string
  // Step 3 — Data Sources
  data_sources: DataSourceItem[]
  // Step 4 — Policy
  escalation_email: string
  department_routing: string
  emergency_disclaimer: string
  human_handoff: string
  unsupported_response: string
}

export async function submitDeployment(payload: DeployWizardPayload): Promise<OnboardingResponse> {
  const { data } = await client.post<OnboardingResponse>('/agents/deploy', payload)
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
