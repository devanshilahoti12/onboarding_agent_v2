import { Link, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { AGENTS, type Agent } from '../data/agents'

/* ── Agent icon ─────────────────────────────────────────────────────── */
function AgentIcon({ type, size = 20 }: { type: Agent['icon']; size?: number }) {
  const style = { width: size, height: size }
  if (type === 'chat') return (
    <svg style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
    </svg>
  )
  if (type === 'phone') return (
    <svg style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
    </svg>
  )
  if (type === 'chart') return (
    <svg style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
    </svg>
  )
  if (type === 'headset') return (
    <svg style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/>
    </svg>
  )
  if (type === 'shield') return (
    <svg style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
    </svg>
  )
  return (
    <svg style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
    </svg>
  )
}

function CheckCircle() {
  return (
    <svg className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  )
}

function DbIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/>
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
    </svg>
  )
}

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const agent = AGENTS.find((a) => a.id === id)

  if (!agent) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full min-h-96">
          <div className="text-center">
            <p className="text-slate-500 text-sm mb-4">Agent not found.</p>
            <Link to="/agents" className="text-sky-500 hover:underline text-sm font-medium">
              Back to AI Agent Library
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/agents')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Marketplace
        </button>

        <div className="flex gap-6 items-start">
          {/* ── Left / main column ────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Agent info card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-center flex-shrink-0 text-sky-500">
                  <AgentIcon type={agent.icon} size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-slate-900">{agent.name}</h1>
                    <span className="text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
                      State Approved
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{agent.category} · {agent.deploymentType}</p>
                  <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                    {agent.name} embeds an approved AI assistant on the municipal website to answer resident questions in plain language, guide residents through forms and service requests, and route complex inquiries to the right department. All responses are grounded in approved public content provided by the municipality.
                  </p>
                </div>
              </div>

              {/* Info boxes */}
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="bg-slate-50 rounded-lg px-4 py-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1 mb-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Estimated setup
                  </p>
                  <p className="text-sm font-semibold text-slate-800">{agent.setup}</p>
                </div>
                <div className="bg-slate-50 rounded-lg px-4 py-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1 mb-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
                    </svg>
                    Supported departments
                  </p>
                  <p className="text-sm font-semibold text-slate-800">{agent.deptCount ?? agent.supportedDepts?.length ?? '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg px-4 py-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1 mb-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/>
                    </svg>
                    Data sources
                  </p>
                  <p className="text-sm font-semibold text-slate-800">{agent.sourceCount ?? agent.dataSources?.length ?? '—'}</p>
                </div>
              </div>
            </div>

            {/* Key Use Cases */}
            {agent.useCases && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-slate-900 mb-4">Key Use Cases</h2>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                  {agent.useCases.map((uc) => (
                    <div key={uc} className="flex items-start gap-2">
                      <CheckCircle />
                      <span className="text-sm text-slate-700">{uc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supported Departments + Required Data Sources */}
            {(agent.supportedDepts || agent.dataSources) && (
              <div className="grid grid-cols-2 gap-4">
                {agent.supportedDepts && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h2 className="font-semibold text-slate-900 mb-3">Supported Departments</h2>
                    <ul className="space-y-2">
                      {agent.supportedDepts.map((d) => (
                        <li key={d} className="flex items-center gap-2 text-sm text-slate-700">
                          <BuildingIcon />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {agent.dataSources && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h2 className="font-semibold text-slate-900 mb-3">Required Data Sources</h2>
                    <ul className="space-y-2">
                      {agent.dataSources.map((d) => (
                        <li key={d} className="flex items-center gap-2 text-sm text-slate-700">
                          <DbIcon />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Compliance Considerations */}
            {agent.compliance && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-slate-900 mb-3">Compliance Considerations</h2>
                <ul className="space-y-2">
                  {agent.compliance.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Implementation Steps */}
            {agent.implSteps && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-slate-900 mb-4">Implementation Steps</h2>
                <ol className="space-y-3">
                  {agent.implSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full text-[11px] font-semibold flex items-center justify-center text-sky-600 mt-0.5"
                        style={{ background: '#e0f2fe', border: '1px solid #bae6fd' }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Sample Output Preview */}
            {agent.sampleQ && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-slate-900 mb-4">Sample Output Preview</h2>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-1">Resident question</p>
                    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700">
                      {agent.sampleQ}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-1">IGNA Chat response</p>
                    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 leading-relaxed">
                      {agent.sampleA}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right sidebar ─────────────────────────────────────── */}
          <div className="flex-shrink-0 space-y-4" style={{ width: 280 }}>
            {/* Ready to Deploy */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">READY TO DEPLOY?</p>
              <h3 className="font-bold text-slate-900 mb-1">Request {agent.name}</h3>
              <p className="text-sm text-slate-500 mb-4">Complete a guided wizard to submit your deployment request.</p>
              <Link
                to={`/agents/${agent.id}/deploy`}
                className="flex items-center justify-center gap-1.5 w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
              >
                Request This Agent
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                </svg>
              </Link>
              <div className="mt-4 space-y-2">
                {['State-approved framework', 'Secure connector vault', 'Statewide enablement support'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-slate-600">
                    <svg className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Setup Requirements */}
            {agent.setupReqs && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-3">Setup Requirements</h3>
                <ul className="space-y-1.5">
                  {agent.setupReqs.map((r) => (
                    <li key={r} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200 bg-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-400">
          <span>IGNA AI Enablement Portal · Powered by Ignatiuz</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-600 cursor-pointer">Accessibility</span>
            <span className="hover:text-slate-600 cursor-pointer">Support</span>
            <span className="hover:text-slate-600 cursor-pointer">Policy Library</span>
          </div>
        </div>
      </footer>
    </AppLayout>
  )
}
