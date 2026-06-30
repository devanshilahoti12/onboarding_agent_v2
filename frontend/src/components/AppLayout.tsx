import { type ReactNode, type CSSProperties } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/* ── Inline color tokens (avoids custom Tailwind config dependency) ── */
const C = {
  sidebar: '#0d1929',
  sidebarHover: '#162e4a',
  sidebarBorder: '#1e3450',
  active: '#0ea5e9',
  bg: '#f1f5f9',
}

/* ── Icons ───────────────────────────────────────────────────────────── */
function IcDashboard() {
  return (
    <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/>
      <rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/>
    </svg>
  )
}
function IcAgents() {
  return (
    <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3h7.5M12 3v3m-3.75 0h7.5A2.25 2.25 0 0118 8.25v1.5A2.25 2.25 0 0115.75 12h-7.5A2.25 2.25 0 016 9.75v-1.5A2.25 2.25 0 018.25 6zm-3 9h13.5m-13.5 0v3.75c0 .621.504 1.125 1.125 1.125h11.25c.621 0 1.125-.504 1.125-1.125V15m-13.5 0a2.25 2.25 0 00-2.25 2.25v1.5"/>
    </svg>
  )
}
function IcRequests() {
  return (
    <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
    </svg>
  )
}
function IcDeployment() {
  return (
    <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
    </svg>
  )
}
function IcConnector() {
  return (
    <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
    </svg>
  )
}
function IcPolicy() {
  return (
    <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
    </svg>
  )
}
function IcSupport() {
  return (
    <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/>
    </svg>
  )
}

/* ── Nav item definitions ─────────────────────────────────────────────
   activePaths: if set, the item is active only when location matches one of these paths exactly.
   If activePaths is undefined, uses NavLink's built-in isActive (with end=true for Dashboard).
   If activePaths is an empty array [], the item is never highlighted (visual-only link).
─────────────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { to: '/dashboard',   label: 'Dashboard',        icon: <IcDashboard />,  activePaths: undefined,   end: true  },
  { to: '/agents',      label: 'AI Agent Library',  icon: <IcAgents />,     activePaths: ['/agents'], end: false },
  { to: '/dashboard',   label: 'My Requests',       icon: <IcRequests />,   activePaths: [],          end: false },
  { to: '/onboarding',  label: 'Deployment Center', icon: <IcDeployment />, activePaths: ['/onboarding', '/download'], end: false },
  { to: '/dashboard',   label: 'Connector Center',  icon: <IcConnector />,  activePaths: [],          end: false },
  { to: '/dashboard',   label: 'Policy Library',    icon: <IcPolicy />,     activePaths: [],          end: false },
  { to: '#',            label: 'Support',           icon: <IcSupport />,    activePaths: [],          end: false },
]

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, clearAuth } = useAuth()
  const location = useLocation()

  const initials = (user?.full_name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      {/* ══ TOP BAR — full width, dark navy ═══════════════════════════ */}
      <header
        className="flex-shrink-0 flex items-center z-50"
        style={{ background: C.sidebar, height: 56 }}
      >
        {/* Brand — same width as sidebar */}
        <div
          className="flex-shrink-0 flex items-center gap-2.5 px-4"
          style={{ width: 220, borderRight: `1px solid ${C.sidebarBorder}` }}
        >
          <div
            className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: C.active }}
          >
            <svg className="w-[18px] h-[18px] text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
            </svg>
          </div>
          <div className="leading-tight">
            <p className="text-white font-semibold text-[13.5px] leading-tight">IGNA Onboarding</p>
            <p className="text-[10px] uppercase tracking-widest leading-tight" style={{ color: C.active }}>
              AI Platform
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 px-5">
          <div className="relative" style={{ maxWidth: 440 }}>
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: '#64748b' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
            </svg>
            <input
              type="text"
              placeholder="Search agents, sites, policies…"
              className="w-full rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none"
              style={{
                background: '#162e4a',
                border: `1px solid ${C.sidebarBorder}`,
                color: '#cbd5e1',
              }}
            />
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 pr-4">
          {/* Location chip */}
          <button
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors"
            style={{ border: `1px solid ${C.sidebarBorder}`, color: '#94a3b8' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
            </svg>
            Default
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
            </svg>
          </button>

          {/* User chip */}
          <button
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors"
            style={{ border: `1px solid ${C.sidebarBorder}`, color: '#94a3b8' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
            </svg>
            {user?.full_name}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
            </svg>
          </button>

          {/* Bell */}
          <button className="transition-colors" style={{ color: '#64748b' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
            </svg>
          </button>

          {/* Avatar */}
          <div className="relative group">
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: '#f59e0b' }}
              title="Sign out"
            >
              {initials}
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-28 hidden group-hover:block z-50">
              <button
                onClick={clearAuth}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ══ BODY: sidebar + main ══════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside
          className="flex-shrink-0 flex flex-col overflow-y-auto"
          style={{ width: 220, background: C.sidebar, borderRight: `1px solid ${C.sidebarBorder}` }}
        >
          {/* Org header */}
          <div className="px-4 pt-5 pb-4" style={{ borderBottom: `1px solid ${C.sidebarBorder}` }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#475569' }}>
              IGNA AI
            </p>
            <p className="font-semibold text-base text-white leading-snug">Onboarding Agent</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-3 px-2 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              /* Determine active state */
              let isActive = false
              if (item.activePaths === undefined) {
                /* use NavLink's standard logic — handled below */
              } else if (item.activePaths.length === 0) {
                isActive = false
              } else {
                isActive = item.activePaths.some((p) => location.pathname.startsWith(p))
              }

              const baseStyle: CSSProperties = {
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8,
                fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
                background: isActive ? C.active : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                cursor: item.to === '#' ? 'default' : 'pointer',
                textDecoration: 'none',
              }

              if (item.activePaths === undefined) {
                /* NavLink handles active state */
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.end}
                    style={({ isActive: a }) => ({
                      ...baseStyle,
                      background: a ? C.active : 'transparent',
                      color: a ? '#ffffff' : '#94a3b8',
                      fontWeight: a ? 600 : 400,
                    })}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget
                      if (!el.style.background || el.style.background === 'transparent') {
                        el.style.background = C.sidebarHover
                        el.style.color = '#e2e8f0'
                      }
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget
                      if (el.style.background === C.sidebarHover) {
                        el.style.background = 'transparent'
                        el.style.color = '#94a3b8'
                      }
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                )
              }

              /* Static active state computed above */
              if (item.to === '#') {
                return (
                  <span key={item.label} style={baseStyle}>
                    {item.icon}
                    {item.label}
                  </span>
                )
              }

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={false}
                  style={baseStyle}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = C.sidebarHover
                      e.currentTarget.style.color = '#e2e8f0'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#94a3b8'
                    }
                  }}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </aside>

        {/* ── Main content ────────────────────────────────────────── */}
        <main className="flex-1 overflow-auto" style={{ background: C.bg }}>
          {children}
        </main>
      </div>
    </div>
  )
}
