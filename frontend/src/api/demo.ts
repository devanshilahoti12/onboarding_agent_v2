import client from './client'

export interface DemoStartResponse {
  demo_id: string
  questions: string[]
}

export type DemoStatus = 'starting' | 'opening' | 'running' | 'done' | 'error' | 'closed'

export interface DemoStatusResponse {
  status: DemoStatus
  error?: string
}

export async function startDemo(customerId: number): Promise<DemoStartResponse> {
  const { data } = await client.post<DemoStartResponse>('/demo/start', { customer_id: customerId })
  return data
}

export async function getDemoStatus(demoId: string): Promise<DemoStatusResponse> {
  const { data } = await client.get<DemoStatusResponse>(`/demo/${demoId}/status`)
  return data
}

export async function stopDemo(demoId: string): Promise<void> {
  await client.post(`/demo/${demoId}/stop`)
}
