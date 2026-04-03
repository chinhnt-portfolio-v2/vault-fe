import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Bookmark, Folder, Sun, Moon, Globe } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useThemeStore } from '@/stores/themeStore'
import { setLanguage, LANGUAGES } from '@/i18n'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const { isDark, toggleDark } = useThemeStore()
  const [showLangMenu, setShowLangMenu] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const navItems = [
    { href: '/', label: t('nav.dashboard'), icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/bookmarks', label: t('nav.bookmarks'), icon: <Bookmark className="w-5 h-5" /> },
    { href: '/folders', label: t('nav.folders'), icon: <Folder className="w-5 h-5" /> },
  ]

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-foreground hover:text-brand transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="#7C3AED" fillOpacity="0.15"/>
                <rect x="6" y="10" width="20" height="16" rx="3" stroke="#7C3AED" strokeWidth="1.5" fill="none"/>
                <line x1="6" y1="15" x2="26" y2="15" stroke="#7C3AED" strokeWidth="1.5"/>
                <circle cx="20" cy="20" r="2" fill="#7C3AED"/>
              </svg>
              <span className="text-sm hidden sm:inline">{t('appName')}</span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-1 flex-1" aria-label="Điều hướng chính">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-brand/10 text-brand font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Language */}
              <div className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowLangMenu(!showLangMenu)}
                      aria-label="Chuyển ngôn ngữ"
                      className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{i18n.language === 'vi' ? 'Tiếng Việt' : 'English'}</TooltipContent>
                </Tooltip>
                {showLangMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-md z-50 py-1 min-w-[120px]">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code as 'vi' | 'en'); setShowLangMenu(false) }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors ${
                          i18n.language === lang.code ? 'text-brand font-medium' : 'text-foreground'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dark mode */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleDark}
                    aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                    className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{isDark ? 'Chế độ sáng' : 'Chế độ tối'}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </TooltipProvider>
  )
}
