import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { Layout } from '@/pages/Layout'
import '@/i18n'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-sm text-muted-foreground animate-pulse">Đang tải…</p>
    </div>
  )
}

// OAuth callback handler — reads tokens from URL params (implicit flow)
// and redirects to /. Component renders nothing.
function OAuthCallbackHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const accessToken  = params.get('accessToken')
    const refreshToken = params.get('refreshToken')
    const tokenType    = params.get('tokenType') ?? 'Bearer'

    // Backend redirects here with tokens in URL (GET redirect, no code exchange needed)

    if (accessToken && refreshToken) {
      // Implicit flow
      localStorage.setItem('vault-auth-storage', JSON.stringify({
        state: { accessToken, refreshToken, tokenType },
      }))
      window.history.replaceState(null, '', '/')
      navigate('/', { replace: true })
      return
    }
  }, [navigate])

  return null
}

// Protected routes — all except /login
function ProtectedRoutes() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<DashboardPageLazy />} />
          <Route path="/bookmarks" element={<BookmarksPageLazy />} />
          <Route path="/bookmarks/favorites" element={<BookmarksPageLazy />} />
          <Route path="/bookmarks/unfiled" element={<BookmarksPageLazy />} />
          <Route path="/bookmarks/folder/:folderId" element={<BookmarksPageLazy />} />
          <Route path="/folders" element={<FoldersPageLazy />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

// Lazy-loaded pages
const DashboardPageLazy  = lazy(() => import('@/pages/DashboardPage'))
const BookmarksPageLazy  = lazy(() => import('@/pages/BookmarksPage'))
const FoldersPageLazy    = lazy(() => import('@/pages/FoldersPage'))
const LoginPageLazy      = lazy(() => import('@/pages/LoginPage'))

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="bottom-right" richColors />
        <OAuthCallbackHandler />
        <Routes>
          <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPageLazy /></Suspense>} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
