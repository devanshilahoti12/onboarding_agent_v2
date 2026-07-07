import { useEffect, useMemo, useState } from 'react'
import { getMySites } from '../api/onboarding'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../contexts/AuthContext'
import type { SiteSummary } from '../types'

/* ── Status config ────────────────────────────────────────────────────── */
type RequestStatus = 'Ready for Deployment' | 'Connector Validation' | 'Deployed' | 'Under State Review' | 'Submitted'

function crawlToStatus(crawl: SiteSummary['crawl_status']): RequestStatus {
  switch (crawl) {
    case 'completed': return 'Ready for Deployment'
    case 'running':   return 'Connector Validation'
    case 'failed':    return 'Under State Review'
    case 'queued':    return 'Submitted'
    default:          return 'Submitted'
  }
}

function crawlToStep(crawl: SiteSummary['crawl_status']): string {
  switch (crawl) {
    case 'completed': return 'Awaiting installation'
    case 'running':   return 'Crawl in progress'
    case 'failed':    return 'Policy review'
    case 'queued':    return 'Intake review'
    default:          return 'Intake review'
  }
}

function etaDate(created: string, crawl: SiteSummary['crawl_status']): string {
  const d = new Date(created)
  const days = crawl === 'completed' ? 5 : crawl === 'running' ? 11 : 16
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function reqId(customerId: number): string {
  return `REQ-2026-${String(customerId).padStart(4, '0')}`
}

function domain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') }
  catch { return url }
}

const STATUS_STYLES: Record<RequestStatus, { bg: string; color: string; border: string }> = {
  'Ready for Deployment': { bg: '#f0fdf4', color: '#0d9488', border: '#99f6e4' },
  'Connector Validation': { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  'Deployed':             { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Under State Review':   { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'Submitted':            { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {status}
    </span>
  )
}

/* ── Timeline steps per status ────────────────────────────────────────── */
const TIMELINE_STEPS = [
  'Request submitted',
  'State intake review',
  'Policy confirmation',
  'Connector/Config validation',
  'Deployment package',
  'Activation',
]

function timelineDone(crawl: SiteSummary['crawl_status']): number {
  switch (crawl) {
    case 'completed': return 3
    case 'running':   return 2
    case 'failed':    return 2
    case 'queued':    return 1
    default:          return 1
  }
}

function riskLevel(crawl: SiteSummary['crawl_status']): { label: string; bg: string; color: string } {
  if (crawl === 'failed') return { label: 'High',   bg: '#fee2e2', color: '#b91c1c' }
  if (crawl === 'running') return { label: 'Medium', bg: '#fef3c7', color: '#92400e' }
  return { label: 'Low', bg: '#dcfce7', color: '#15803d' }
}

/* ── Request detail drawer ────────────────────────────────────────────── */
function RequestDrawer({ site, submittedBy, onClose }: { site: SiteSummary; submittedBy: string; onClose: () => void }) {
  const [comment, setComment] = useState('')
  const [posted, setPosted]   = useState(false)

  const status  = crawlToStatus(site.crawl_status)
  const entity  = site.municipality_name || domain(site.website_url)
  const eta     = etaDate(site.created_at, site.crawl_status)
  const done    = timelineDone(site.crawl_status)
  const risk    = riskLevel(site.crawl_status)

  function handlePost() {
    if (!comment.trim()) return
    setPosted(true)
    setComment('')
    setTimeout(() => setPosted(false), 3000)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(10,20,40,0.4)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 bg-white shadow-2xl flex flex-col overflow-hidden"
        style={{ width: 420 }}
      >
        {/* Drawer header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-slate-900 text-lg leading-tight">IGNA Chat</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{reqId(site.customer_id)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Status</span>
            <StatusBadge status={status} />
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-0.5">Entity</p>
              <p className="text-sm font-semibold text-slate-800">{entity}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-0.5">Submitted by</p>
              <p className="text-sm font-semibold text-slate-800">{submittedBy}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-0.5">Submitted</p>
              <p className="text-sm font-semibold text-slate-800">{site.created_at.slice(0, 10)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-0.5">ETA</p>
              <p className="text-sm font-semibold text-slate-800">{eta}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-0.5">Risk</p>
              <span
                className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: risk.bg, color: risk.color }}
              >
                {risk.label}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-0.5">Current Step</p>
              <p className="text-sm font-semibold text-slate-800">{crawlToStep(site.crawl_status)}</p>
            </div>
          </div>

          <hr className="border-slate-100"/>

          {/* Timeline */}
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-3">Timeline</p>
            <ol className="space-y-2.5">
              {TIMELINE_STEPS.map((step, i) => {
                const isDone = i < done
                return (
                  <li key={step} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: isDone ? '#22c55e' : '#cbd5e1' }}
                    />
                    <span className={`text-sm ${isDone ? 'text-slate-800' : 'text-slate-400'}`}>{step}</span>
                  </li>
                )
              })}
            </ol>
          </div>

          <hr className="border-slate-100"/>

          {/* Policy Acknowledgements */}
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-3">Policy Acknowledgements</p>
            <ul className="space-y-1.5">
              {['Responsible AI Use Policy', 'Data Privacy and Protection', 'Human Oversight and Review'].map(p => (
                <li key={p} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <hr className="border-slate-100"/>

          {/* Comments */}
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-3">Comments</p>
            {posted && (
              <div className="mb-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
                <p className="text-xs text-green-700 font-medium">Comment posted successfully.</p>
              </div>
            )}
            <textarea

              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a comment for the State team..."
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
            />
          </div>
        </div>

        {/* Sticky footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-white">
          <button
            onClick={handlePost}
            className="w-full bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            Post Comment
          </button>
        </div>
      </div>
    </>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function MyRequestsPage() {
  const { user }              = useAuth()
  const [sites, setSites]     = useState<SiteSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<SiteSummary | null>(null)

  /* Filter state */
  const [filterAgent, setFilterAgent]   = useState('All agents')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterEntity, setFilterEntity] = useState('All')
  const [filterRange, setFilterRange]   = useState('Last 30 days')

  useEffect(() => {
    getMySites().then(setSites).catch(() => {}).finally(() => setLoading(false))
  }, [])

  /* Derive unique filter options from data */
  const agentOptions   = useMemo(() => ['All agents', 'IGNA Chat'], [])
  const entityOptions  = useMemo(() => {
    const names = sites.map(s => s.municipality_name || domain(s.website_url)).filter(Boolean)
    return ['All', ...Array.from(new Set(names))]
  }, [sites])
  const statusOptions  = ['All', 'Ready for Deployment', 'Connector Validation', 'Deployed', 'Under State Review', 'Submitted']
  const rangeOptions   = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'All time']

  /* Filter rows */
  const rows = useMemo(() => {
    const cutoff = (() => {
      const d = new Date()
      if (filterRange === 'Last 7 days')  { d.setDate(d.getDate() - 7);  return d }
      if (filterRange === 'Last 30 days') { d.setDate(d.getDate() - 30); return d }
      if (filterRange === 'Last 90 days') { d.setDate(d.getDate() - 90); return d }
      return null
    })()

    return sites.filter(s => {
      const entity = s.municipality_name || domain(s.website_url)
      const status = crawlToStatus(s.crawl_status)
      if (filterStatus !== 'All' && status !== filterStatus) return false
      if (filterEntity !== 'All' && entity !== filterEntity) return false
      if (cutoff && new Date(s.created_at) < cutoff) return false
      return true
    })
  }, [sites, filterAgent, filterStatus, filterEntity, filterRange])

  return (
    <AppLayout>
      {selected && (
        <RequestDrawer
          site={selected}
          submittedBy={user?.full_name ?? 'Unknown'}
          onClose={() => setSelected(null)}
        />
      )}
      <div className="flex flex-col min-h-full">
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Requests</h1>
            <p className="text-slate-500 text-sm mt-1">
              Track every deployment request your entity has submitted, from intake through activation.
            </p>
          </div>

          {/* Filter bar */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Agent */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Agent</label>
                <select
                  value={filterAgent}
                  onChange={e => setFilterAgent(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
                >
                  {agentOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
                >
                  {statusOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Entity */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Entity</label>
                <select
                  value={filterEntity}
                  onChange={e => setFilterEntity(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
                >
                  {entityOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Date Range</label>
                <select
                  value={filterRange}
                  onChange={e => setFilterRange(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
                >
                  {rangeOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Request ID', 'Agent', 'Entity', 'Submitted', 'Status', 'Current Step', 'ETA', 'Actions'].map(h => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-50 animate-pulse">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-3.5 bg-slate-100 rounded w-20"/>
                          </td>
                        ))}
                      </tr>
                    ))
                  )}

                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-14 text-center text-slate-400 text-sm">
                        No requests match the selected filters.
                      </td>
                    </tr>
                  )}

                  {!loading && rows.map((site, i) => {
                    const status  = crawlToStatus(site.crawl_status)
                    const entity  = site.municipality_name || domain(site.website_url)
                    const submitted = site.created_at.slice(0, 10)
                    const eta     = etaDate(site.created_at, site.crawl_status)
                    const isLast  = i === rows.length - 1

                    return (
                      <tr
                        key={site.customer_id}
                        className={`hover:bg-slate-50 transition-colors ${isLast ? '' : 'border-b border-slate-50'}`}
                      >
                        <td className="px-5 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {reqId(site.customer_id)}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-800 whitespace-nowrap">IGNA Chat</td>
                        <td className="px-5 py-4 text-sky-600 font-medium whitespace-nowrap">{entity}</td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{submitted}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{crawlToStep(site.crawl_status)}</td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{eta}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <button onClick={() => setSelected(site)} className="flex items-center gap-1 text-sky-600 hover:text-sky-800 font-medium text-sm transition-colors">
                            View
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="font-semibold text-slate-900 text-[15px]">State of New Jersey AI Enablement Portal</p>
                <p className="text-sky-600 text-sm font-medium mt-1">Powered by TechForGov</p>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed max-w-xs">
                  AI-generated outputs should be reviewed by authorized staff before official action.
                </p>
              </div>
              <div className="space-y-2">
                {['Privacy', 'Accessibility', 'Security'].map(l => (
                  <p key={l}><a href="#" className="text-slate-500 hover:text-slate-800 text-sm transition-colors">{l}</a></p>
                ))}
              </div>
              <div className="space-y-2">
                {['Policy Library', 'Support'].map(l => (
                  <p key={l}><a href="#" className="text-slate-500 hover:text-slate-800 text-sm transition-colors">{l}</a></p>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100">
              <p className="text-slate-400 text-xs">© 2026 State of New Jersey. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </AppLayout>
  )
}
