import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Folder, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useFolders, useCreateFolder, useUpdateFolder, useDeleteFolder } from '@/hooks/useFolders'
import type { BookmarkFolder } from '@/api/vault'

const SPRING_GENTLE = { type: 'spring' as const, stiffness: 300, damping: 30 }

const FOLDER_COLORS = [
  '#7C3AED', '#EC4899', '#EF4444', '#F59E0B',
  '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6',
]

interface FolderFormState {
  name: string
  color: string
}

function FolderFormDialog({
  open,
  onOpenChange,
  folder,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder?: BookmarkFolder | null
}) {
  const { t } = useTranslation()
  const isEditing = !!folder
  const [form, setForm] = useState<FolderFormState>({
    name: folder?.name ?? '',
    color: folder?.color ?? FOLDER_COLORS[0],
  })
  const createFolder = useCreateFolder()
  const updateFolder = useUpdateFolder()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEditing && folder) {
        await updateFolder.mutateAsync({ id: folder.id, name: form.name, color: form.color })
      } else {
        await createFolder.mutateAsync({ name: form.name, color: form.color })
      }
      onOpenChange(false)
      setForm({ name: '', color: FOLDER_COLORS[0] })
    } catch { /* handled by query */ }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t('folders.edit') : t('folders.create')}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Cập nhật thư mục.' : 'Tạo thư mục mới để sắp xếp đánh dấu.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="folder-name">{t('folders.name')}</Label>
            <Input
              id="folder-name"
              placeholder="Ví dụ: Công việc, Cá nhân"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>{t('folders.color')}</Label>
            <div className="flex gap-2 flex-wrap">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-brand' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Chọn màu ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="accent"
              disabled={!form.name.trim() || createFolder.isPending || updateFolder.isPending}
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function FoldersPage() {
  const { t } = useTranslation()
  const { data: folders = [], isLoading } = useFolders()
  const deleteFolder = useDeleteFolder()
  const [editingFolder, setEditingFolder] = useState<BookmarkFolder | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const handleDelete = (folder: BookmarkFolder) => {
    if (confirm(t('folders.confirmDelete', { name: folder.name }))) {
      deleteFolder.mutate(folder.id)
    }
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('folders.title')}</h1>
        <Button variant="accent" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          {t('folders.create')}
        </Button>
      </div>

      {/* Folder list */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
        </div>
      ) : folders.length === 0 ? (
        <div className="card p-12 text-center">
          <Folder className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{t('folders.noFolders')}</p>
          <Button variant="accent" className="mt-3" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" />
            {t('folders.create')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {folders.map((folder: BookmarkFolder) => (
            <motion.div
              key={folder.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={SPRING_GENTLE}
              className="card p-4 flex items-center gap-4 group"
            >
              {/* Color dot */}
              <span
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: folder.color || '#7C3AED' }}
              />

              {/* Name */}
              <span className="flex-1 font-medium text-foreground truncate">{folder.name}</span>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingFolder(folder)}
                  className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={t('folders.edit')}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(folder)}
                  className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={t('folders.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <FolderFormDialog open={showCreate} onOpenChange={setShowCreate} />

      {/* Edit dialog */}
      <FolderFormDialog
        open={!!editingFolder}
        onOpenChange={(open) => { if (!open) setEditingFolder(null) }}
        folder={editingFolder}
      />
    </div>
  )
}
