import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { submitOnboarding } from '../api/onboarding'
import { useCrawlPoller } from '../hooks/useCrawlPoller'

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

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [full_name, setFullName] = useState('')
  const [work_email, setWorkEmail] = useState('')
  const [website_url, setWebsiteUrl] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  // After submission
  const [jobId, setJobId] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<number | null>(null)

  const crawlStatus = useCrawlPoller(jobId)

  // Navigate only after render, not during it
  useEffect(() => {
    if (crawlStatus?.status === 'completed' && customerId) {
      navigate(`/download/${customerId}`, { replace: true })
    }
  }, [crawlStatus?.status, customerId, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validateForm(full_name, work_email, website_url)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </Link>

        {/* IGNA Welcome Bubble */}
        <div className="flex items-start gap-3 mb-8">
          <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
            </svg>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm max-w-sm">
            <p className="text-xs font-semibold text-indigo-600 mb-1">IGNA Onboarding Agent</p>
            <p className="text-gray-700 text-sm leading-relaxed">
              Hi! I'm IGNA. Let's get your AI chat widget set up in minutes.
              Fill in the details below and I'll start building your knowledge base from your website.
            </p>
          </div>
        </div>

        {/* Form card */}
        {!jobId ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Setup Details</h2>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={full_name}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.full_name ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={work_email}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="e.g. rahul@company.com"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.work_email ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.work_email && <p className="mt-1 text-xs text-red-600">{errors.work_email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={website_url}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="e.g. https://yourcompany.com"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.website_url ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.website_url && <p className="mt-1 text-xs text-red-600">{errors.website_url}</p>}
              </div>

              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {errors.general}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
              >
                {submitting ? 'Starting crawl…' : 'Build My Knowledge Base'}
              </button>
            </form>
          </div>
        ) : (
          /* Crawl Progress */
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            {crawlStatus?.status === 'failed' ? (
              <>
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Crawl Failed</h3>
                <p className="text-sm text-gray-500 mb-4">{crawlStatus.error_message || 'An error occurred while crawling your site.'}</p>
                <button
                  onClick={() => { setJobId(null); setCustomerId(null) }}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Try again
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Crawling your website…</h3>
                <p className="text-sm text-gray-500 mb-4">This may take a few minutes for larger sites.</p>
                <div className="inline-flex items-center gap-2 bg-indigo-50 rounded-full px-4 py-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"/>
                  <span className="text-sm font-medium text-indigo-700">
                    Pages discovered: {crawlStatus?.pages_crawled ?? 0}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
