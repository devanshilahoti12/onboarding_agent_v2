import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { startDemo, getDemoStatus, stopDemo, type DemoStatus } from '../api/demo'

export default function DemoPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()


  const [questions, setQuestions]       = useState<string[]>([])
  const [demoId, setDemoId]             = useState<string | null>(null)
  const [status, setStatus]             = useState<DemoStatus>('starting')
  const [threadError, setThreadError]   = useState('')
  const [loading, setLoading]           = useState(true)
  const [startError, setStartError]     = useState('')
  const [currentFrame, setCurrentFrame] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wsRef       = useRef<WebSocket | null>(null)
  const [questions, setQuestions]     = useState<string[]>([])
  const [demoId, setDemoId]           = useState<string | null>(null)
  const [status, setStatus]           = useState<DemoStatus>('starting')
  const [threadError, setThreadError] = useState('')
  const [loading, setLoading]         = useState(true)
  const [startError, setStartError]   = useState('')
  const intervalRef                   = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedForRef                 = useRef<string | null>(null)


  /* Start demo on mount */
  useEffect(() => {
    if (!customerId) return
    if (startedForRef.current === customerId) return
    startedForRef.current = customerId
    startDemo(parseInt(customerId))
      .then(res => { setDemoId(res.demo_id); setQuestions(res.questions) })
      .catch(err => setStartError(err?.response?.data?.detail || 'Failed to start demo. Please try again.'))
      .finally(() => setLoading(false))
  }, [customerId])

  /* Open WebSocket stream once demoId is available */
  useEffect(() => {
    if (!demoId) return
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${proto}//${window.location.hostname}:8000/api/demo/${demoId}/stream`)
    wsRef.current = ws
    ws.onmessage = (e) => setCurrentFrame(e.data)
    ws.onclose = () => {}
    return () => ws.close()
  }, [demoId])

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
    wsRef.current?.close()
    if (demoId) stopDemo(demoId).catch(() => {})
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    navigate(-1)
  }

  const isError = status === 'error'
  const statusLabel =
    status === 'starting' ? 'Initializing demo session…'
    : status === 'opening'  ? 'Opening browser and navigating to your website…'
    : status === 'running'  ? 'Demo in progress — questions are being auto-typed into the chat…'
    : status === 'done'     ? 'All 3 questions answered! Click Stop Demo to finish.'
    : status === 'error'    ? (threadError || 'An error occurred during the demo.')
    : 'Demo closed.'

  const isLive = status === 'running' || status === 'opening'

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px] mx-auto w-full">

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Deployment
        </button>

        {/* Page heading */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"/>
            </svg>
            Live Demo
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            A live browser session will stream here and automatically type 3 questions into your chat agent.
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

        {/* Two-column main layout */}
        {!loading && !startError && (
          <div className="flex gap-5 items-start">

            {/* LEFT SIDEBAR — questions, status, stop */}
            <div className="w-72 flex-shrink-0 flex flex-col gap-4">

              {/* Questions card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <p className="text-[11px] font-semibold text-slate-500 mb-4 uppercase tracking-wider">
                  Questions being asked
                </p>
                <ol className="space-y-4">
                  {questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-slate-700 text-sm leading-relaxed">{q}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Status card */}
              <div className={`border rounded-xl px-4 py-3 shadow-sm ${isError ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-slate-500">Status</p>
                <p className={`text-sm leading-relaxed ${isError ? 'text-red-700' : 'text-slate-700'}`}>{statusLabel}</p>
              </div>

              {/* Stop button */}
              <button
                onClick={handleStop}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"/>
                </svg>
                Stop Demo
              </button>

            </div>

            {/* RIGHT — live browser stream */}
            <div className="flex-1 min-w-0">
              <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-lg">

                {/* Browser chrome bar */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border-b border-slate-700">
                  <span className="w-3 h-3 rounded-full bg-red-500"/>
                  <span className="w-3 h-3 rounded-full bg-yellow-400"/>
                  <span className="w-3 h-3 rounded-full bg-green-500"/>
                  <div className="flex-1 mx-3 bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 truncate select-none">
                    {isLive || status === 'done' ? 'Live demo' : 'Initializing…'}
                  </div>
                  {isLive && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                      <span className="text-xs text-green-400 font-medium">Live</span>
                    </div>
                  )}
                  {status === 'done' && (
                    <span className="text-xs text-indigo-400 font-medium flex-shrink-0">Complete</span>
                  )}
                </div>

                {/* Frame or waiting state */}
                {currentFrame ? (
                  <img
                    src={`data:image/jpeg;base64,${currentFrame}`}
                    alt="Live demo"
                    className="w-full block"
                  />
                ) : (
                  <div
                    className="flex flex-col items-center justify-center gap-3 text-center bg-slate-900"
                    style={{ aspectRatio: '16/9' }}
                  >
                    <svg className="w-8 h-8 text-slate-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <p className="text-slate-500 text-sm">Waiting for browser to start…</p>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

      </div>
    </AppLayout>
  )
}
