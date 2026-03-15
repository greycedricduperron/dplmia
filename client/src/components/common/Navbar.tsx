import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const { teacher, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">🌍 {t('app.name')}</div>
      {teacher && (
        <div className="navbar-links">
          <NavLink to="/feed">{t('nav.feed')}</NavLink>
          <NavLink to="/gallery">{t('nav.gallery')}</NavLink>
          <NavLink to="/audio">{t('nav.audio')}</NavLink>
          <NavLink to="/hangman">{t('nav.hangman')}</NavLink>
          <NavLink to="/connections">{t('nav.connections')}</NavLink>
          <NavLink to="/class">{t('nav.myClass')}</NavLink>
        </div>
      )}
      <div className="navbar-right">
        <LanguageSwitcher />
        {teacher && (
          <button className="btn-ghost" onClick={handleLogout}>
            {t('nav.logout')}
          </button>
        )}
      </div>
    </nav>
  );
}
