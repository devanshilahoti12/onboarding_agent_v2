import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getMySites } from '../api/onboarding'
import type { SiteSummary } from '../types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuth()
  const [sites, setSites] = useState<SiteSummary[]>([])

  useEffect(() => {
    getMySites().then(setSites).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
            </svg>
          </div>
          <span className="font-semibold text-gray-900">IGNA Onboarding Agent</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hello, {user?.full_name}</span>
          <button onClick={clearAuth} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Agent Cards */}
        <div className="mb-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-500 mt-1">Select an agent to get started</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AgentCard
              title="IGNA Chat"
              description="Deploy an AI-powered chat widget on your website, trained on your own content."
              icon={
                <svg className="w-7 h-7 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
                </svg>
              }
              badge="Ready"
              onAction={() => navigate('/onboarding')}
              actionLabel="Set Up New Site"
            />
            <LockedCard title="IGNA Voice" description="AI-powered voice assistant for hands-free customer interactions." />
            <LockedCard title="IGNA Sync" description="Sync your knowledge base across all your IGNA agents instantly." />
          </div>
        </div>

        {/* My Sites History */}
        {sites.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">My Sites</h3>
              <span className="text-sm text-gray-500">{sites.length} site{sites.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Website</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pages</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Added</th>
                    <th className="px-5 py-3"/>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site, i) => (
                    <tr key={site.customer_id} className={i !== sites.length - 1 ? 'border-b border-gray-100' : ''}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 truncate max-w-xs">{site.website_url}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{site.site_identifier}</p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={site.crawl_status} />
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-indigo-600">{site.pages_indexed}</span>
                        <span className="text-gray-400 ml-1">pages</span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {new Date(site.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {site.crawl_status === 'completed' ? (
                          <button
                            onClick={() => navigate(`/download/${site.customer_id}`)}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            View Script →
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    completed: { label: 'Indexed', className: 'bg-green-100 text-green-700' },
    running:   { label: 'Crawling', className: 'bg-blue-100 text-blue-700' },
    queued:    { label: 'Queued', className: 'bg-yellow-100 text-yellow-700' },
    failed:    { label: 'Failed', className: 'bg-red-100 text-red-700' },
    unknown:   { label: 'Unknown', className: 'bg-gray-100 text-gray-500' },
  }
  const { label, className } = map[status] ?? map.unknown
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

function AgentCard({ title, description, icon, badge, onAction, actionLabel }: {
  title: string; description: string; icon: React.ReactNode
  badge: string; onAction: () => void; actionLabel: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">{icon}</div>
        <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{badge}</span>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        <p className="text-gray-500 text-sm mt-1 leading-relaxed">{description}</p>
      </div>
      <button onClick={onAction} className="mt-auto w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
        {actionLabel}
      </button>
    </div>
  )
}

function LockedCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4 opacity-60">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">Coming soon</span>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        <p className="text-gray-500 text-sm mt-1 leading-relaxed">{description}</p>
      </div>
      <button disabled className="mt-auto w-full bg-gray-200 text-gray-400 text-sm font-semibold py-2.5 rounded-xl cursor-not-allowed">
        Coming Soon
      </button>
    </div>
  )
}
