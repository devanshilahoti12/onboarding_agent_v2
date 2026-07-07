import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getMySites } from '../api/onboarding'
import AppLayout from '../components/AppLayout'
import type { SiteSummary } from '../types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sites, setSites] = useState<SiteSummary[]>([])

  useEffect(() => {
    getMySites().then(setSites).catch(() => {})
  }, [])

  const activeSites = sites.filter((s) => s.crawl_status === 'completed').length
  const pendingSites = sites.filter((s) => ['queued', 'running'].includes(s.crawl_status)).length
  const totalPages = sites.reduce((sum, s) => sum + s.pages_indexed, 0)

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* ── Hero banner ──────────────────────────────────────────── */}
        <div className="rounded-2xl p-8 text-white" style={{ background: '#0d1929' }}>
          <p className="text-sky-400 text-xs font-semibold uppercase tracking-widest mb-3">IGNA AI PLATFORM</p>
          <h1 className="text-3xl font-bold leading-snug mb-3">
            Deploy AI Chat Widgets<br />Trained on Your Content
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mb-6 leading-relaxed">
            A self-service portal to configure, crawl, and deploy AI-powered chat agents
            trained on your website content — ready in minutes.
          </p>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/onboarding')}
              className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              Set Up New Site
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </button>
            <button className="border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
              View My Sites
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['Website Crawler', 'AI Knowledge Base', 'Script Tag Deploy', 'Zero-Code Setup'].map((tag) => (
              <span key={tag} className="text-slate-400 text-xs px-3 py-1 rounded-full" style={{ background: '#162e4a', border: '1px solid #1e3450' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Welcome + metrics ────────────────────────────────────── */}
        <div>
          <p className="text-sky-500 text-xs font-semibold uppercase tracking-widest mb-1">
            WELCOME, {user?.full_name?.toUpperCase()}
          </p>
          <h2 className="text-2xl font-bold text-slate-900 mb-0.5">Your AI Chat Operations</h2>
          <p className="text-slate-500 text-sm mb-5">Track your IGNA Chat deployments and knowledge bases.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              label="AVAILABLE AI AGENTS"
              value="1"
              sub="Ready to deploy"
              accentColor="#0ea5e9"
            />
            <StatCard
              label="ACTIVE DEPLOYMENTS"
              value={String(activeSites)}
              sub="Live sites"
              accentColor="#16a34a"
            />
            <StatCard
              label="PENDING CRAWLS"
              value={String(pendingSites)}
              sub="In progress"
              accentColor="#f59e0b"
            />
            <StatCard
              label="TOTAL SITES"
              value={String(sites.length)}
              sub="All time"
              accentColor="#8b5cf6"
            />
            <StatCard
              label="PAGES INDEXED"
              value={String(totalPages)}
              sub="Across all sites"
              accentColor="#0891b2"
            />
            <StatCard
              label="AVG. SETUP TIME"
              value="~5 min"
              sub="From URL to widget"
              accentColor="#f97316"
            />
          </div>
        </div>

        {/* ── Main content: Agents + Activity ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recommended Agents (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Available Agents</h3>
                <span className="text-sky-500 text-sm font-medium cursor-pointer hover:text-sky-600">
                  3 agents
                </span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AgentCard
                  icon={
                    <svg className="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
                    </svg>
                  }
                  title="IGNA Chat"
                  category="Resident Services"
                  badge="Ready"
                  badgeColor="green"
                  description="AI-powered website chat assistant that helps visitors find answers, complete requests, and navigate your content."
                  deploy="Website Script Tag"
                  setup="1–3 days"
                  onAction={() => navigate('/onboarding')}
                  actionLabel="Set Up Now"
                />
                <LockedAgentCard
                  icon={
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/>
                    </svg>
                  }
                  title="IGNA Voice"
                  category="Voice Automation"
                  description="AI voice assistant for handling calls, routing requests, and answering FAQs after hours."
                  deploy="Phone / Voice Integration"
                  setup="3–5 days"
                />
                <LockedAgentCard
                  icon={
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
                    </svg>
                  }
                  title="IGNA Sync"
                  category="Knowledge Management"
                  description="Sync and manage your knowledge base across all IGNA agents automatically."
                  deploy="Connector Package"
                  setup="2–4 days"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions (1/3 width) */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-3">
                <ActionItem
                  icon={<svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>}
                  title="Set Up New Site"
                  subtitle="Configure a new deployment"
                  onClick={() => navigate('/onboarding')}
                />
                {sites.length > 0 && (
                  <ActionItem
                    icon={<svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                    title="View Latest Script"
                    subtitle={sites[0]?.website_url}
                    onClick={() => navigate(`/download/${sites[0]?.customer_id}`)}
                  />
                )}
                <ActionItem
                  icon={<svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/></svg>}
                  title="Support"
                  subtitle="Get help & documentation"
                  onClick={() => {}}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Deployment Activity table ─────────────────────────────── */}
        {sites.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Recent Deployment Activity</h3>
              <span className="text-slate-400 text-sm">{sites.length} site{sites.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">AGENT</th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">WEBSITE</th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">STATUS</th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">PAGES</th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">SUBMITTED</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site, i) => (
                    <tr
                      key={site.customer_id}
                      className={`hover:bg-slate-50 transition-colors ${i !== sites.length - 1 ? 'border-b border-slate-100' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-sky-50 rounded flex items-center justify-center flex-shrink-0">
                            <svg className="w-3.5 h-3.5 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">IGNA Chat</p>
                            <p className="text-xs text-slate-400 font-mono">{site.site_identifier}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-700 truncate max-w-[200px]">{site.website_url}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={site.crawl_status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">{site.pages_indexed}</span>
                        <span className="text-slate-400 ml-1 text-xs">pages</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(site.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {site.crawl_status === 'completed' ? (
                          <button
                            onClick={() => navigate(`/download/${site.customer_id}`)}
                            className="bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
                          >
                            View Script
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                            </svg>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="border-t border-slate-200 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-700 font-medium text-sm">IGNA AI Onboarding Platform</p>
              <p className="text-sky-500 text-xs mt-0.5">Powered by Ignatiuz</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Support</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Documentation</a>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">© 2026 Ignatiuz. All rights reserved.</p>
        </div>
      </div>
    </AppLayout>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function StatCard({ label, value, sub, accentColor }: {
  label: string; value: string; sub: string; accentColor: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />
      <div className="px-5 py-4">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mb-0.5">{value}</p>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    completed: { label: 'Deployed', className: 'text-green-700 bg-green-50 border-green-200' },
    running:   { label: 'Crawling', className: 'text-sky-700 bg-sky-50 border-sky-200' },
    queued:    { label: 'Queued',   className: 'text-amber-700 bg-amber-50 border-amber-200' },
    failed:    { label: 'Failed',   className: 'text-red-700 bg-red-50 border-red-200' },
    unknown:   { label: 'Unknown',  className: 'text-slate-500 bg-slate-50 border-slate-200' },
  }
  const { label, className } = map[status] ?? map.unknown
  return (
    <span className={`inline-flex items-center border px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

function AgentCard({ icon, title, category, badge, badgeColor, description, deploy, setup, onAction, actionLabel }: {
  icon: ReactNode; title: string; category: string; badge: string
  badgeColor: 'green' | 'sky'; description: string
  deploy: string; setup: string; onAction: () => void; actionLabel: string
}) {
  const badgeClass = badgeColor === 'green'
    ? 'text-green-700 bg-green-50 border-green-200'
    : 'text-sky-700 bg-sky-50 border-sky-200'
  return (
    <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-sky-50 border border-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900 text-sm">{title}</p>
            <span className={`border text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badgeClass}`}>{badge}</span>
          </div>
          <p className="text-xs text-slate-500">{category}</p>
        </div>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-slate-400 mb-0.5">Deployment</p>
          <p className="text-xs font-medium text-slate-700 truncate">{deploy}</p>
        </div>
        <div className="bg-slate-50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-slate-400 mb-0.5">Setup</p>
          <p className="text-xs font-medium text-slate-700">{setup}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-auto">
        <button className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium py-2 rounded-lg transition-colors">
          View Details
        </button>
        <button
          onClick={onAction}
          className="flex-1 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          {actionLabel}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function LockedAgentCard({ icon, title, category, description, deploy, setup }: {
  icon: ReactNode; title: string; category: string
  description: string; deploy: string; setup: string
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3 opacity-50">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900 text-sm">{title}</p>
            <span className="border border-slate-200 text-slate-500 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">Pilot</span>
          </div>
          <p className="text-xs text-slate-500">{category}</p>
        </div>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-slate-400 mb-0.5">Deployment</p>
          <p className="text-xs font-medium text-slate-700 truncate">{deploy}</p>
        </div>
        <div className="bg-slate-50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-slate-400 mb-0.5">Setup</p>
          <p className="text-xs font-medium text-slate-700">{setup}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-auto">
        <button disabled className="flex-1 border border-slate-200 text-slate-400 text-xs font-medium py-2 rounded-lg cursor-not-allowed">
          View Details
        </button>
        <button disabled className="flex-1 bg-slate-200 text-slate-400 text-xs font-semibold py-2 rounded-lg cursor-not-allowed">
          Coming Soon
        </button>
      </div>
    </div>
  )
}

function ActionItem({ icon, title, subtitle, onClick }: {
  icon: ReactNode; title: string; subtitle: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
    >
      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-xs text-slate-400 truncate">{subtitle}</p>
      </div>
      <svg className="w-4 h-4 text-slate-300 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
      </svg>
    </button>
  )
}
