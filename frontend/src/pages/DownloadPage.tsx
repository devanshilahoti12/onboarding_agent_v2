import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Highlight, themes } from 'prism-react-renderer'
import { getScript } from '../api/onboarding'
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

  function downloadScript() {
    if (!script) return
    const blob = new Blob([script.script_content], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = script.filename
    a.click()
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-gray-600 text-sm">Loading your script…</p>
        </div>
      </div>
    )
  }

  if (error || !script) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Something went wrong.'}</p>
          <button onClick={() => navigate('/dashboard')} className="text-indigo-600 hover:underline text-sm">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </Link>

        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-green-800 text-lg">Your knowledge base is ready!</h2>
            <p className="text-green-700 text-sm mt-0.5">Your AI chat widget has been trained on your website.</p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Crawl Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Website Crawled</p>
              <p className="text-sm font-medium text-gray-900 break-all">{script.website_url}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Pages Indexed</p>
              <p className="text-2xl font-bold text-indigo-600">{script.pages_indexed}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Site Identifier</p>
              <p className="text-sm font-mono text-gray-700">{script.site_identifier}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">API Key</p>
              <p className="text-sm font-mono text-gray-700 truncate">{script.api_key.slice(0, 20)}…</p>
            </div>
          </div>
        </div>

        {/* Script Preview */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"/>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"/>
              <div className="w-3 h-3 bg-green-400 rounded-full"/>
              <span className="ml-2 text-sm text-gray-500 font-mono">{script.filename}</span>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-600 transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
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
                      <span className="select-none text-gray-500 mr-4 text-xs" style={{ userSelect: 'none' }}>
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

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={copyToClipboard}
            className="flex-1 flex items-center justify-center gap-2 border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-medium py-3 rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={downloadScript}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Download igna-chat.js
          </button>
        </div>

        {/* Integration Instructions */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-5">How to integrate</h3>
          <div className="space-y-4">
            {[
              {
                step: 1,
                title: 'Download the script',
                desc: 'Click "Download igna-chat.js" above to save the file to your computer.',
              },
              {
                step: 2,
                title: 'Upload to your server',
                desc: 'Upload igna-chat.js to your web server, hosting platform, or CDN where your website files are served.',
              },
              {
                step: 3,
                title: 'Add to your HTML',
                desc: 'Paste the following line into your website\'s HTML just before the </body> closing tag on every page.',
                code: `<script src="/igna-chat.js"></script>`,
              },
            ].map(({ step, title, desc, code }) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{desc}</p>
                  {code && (
                    <code className="mt-2 block bg-gray-900 text-green-400 text-xs rounded-lg px-4 py-2 font-mono">
                      {code}
                    </code>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> Once the script loads, a chat button will appear in the bottom-right corner of your website, ready to answer visitor questions using your indexed content.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
