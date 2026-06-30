import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import OnboardingPage from './pages/OnboardingPage'
import DownloadPage from './pages/DownloadPage'
import AgentLibraryPage from './pages/AgentLibraryPage'
import AgentDetailPage from './pages/AgentDetailPage'
import DeployWizardPage from './pages/DeployWizardPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const { token } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/download/:customerId" element={<ProtectedRoute><DownloadPage /></ProtectedRoute>} />
      <Route path="/agents" element={<ProtectedRoute><AgentLibraryPage /></ProtectedRoute>} />
      <Route path="/agents/:id" element={<ProtectedRoute><AgentDetailPage /></ProtectedRoute>} />
      <Route path="/agents/:id/deploy" element={<ProtectedRoute><DeployWizardPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
