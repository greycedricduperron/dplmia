import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { saveOnboardingFn } from '../functions/user'
import { useAuth } from '../context/AuthContext'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

const COUNTRIES = [
  { code: 'FR', label: 'France' },
  { code: 'BE', label: 'Belgique' },
  { code: 'CH', label: 'Suisse' },
  { code: 'CA', label: 'Canada' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'US', label: 'United States' },
  { code: 'ES', label: 'España' },
  { code: 'DE', label: 'Deutschland' },
  { code: 'IT', label: 'Italia' },
  { code: 'PT', label: 'Portugal' },
]

function OnboardingPage() {
  const { t } = useTranslation()
  const { user, setUser } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ language: 'fr', country: 'FR' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Already onboarded — redirect
  if (user?.onboardingComplete) {
    router.navigate({ to: user.class ? '/feed' : '/class' })
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await saveOnboardingFn({ data: form })
      if (user) setUser({ ...user, ...form, onboardingComplete: true })
      await router.navigate({ to: '/class' })
    } catch {
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🌍 {t('app.name')}</h1>
        <h2>{t('auth.completeProfile', 'Complétez votre profil')}</h2>
        {user && <p>Bienvenue, {user.name} !</p>}
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            {t('auth.language', 'Langue')}
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('auth.country', 'Pays')}
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {t('common.continue', 'Continuer')}
          </button>
        </form>
      </div>
    </div>
  )
}
