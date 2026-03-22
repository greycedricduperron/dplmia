import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { Class } from '../types'
import { createClassFn, getMyClassFn } from '../functions/class'

export const Route = createFileRoute('/_auth/class')({
  component: ClassPage,
})

function ClassPage() {
  const { t } = useTranslation()
  const [cls, setCls] = useState<Class | null>(null)
  const [form, setForm] = useState({ name: '', country: 'FR', language: 'fr' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyClassFn()
      .then((c) => setCls(c as Class))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function createClass(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const c = await createClassFn({ data: form })
      setCls(c as Class)
    } catch (err: any) {
      if (err.message === 'ALREADY_HAS_CLASS') setError(t('common.error'))
      else setError(t('common.error'))
    }
  }

  const set =
    (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value })

  if (loading) return <p>{t('common.loading')}</p>

  return (
    <div className="page">
      <h1>{t('nav.myClass')}</h1>
      {cls ? (
        <div className="card">
          <h2>{cls.name}</h2>
          <p>
            🌍 {cls.country} — 🗣️ {cls.language.toUpperCase()}
          </p>
          <p className="text-muted">
            ID : <code>{cls.id}</code>
          </p>
        </div>
      ) : (
        <div className="card">
          <p>{t('class.noClass')}</p>
          {error && <p className="error">{error}</p>}
          <form onSubmit={createClass}>
            <label>
              {t('class.name')}
              <input type="text" value={form.name} onChange={set('name')} required />
            </label>
            <label>
              {t('class.country')}
              <input
                type="text"
                value={form.country}
                onChange={set('country')}
                maxLength={2}
                required
              />
            </label>
            <label>
              {t('class.language')}
              <select value={form.language} onChange={set('language')}>
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </label>
            <button type="submit" className="btn-primary">
              {t('class.createBtn')}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
