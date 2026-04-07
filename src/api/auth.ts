import apiClient from './client'

export interface LoginRequest { email: string; password: string }
export interface RegisterRequest { email: string; password: string; name?: string }
export interface AuthResponse { accessToken: string; refreshToken: string; tokenType: string }
export interface UserProfile { id: string; email: string; name?: string; createdAt: string }

export const login = (body: LoginRequest) =>
  apiClient.post<AuthResponse>('/auth/login', body).then((r) => r.data)

export const register = (body: RegisterRequest) =>
  apiClient.post<AuthResponse>('/auth/register', body).then((r) => r.data)

export const refreshTokens = (refreshToken: string) =>
  apiClient
    .post<AuthResponse>('/auth/refresh', { refreshToken })
    .then((r) => r.data)

export const getMe = () =>
  apiClient.get<UserProfile>('/auth/me').then((r) => r.data)

export const googleOAuthUrl = () => {
  const base = (import.meta.env.VITE_API_BASE_URL || 'https://portfolio-platform-1095331155372.asia-southeast1.run.app')
  return `${base}/api/v1/auth/oauth2/login/google`
}
