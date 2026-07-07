import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Highlight, themes } from 'prism-react-renderer'
import { getScript } from '../api/onboarding'
import AppLayout from '../components/AppLayout'
import type { ScriptData } from '../types'

export default function DownloadPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const [script, setScript] = useState<ScriptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!customerId) return
    getScript(Number(customerId))
      .then(setScript)
      .catch(() => setError('Could not load script. Please try again.'))
      .finally(() => setLoading(false))
  }, [customerId])

  useEffect(() => {
    if (!script) return
    const existing = document.getElementById('igna-preview-script')
    if (existing) existing.remove()
    if ((window as any).IGNAChat) delete (window as any).IGNAChat

    const s = document.createElement('script')
    s.id = 'igna-preview-script'
    s.src = `${script.backend_url}/widget/igna-chat-widget.js`
    s.onload = () => {
      if ((window as any).IGNAChat) {
        (window as any).IGNAChat.init({
          apiKey: script.api_key,
          siteIdentifier: script.site_identifier,
          kbIdentifier: script.kb_identifier,
          pagesIndexed: script.pages_indexed,
          backendUrl: script.backend_url,
          theme: { primaryColor: '#1a1a2e', accentColor: '#0ea5e9' },
        })
      }
    }
    document.body.appendChild(s)
    return () => { document.getElementById('igna-preview-script')?.remove() }
  }, [script])

  function downloadScript() {
    if (!script) return
    const blob = new Blob([script.script_content], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = script.filename; a.click()
    URL.revokeObjectURL(url)
  }

  function copyToClipboard() {
    if (!script) return
    navigator.clipboard.writeText(script.script_content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full min-h-96">
          <div className="text-center">
            <svg className="w-10 h-10 text-sky-500 animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-slate-500 text-sm">Loading your script…</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !script) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full min-h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4 text-sm">{error || 'Something went wrong.'}</p>
            <button onClick={() => navigate('/dashboard')} className="text-sky-500 hover:underline text-sm font-medium">
              Back to Dashboard
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-5">
        {/* Breadcrumb */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </Link>

        {/* ── Success banner ─────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[11px] font-semibold text-green-600 uppercase tracking-widest">DEPLOYMENT READY</p>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Your knowledge base is ready!</h2>
              <p className="text-slate-500 text-sm mt-1">IGNA Chat has been trained on your website content and is ready to deploy.</p>
            </div>
            <div className="flex-shrink-0 flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                {copied ? 'Copied!' : 'Copy Script'}
              </button>
              <button
                onClick={downloadScript}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Download Script
              </button>
            </div>
          </div>
        </div>

        {/* ── Crawl Summary + info cards ─────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Crawl Summary</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100">
            <SummaryCell label="Website Crawled" value={script.website_url} mono={false} truncate />
            <SummaryCell label="Pages Indexed" value={String(script.pages_indexed)} accent />
            <SummaryCell label="Site Identifier" value={script.site_identifier} mono />
            <SummaryCell label="API Key" value={script.api_key.slice(0, 18) + '…'} mono />
          </div>
        </div>

        {/* ── Script preview ─────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-red-400 rounded-full"/>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"/>
                <div className="w-3 h-3 bg-green-400 rounded-full"/>
              </div>
              <span className="text-sm text-slate-500 font-mono ml-2">{script.filename}</span>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-sky-600 transition-colors font-medium"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  Copy code
                </>
              )}
            </button>
          </div>
          <div className="overflow-x-auto max-h-72 text-sm">
            <Highlight theme={themes.nightOwl} code={script.script_content} language="javascript">
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre className={`${className} p-5 m-0 min-w-max`} style={style}>
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line })}>
                      <span className="select-none text-slate-600 mr-4 text-xs" style={{ userSelect: 'none' }}>
                        {String(i + 1).padStart(2, ' ')}
                      </span>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          </div>
        </div>

        {/* ── How to integrate ───────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">How to Integrate</h3>
            <p className="text-slate-500 text-sm mt-0.5">Follow these steps to add IGNA Chat to your website.</p>
          </div>
          <div className="p-6 space-y-5">
            {[
              {
                step: 1,
                title: 'Download the script',
                desc: 'Click "Download Script" above to save the file to your computer.',
              },
              {
                step: 2,
                title: 'Upload to your server',
                desc: 'Upload igna-chat.js to your web server, hosting platform, or CDN where your website files are served.',
              },
              {
                step: 3,
                title: 'Add to your HTML',
                desc: "Paste the following line into your website's HTML just before the </body> closing tag on every page.",
                code: `<script src="/igna-chat.js"></script>`,
              },
            ].map(({ step, title, desc, code }) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step}
                </div>
                <div className="pt-0.5">
                  <p className="font-medium text-slate-900 text-sm">{title}</p>
                  <p className="text-slate-500 text-sm mt-1">{desc}</p>
                  {code && (
                    <code className="mt-2.5 block bg-slate-900 text-green-400 text-xs rounded-lg px-4 py-2.5 font-mono">
                      {code}
                    </code>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-6 mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> Once the script loads, a chat button will appear in the bottom-right corner of your website,
              ready to answer visitor questions using your indexed content.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-2 text-center">
          <p className="text-xs text-slate-400">© 2026 Ignatiuz. All rights reserved.</p>
        </div>
      </div>
    </AppLayout>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function SummaryCell({ label, value, mono = false, accent = false, truncate = false }: {
  label: string; value: string; mono?: boolean; accent?: boolean; truncate?: boolean
}) {
  return (
    <div className="px-5 py-4">
      <p className="text-[11px] text-slate-400 mb-1 uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-sm font-medium break-all ${
        accent ? 'text-2xl font-bold text-sky-500' :
        mono ? 'font-mono text-slate-700' : 'text-slate-900'
      } ${truncate ? 'truncate' : ''}`}>
        {value}
      </p>
    </div>
  )
}
