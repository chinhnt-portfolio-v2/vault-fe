import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, StarOff, Archive, ExternalLink, MousePointerClick } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn, getFaviconUrl, getDomain, formatCount } from '@/lib/utils'
import { useToggleFavorite, useToggleArchive, useDeleteBookmark, useTrackClick } from '@/hooks/useBookmarks'
import type { Bookmark } from '@/api/vault'

const SPRING_GENTLE = { type: 'spring' as const, stiffness: 300, damping: 30 }

interface BookmarkCardProps {
  bookmark: Bookmark
  onEdit?: (b: Bookmark) => void
}

export function BookmarkCard({ bookmark, onEdit }: BookmarkCardProps) {
  const { t } = useTranslation()
  const toggleFav = useToggleFavorite()
  const toggleArch = useToggleArchive()
  const deleteBm = useDeleteBookmark()
  const trackClick = useTrackClick()
  const [imgError, setImgError] = useState(false)

  const faviconSrc = bookmark.favicon || getFaviconUrl(bookmark.url)
  const domain = getDomain(bookmark.url)

  const handleClick = () => {
    trackClick.mutate(bookmark.id)
    window.open(bookmark.url, '_blank', 'noopener,noreferrer')
  }

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFav.mutate(bookmark.id)
  }

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleArch.mutate(bookmark.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(t('bookmarks.confirmDelete'))) {
      deleteBm.mutate(bookmark.id)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={SPRING_GENTLE}
      whileHover={{ y: -2 }}
      onClick={handleClick}
      className={cn(
        'card group cursor-pointer p-4 flex flex-col gap-3 select-none',
        'hover:border-brand/40 hover:shadow-brand-glow-hover transition-shadow'
      )}
    >
      {/* Header row: favicon + domain + external link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {!imgError && faviconSrc ? (
            <img
              src={faviconSrc}
              alt=""
              className="favicon-img flex-shrink-0"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-5 h-5 rounded-sm bg-secondary flex items-center justify-center flex-shrink-0">
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </div>
          )}
          <span className="text-xs text-muted-foreground truncate">{domain}</span>
        </div>
        <ExternalLink
          className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          aria-hidden="true"
        />
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">
        {bookmark.title || bookmark.url}
      </h3>

      {/* Description */}
      {bookmark.description && (
        <p className="text-xs text-muted-foreground line-clamp-1">{bookmark.description}</p>
      )}

      {/* Tags */}
      {bookmark.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {bookmark.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
          {bookmark.tags.length > 4 && (
            <span className="text-xs text-muted-foreground">+{bookmark.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-border/50">
        <div className="flex items-center gap-1">
          {/* Favorite */}
          <button
            onClick={handleFav}
            aria-label={bookmark.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
            className={cn(
              'p-1 rounded transition-colors',
              bookmark.isFavorite
                ? 'text-yellow-500'
                : 'text-muted-foreground hover:text-yellow-500 opacity-0 group-hover:opacity-100'
            )}
          >
            {bookmark.isFavorite ? <StarOff className="w-3.5 h-3.5" fill="currentColor" /> : <Star className="w-3.5 h-3.5" />}
          </button>

          {/* Archive */}
          <button
            onClick={handleArchive}
            aria-label={bookmark.isArchived ? 'Bỏ lưu trữ' : 'Lưu trữ'}
            className="p-1 rounded text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>

          {/* Edit */}
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(bookmark) }}
              aria-label="Sửa"
              className="p-1 rounded text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-colors text-xs"
            >
              ✎
            </button>
          )}

          {/* Delete */}
          <button
            onClick={handleDelete}
            aria-label="Xóa"
            className="p-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Click count */}
        {bookmark.clickCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MousePointerClick className="w-3 h-3" />
            <span>{formatCount(bookmark.clickCount)}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
