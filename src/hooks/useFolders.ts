import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  type CreateFolderRequest,
  type UpdateFolderRequest,
  type BookmarkFolder,
} from '@/api/vault'

export function useFolders() {
  return useQuery<BookmarkFolder[]>({
    queryKey: ['folders'],
    queryFn: getFolders,
    staleTime: 30_000,
  })
}

export function useCreateFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateFolderRequest) => createFolder(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['folders'] }),
  })
}

export function useUpdateFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & UpdateFolderRequest) =>
      updateFolder(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['folders'] }),
  })
}

export function useDeleteFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteFolder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['folders'] }),
  })
}
