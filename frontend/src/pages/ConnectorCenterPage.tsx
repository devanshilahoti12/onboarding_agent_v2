import { useState } from 'react'
import AppLayout from '../components/AppLayout'

/* ── Types ────────────────────────────────────────────────────────────── */
type ConnectorStatus = 'Connected' | 'Pending Validation' | 'Not Connected'

interface Connector {
  id: string
  name: string
  category: string
  status: ConnectorStatus
  usedBy: string
  lastSync: string | null
  avatarBg: string
  avatarColor: string
  abbr: string
}

/* ── Static connector catalog ─────────────────────────────────────────── */
const CONNECTORS: Connector[] = [
  {
    id: 'msi',
    name: 'MSI',
    category: 'Finance',
    status: 'Connected',
    usedBy: 'IGNA Insight Finance',
    lastSync: '2 hours ago',
    avatarBg: '#0f2942',
    avatarColor: '#ffffff',
    abbr: 'MS',
  },
  {
    id: 'edmunds',
    name: 'Edmunds GovTech',
    category: 'Finance',
    status: 'Pending Validation',
    usedBy: 'IGNA Insight Finance',
    lastSync: null,
    avatarBg: '#e8f0fe',
    avatarColor: '#1a56db',
    abbr: 'Ed',
  },
  {
    id: 'sdl',
    name: 'SDL',
    category: 'Finance',
    status: 'Not Connected',
    usedBy: 'IGNA Insight Finance',
    lastSync: null,
    avatarBg: '#f0f9ff',
    avatarColor: '#0284c7',
    abbr: 'SD',
  },
  {
    id: 'govpilot',
    name: 'GovPilot',
    category: 'Permits / Service',
    status: 'Connected',
    usedBy: 'IGNA Insight Finance',
    lastSync: '2 hours ago',
    avatarBg: '#dcfce7',
    avatarColor: '#15803d',
    abbr: 'Gv',
  },
  {
    id: 'modiv',
    name: 'MOD IV',
    category: 'Tax Assessment',
    status: 'Connected',
    usedBy: 'IGNA Insight Finance',
    lastSync: '2 hours ago',
    avatarBg: '#1e293b',
    avatarColor: '#e2e8f0',
    abbr: 'MO',
  },
  {
    id: 'civicplus',
    name: 'CivicPlus',
    category: 'Website CMS',
    status: 'Connected',
    usedBy: 'IGNA Chat',
    lastSync: '2 hours ago',
    avatarBg: '#1e3a8a',
    avatarColor: '#ffffff',
    abbr: 'Ci',
  },
  {
    id: 'granicus',
    name: 'Granicus',
    category: 'Website CMS',
    status: 'Not Connected',
    usedBy: 'IGNA Chat',
    lastSync: null,
    avatarBg: '#f3e8ff',
    avatarColor: '#7c3aed',
    abbr: 'Gr',
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    category: 'Website CMS',
    status: 'Connected',
    usedBy: 'IGNA Chat',
    lastSync: '2 hours ago',
    avatarBg: '#21759b',
    avatarColor: '#ffffff',
    abbr: 'Wo',
  },
  {
    id: 'microsoft365',
    name: 'Microsoft 365',
    category: 'Productivity',
    status: 'Connected',
    usedBy: 'MinutesIQ',
    lastSync: '2 hours ago',
    avatarBg: '#fef2f2',
    avatarColor: '#dc2626',
    abbr: 'Mi',
  },
  {
    id: 'googleworkspace',
    name: 'Google Workspace',
    category: 'Productivity',
    status: 'Connected',
    usedBy: 'MinutesIQ',
    lastSync: '2 hours ago',
    avatarBg: '#fefce8',
    avatarColor: '#ca8a04',
    abbr: 'Go',
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    category: 'Helpdesk',
    status: 'Pending Validation',
    usedBy: 'IGNA Insight Helpdesk',
    lastSync: null,
    avatarBg: '#03363d',
    avatarColor: '#ffffff',
    abbr: 'Ze',
  },
  {
    id: 'servicenow',
    name: 'ServiceNow',
    category: 'Helpdesk',
    status: 'Not Connected',
    usedBy: 'IGNA Insight Helpdesk',
    lastSync: null,
    avatarBg: '#f0fdf4',
    avatarColor: '#16a34a',
    abbr: 'Se',
  },
]

/* ── Status badge ─────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: ConnectorStatus }) {
  const styles: Record<ConnectorStatus, { bg: string; color: string }> = {
    'Connected':          { bg: '#dcfce7', color: '#15803d' },
    'Pending Validation': { bg: '#fef3c7', color: '#92400e' },
    'Not Connected':      { bg: '#f1f5f9', color: '#64748b' },
  }
  const s = styles[status]
  return (
    <span
      className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  )
}

/* ── Configure modal ──────────────────────────────────────────────────── */
function ConfigureModal({ connector, onClose }: { connector: Connector; onClose: () => void }) {
  const [environment, setEnvironment]   = useState('Production')
  const [syncFreq, setSyncFreq]         = useState('Daily')
  const [apiBaseUrl, setApiBaseUrl]     = useState('')
  const [clientId, setClientId]         = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [testing, setTesting]           = useState(false)
  const [testResult, setTestResult]     = useState<'success' | 'error' | null>(null)

  function handleTest() {
    setTesting(true)
    setTestResult(null)
    setTimeout(() => { setTesting(false); setTestResult('success') }, 1500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,30,50,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Configure {connector.name}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 space-y-4">
          {/* Row 1: Environment + Sync Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Environment</label>
              <select
                value={environment}
                onChange={e => setEnvironment(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
              >
                {['Production', 'Staging', 'Development'].map(o => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sync Frequency</label>
              <select
                value={syncFreq}
                onChange={e => setSyncFreq(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
              >
                {['Hourly', 'Daily', 'Weekly', 'Manual'].map(o => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* API Base URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">API Base URL</label>
            <input
              type="url"
              value={apiBaseUrl}
              onChange={e => setApiBaseUrl(e.target.value)}
              placeholder="https://api.example.gov"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* Row 2: Client ID + Client Secret */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Client ID</label>
              <input
                type="text"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Client Secret</label>
              <input
                type="password"
                value={clientSecret}
                onChange={e => setClientSecret(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          {/* Test result banner */}
          {testResult === 'success' && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
              <p className="text-sm text-green-700 font-medium">Connection successful!</p>
            </div>
          )}
          {testResult === 'error' && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/>
              </svg>
              <p className="text-sm text-red-700 font-medium">Connection failed. Check your credentials.</p>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-300 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            {testing && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            )}
            {testing ? 'Testing…' : 'Test Connection'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Single connector card ────────────────────────────────────────────── */
function ConnectorCard({ connector: c, onConfigure }: { connector: Connector; onConfigure: (c: Connector) => void }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="p-5 flex-1 space-y-3">
        {/* Header row: avatar + name/category + status badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
              style={{ background: c.avatarBg, color: c.avatarColor }}
            >
              {c.abbr}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-[15px] leading-tight truncate">{c.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{c.category}</p>
            </div>
          </div>
          <StatusBadge status={c.status} />
        </div>

        {/* Meta */}
        <div className="space-y-1 pt-1">
          <p className="text-sm text-slate-500">
            Used by <span className="font-semibold text-slate-700">{c.usedBy}</span>
          </p>
          <p className="text-sm text-slate-500">
            Last sync:{' '}
            {c.lastSync
              ? <span className="text-slate-700">{c.lastSync}</span>
              : <span className="text-slate-300">—</span>
            }
          </p>
        </div>
      </div>

      {/* Configure button */}
      <div className="px-5 pb-5">
        <button
          onClick={() => onConfigure(c)}
          className="w-full py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Configure
        </button>
      </div>
    </div>
  )
}

/* ── Connector Health table data ──────────────────────────────────────── */
interface HealthRow {
  connector: string
  entity: string
  status: ConnectorStatus
  lastSync: string | null
  records: number | null
  errors: number
}

const HEALTH_ROWS: HealthRow[] = [
  { connector: 'MSI',             entity: 'Morris County',  status: 'Connected',          lastSync: '2h ago', records: 42180, errors: 0 },
  { connector: 'MOD IV',          entity: 'Morris County',  status: 'Connected',          lastSync: '6h ago', records: 18902, errors: 0 },
  { connector: 'GovPilot',        entity: 'City of Trenton',status: 'Connected',          lastSync: '1h ago', records: 9341,  errors: 1 },
  { connector: 'Edmunds GovTech', entity: 'Bergen County',  status: 'Pending Validation', lastSync: null,     records: null,  errors: 0 },
  { connector: 'Zendesk',         entity: 'Hudson County',  status: 'Pending Validation', lastSync: null,     records: null,  errors: 0 },
]

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function ConnectorCenterPage() {
  const [configuring, setConfiguring] = useState<Connector | null>(null)

  return (
    <AppLayout>
      {configuring && (
        <ConfigureModal connector={configuring} onClose={() => setConfiguring(null)} />
      )}
      <div className="flex flex-col min-h-full">
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Connector Center</h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage approved data source connections that power your AI agents.
            </p>
          </div>

          {/* 3-column connector grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONNECTORS.map(c => <ConnectorCard key={c.id} connector={c} onConfigure={setConfiguring} />)}
          </div>

          {/* Connector Health table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 text-base">Connector Health</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Connector', 'Entity', 'Status', 'Last Sync', 'Records', 'Errors', 'Action'].map(h => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HEALTH_ROWS.map((row, i) => (
                    <tr
                      key={row.connector}
                      className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i === HEALTH_ROWS.length - 1 ? 'border-b-0' : ''}`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">{row.connector}</td>
                      <td className="px-6 py-4 text-sky-600 font-medium">{row.entity}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-600">{row.lastSync ?? '—'}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {row.records != null ? row.records.toLocaleString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={row.errors > 0 ? 'text-amber-500 font-semibold' : 'text-slate-700'}>
                          {row.errors}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-sky-600 hover:text-sky-800 font-medium transition-colors text-sm">
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left: branding */}
              <div>
                <p className="font-semibold text-slate-900 text-[15px]">State of New Jersey AI Enablement Portal</p>
                <p className="text-sky-600 text-sm font-medium mt-1">Powered by TechForGov</p>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed max-w-xs">
                  AI-generated outputs should be reviewed by authorized staff before official action.
                </p>
              </div>

              {/* Center: links */}
              <div className="space-y-2">
                {['Privacy', 'Accessibility', 'Security'].map(l => (
                  <p key={l}>
                    <a href="#" className="text-slate-500 hover:text-slate-800 text-sm transition-colors">{l}</a>
                  </p>
                ))}
              </div>

              {/* Right: links */}
              <div className="space-y-2">
                {['Policy Library', 'Support'].map(l => (
                  <p key={l}>
                    <a href="#" className="text-slate-500 hover:text-slate-800 text-sm transition-colors">{l}</a>
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <p className="text-slate-400 text-xs">© 2026 State of New Jersey. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </AppLayout>
  )
}
