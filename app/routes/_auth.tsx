import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import Navbar from '../components/common/Navbar'
import { useAuth } from '../context/AuthContext'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading">
        <p>Chargement…</p>
      </div>
    )
  }

  if (!user) {
    throw redirect({ to: '/login' })
  }

  if (!user.onboardingComplete) {
    throw redirect({ to: '/onboarding' })
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
