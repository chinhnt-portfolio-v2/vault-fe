import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link2, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getFaviconUrl } from '@/lib/utils'
import { useFolders } from '@/hooks/useFolders'
import { useCreateBookmark, useUpdateBookmark } from '@/hooks/useBookmarks'
import type { Bookmark, CreateBookmarkRequest } from '@/api/vault'

const bookmarkSchema = z.object({
  url: z.string().url('URL không hợp lệ'),
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  folderId: z.string().optional(),
  tags: z.string().optional(),
})

type BookmarkFormValues = z.infer<typeof bookmarkSchema>

interface AddBookmarkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editBookmark?: Bookmark | null
}

export function AddBookmarkDialog({ open, onOpenChange, editBookmark }: AddBookmarkDialogProps) {
  const { t } = useTranslation()
  const { data: folders = [] } = useFolders()
  const createBm = useCreateBookmark()
  const updateBm = useUpdateBookmark()

  const [urlInput, setUrlInput] = useState('')
  const [previewFavicon, setPreviewFavicon] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const isEditing = !!editBookmark

  const { register, handleSubmit, setValue, reset, watch, formState: { errors, isSubmitting } } = useForm<BookmarkFormValues>({
    resolver: zodResolver(bookmarkSchema),
    defaultValues: {
      url: '',
      title: '',
      description: '',
      folderId: '',
      tags: '',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (editBookmark) {
      setUrlInput(editBookmark.url)
      setPreviewFavicon(editBookmark.favicon || getFaviconUrl(editBookmark.url))
      setTags(editBookmark.tags || [])
      reset({
        url: editBookmark.url,
        title: editBookmark.title,
        description: editBookmark.description || '',
        folderId: editBookmark.folderId || '',
        tags: editBookmark.tags?.join(', ') || '',
      })
    } else {
      setUrlInput('')
      setPreviewFavicon('')
      setTags([])
      reset({ url: '', title: '', description: '', folderId: '', tags: '' })
    }
  }, [editBookmark, reset])

  // Auto-derive favicon from URL
  const handleUrlChange = (val: string) => {
    setUrlInput(val)
    try {
      setPreviewFavicon(getFaviconUrl(val))
    } catch { /* ignore */ }
  }

  // Tag management
  const addTag = (raw: string) => {
    const trimmed = raw.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag))

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const onSubmit = async (values: BookmarkFormValues) => {
    const payload: CreateBookmarkRequest = {
      url: values.url,
      title: values.title,
      description: values.description,
      folderId: values.folderId || undefined,
      favicon: previewFavicon || undefined,
      tags: tags.length > 0 ? tags : undefined,
    }

    try {
      if (isEditing && editBookmark) {
        await updateBm.mutateAsync({ id: editBookmark.id, ...payload })
      } else {
        await createBm.mutateAsync(payload)
      }
      onOpenChange(false)
      reset()
      setTags([])
      setUrlInput('')
      setPreviewFavicon('')
    } catch { /* error handled by query */ }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('bookmarks.editBookmark') : t('bookmarks.addBookmark')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Cập nhật thông tin đánh dấu.'
              : 'Lưu một đường dẫn mới vào kho của bạn.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          {/* URL — primary field */}
          <div className="space-y-1.5">
            <Label htmlFor="url">{t('bookmarks.url')} *</Label>
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Input
                id="url"
                placeholder="https://example.com"
                autoComplete="off"
                {...register('url')}
                value={urlInput}
                onChange={(e) => {
                  register('url').onChange(e)
                  handleUrlChange(e.target.value)
                }}
              />
              {previewFavicon && (
                <img
                  src={previewFavicon}
                  alt=""
                  className="w-5 h-5 rounded-sm flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
            </div>
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">{t('bookmarks.titleLabel')} *</Label>
            <Input
              id="title"
              placeholder="Tên trang web"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">{t('bookmarks.description')}</Label>
            <Input
              id="description"
              placeholder="Mô tả ngắn (tùy chọn)"
              {...register('description')}
            />
          </div>

          {/* Folder */}
          <div className="space-y-1.5">
            <Label htmlFor="folder">{t('bookmarks.folder')}</Label>
            <Select
              onValueChange={(val) => setValue('folderId', val === '__none__' ? '' : val)}
              value={watch('folderId') || '__none__'}
            >
              <SelectTrigger id="folder">
                <SelectValue placeholder={t('bookmarks.selectFolder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">{t('bookmarks.noFolder')}</SelectItem>
                {folders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>{t('bookmarks.tags')}</Label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 border border-border rounded-md bg-card focus-within:ring-2 focus-within:ring-brand">
              {tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 hover:text-destructive"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => tagInput && addTag(tagInput)}
                placeholder={tags.length === 0 ? 'react, typescript, ...' : ''}
                className="flex-1 min-w-[100px] text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Nhấn Enter hoặc dấu phẩy để thêm nhãn
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="accent"
              disabled={isSubmitting || createBm.isPending || updateBm.isPending}
            >
              {isSubmitting || createBm.isPending || updateBm.isPending
                ? t('common.loading')
                : t('common.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
