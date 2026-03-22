import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { ClassConnection } from '../types'
import {
  getConnectionsFn,
  getPendingFn,
  sendInviteFn,
  acceptConnectionFn,
  rejectConnectionFn,
  removeConnectionFn,
} from '../functions/connections'

export const Route = createFileRoute('/_auth/connections')({
  component: ConnectionPage,
})

function ConnectionPage() {
  const { t } = useTranslation()
  const [connections, setConnections] = useState<ClassConnection[]>([])
  const [pending, setPending] = useState<ClassConnection[]>([])
  const [form, setForm] = useState({ name: '', country: '' })
  const [error, setError] = useState('')

  async function load() {
    const [c, p] = await Promise.all([getConnectionsFn(), getPendingFn()])
    setConnections(c as ClassConnection[])
    setPending(p as ClassConnection[])
  }

  useEffect(() => {
    load()
  }, [])

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await sendInviteFn({ data: { name: form.name, country: form.country.toUpperCase() } })
      setForm({ name: '', country: '' })
      load()
    } catch (err: any) {
      const msg = err.message
      if (msg === 'TARGET_NOT_FOUND') setError('Classe introuvable')
      else if (msg === 'SELF_INVITE') setError('Vous ne pouvez pas vous inviter vous-même')
      else if (msg === 'CONNECTION_EXISTS') setError('Une connexion existe déjà avec cette classe')
      else setError(t('common.error'))
    }
  }

  async function respond(id: string, accept: boolean) {
    if (accept) await acceptConnectionFn({ data: { connectionId: id } })
    else await rejectConnectionFn({ data: { connectionId: id } })
    load()
  }

  async function remove(id: string) {
    await removeConnectionFn({ data: { connectionId: id } })
    load()
  }

  return (
    <div className="page">
      <h1>{t('connections.title')}</h1>

      <div className="card">
        <h2>{t('class.invite')}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={sendInvite} className="inline-form">
          <input
            placeholder={t('class.targetName')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder={t('class.targetCountry') + ' (FR, ES…)'}
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            maxLength={2}
            required
          />
          <button type="submit" className="btn-primary">
            {t('class.sendInvite')}
          </button>
        </form>
      </div>

      {pending.length > 0 && (
        <div className="card">
          <h2>{t('connections.pending')}</h2>
          {pending.map((c) => (
            <div key={c.id} className="connection-item">
              <span>
                <strong>{c.requester.name}</strong> ({c.requester.country})
              </span>
              <div>
                <button className="btn-success" onClick={() => respond(c.id, true)}>
                  {t('connections.accept')}
                </button>
                <button className="btn-danger" onClick={() => respond(c.id, false)}>
                  {t('connections.reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h2>{t('connections.title')}</h2>
        {connections.length === 0 ? (
          <p className="text-muted">{t('connections.empty')}</p>
        ) : (
          connections.map((c) => (
            <div key={c.id} className="connection-item">
              <div>
                <strong>{c.requester.name}</strong> ({c.requester.country}) {' ↔ '}
                <strong>{c.receiver.name}</strong> ({c.receiver.country})
              </div>
              <div>
                <span className={`badge badge-${c.status.toLowerCase()}`}>
                  {t(`connections.status.${c.status}`)}
                </span>
                <button className="btn-ghost btn-sm" onClick={() => remove(c.id)}>
                  {t('connections.disconnect')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
