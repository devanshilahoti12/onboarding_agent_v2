export interface User {
  id: number
  email: string
  full_name: string
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface OnboardingResponse {
  job_id: string
  customer_id: number
  site_identifier: string
  status: string
}

export interface CrawlStatus {
  job_id: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  pages_crawled: number
  pages_indexed: number
  error_message: string | null
  started_at: string | null
  completed_at: string | null
}

export interface SiteSummary {
  customer_id: number
  website_url: string
  site_identifier: string
  pages_indexed: number
  crawl_status: 'queued' | 'running' | 'completed' | 'failed' | 'unknown'
  created_at: string
  municipality_name: string
  entity_type: string
}

export interface ScriptData {
  script_content: string
  filename: string
  site_identifier: string
  api_key: string
  kb_identifier: string
  pages_indexed: number
  website_url: string
  backend_url: string
}
