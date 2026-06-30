import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { startDemo, getDemoStatus, stopDemo, type DemoStatus } from '../api/demo'

export default function DemoPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()

  const [questions, setQuestions]     = useState<string[]>([])
  const [demoId, setDemoId]           = useState<string | null>(null)
  const [status, setStatus]           = useState<DemoStatus>('starting')
  const [threadError, setThreadError] = useState('')
  const [loading, setLoading]         = useState(true)
  const [startError, setStartError]   = useState('')
  const intervalRef                   = useRef<ReturnType<typeof setInterval> | null>(null)

  /* Start demo on mount */
  useEffect(() => {
    if (!customerId) return
    startDemo(parseInt(customerId))
      .then(res => { setDemoId(res.demo_id); setQuestions(res.questions) })
      .catch(err => setStartError(err?.response?.data?.detail || 'Failed to start demo. Please try again.'))
      .finally(() => setLoading(false))
  }, [customerId])

  /* Poll status */
  useEffect(() => {
    if (!demoId) return
    if (status === 'done' || status === 'closed' || status === 'error') {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      return
    }
    intervalRef.current = setInterval(() => {
      getDemoStatus(demoId).then(res => {
        setStatus(res.status)
        if (res.error) setThreadError(res.error)
      }).catch(() => {})
    }, 2000)
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null } }
  }, [demoId, status])

  function handleStop() {
    if (demoId) stopDemo(demoId).catch(() => {})
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    navigate(-1)
  }

  const isError = status === 'error'
  const statusLabel =
    status === 'starting' ? 'Initializing demo session…'
    : status === 'opening'  ? 'Opening Firefox and navigating to your website…'
    : status === 'running'  ? 'Demo in progress — questions are being auto-typed into the chat…'
    : status === 'done'     ? 'All 3 questions answered! Click Stop Demo to close the browser.'
    : status === 'error'    ? (threadError || 'An error occurred during the demo.')
    : 'Demo closed.'

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto">

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Deployment
        </button>

        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"/>
            </svg>
            Live Demo
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Firefox will open on your screen and automatically type 3 questions into your chat agent.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm flex flex-col items-center gap-4">
            <svg className="w-10 h-10 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-slate-500 text-sm">Generating questions from your knowledge base…</p>
          </div>
        )}

        {/* Start error */}
        {!loading && startError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-700 text-sm font-medium mb-3">{startError}</p>
            <button onClick={() => navigate(-1)} className="text-sm text-slate-600 hover:text-slate-800 underline">
              Go back
            </button>
          </div>
        )}

        {/* Main content */}
        {!loading && !startError && (
          <div className="space-y-4">

            {/* Questions card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
                Questions being asked by the demo
              </p>
              <ol className="space-y-3">
                {questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <span className="text-slate-700 pt-0.5 text-sm leading-relaxed">{q}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Browser window placeholder */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Firefox browser window</p>
                <p className="text-slate-400 text-sm mt-0.5">
                  Watch the Firefox window that opened on your screen —<br/>
                  your chat agent is being demonstrated there live.
                </p>
              </div>
              {(status === 'running' || status === 'opening') && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                  <span className="text-xs text-green-600 font-medium">Live</span>
                </div>
              )}
            </div>

            {/* Status + Stop */}
            <div className="flex items-center justify-between gap-4">
              <div className={`flex-1 border rounded-xl px-4 py-3 ${isError ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'} shadow-sm`}>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5 text-slate-500">Status</p>
                <p className={`text-sm ${isError ? 'text-red-700' : 'text-slate-700'}`}>{statusLabel}</p>
              </div>
              <button
                onClick={handleStop}
                className="flex-shrink-0 flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"/>
                </svg>
                Stop Demo
              </button>
            </div>

          </div>
        )}
      </div>
    </AppLayout>
  )
}
