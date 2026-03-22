import { Link, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const { t } = useTranslation()
  const { teacher, logout } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    await logout()
    await router.navigate({ to: '/login' })
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">🌍 {t('app.name')}</div>
      {teacher && (
        <div className="navbar-links">
          <Link to="/feed">{t('nav.feed')}</Link>
          <Link to="/gallery">{t('nav.gallery')}</Link>
          <Link to="/audio">{t('nav.audio')}</Link>
          <Link to="/hangman">{t('nav.hangman')}</Link>
          <Link to="/connections">{t('nav.connections')}</Link>
          <Link to="/class">{t('nav.myClass')}</Link>
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
  )
}
