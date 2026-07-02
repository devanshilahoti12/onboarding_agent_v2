import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { AGENTS, CATEGORIES, DEPLOYMENT_TYPES, type Agent } from '../data/agents'

/* ── Agent icon components ──────────────────────────────────────────── */
function AgentIcon({ type }: { type: Agent['icon'] }) {
  const cls = 'w-5 h-5'
  if (type === 'chat') return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
    </svg>
  )
  if (type === 'phone') return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
    </svg>
  )
  if (type === 'chart') return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
    </svg>
  )
  if (type === 'headset') return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/>
    </svg>
  )
  if (type === 'shield') return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
    </svg>
  )
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
    </svg>
  )
}

/* ── Agent card ─────────────────────────────────────────────────────── */
function AgentCard({ agent }: { agent: Agent }) {
  const isLive = agent.id === 'igna-chat'

  return (
    <div className={`relative bg-white border rounded-xl p-5 flex flex-col gap-3 shadow-sm transition-shadow ${isLive ? 'border-slate-200 hover:shadow-md' : 'border-slate-200 opacity-70'}`}>
      {/* Coming Soon ribbon */}
      {!isLive && (
        <div className="absolute top-3.5 right-3.5 z-10">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            Coming Soon
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isLive ? 'bg-sky-50 border border-sky-100 text-sky-500' : 'bg-slate-100 border border-slate-200 text-slate-400'}`}>
          <AgentIcon type={agent.icon} />
        </div>
        <div className="flex-1 min-w-0 pr-20">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-[15px]">{agent.name}</span>
            {isLive && (
              <span className="text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 whitespace-nowrap">
                State Approved
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{agent.category}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 leading-relaxed">{agent.description}</p>

      {/* Info boxes */}
      <div className="flex gap-2">
        <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Deployment</p>
          <p className="text-xs font-medium text-slate-700 truncate">{agent.deploymentType}</p>
        </div>
        {agent.setup && (
          <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-0.5 flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Setup
            </p>
            <p className="text-xs font-medium text-slate-700">{agent.setup}</p>
          </div>
        )}
      </div>

      {/* Integrations */}
      {agent.integrations && (
        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/>
          </svg>
          {agent.integrations.join(', ')}
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-2 mt-1">
        {isLive ? (
          <>
            <Link
              to={`/agents/${agent.id}`}
              className="flex-1 text-center border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium py-2 rounded-lg transition-colors"
            >
              View Details
            </Link>
            <Link
              to={`/agents/${agent.id}/deploy`}
              className="flex-1 text-center bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              Request Deployment
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </Link>
          </>
        ) : (
          <>
            <button disabled className="flex-1 text-center border border-slate-200 text-slate-400 text-sm font-medium py-2 rounded-lg cursor-not-allowed">
              View Details
            </button>
            <button disabled className="flex-1 text-center bg-slate-100 text-slate-400 text-sm font-semibold py-2 rounded-lg cursor-not-allowed">
              Coming Soon
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────── */
export default function AgentLibraryPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [deployTypes, setDeployTypes] = useState<string[]>([])

  const filtered = AGENTS.filter((a) => {
    const matchCat = category === 'All' || a.category === category
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    const matchDeploy =
      deployTypes.length === 0 || deployTypes.some((d) => a.deploymentType.includes(d))
    return matchCat && matchSearch && matchDeploy
  })

  function toggleDeployType(t: string) {
    setDeployTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    )
  }

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* ── Filter sidebar ─────────────────────────────────────────── */}
        <aside className="flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto" style={{ width: 240 }}>
          <div className="p-5 space-y-6">
            {/* Search */}
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Search</p>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agents..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
              />
            </div>

            {/* Category */}
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Category</p>
              <ul className="space-y-0.5">
                {CATEGORIES.map((c) => (
                  <li key={c}>
                    <button
                      onClick={() => setCategory(c)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                        category === c
                          ? 'bg-sky-50 text-sky-600 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Deployment Type */}
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Deployment Type</p>
              <ul className="space-y-1.5">
                {DEPLOYMENT_TYPES.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`dt-${t}`}
                      checked={deployTypes.includes(t)}
                      onChange={() => toggleDeployType(t)}
                      className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-200 cursor-pointer"
                    />
                    <label htmlFor={`dt-${t}`} className="text-sm text-slate-600 cursor-pointer">{t}</label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Status</p>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="status-approved"
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-200 cursor-pointer"
                />
                <label htmlFor="status-approved" className="text-sm text-slate-600 cursor-pointer">State Approved</label>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto p-6">
          {/* Page header */}
          <div className="mb-5">
            <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-widest mb-1">LIBRARY</p>
            <h1 className="text-2xl font-bold text-slate-900">AI Agent Library</h1>
            <p className="text-slate-500 text-sm mt-1">
              Explore state-approved AI agents designed for municipal and county operations. Every agent has been reviewed by the State AI Enablement Office.
            </p>
          </div>

          <p className="text-sm text-slate-500 mb-4">{filtered.length} agent{filtered.length !== 1 ? 's' : ''}</p>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
              </svg>
              <p className="text-sm">No agents match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filtered.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
