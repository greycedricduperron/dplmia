import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const { setTeacher } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await authApi.login(form);
      setTeacher(res.data.data);
      navigate('/feed');
    } catch (err: any) {
      setError(err.response?.data?.error ?? t('common.error'));
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🌍 {t('app.name')}</h1>
        <h2>{t('auth.login')}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>{t('auth.email')}
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>{t('auth.password')}
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          <button type="submit" className="btn-primary">{t('auth.loginBtn')}</button>
        </form>
        <p>{t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link></p>
      </div>
    </div>
  );
}
