import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { submitOnboarding } from '../api/onboarding'
import { useCrawlPoller } from '../hooks/useCrawlPoller'
import AppLayout from '../components/AppLayout'

interface FormErrors {
  full_name?: string
  work_email?: string
  website_url?: string
  general?: string
}

function validateForm(full_name: string, work_email: string, website_url: string): FormErrors {
  const errors: FormErrors = {}
  if (!full_name.trim()) errors.full_name = 'Full name is required'
  if (!work_email.trim()) {
    errors.work_email = 'Work email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(work_email)) {
    errors.work_email = 'Enter a valid email address'
  }
  if (!website_url.trim()) {
    errors.website_url = 'Website URL is required'
  } else if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(website_url)) {
    errors.website_url = 'Enter a valid http or https URL'
  }
  return errors
}

const CRAWL_STAGES: Array<{ minPages: number; messages: string[] }> = [
  { minPages: 0,  messages: ['Connecting to your website…', 'Starting the crawler…', 'Scanning the homepage…'] },
  { minPages: 5,  messages: ['Discovering internal links…', 'Following page references…', 'Mapping your site structure…'] },
  { minPages: 20, messages: ['Reading page content…', 'Extracting text from pages…', 'Analysing your content…'] },
  { minPages: 50, messages: ['Processing articles and guides…', 'Building knowledge chunks…', 'Indexing content…'] },
  { minPages: 80, messages: ['Finalising the knowledge base…', 'Almost done…', 'Wrapping up…'] },
]

function getCrawlMessages(pages: number) {
  let stage = CRAWL_STAGES[0]
  for (const s of CRAWL_STAGES) { if (pages >= s.minPages) stage = s }
  return stage.messages
}

/* ── Step wizard ─────────────────────────────────────────────────────── */
const STEPS = ['Details', 'Processing', 'Complete']

function StepWizard({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              i < current
                ? 'bg-green-500 border-green-500 text-white'
                : i === current
                ? 'bg-sky-500 border-sky-500 text-white'
                : 'bg-white border-slate-300 text-slate-400'
            }`}>
              {i < current ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
              i <= current ? 'text-slate-700' : 'text-slate-400'
            }`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${
              i < current ? 'bg-green-400' : 'bg-slate-200'
            }`}/>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Crawl progress view ─────────────────────────────────────────────── */
function CrawlProgress({ pages, status }: { pages: number; status: string }) {
  const MAX_PAGES = 100
  const pct = status === 'completed' ? 100 : Math.min(Math.round((pages / MAX_PAGES) * 90) + 5, 92)
  const [msgIdx, setMsgIdx] = useState(0)
  const messages = getCrawlMessages(pages)
  const prevPagesRef = useRef(pages)

  useEffect(() => {
    if (status !== 'running' && status !== 'queued') return
    const t = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 3000)
    return () => clearInterval(t)
  }, [messages.length, status])

  useEffect(() => {
    if (pages !== prevPagesRef.current) { prevPagesRef.current = pages; setMsgIdx(0) }
  }, [pages])

  return (
    <div className="space-y-6">
      {/* Spinner + headline */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-16 h-16 bg-sky-50 border border-sky-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-sky-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 text-lg">Building your knowledge base</h3>
          <p className="text-sm text-slate-500 mt-0.5 h-5 transition-all duration-500">
            {messages[msgIdx % messages.length]}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-slate-500">Progress</span>
          <span className="text-xs font-bold text-sky-500">{pct}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${pct}%` }}
          >
            <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse"/>
          </div>
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-sky-600">{pages}</p>
          <p className="text-xs text-sky-400 mt-0.5">Pages crawled</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-slate-700">{pct}%</p>
          <p className="text-xs text-slate-400 mt-0.5">Complete</p>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        This may take a few minutes for larger sites. You can leave this page — the crawl continues in the background.
      </p>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────────── */
export default function OnboardingPage() {
  const navigate = useNavigate()
  const [full_name, setFullName] = useState('')
  const [work_email, setWorkEmail] = useState('')
  const [website_url, setWebsiteUrl] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<number | null>(null)

  const crawlStatus = useCrawlPoller(jobId)

  useEffect(() => {
    if (crawlStatus?.status === 'completed' && customerId) {
      navigate(`/download/${customerId}`, { replace: true })
    }
  }, [crawlStatus?.status, customerId, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validateForm(full_name, work_email, website_url)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSubmitting(true)
    try {
      const res = await submitOnboarding(full_name, work_email, website_url)
      setJobId(res.job_id)
      setCustomerId(res.customer_id)
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Submission failed. Please try again.'
      setErrors({ general: detail })
    } finally {
      setSubmitting(false)
    }
  }

  const currentStep = !jobId ? 0 : 1

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </Link>

        {/* Main card */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Card header */}
          <div className="px-8 pt-7 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-sky-500 uppercase tracking-widest mb-0.5">NEW SITE SETUP</p>
                <h1 className="text-xl font-bold text-slate-900">IGNA Chat</h1>
                <p className="text-sm text-slate-500">Resident Services · Website Script Tag</p>
              </div>
            </div>
            <StepWizard current={currentStep} />
          </div>

          {/* Card body */}
          <div className="px-8 py-7">
            {crawlStatus?.status === 'failed' ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Crawl Failed</h3>
                <p className="text-sm text-slate-500 mb-5">{crawlStatus.error_message || 'An error occurred while crawling your site.'}</p>
                <button
                  onClick={() => { setJobId(null); setCustomerId(null) }}
                  className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : jobId ? (
              <CrawlProgress pages={crawlStatus?.pages_crawled ?? 0} status={crawlStatus?.status ?? 'queued'} />
            ) : (
              <>
                <h2 className="text-base font-semibold text-slate-900 mb-1">Entity Information</h2>
                <p className="text-sm text-slate-500 mb-6">Tell us about the site you'd like to deploy IGNA Chat on.</p>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={full_name}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                          errors.full_name ? 'border-red-400 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                      {errors.full_name && (
                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                          {errors.full_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Work Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={work_email}
                        onChange={(e) => setWorkEmail(e.target.value)}
                        placeholder="e.g. rahul@company.com"
                        className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                          errors.work_email ? 'border-red-400 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                      {errors.work_email && (
                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                          {errors.work_email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Website URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={website_url}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="e.g. https://yourcompany.com"
                      className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                        errors.website_url ? 'border-red-400 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                    {errors.website_url && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                        {errors.website_url}
                      </p>
                    )}
                  </div>

                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                      {errors.general}
                    </div>
                  )}

                  {/* Footer buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-6">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                      </svg>
                      Back
                    </Link>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
                    >
                      {submitting ? 'Starting crawl…' : 'Continue'}
                      {!submitting && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
