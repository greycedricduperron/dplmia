import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation()

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🌍 {t('app.name')}</h1>
        <h2>{t('auth.login')}</h2>
        <div className="social-buttons">
          <button
            className="btn-social btn-google"
            onClick={() =>
              authClient.signIn.social({ provider: 'google', callbackURL: '/onboarding' })
            }
          >
            {t('auth.continueWithGoogle', 'Continuer avec Google')}
          </button>
          <button
            className="btn-social btn-microsoft"
            onClick={() =>
              authClient.signIn.social({ provider: 'microsoft', callbackURL: '/onboarding' })
            }
          >
            {t('auth.continueWithMicrosoft', 'Continuer avec Microsoft / Teams')}
          </button>
          <button
            className="btn-social btn-slack"
            onClick={() =>
              authClient.signIn.social({ provider: 'slack', callbackURL: '/onboarding' })
            }
          >
            {t('auth.continueWithSlack', 'Continuer avec Slack')}
          </button>
        </div>
      </div>
    </div>
  )
}
