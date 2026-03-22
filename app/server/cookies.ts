import { getCookie, setCookie, deleteCookie } from '@tanstack/react-start/server'

export const COOKIE_NAME = 'token'

export function setAuthCookie(token: string, isProduction: boolean) {
  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
}

export function getAuthCookie(): string | undefined {
  return getCookie(COOKIE_NAME) ?? undefined
}

export function clearAuthCookie() {
  deleteCookie(COOKIE_NAME)
}
