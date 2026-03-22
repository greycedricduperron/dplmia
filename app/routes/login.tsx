import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { loginFn } from '../functions/auth'
import { useAuth } from '../context/AuthContext'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation()
  const { setTeacher } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const teacher = await loginFn({ data: form })
      setTeacher(teacher as any)
      await router.navigate({ to: '/feed' })
    } catch (err: any) {
      const msg = err.message
      if (msg === 'INVALID_CREDENTIALS') setError(t('auth.invalidCredentials') ?? t('common.error'))
      else setError(t('common.error'))
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🌍 {t('app.name')}</h1>
        <h2>{t('auth.login')}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            {t('auth.email')}
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label>
            {t('auth.password')}
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>
          <button type="submit" className="btn-primary">
            {t('auth.loginBtn')}
          </button>
        </form>
        <p>
          {t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link>
        </p>
      </div>
    </div>
  )
}
