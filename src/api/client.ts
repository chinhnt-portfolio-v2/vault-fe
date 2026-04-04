import axios from 'axios'

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL ?? '') + '/api/v1'

// ─── Token refresh state ────────────────────────────────────────────────────

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onRefreshComplete(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

async function refreshAccessToken(): Promise<string> {
  const state = localStorage.getItem('vault-auth-storage')
  const refreshToken = state ? JSON.parse(state).state.refreshToken : null

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    localStorage.removeItem('vault-auth-storage')
    // Use replaceState + reload to stay within SPA, avoid double-proxy-404
    const msg = 'Refresh failed'
    return Promise.reject(new Error(msg))
  }

  const data = await response.json()
  const newToken = data.accessToken
  localStorage.setItem('vault-auth-storage', JSON.stringify({
    state: { accessToken: newToken, refreshToken: data.refreshToken, tokenType: data.tokenType },
  }))
  return newToken
}

// ─── Axios client ────────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

export const { get, post, put, patch } = apiClient
export const del = apiClient.delete.bind(apiClient)
export default apiClient

// ─── Request interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.request.use((config) => {
  const state = localStorage.getItem('vault-auth-storage')
  const token = state ? JSON.parse(state).state.accessToken : null
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor ────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config

    // On 401 with no token → user is logged out → go to login (SPA navigation)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Only redirect if the request didn't already include a token
      const state = localStorage.getItem('vault-auth-storage')
      const hadToken = state && JSON.parse(state).state.accessToken

      if (!hadToken) {
        // No token ever — go to login
        window.location.replace('/login')
        return Promise.reject(new Error('Unauthorized'))
      }

      // Had token but got 401 → try refresh
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      return refreshAccessToken()
        .then((newToken: string) => {
          onRefreshComplete(newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          isRefreshing = false
          return apiClient(originalRequest)
        })
        .catch(() => {
          isRefreshing = false
          localStorage.removeItem('vault-auth-storage')
          window.location.replace('/login')
          return Promise.reject(new Error('Hết phiên đăng nhập. Đang chuyển về trang đăng nhập…'))
        })
    }

    const status = error.response?.status
    let message = 'Có lỗi xảy ra. Vui lòng thử lại.'

    if (status === 400) message = 'Dữ liệu không hợp lệ.'
    else if (status === 403) message = 'Bạn không có quyền thực hiện thao tác này.'
    else if (status === 404) message = 'Không tìm thấy dữ liệu.'
    else if (status === 422) {
      const detail = error.response?.data?.detail
      message = typeof detail === 'string' ? detail : 'Thông tin không hợp lệ.'
    } else if (status === 429) message = 'Thao tác quá nhanh. Vui lòng chờ một chút.'
    else if (status === 500) message = 'Máy chủ đang bận. Vui lòng thử lại sau.'
    else if (!navigator.onLine) message = 'Không có kết nối internet.'
    else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') message = 'Kết nối bị gián đoạn.'

    return Promise.reject(new Error(message))
  }
)
