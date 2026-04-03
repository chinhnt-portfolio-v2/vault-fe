import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getBookmarks,
  getBookmarksByFolder,
  getFavoriteBookmarks,
  searchBookmarks,
  createBookmark,
  updateBookmark,
  toggleFavorite,
  toggleArchive,
  deleteBookmark,
  trackClick,
  type CreateBookmarkRequest,
  type UpdateBookmarkRequest,
  type Bookmark,
  type PagedResponse,
} from '@/api/vault'

export function useBookmarks(page = 0, size = 30) {
  return useQuery<PagedResponse<Bookmark>>({
    queryKey: ['bookmarks', 'list', page, size],
    queryFn: () => getBookmarks(page, size),
  })
}

export function useBookmarksByFolder(folderId: string | null) {
  return useQuery<Bookmark[]>({
    queryKey: ['bookmarks', 'folder', folderId],
    queryFn: () => getBookmarksByFolder(folderId!),
    enabled: !!folderId,
  })
}

export function useFavoriteBookmarks() {
  return useQuery<Bookmark[]>({
    queryKey: ['bookmarks', 'favorites'],
    queryFn: getFavoriteBookmarks,
  })
}

export function useSearchBookmarks(q: string, page = 0, size = 30) {
  return useQuery<PagedResponse<Bookmark>>({
    queryKey: ['bookmarks', 'search', q, page, size],
    queryFn: () => searchBookmarks(q, page, size),
    enabled: q.trim().length > 0,
  })
}

export function useCreateBookmark() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateBookmarkRequest) => createBookmark(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookmarks'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateBookmark() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & UpdateBookmarkRequest) =>
      updateBookmark(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookmarks'] }),
  })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (_id: string) => toggleFavorite(_id),
    onMutate: async (_id) => {
      await qc.cancelQueries({ queryKey: ['bookmarks'] })
      const snapshots = {
        list: qc.getQueriesData<Bookmark[]>({ queryKey: ['bookmarks'] }),
        favs: qc.getQueriesData<Bookmark[]>({ queryKey: ['bookmarks', 'favorites'] }),
      }
      qc.setQueriesData<Bookmark>({ queryKey: ['bookmarks'] }, (old) =>
        old ? { ...old, isFavorite: !old.isFavorite } : old
      )
      return { snapshots }
    },
    onError: (_err, _id, context) => {
      if (context?.snapshots.list) {
        context.snapshots.list.forEach(([key, data]) => qc.setQueryData(key, data))
      }
      if (context?.snapshots.favs) {
        context.snapshots.favs.forEach(([key, data]) => qc.setQueryData(key, data))
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })
}

export function useToggleArchive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => toggleArchive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookmarks'] }),
  })
}

export function useDeleteBookmark() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBookmark(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookmarks'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useTrackClick() {
  return useMutation({
    mutationFn: (id: string) => trackClick(id),
  })
}
