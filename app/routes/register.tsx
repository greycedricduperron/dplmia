import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { registerFn } from '../functions/auth'
import { useAuth } from '../context/AuthContext'

const COUNTRIES = [
  { code: 'FR', label: 'France' },
  { code: 'GB', label: 'Royaume-Uni' },
  { code: 'ES', label: 'Espagne' },
  { code: 'DE', label: 'Allemagne' },
  { code: 'IT', label: 'Italie' },
  { code: 'PT', label: 'Portugal' },
  { code: 'BE', label: 'Belgique' },
  { code: 'CH', label: 'Suisse' },
  { code: 'CA', label: 'Canada' },
  { code: 'MA', label: 'Maroc' },
  { code: 'SN', label: 'Sénégal' },
  { code: 'CI', label: "Côte d'Ivoire" },
]

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const { t } = useTranslation()
  const { setTeacher } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    country: 'FR',
    language: 'fr',
  })
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const teacher = await registerFn({ data: form })
      setTeacher(teacher as any)
      await router.navigate({ to: '/class' })
    } catch (err: any) {
      const msg = err.message
      if (msg === 'EMAIL_TAKEN') setError(t('auth.emailTaken') ?? t('common.error'))
      else setError(t('common.error'))
    }
  }

  const set =
    (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value })

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🌍 {t('app.name')}</h1>
        <h2>{t('auth.register')}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            {t('auth.name')}
            <input type="text" value={form.name} onChange={set('name')} required minLength={2} />
          </label>
          <label>
            {t('auth.email')}
            <input type="email" value={form.email} onChange={set('email')} required />
          </label>
          <label>
            {t('auth.password')}
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              required
              minLength={8}
            />
          </label>
          <label>
            {t('auth.country')}
            <select value={form.country} onChange={set('country')}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('auth.language')}
            <select value={form.language} onChange={set('language')}>
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </label>
          <button type="submit" className="btn-primary">
            {t('auth.registerBtn')}
          </button>
        </form>
        <p>
          {t('auth.hasAccount')} <Link to="/login">{t('auth.login')}</Link>
        </p>
      </div>
    </div>
  )
}
