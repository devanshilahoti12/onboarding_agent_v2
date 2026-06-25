import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
            </svg>
          </div>
          <span className="font-semibold text-gray-900">IGNA Onboarding Agent</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hello, {user?.full_name}</span>
          <button
            onClick={clearAuth}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Select an agent to get started</p>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AgentCard
            title="IGNA Chat"
            description="Deploy an AI-powered chat widget on your website, trained on your own content."
            icon={
              <svg className="w-7 h-7 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
              </svg>
            }
            badge="Ready"
            onAction={() => navigate('/onboarding')}
            actionLabel="Set Up"
          />

          {/* Placeholder future agents */}
          <LockedCard title="IGNA Forms" description="AI-powered forms that adapt to your visitors." />
          <LockedCard title="IGNA Insights" description="Analytics and insights from visitor conversations." />
        </div>
      </main>
    </div>
  )
}

function AgentCard({
  title, description, icon, badge, onAction, actionLabel,
}: {
  title: string
  description: string
  icon: React.ReactNode
  badge: string
  onAction: () => void
  actionLabel: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">{icon}</div>
        <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{badge}</span>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        <p className="text-gray-500 text-sm mt-1 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onAction}
        className="mt-auto w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
      >
        {actionLabel}
      </button>
    </div>
  )
}

function LockedCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4 opacity-60">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">Coming soon</span>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        <p className="text-gray-500 text-sm mt-1 leading-relaxed">{description}</p>
      </div>
      <button disabled className="mt-auto w-full bg-gray-200 text-gray-400 text-sm font-semibold py-2.5 rounded-xl cursor-not-allowed">
        Coming Soon
      </button>
    </div>
  )
}
