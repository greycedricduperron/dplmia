import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Class } from '../lib/types';
import { classApi } from '../api/class.api';

export default function ClassPage() {
  const { t } = useTranslation();
  const [cls, setCls] = useState<Class | null>(null);
  const [form, setForm] = useState({ name: '', country: 'FR', language: 'fr' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    classApi.getMine()
      .then((r) => { setCls(r.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const r = await classApi.create(form);
      setCls(r.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error ?? t('common.error'));
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  if (loading) return <p>{t('common.loading')}</p>;

  return (
    <div className="page">
      <h1>{t('nav.myClass')}</h1>
      {cls ? (
        <div className="card">
          <h2>{cls.name}</h2>
          <p>🌍 {cls.country} — 🗣️ {cls.language.toUpperCase()}</p>
          <p className="text-muted">ID : <code>{cls.id}</code></p>
        </div>
      ) : (
        <div className="card">
          <p>{t('class.noClass')}</p>
          {error && <p className="error">{error}</p>}
          <form onSubmit={createClass}>
            <label>{t('class.name')}
              <input type="text" value={form.name} onChange={set('name')} required />
            </label>
            <label>{t('class.country')}
              <input type="text" value={form.country} onChange={set('country')} maxLength={2} required />
            </label>
            <label>{t('class.language')}
              <select value={form.language} onChange={set('language')}>
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </label>
            <button type="submit" className="btn-primary">{t('class.createBtn')}</button>
          </form>
        </div>
      )}
    </div>
  );
}
