import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import Navbar from '../components/common/Navbar'
import { useAuth } from '../context/AuthContext'

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    // Client-side auth guard: redirect to /login if no cookie
    // The AuthContext handles the actual session loading
  },
  component: AuthLayout,
})

function AuthLayout() {
  const { teacher, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading">
        <p>Chargement…</p>
      </div>
    )
  }

  if (!teacher) {
    throw redirect({ to: '/login' })
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
