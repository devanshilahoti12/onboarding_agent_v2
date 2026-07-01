import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMySites } from '../api/onboarding'
import AppLayout from '../components/AppLayout'
import type { SiteSummary } from '../types'

/* ── Helpers ──────────────────────────────────────────────────────────── */
function badge(status: SiteSummary['crawl_status']): { label: string; bg: string; color: string } {
  switch (status) {
    case 'completed': return { label: 'Ready for Installation', bg: '#dcfce7', color: '#15803d' }
    case 'running':   return { label: 'Crawling in Progress',   bg: '#dbeafe', color: '#1d4ed8' }
    case 'queued':    return { label: 'Queued',                 bg: '#f1f5f9', color: '#475569' }
    case 'failed':    return { label: 'Crawl Failed',           bg: '#fee2e2', color: '#b91c1c' }
    default:          return { label: 'Unknown',                bg: '#f1f5f9', color: '#94a3b8' }
  }
}

function nextAction(status: SiteSummary['crawl_status']): string {
  switch (status) {
    case 'completed': return 'Verify Installation'
    case 'running':   return 'Awaiting Crawl Completion'
    case 'queued':    return 'Pending Crawl Start'
    case 'failed':    return 'Retry Crawl'
    default:          return '—'
  }
}

function domain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') }
  catch { return url }
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const TIMELINE = [
  'Request Submitted',
  'Policy Confirmed',
  'Data Source Validated',
  'Package Generated',
  'Installed / Activated',
  'Monitoring Enabled',
]

/* ── Skeleton card ────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <div className="h-4 w-24 bg-slate-100 rounded"/>
            <div className="h-3 w-32 bg-slate-100 rounded"/>
          </div>
          <div className="h-6 w-28 bg-slate-100 rounded-full"/>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-1"><div className="h-2.5 w-12 bg-slate-100 rounded"/><div className="h-3.5 w-20 bg-slate-100 rounded"/></div>
          <div className="space-y-1"><div className="h-2.5 w-16 bg-slate-100 rounded"/><div className="h-3.5 w-20 bg-slate-100 rounded"/></div>
        </div>
        <div className="space-y-1 pt-1"><div className="h-2.5 w-16 bg-slate-100 rounded"/><div className="h-3.5 w-32 bg-slate-100 rounded"/></div>
      </div>
      <div className="border-t border-slate-100 h-10 bg-slate-50"/>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function DeploymentCenterPage() {
  const navigate = useNavigate()
  const [sites, setSites]     = useState<SiteSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMySites().then(setSites).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const doneCount = sites.filter(s => s.crawl_status === 'completed').length
  const stepsComplete =
    sites.length === 0 ? 0 :
    doneCount > 0      ? 4 :
    sites.some(s => s.crawl_status === 'running') ? 2 : 1

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deployment Center</h1>
          <p className="text-slate-500 text-sm mt-1">Manage active and pending AI agent deployments across your entity.</p>
        </div>

        {/* Cards grid — skeleton while loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && sites.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center shadow-sm">
            <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">No deployments yet</h3>
            <p className="text-slate-400 text-sm mb-5">Start by deploying an AI agent for your website.</p>
            <button
              onClick={() => navigate('/agents')}
              className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Go to AI Agent Library
            </button>
          </div>
        )}

        {/* Deployment cards */}
        {!loading && sites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sites.map(site => {
              const b = badge(site.crawl_status)
              return (
                <div
                  key={site.customer_id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="p-5 flex-1">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-[15px]">IGNA Chat</h3>
                        <p className="text-sm text-slate-500 mt-0.5">{domain(site.website_url)}</p>
                      </div>
                      <span
                        className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: b.bg, color: b.color }}
                      >
                        {b.label}
                      </span>
                    </div>

                    {/* Method + Last updated */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Method</p>
                        <p className="text-sm font-medium text-slate-800">Website Script Tag</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Last updated</p>
                        <p className="text-sm font-medium text-slate-800">{fmtDate(site.created_at)}</p>
                      </div>
                    </div>

                    {/* Next action */}
                    <div className="mt-3.5">
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Next action</p>
                      <p className="text-sm font-medium text-slate-800">{nextAction(site.crawl_status)}</p>
                    </div>
                  </div>

                  {/* Footer button */}
                  <button
                    onClick={() => navigate(`/download/${site.customer_id}`)}
                    className="w-full flex items-center justify-center gap-1.5 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 border-t border-slate-100 transition-colors"
                  >
                    View Deployment
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Deployment Timeline */}
        {!loading && sites.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-7">Deployment Timeline</h3>
            <div className="relative flex items-start">
              {/* Connector track behind circles */}
              <div className="absolute top-5 left-5 right-5 h-px bg-slate-100" style={{ zIndex: 0 }}/>
              <div
                className="absolute top-5 left-5 h-px bg-green-400 transition-all duration-700"
                style={{ zIndex: 0, width: stepsComplete > 1 ? `${((stepsComplete - 1) / (TIMELINE.length - 1)) * 100}%` : 0 }}
              />

              {TIMELINE.map((step, i) => {
                const done = i < stepsComplete
                return (
                  <div key={step} className="flex-1 flex flex-col items-center relative" style={{ zIndex: 1 }}>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all"
                      style={{
                        background: done ? '#22c55e' : '#f1f5f9',
                        borderColor: done ? '#22c55e' : '#e2e8f0',
                        color: done ? '#fff' : '#94a3b8',
                      }}
                    >
                      {done ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                        </svg>
                      ) : (i + 1)}
                    </div>
                    <p
                      className="text-xs text-center mt-2.5 leading-tight px-1"
                      style={{
                        color: done ? '#334155' : '#94a3b8',
                        fontWeight: done ? 500 : 400,
                        maxWidth: 80,
                      }}
                    >
                      {step}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
