import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './en'
import { vi } from './vi'

const savedLang = localStorage.getItem('vault-lang') || 'vi'

i18n.use(initReactI18next).init({
  resources: { en, vi },
  lng: savedLang,
  fallbackLng: 'vi',
  interpolation: { escapeValue: false },
})

export default i18n

export function setLanguage(lang: 'en' | 'vi') {
  localStorage.setItem('vault-lang', lang)
  i18n.changeLanguage(lang)
}

export const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
] as const
