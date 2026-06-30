import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { AGENTS, type Agent } from '../data/agents'

/* ── Agent icon ─────────────────────────────────────────────────────── */
function AgentIcon({ type }: { type: Agent['icon'] }) {
  if (type === 'chat') return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
    </svg>
  )
  if (type === 'phone') return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
    </svg>
  )
  if (type === 'chart') return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
    </svg>
  )
  if (type === 'headset') return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/>
    </svg>
  )
  if (type === 'shield') return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
    </svg>
  )
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
    </svg>
  )
}

/* ── Form types ─────────────────────────────────────────────────────── */
type DataSourceRow = { url: string; type: string; priority: string; frequency: string }

type FormData = {
  municipalityName: string
  entityType: string
  department: string
  primaryContactName: string
  primaryContactEmail: string
  technicalContactEmail: string
  primaryContactPhone: string
  websiteUrl: string
  websitePlatform: string
  chatPlacement: string
  chatDisplayName: string
  welcomeMessage: string
  businessHours: string
  afterHoursMessage: string
  dataSources: DataSourceRow[]
  escalationEmail: string
  departmentRouting: string
  emergencyDisclaimer: string
  humanHandoff: string
  unsupportedResponse: string
  policyChecks: boolean[]
}

/* ── Step progress bar ──────────────────────────────────────────────── */
const STEP_LABELS = ['Entity', 'Configuration', 'Data Sources', 'Policy', 'Review', 'Deployment']

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center py-5 px-1 border-b border-slate-100">
      {STEP_LABELS.map((label, i) => {
        const num = i + 1
        const done = num < current
        const active = num === current
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors"
                style={{
                  background: done ? '#22c55e' : active ? '#0ea5e9' : '#fff',
                  borderColor: done ? '#22c55e' : active ? '#0ea5e9' : '#cbd5e1',
                  color: done || active ? '#fff' : '#94a3b8',
                }}
              >
                {done ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                ) : num}
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: active ? '#0f172a' : done ? '#475569' : '#94a3b8' }}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className="flex-1 h-px mx-3" style={{ background: done ? '#86efac' : '#e2e8f0' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Field components ───────────────────────────────────────────────── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400'
const selectCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 bg-white'
const textareaCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 resize-y min-h-[80px]'

/* ── Step contents ──────────────────────────────────────────────────── */
function Step1({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
  const s = (field: keyof FormData, val: string) => setData({ ...data, [field]: val } as FormData)
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Entity Information</h2>
      <p className="text-sm text-slate-500 mb-6">Tell us about the entity requesting this deployment.</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Municipality / County Name" required>
          <input className={inputCls} placeholder="e.g. City of Trenton" value={data.municipalityName} onChange={e => s('municipalityName', e.target.value)} />
        </Field>
        <Field label="Entity Type" required>
          <select className={selectCls} value={data.entityType} onChange={e => s('entityType', e.target.value)}>
            <option value="">Select type…</option>
            <option>Municipality</option>
            <option>County</option>
            <option>State Agency</option>
            <option>School District</option>
            <option>Authority / Commission</option>
          </select>
        </Field>
        <Field label="Department" required>
          <input className={inputCls} placeholder="e.g. Clerk's Office" value={data.department} onChange={e => s('department', e.target.value)} />
        </Field>
        <Field label="Primary Contact Name" required>
          <input className={inputCls} placeholder="Full name" value={data.primaryContactName} onChange={e => s('primaryContactName', e.target.value)} />
        </Field>
        <Field label="Primary Contact Email" required>
          <input type="email" className={inputCls} placeholder="email@municipality.gov" value={data.primaryContactEmail} onChange={e => s('primaryContactEmail', e.target.value)} />
        </Field>
        <Field label="Technical Contact Email" required>
          <input type="email" className={inputCls} placeholder="it@municipality.gov" value={data.technicalContactEmail} onChange={e => s('technicalContactEmail', e.target.value)} />
        </Field>
        <Field label="Primary Contact Phone">
          <input type="tel" className={inputCls} placeholder="(000) 000-0000" value={data.primaryContactPhone} onChange={e => s('primaryContactPhone', e.target.value)} />
        </Field>
      </div>
    </div>
  )
}

function Step2({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
  const s = (field: keyof FormData, val: string) => setData({ ...data, [field]: val } as FormData)
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Website Configuration</h2>
      <p className="text-sm text-slate-500 mb-6">Tell us where IGNA Chat will live and how it should greet residents.</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Main Website URL" required>
          <input type="url" className={inputCls} placeholder="https://www.municipality.gov" value={data.websiteUrl} onChange={e => s('websiteUrl', e.target.value)} />
        </Field>
        <Field label="Website Platform" required>
          <select className={selectCls} value={data.websitePlatform} onChange={e => s('websitePlatform', e.target.value)}>
            <option value="">Select platform…</option>
            <option>CivicPlus</option>
            <option>Granicus</option>
            <option>Accela</option>
            <option>WordPress</option>
            <option>Custom / Other</option>
          </select>
        </Field>
        <Field label="Preferred Chat Placement">
          <select className={selectCls} value={data.chatPlacement} onChange={e => s('chatPlacement', e.target.value)}>
            <option>Bottom Right</option>
            <option>Bottom Left</option>
            <option>Inline</option>
          </select>
        </Field>
        <Field label="Chat Display Name">
          <input className={inputCls} placeholder="e.g. Trenton Assistant" value={data.chatDisplayName} onChange={e => s('chatDisplayName', e.target.value)} />
        </Field>
        <Field label="Welcome Message">
          <input className={inputCls} placeholder="Hi! I can help you with city services." value={data.welcomeMessage} onChange={e => s('welcomeMessage', e.target.value)} />
          <p className="text-[11px] text-slate-400 mt-1">First message residents see</p>
        </Field>
        <Field label="Business Hours">
          <input className={inputCls} placeholder="Monday–Friday, 8:30 AM – 5:00 PM" value={data.businessHours} onChange={e => s('businessHours', e.target.value)} />
        </Field>
        <div className="col-span-2">
          <Field label="After-Hours Message">
            <textarea className={textareaCls} placeholder="Our offices are closed. I can still help with FAQs or take a service request." value={data.afterHoursMessage} onChange={e => s('afterHoursMessage', e.target.value)} />
          </Field>
        </div>
      </div>
    </div>
  )
}

function Step3({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
  function addRow() {
    setData({ ...data, dataSources: [...data.dataSources, { url: '', type: 'Department Page', priority: 'Medium', frequency: 'Weekly' }] })
  }
  function removeRow(i: number) {
    setData({ ...data, dataSources: data.dataSources.filter((_, idx) => idx !== i) })
  }
  function updateRow(i: number, field: keyof DataSourceRow, val: string) {
    const rows = data.dataSources.map((r, idx) => idx === i ? { ...r, [field]: val } : r)
    setData({ ...data, dataSources: rows })
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold text-slate-900">Data Sources</h2>
        <button onClick={addRow} className="flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 font-medium border border-sky-200 hover:border-sky-300 rounded-lg px-3 py-1.5 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
          Add Source
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-5">Provide approved public URLs IGNA Chat should reference.</p>
      <div className="space-y-3">
        {data.dataSources.map((row, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
              placeholder="https://www.municipality.gov/page"
              value={row.url}
              onChange={e => updateRow(i, 'url', e.target.value)}
            />
            <select className="border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white" value={row.type} onChange={e => updateRow(i, 'type', e.target.value)}>
              <option>Department Page</option>
              <option>Forms Page</option>
              <option>Service Requests</option>
              <option>FAQ Page</option>
              <option>News / Notices</option>
            </select>
            <select className="border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white" value={row.priority} onChange={e => updateRow(i, 'priority', e.target.value)}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className="border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white" value={row.frequency} onChange={e => updateRow(i, 'frequency', e.target.value)}>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 transition-colors p-1 rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
              </svg>
            </button>
          </div>
        ))}
        {data.dataSources.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
            No data sources added yet. Click "+ Add Source" to begin.
          </div>
        )}
      </div>
    </div>
  )
}

function Step4({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
  const s = (field: keyof FormData, val: string) => setData({ ...data, [field]: val } as FormData)
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Escalation Rules</h2>
      <p className="text-sm text-slate-500 mb-6">How should IGNA Chat handle complex or sensitive questions?</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Escalation Email" required>
          <input type="email" className={inputCls} placeholder="escalation@municipality.gov" value={data.escalationEmail} onChange={e => s('escalationEmail', e.target.value)} />
        </Field>
        <Field label="Department Routing">
          <input className={inputCls} placeholder="e.g. Clerk, Public Works" value={data.departmentRouting} onChange={e => s('departmentRouting', e.target.value)} />
        </Field>
        <div className="col-span-2">
          <Field label="Emergency Disclaimer Text" required>
            <textarea className={textareaCls} placeholder="For emergencies, please call 911…" value={data.emergencyDisclaimer} onChange={e => s('emergencyDisclaimer', e.target.value)} />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Human Handoff Message">
            <textarea className={textareaCls} placeholder="Let me connect you with a staff member…" value={data.humanHandoff} onChange={e => s('humanHandoff', e.target.value)} />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Unsupported Question Response">
            <textarea className={textareaCls} placeholder="I'm not able to help with that, but you can contact us at…" value={data.unsupportedResponse} onChange={e => s('unsupportedResponse', e.target.value)} />
          </Field>
        </div>
      </div>
    </div>
  )
}

const POLICY_ITEMS = [
  'AI responses must reference approved public content only',
  'Personal resident data should not be entered into the chat',
  'Emergency situations must be routed to official emergency channels',
  'Municipality is responsible for reviewing source URLs',
  'Chat transcript retention follows approved state policy',
]

function Step5({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
  function toggle(i: number) {
    const checks = data.policyChecks.map((v, idx) => idx === i ? !v : v)
    setData({ ...data, policyChecks: checks })
  }
  const allChecked = data.policyChecks.every(Boolean)
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
        <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
        </svg>
        Policy Acknowledgement
      </h2>
      <p className="text-sm text-slate-500 mb-5">Confirm that your entity will follow these state requirements before submitting.</p>
      <div className="space-y-2 mb-4">
        {POLICY_ITEMS.map((item, i) => (
          <label key={i} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={data.policyChecks[i] ?? false}
              onChange={() => toggle(i)}
              className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-200 cursor-pointer"
            />
            <span className="text-sm text-slate-700">{item}</span>
          </label>
        ))}
      </div>
      {!allChecked && (
        <p className="text-xs text-slate-400">All items must be acknowledged before you can submit.</p>
      )}
    </div>
  )
}

function Step6({ data, agentId }: { data: FormData; agentId: string }) {
  const [copied, setCopied] = useState(false)
  const [reqId] = useState(() => Math.floor(1000 + Math.random() * 9000))
  const entitySlug = data.municipalityName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'nj-entity'
  const script = `<script src="https://cdn.igna.techforgov.com/nj/agents/${agentId}.js" data-entity-id="${entitySlug}" data-agent-id="${agentId}-${entitySlug}-prod" async></script>`

  function copy() {
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const steps = [
    'Copy the script tag.',
    'Open the municipality website CMS.',
    'Paste the script before the closing </body> tag.',
    'Save and publish the website.',
    'Click Verify Installation in this portal.',
    'Once verified, IGNA Chat will appear on the public website.',
  ]

  return (
    <div>
      {/* Success banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
          </svg>
        </div>
        <div>
          <p className="font-semibold text-green-800 text-sm">Ready for Website Installation</p>
          <p className="text-green-700 text-xs mt-0.5">
            Request REQ-2026-{reqId} submitted successfully.
          </p>
        </div>
      </div>

      {/* Script block */}
      <div className="mb-5">
        <h3 className="font-semibold text-slate-900 mb-3">Installation Script</h3>
        <div className="bg-slate-900 rounded-xl px-5 py-4 font-mono text-sm text-green-400 overflow-x-auto whitespace-nowrap">
          {script}
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          <button onClick={copy} className="flex items-center gap-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-2 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            {copied ? 'Copied!' : 'Copy Script Tag'}
          </button>
          <button className="flex items-center gap-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-2 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Download Instructions PDF
          </button>
          <button className="flex items-center gap-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-2 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
            Send to Technical Contact
          </button>
          <button className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Verify Installation
          </button>
          <button className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"/>
            </svg>
            Open Test Chat
          </button>
        </div>
      </div>

      {/* Installation Instructions */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-4">Installation Instructions</h3>
        <ol className="space-y-3">
          {steps.map((step, i) => (
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
    </div>
  )
}

/* ── Main wizard page ───────────────────────────────────────────────── */
export default function DeployWizardPage() {
  const { id } = useParams<{ id: string }>()
  const agent = AGENTS.find((a) => a.id === id)

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    municipalityName: '',
    entityType: '',
    department: '',
    primaryContactName: '',
    primaryContactEmail: '',
    technicalContactEmail: '',
    primaryContactPhone: '',
    websiteUrl: '',
    websitePlatform: '',
    chatPlacement: 'Bottom Right',
    chatDisplayName: '',
    welcomeMessage: '',
    businessHours: '',
    afterHoursMessage: '',
    dataSources: [
      { url: '', type: 'Department Page', priority: 'High', frequency: 'Weekly' },
    ],
    escalationEmail: '',
    departmentRouting: '',
    emergencyDisclaimer: '',
    humanHandoff: '',
    unsupportedResponse: '',
    policyChecks: [false, false, false, false, false],
  })

  const allPolicyChecked = formData.policyChecks.every(Boolean)

  if (!agent) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full min-h-96">
          <p className="text-slate-500 text-sm">Agent not found. <Link to="/agents" className="text-sky-500 hover:underline">Back to library</Link></p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Link
          to={`/agents/${agent.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to {agent.name}
        </Link>

        {/* Wizard card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Agent header */}
          <div className="flex items-center gap-4 px-6 pt-6 pb-0">
            <div className="w-11 h-11 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-center flex-shrink-0 text-sky-500">
              <AgentIcon type={agent.icon} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-widest">REQUEST DEPLOYMENT</p>
              <h1 className="text-lg font-bold text-slate-900">{agent.name}</h1>
              <p className="text-xs text-slate-500">{agent.category} · {agent.deploymentType}</p>
            </div>
          </div>

          {/* Step bar */}
          <div className="px-6">
            <StepBar current={step} />
          </div>

          {/* Step content */}
          <div className="px-6 py-6">
            {step === 1 && <Step1 data={formData} setData={setFormData} />}
            {step === 2 && <Step2 data={formData} setData={setFormData} />}
            {step === 3 && <Step3 data={formData} setData={setFormData} />}
            {step === 4 && <Step4 data={formData} setData={setFormData} />}
            {step === 5 && <Step5 data={formData} setData={setFormData} />}
            {step === 6 && <Step6 data={formData} agentId={agent.id} />}
          </div>

          {/* Footer buttons */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            {step < 6 ? (
              <>
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="flex items-center gap-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                  </svg>
                  Back
                </button>
                <button
                  onClick={() => setStep((s) => Math.min(6, s + 1))}
                  disabled={step === 5 && !allPolicyChecked}
                  className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  {step === 5 ? (
                    <>
                      Submit Request
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                    </>
                  ) : (
                    <>
                      Continue
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                      </svg>
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center justify-end gap-3 w-full">
                <Link
                  to="/dashboard"
                  className="border border-slate-300 text-slate-600 hover:bg-slate-100 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  View My Requests
                </Link>
                <Link
                  to="/onboarding"
                  className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Open Deployment Center
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 border-t border-slate-200 bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-slate-400">
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
