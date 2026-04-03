import apiClient from './client'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BookmarkFolder {
  id: string
  userId: string
  name: string
  color: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Bookmark {
  id: string
  userId: string
  folderId: string | null
  url: string
  title: string
  description: string | null
  favicon: string | null
  thumbnail: string | null
  tags: string[]
  isArchived: boolean
  isFavorite: boolean
  clickCount: number
  createdAt: string
  updatedAt: string
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface DashboardData {
  totalBookmarks: number
  totalFolders: number
  totalFavorites: number
  allTags: string[]
  recentBookmarks: Bookmark[]
}

export interface CreateBookmarkRequest {
  url: string
  title: string
  description?: string
  favicon?: string
  folderId?: string
  tags?: string[]
}

export interface UpdateBookmarkRequest extends Partial<CreateBookmarkRequest> {}

export interface CreateFolderRequest {
  name: string
  color: string
  sortOrder?: number
}

export interface UpdateFolderRequest {
  name?: string
  color?: string
  sortOrder?: number
}

// ─── Folders ─────────────────────────────────────────────────────────────────

export const getFolders = () =>
  apiClient.get<BookmarkFolder[]>('/vault/folders').then((r) => r.data)

export const createFolder = (body: CreateFolderRequest) =>
  apiClient.post<BookmarkFolder>('/vault/folders', body).then((r) => r.data)

export const updateFolder = (id: string, body: UpdateFolderRequest) =>
  apiClient.put<BookmarkFolder>(`/vault/folders/${id}`, body).then((r) => r.data)

export const deleteFolder = (id: string) =>
  apiClient.delete(`/vault/folders/${id}`).then((r) => r.data)

// ─── Bookmarks ───────────────────────────────────────────────────────────────

export const getBookmarks = (page = 0, size = 30) =>
  apiClient
    .get<PagedResponse<Bookmark>>('/vault/bookmarks', { params: { page, size } })
    .then((r) => r.data)

export const getBookmarksByFolder = (folderId: string) =>
  apiClient.get<Bookmark[]>(`/vault/bookmarks/folder/${folderId}`).then((r) => r.data)

export const getFavoriteBookmarks = () =>
  apiClient.get<Bookmark[]>('/vault/bookmarks/favorites').then((r) => r.data)

export const searchBookmarks = (q: string, page = 0, size = 30) =>
  apiClient
    .get<PagedResponse<Bookmark>>('/vault/bookmarks/search', { params: { q, page, size } })
    .then((r) => r.data)

export const createBookmark = (body: CreateBookmarkRequest) =>
  apiClient.post<Bookmark>('/vault/bookmarks', body).then((r) => r.data)

export const updateBookmark = (id: string, body: UpdateBookmarkRequest) =>
  apiClient.put<Bookmark>(`/vault/bookmarks/${id}`, body).then((r) => r.data)

export const toggleFavorite = (id: string) =>
  apiClient.patch<Bookmark>(`/vault/bookmarks/${id}/favorite`).then((r) => r.data)

export const toggleArchive = (id: string) =>
  apiClient.patch<Bookmark>(`/vault/bookmarks/${id}/archive`).then((r) => r.data)

export const deleteBookmark = (id: string) =>
  apiClient.delete(`/vault/bookmarks/${id}`).then((r) => r.data)

export const trackClick = (id: string) =>
  apiClient.post(`/vault/bookmarks/${id}/click`).then((r) => r.data)

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const getDashboard = () =>
  apiClient.get<DashboardData>('/vault/dashboard').then((r) => r.data)
