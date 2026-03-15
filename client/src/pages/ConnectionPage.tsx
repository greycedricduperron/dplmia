import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ClassConnection } from '@dplmia/shared';
import { connectionApi } from '../api/connection.api';

export default function ConnectionPage() {
  const { t } = useTranslation();
  const [connections, setConnections] = useState<ClassConnection[]>([]);
  const [pending, setPending] = useState<ClassConnection[]>([]);
  const [form, setForm] = useState({ name: '', country: '' });
  const [error, setError] = useState('');

  async function load() {
    const [c, p] = await Promise.all([connectionApi.list(), connectionApi.pending()]);
    setConnections(c.data.data);
    setPending(p.data.data);
  }

  useEffect(() => { load(); }, []);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await connectionApi.send(form.name, form.country.toUpperCase());
      setForm({ name: '', country: '' });
      load();
    } catch (err: any) {
      setError(err.response?.data?.error ?? t('common.error'));
    }
  }

  async function respond(id: string, accept: boolean) {
    await (accept ? connectionApi.accept(id) : connectionApi.reject(id));
    load();
  }

  async function remove(id: string) {
    await connectionApi.remove(id);
    load();
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
          <button type="submit" className="btn-primary">{t('class.sendInvite')}</button>
        </form>
      </div>

      {pending.length > 0 && (
        <div className="card">
          <h2>{t('connections.pending')}</h2>
          {pending.map((c) => (
            <div key={c.id} className="connection-item">
              <span><strong>{c.requester.name}</strong> ({c.requester.country})</span>
              <div>
                <button className="btn-success" onClick={() => respond(c.id, true)}>{t('connections.accept')}</button>
                <button className="btn-danger" onClick={() => respond(c.id, false)}>{t('connections.reject')}</button>
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
                <strong>{c.requester.name}</strong> ({c.requester.country})
                {' ↔ '}
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
  );
}
