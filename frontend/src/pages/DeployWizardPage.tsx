import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Highlight, themes } from 'prism-react-renderer'
import AppLayout from '../components/AppLayout'
import { AGENTS, type Agent } from '../data/agents'
import { submitDeployment, getScript } from '../api/onboarding'
import { useCrawlPoller } from '../hooks/useCrawlPoller'
import type { ScriptData } from '../types/index'

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
type StepErrors = Record<string, string>

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
              <span className="text-sm font-medium" style={{ color: active ? '#0f172a' : done ? '#475569' : '#94a3b8' }}>
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

/* ── Field wrapper ──────────────────────────────────────────────────── */
function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>{error}</p>}
    </div>
  )
}

const inputCls    = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400'
const selectCls   = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 bg-white'
const textareaCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 resize-y min-h-[80px]'
const inputErrCls    = 'w-full border border-red-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400'
const selectErrCls   = 'w-full border border-red-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 bg-white'
const textareaErrCls = 'w-full border border-red-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-y min-h-[80px]'
const ic = (e?: string) => e ? inputErrCls : inputCls
const sc = (e?: string) => e ? selectErrCls : selectCls
const tc = (e?: string) => e ? textareaErrCls : textareaCls

/* ── Steps 1–5 ──────────────────────────────────────────────────────── */
function Step1({ data, setData, errors = {} }: { data: FormData; setData: (d: FormData) => void; errors?: StepErrors }) {
  const s = (f: keyof FormData, v: string) => setData({ ...data, [f]: v } as FormData)
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Entity Information</h2>
      <p className="text-sm text-slate-500 mb-6">Tell us about the entity requesting this deployment.</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Municipality / County Name" required error={errors.municipalityName}>
          <input className={ic(errors.municipalityName)} placeholder="e.g. City of Trenton" value={data.municipalityName} onChange={e => s('municipalityName', e.target.value)} />
        </Field>
        <Field label="Entity Type" required error={errors.entityType}>
          <select className={sc(errors.entityType)} value={data.entityType} onChange={e => s('entityType', e.target.value)}>
            <option value="">Select type…</option>
            <option>Municipality</option><option>County</option><option>State Agency</option>
            <option>School District</option><option>Authority / Commission</option>
          </select>
        </Field>
        <Field label="Department" required error={errors.department}>
          <input className={ic(errors.department)} placeholder="e.g. Clerk's Office" value={data.department} onChange={e => s('department', e.target.value)} />
        </Field>
        <Field label="Primary Contact Name" required error={errors.primaryContactName}>
          <input className={ic(errors.primaryContactName)} placeholder="Full name" value={data.primaryContactName} onChange={e => s('primaryContactName', e.target.value)} />
        </Field>
        <Field label="Primary Contact Email" required error={errors.primaryContactEmail}>
          <input type="email" className={ic(errors.primaryContactEmail)} placeholder="email@municipality.gov" value={data.primaryContactEmail} onChange={e => s('primaryContactEmail', e.target.value)} />
        </Field>
        <Field label="Technical Contact Email" required error={errors.technicalContactEmail}>
          <input type="email" className={ic(errors.technicalContactEmail)} placeholder="it@municipality.gov" value={data.technicalContactEmail} onChange={e => s('technicalContactEmail', e.target.value)} />
        </Field>
        <Field label="Primary Contact Phone">
          <input type="tel" className={inputCls} placeholder="(000) 000-0000" value={data.primaryContactPhone} onChange={e => s('primaryContactPhone', e.target.value)} />
        </Field>
      </div>
    </div>
  )
}

function Step2({ data, setData, errors = {} }: { data: FormData; setData: (d: FormData) => void; errors?: StepErrors }) {
  const s = (f: keyof FormData, v: string) => setData({ ...data, [f]: v } as FormData)
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Website Configuration</h2>
      <p className="text-sm text-slate-500 mb-6">Tell us where IGNA Chat will live and how it should greet residents.</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Main Website URL" required error={errors.websiteUrl}>
          <input type="url" className={ic(errors.websiteUrl)} placeholder="https://www.municipality.gov" value={data.websiteUrl} onChange={e => s('websiteUrl', e.target.value)} />
        </Field>
        <Field label="Website Platform" required error={errors.websitePlatform}>
          <select className={sc(errors.websitePlatform)} value={data.websitePlatform} onChange={e => s('websitePlatform', e.target.value)}>
            <option value="">Select platform…</option>
            <option>CivicPlus</option><option>Granicus</option><option>Accela</option>
            <option>WordPress</option><option>Custom / Other</option>
          </select>
        </Field>
        <Field label="Preferred Chat Placement">
          <select className={selectCls} value={data.chatPlacement} onChange={e => s('chatPlacement', e.target.value)}>
            <option>Bottom Right</option><option>Bottom Left</option><option>Inline</option>
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

function Step3({ data, setData, errors = {} }: { data: FormData; setData: (d: FormData) => void; errors?: StepErrors }) {
  const addRow = () => setData({ ...data, dataSources: [...data.dataSources, { url: '', type: 'Department Page', priority: 'Medium', frequency: 'Weekly' }] })
  const removeRow = (i: number) => setData({ ...data, dataSources: data.dataSources.filter((_, idx) => idx !== i) })
  const updateRow = (i: number, field: keyof DataSourceRow, val: string) =>
    setData({ ...data, dataSources: data.dataSources.map((r, idx) => idx === i ? { ...r, [field]: val } : r) })
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
          <DataSourceRow
            key={i}
            row={row}
            urlError={errors['ds_' + i + '_url']}
            onUrlChange={val => updateRow(i, 'url', val)}
            onTypeChange={val => updateRow(i, 'type', val)}
            onPriorityChange={val => updateRow(i, 'priority', val)}
            onFrequencyChange={val => updateRow(i, 'frequency', val)}
            onRemove={() => removeRow(i)}
          />
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

function DataSourceRow({ row, urlError, onUrlChange, onTypeChange, onPriorityChange, onFrequencyChange, onRemove }: {
  row: { url: string; type: string; priority: string; frequency: string }
  urlError?: string
  onUrlChange: (v: string) => void
  onTypeChange: (v: string) => void
  onPriorityChange: (v: string) => void
  onFrequencyChange: (v: string) => void
  onRemove: () => void
}) {
  const urlCls = urlError
    ? 'flex-1 border border-red-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400'
    : 'flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400'
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2 items-center">
        <input className={urlCls} placeholder="https://www.municipality.gov/page" value={row.url} onChange={e => onUrlChange(e.target.value)} />
        <select className="border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white" value={row.type} onChange={e => onTypeChange(e.target.value)}>
          <option>Department Page</option><option>Forms Page</option><option>Service Requests</option><option>FAQ Page</option><option>News / Notices</option>
        </select>
        <select className="border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white" value={row.priority} onChange={e => onPriorityChange(e.target.value)}>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
        <select className="border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white" value={row.frequency} onChange={e => onFrequencyChange(e.target.value)}>
          <option>Daily</option><option>Weekly</option><option>Monthly</option>
        </select>
        <button onClick={onRemove} className="text-red-400 hover:text-red-600 transition-colors p-1 rounded">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
          </svg>
        </button>
      </div>
      {urlError && <p className="text-xs text-red-500 mt-0.5 pl-1">{urlError}</p>}
    </div>
  )
}

function Step4({ data, setData, errors = {} }: { data: FormData; setData: (d: FormData) => void; errors?: StepErrors }) {
  const s = (f: keyof FormData, v: string) => setData({ ...data, [f]: v } as FormData)
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Escalation Rules</h2>
      <p className="text-sm text-slate-500 mb-6">How should IGNA Chat handle complex or sensitive questions?</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Escalation Email" required error={errors.escalationEmail}>
          <input type="email" className={ic(errors.escalationEmail)} placeholder="escalation@municipality.gov" value={data.escalationEmail} onChange={e => s('escalationEmail', e.target.value)} />
        </Field>
        <Field label="Department Routing">
          <input className={inputCls} placeholder="e.g. Clerk, Public Works" value={data.departmentRouting} onChange={e => s('departmentRouting', e.target.value)} />
        </Field>
        <div className="col-span-2">
          <Field label="Emergency Disclaimer Text" required error={errors.emergencyDisclaimer}>
            <textarea className={tc(errors.emergencyDisclaimer)} placeholder="For emergencies, please call 911…" value={data.emergencyDisclaimer} onChange={e => s('emergencyDisclaimer', e.target.value)} />
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
  const toggle = (i: number) => setData({ ...data, policyChecks: data.policyChecks.map((v, idx) => idx === i ? !v : v) })
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
            <input type="checkbox" checked={data.policyChecks[i] ?? false} onChange={() => toggle(i)} className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-200 cursor-pointer" />
            <span className="text-sm text-slate-700">{item}</span>
          </label>
        ))}
      </div>
      {!data.policyChecks.every(Boolean) && (
        <p className="text-xs text-slate-400">All items must be acknowledged before you can submit.</p>
      )}
    </div>
  )
}

/* ── Crawl helpers (identical to OnboardingPage) ─────────────────────── */
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

/* ── CrawlProgress — exact copy from OnboardingPage ─────────────────── */
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
    <div className="space-y-6 py-4">
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

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-slate-500">Progress</span>
          <span className="text-xs font-bold text-sky-500">{pct}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-700 ease-out relative" style={{ width: `${pct}%` }}>
            <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse"/>
          </div>
        </div>
      </div>

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

/* ── Step 6: real crawl + script deployment ─────────────────────────── */
function Step6({ data }: { data: FormData }) {
  const [jobId, setJobId]           = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [scriptData, setScriptData] = useState<ScriptData | null>(null)
  const [scriptLoading, setScriptLoading] = useState(false)
  const [copied, setCopied]           = useState(false)
  const navigate                          = useNavigate()

  const crawlStatus = useCrawlPoller(jobId)
  const dataRef     = useRef(data)

  function startSubmit() {
    setSubmitError('')
    const d = dataRef.current
    submitDeployment({
      full_name:               d.primaryContactName   || 'User',
      work_email:              d.primaryContactEmail  || 'user@example.com',
      municipality_name:       d.municipalityName,
      entity_type:             d.entityType,
      department:              d.department,
      technical_contact_email: d.technicalContactEmail,
      phone:                   d.primaryContactPhone,
      website_url:             d.websiteUrl           || 'https://example.com',
      website_platform:        d.websitePlatform,
      chat_placement:          d.chatPlacement,
      chat_display_name:       d.chatDisplayName,
      welcome_message:         d.welcomeMessage,
      business_hours:          d.businessHours,
      after_hours_message:     d.afterHoursMessage,
      data_sources:            d.dataSources.filter(s => s.url.trim()),
      escalation_email:        d.escalationEmail,
      department_routing:      d.departmentRouting,
      emergency_disclaimer:    d.emergencyDisclaimer,
      human_handoff:           d.humanHandoff,
      unsupported_response:    d.unsupportedResponse,
    })
      .then(res => { setJobId(res.job_id); setCustomerId(res.customer_id) })
      .catch(err => {
        const detail = err?.response?.data?.detail || 'Submission failed. Please try again.'
        setSubmitError(detail)
      })
  }

  /* Auto-submit on mount */
  useEffect(() => { startSubmit() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* Fetch script once crawl finishes */
  useEffect(() => {
    if (crawlStatus?.status === 'completed' && customerId && !scriptData && !scriptLoading) {
      setScriptLoading(true)
      getScript(customerId)
        .then(setScriptData)
        .catch(() => setSubmitError('Script could not be loaded. Please try again.'))
        .finally(() => setScriptLoading(false))
    }
  }, [crawlStatus?.status, customerId, scriptData, scriptLoading])

  /* Widget preview injection */
  useEffect(() => {
    if (!scriptData) return
    const existing = document.getElementById('igna-preview-script')
    if (existing) existing.remove()
    if ((window as any).IGNAChat) delete (window as any).IGNAChat
    const s = document.createElement('script')
    s.id = 'igna-preview-script'
    s.src = `${scriptData.backend_url}/widget/igna-chat-widget.js`
    s.onload = () => {
      if ((window as any).IGNAChat) {
        (window as any).IGNAChat.init({
          apiKey: scriptData.api_key,
          siteIdentifier: scriptData.site_identifier,
          kbIdentifier: scriptData.kb_identifier,
          pagesIndexed: scriptData.pages_indexed,
          backendUrl: scriptData.backend_url,
          theme: { primaryColor: '#1a1a2e', accentColor: '#0ea5e9' },
        })
      }
    }
    document.body.appendChild(s)
    return () => { document.getElementById('igna-preview-script')?.remove() }
  }, [scriptData])

  function downloadScript() {
    if (!scriptData) return
    const blob = new Blob([scriptData.script_content], { type: 'application/javascript' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = scriptData.filename; a.click()
    URL.revokeObjectURL(url)
  }

  function copyScript() {
    if (!scriptData) return
    navigator.clipboard.writeText(scriptData.script_content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  /* ── Error ── */
  if (submitError) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">Something went wrong</h3>
        <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">{submitError}</p>
        <button onClick={startSubmit} className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
          Try Again
        </button>
      </div>
    )
  }

  /* ── Crawl failed ── */
  if (crawlStatus?.status === 'failed') {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">Crawl Failed</h3>
        <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">
          {crawlStatus.error_message || 'An error occurred while crawling your site.'}
        </p>
        <button
          onClick={() => { setJobId(null); setCustomerId(null); startSubmit() }}
          className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  /* ── Crawling in progress ── */
  if (!crawlStatus || crawlStatus.status === 'queued' || crawlStatus.status === 'running') {
    return <CrawlProgress pages={crawlStatus?.pages_crawled ?? 0} status={crawlStatus?.status ?? 'queued'} />
  }

  /* ── Loading script after crawl ── */
  if (scriptLoading || !scriptData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <svg className="w-10 h-10 text-sky-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-slate-500 text-sm">Preparing your deployment script…</p>
      </div>
    )
  }

  /* ── Script ready ── */
  return (
    <div className="space-y-5">
      {/* Success banner */}
      <div className="flex items-start gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="w-11 h-11 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-green-600 uppercase tracking-widest mb-0.5">DEPLOYMENT READY</p>
          <h3 className="text-lg font-bold text-slate-900">Your knowledge base is ready!</h3>
          <p className="text-slate-500 text-sm mt-0.5">IGNA Chat has been trained on your website content and is ready to deploy.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={copyScript} className="flex items-center gap-2 border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            {copied ? 'Copied!' : 'Copy Script'}
          </button>
          <button onClick={downloadScript} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Download Script
          </button>
        </div>
      </div>

      {/* Crawl summary */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Crawl Summary</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100">
          {([
            { label: 'Website Crawled', value: scriptData.website_url,                       mono: false, accent: false, truncate: true },
            { label: 'Pages Indexed',   value: String(scriptData.pages_indexed),              mono: false, accent: true,  truncate: false },
            { label: 'Site Identifier', value: scriptData.site_identifier,                   mono: true,  accent: false, truncate: false },
            { label: 'API Key',         value: scriptData.api_key.slice(0, 18) + '…',        mono: true,  accent: false, truncate: false },
          ] as const).map(({ label, value, mono, accent, truncate }) => (
            <div key={label} className="px-5 py-4">
              <p className="text-[11px] text-slate-400 mb-1 uppercase tracking-wider font-medium">{label}</p>
              <p className={`text-sm font-medium break-all ${accent ? 'text-2xl font-bold text-sky-500' : mono ? 'font-mono text-slate-700' : 'text-slate-900'} ${truncate ? 'truncate' : ''}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Demo card */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-widest mb-0.5">OPTIONAL</p>
            <h3 className="text-base font-bold text-slate-900">Try a Live Demo</h3>
            <p className="text-slate-500 text-sm mt-0.5">
              Watch your AI chat agent in action — Playwright opens your website and auto-asks 3 questions from your knowledge base.
            </p>
          </div>
          <button
            onClick={() => customerId && navigate(`/demo/${customerId}`)}
            className="flex-shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"/>
            </svg>
            Launch Live Demo
          </button>
        </div>
      </div>

      {/* Script code block */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-400 rounded-full"/>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"/>
              <div className="w-3 h-3 bg-green-400 rounded-full"/>
            </div>
            <span className="text-sm text-slate-500 font-mono ml-2">{scriptData.filename}</span>
          </div>
          <button onClick={copyScript} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-sky-600 transition-colors font-medium">
            {copied ? (
              <><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Copied!</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>Copy code</>
            )}
          </button>
        </div>
        <div className="overflow-x-auto max-h-72 text-sm">
          <Highlight theme={themes.nightOwl} code={scriptData.script_content} language="javascript">
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre className={`${className} p-5 m-0 min-w-max`} style={style}>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    <span className="select-none text-slate-600 mr-4 text-xs" style={{ userSelect: 'none' }}>
                      {String(i + 1).padStart(2, ' ')}
                    </span>
                    {line.map((token, key) => <span key={key} {...getTokenProps({ token })} />)}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      </div>

      {/* Integration steps */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">How to Integrate</h3>
          <p className="text-slate-500 text-sm mt-0.5">Follow these steps to add IGNA Chat to your website.</p>
        </div>
        <div className="p-5 space-y-4">
          {[
            { step: 1, title: 'Download the script',   desc: 'Click "Download Script" above to save the file to your computer.' },
            { step: 2, title: 'Upload to your server', desc: 'Upload igna-chat.js to your web server, hosting platform, or CDN where your website files are served.' },
            { step: 3, title: 'Add to your HTML',      desc: "Paste the following line into your website's HTML just before the </body> closing tag on every page.", code: `<script src="/igna-chat.js"></script>` },
          ].map(({ step, title, desc, code }) => (
            <div key={step} className="flex gap-4">
              <div className="flex-shrink-0 w-7 h-7 bg-sky-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{step}</div>
              <div className="pt-0.5">
                <p className="font-medium text-slate-900 text-sm">{title}</p>
                <p className="text-slate-500 text-sm mt-0.5">{desc}</p>
                {code && <code className="mt-2 block bg-slate-900 text-green-400 text-xs rounded-lg px-4 py-2.5 font-mono">{code}</code>}
              </div>
            </div>
          ))}
        </div>
        <div className="mx-5 mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-800">
            <strong>Note:</strong> Once the script loads, a chat button will appear in the bottom-right corner of your website, ready to answer visitor questions using your indexed content.
          </p>
        </div>
      </div>

      {/* Navigation — only shown when script is ready */}
      <div className="flex justify-end gap-3 pt-2">
        <Link to="/dashboard" className="border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          View My Requests
        </Link>
        <Link to="/onboarding" className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          Open Deployment Center
        </Link>
      </div>

    </div>
  )
}

/* ── Validation ─────────────────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_RE   = /^https?:\/\/.+/i

function validateStep(step: number, data: FormData): StepErrors {
  const e: StepErrors = {}
  if (step === 1) {
    if (!data.municipalityName.trim())     e.municipalityName     = 'Municipality name is required'
    if (!data.entityType)                  e.entityType           = 'Please select an entity type'
    if (!data.department.trim())           e.department           = 'Department is required'
    if (!data.primaryContactName.trim())   e.primaryContactName   = 'Contact name is required'
    if (!data.primaryContactEmail.trim())  e.primaryContactEmail  = 'Contact email is required'
    else if (!EMAIL_RE.test(data.primaryContactEmail))  e.primaryContactEmail  = 'Enter a valid email address'
    if (!data.technicalContactEmail.trim()) e.technicalContactEmail = 'Technical email is required'
    else if (!EMAIL_RE.test(data.technicalContactEmail)) e.technicalContactEmail = 'Enter a valid email address'
  }
  if (step === 2) {
    if (!data.websiteUrl.trim())           e.websiteUrl      = 'Website URL is required'
    else if (!URL_RE.test(data.websiteUrl)) e.websiteUrl     = 'Must be a valid http or https URL'
    if (!data.websitePlatform)             e.websitePlatform = 'Please select a website platform'
  }
  if (step === 3) {
    data.dataSources.forEach((row, i) => {
      if (row.url.trim() && !URL_RE.test(row.url.trim())) {
        e['ds_' + i + '_url'] = 'Must be a valid http or https URL'
      }
    })
  }
  if (step === 4) {
    if (!data.escalationEmail.trim())       e.escalationEmail    = 'Escalation email is required'
    else if (!EMAIL_RE.test(data.escalationEmail)) e.escalationEmail = 'Enter a valid email address'
    if (!data.emergencyDisclaimer.trim())   e.emergencyDisclaimer = 'Emergency disclaimer is required'
  }
  return e
}

/* ── Main wizard ─────────────────────────────────────────────────────── */
export default function DeployWizardPage() {
  const { id } = useParams<{ id: string }>()
  const agent  = AGENTS.find((a) => a.id === id)

  const [step, setStep]         = useState(1)
  const [errors, setErrors]     = useState<StepErrors>({})
  const [formData, setFormData] = useState<FormData>({
    municipalityName: '', entityType: '', department: '',
    primaryContactName: '', primaryContactEmail: '', technicalContactEmail: '', primaryContactPhone: '',
    websiteUrl: '', websitePlatform: '', chatPlacement: 'Bottom Right',
    chatDisplayName: '', welcomeMessage: '', businessHours: '', afterHoursMessage: '',
    dataSources: [{ url: '', type: 'Department Page', priority: 'High', frequency: 'Weekly' }],
    escalationEmail: '', departmentRouting: '', emergencyDisclaimer: '', humanHandoff: '', unsupportedResponse: '',
    policyChecks: [false, false, false, false, false],
  })

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
        <Link to={`/agents/${agent.id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-5">
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
          <div className="px-6"><StepBar current={step} /></div>

          {/* Step content */}
          <div className="px-6 py-6">
            {step === 1 && <Step1 data={formData} setData={setFormData} errors={errors} />}
            {step === 2 && <Step2 data={formData} setData={setFormData} errors={errors} />}
            {step === 3 && <Step3 data={formData} setData={setFormData} errors={errors} />}
            {step === 4 && <Step4 data={formData} setData={setFormData} errors={errors} />}
            {step === 5 && <Step5 data={formData} setData={setFormData} />}
            {step === 6 && <Step6 data={formData} />}
          </div>

          {/* Footer — hidden on step 6 (Step6 renders its own navigation after script is ready) */}
          {step < 6 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <button
                onClick={() => { setErrors({}); setStep(s => Math.max(1, s - 1)) }}
                disabled={step === 1}
                className="flex items-center gap-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
              <button
                onClick={() => {
                  const errs = validateStep(step, formData)
                  if (Object.keys(errs).length > 0) { setErrors(errs); return }
                  setErrors({})
                  setStep(s => Math.min(6, s + 1))
                }}
                disabled={step === 5 && !formData.policyChecks.every(Boolean)}
                className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
              >
                {step === 5 ? (
                  <>Submit Request <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg></>
                ) : (
                  <>Continue <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Page footer */}
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
