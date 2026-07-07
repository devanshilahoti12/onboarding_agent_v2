import { useState } from 'react'
import AppLayout from '../components/AppLayout'

const AGENTS = ['IGNA Chat', 'Permit Assistant', 'Tax Help AI', 'Code Compliance Bot']
const ISSUE_TYPES = ['Installation', 'Configuration', 'Performance', 'Data Issue', 'Access / Permissions', 'Other']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I request a new AI agent for my municipality?',
    a: 'Navigate to the AI Agent Library, select the agent you want, and click "Request Deployment." Your request will be reviewed by the State AI Enablement Office within 3–5 business days.',
  },
  {
    q: 'Who reviews and approves requests?',
    a: 'All deployment requests are reviewed by the State AI Enablement Office in coordination with your county IT liaison. You will receive email updates at each stage of the review.',
  },
  {
    q: 'What if my finance system isn\'t listed as a connector?',
    a: 'Submit a support ticket with Issue Type "Configuration" and describe your finance system. Our team will assess integration feasibility and follow up within 10 business days.',
  },
  {
    q: 'How are AI outputs governed?',
    a: 'All AI agents on the NJ One Marketplace operate under the Responsible AI Use Policy and are subject to the State AI Governance Framework. Human oversight is required for any consequential decisions.',
  },
]

const CHECKLIST = [
  'Confirm entity contact roster',
  'Acknowledge applicable policies',
  'Identify approved data sources',
  'Configure required connectors',
  'Schedule activation window',
  'Notify residents (if resident-facing)',
]

export default function SupportPage() {
  const [form, setForm] = useState({
    entity: '',
    contactName: '',
    email: '',
    agent: '',
    issueType: '',
    priority: 'Low',
    description: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
    setForm({ entity: '', contactName: '', email: '', agent: '', issueType: '', priority: 'Low', description: '' })
  }

  return (
    <AppLayout>
      <div className="flex flex-col min-h-full">
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Support</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Help &amp; Enablement</h1>
        <p className="text-gray-500 mb-8">Submit tickets, browse documentation, or contact the State AI Enablement Office.</p>

        {submitted && (
          <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm font-medium">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Your ticket has been submitted. You'll receive a confirmation email shortly.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — ticket form */}
          <div className="col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </span>
                <h2 className="text-lg font-semibold text-gray-900">Submit a Support Ticket</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entity <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="entity"
                      value={form.entity}
                      onChange={handleChange}
                      required
                      placeholder="City of Trenton"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="contactName"
                      value={form.contactName}
                      onChange={handleChange}
                      required
                      placeholder="Sarah Martinez"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="sarah.martinez@trentonnj.org"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
                    <select
                      name="agent"
                      value={form.agent}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select agent...</option>
                      {AGENTS.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                    <select
                      name="issueType"
                      value={form.issueType}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select type...</option>
                      {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Describe what you're seeing, what you expected, and any error messages."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
              </div>

              <div className="divide-y divide-gray-100">
                {FAQS.map((faq, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <span className="text-gray-400 text-lg leading-none ml-4">{openFaq === i ? '−' : '+'}</span>
                    </button>
                    {openFaq === i && (
                      <p className="pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Contact card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact the State AI Enablement Office</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  ai.enablement@nj.gov
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  (609) 555-0100
                </div>
                <p className="text-xs text-gray-500 pl-6">Mon-Fri, 8:30 AM – 5:00 PM ET</p>
              </div>
            </div>

            {/* Checklist card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Technical Implementation Checklist</h3>
              <ul className="space-y-2.5">
                {CHECKLIST.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* NJ Footer */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center">
            <span className="text-white text-xs font-bold">NJ</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">State of New Jersey — NJ One Marketplace</p>
            <p className="text-xs text-gray-400">AI Governance Division · Office of Innovation · Trenton, NJ 08625</p>
          </div>
        </div>
      </div>
      </div>
    </AppLayout>
  )
}
