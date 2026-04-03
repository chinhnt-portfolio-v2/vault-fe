import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  tokenType: string | null
  setTokens: (accessToken: string, refreshToken: string, tokenType: string) => void
  clearTokens: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      tokenType: null,
      setTokens: (accessToken, refreshToken, tokenType) =>
        set({ accessToken, refreshToken, tokenType }),
      clearTokens: () =>
        set({ accessToken: null, refreshToken: null, tokenType: null }),
    }),
    { name: 'vault-auth-storage' }
  )
)
