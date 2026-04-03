import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, Star, Folder, Inbox } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useFolders } from '@/hooks/useFolders'
import type { BookmarkFolder } from '@/api/vault'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
}

const NAV_ITEMS = (t: ReturnType<typeof useTranslation>['t']): NavItem[] => [
  { id: 'all', label: t('bookmarks.all'), icon: <LayoutGrid className="w-4 h-4" />, href: '/bookmarks' },
  { id: 'favorites', label: t('bookmarks.favorites'), icon: <Star className="w-4 h-4" />, href: '/bookmarks/favorites' },
  { id: 'unfiled', label: t('bookmarks.unfiled'), icon: <Inbox className="w-4 h-4" />, href: '/bookmarks/unfiled' },
]

function FolderColorDot({ color }: { color: string }) {
  return (
    <span
      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ backgroundColor: color || '#7C3AED' }}
      aria-hidden="true"
    />
  )
}

interface FolderTreeProps {
  onFolderClick?: (folderId: string | null) => void
  selectedFolderId?: string | null
}

export function FolderTree({ onFolderClick, selectedFolderId }: FolderTreeProps) {
  const { t } = useTranslation()
  const { data: folders = [], isLoading } = useFolders()
  const location = useLocation()

  const navItems = NAV_ITEMS(t)

  const isActive = (href: string) => location.pathname === href

  return (
    <nav aria-label="Điều hướng bộ sưu tập" className="flex flex-col gap-0.5">
      {/* Main nav items */}
      {navItems.map((item) => (
        <Link
          key={item.id}
          to={item.href}
          onClick={() => onFolderClick?.(null)}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
            'hover:bg-secondary',
            isActive(item.href)
              ? 'bg-brand/10 text-brand font-medium'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span className="flex-shrink-0" aria-hidden="true">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}

      {/* Divider */}
      <div className="my-2 border-t border-border" />

      {/* Folders header */}
      <div className="px-3 py-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t('folders.title')}
        </span>
      </div>

      {/* Folder list */}
      {isLoading ? (
        <div className="flex flex-col gap-1.5 px-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-8 rounded-md" />
          ))}
        </div>
      ) : folders.length === 0 ? (
        <p className="px-3 text-xs text-muted-foreground">{t('folders.noFolders')}</p>
      ) : (
        folders.map((folder: BookmarkFolder) => (
          <Link
            key={folder.id}
            to={`/bookmarks/folder/${folder.id}`}
            onClick={() => onFolderClick?.(folder.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
              'hover:bg-secondary',
              selectedFolderId === folder.id
                ? 'bg-brand/10 text-brand font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <FolderColorDot color={folder.color} />
            <span className="truncate">{folder.name}</span>
          </Link>
        ))
      )}

      {/* Manage folders link */}
      <div className="mt-2 px-3">
        <Link
          to="/folders"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Folder className="w-3.5 h-3.5" />
          <span>{t('folders.title')}</span>
        </Link>
      </div>
    </nav>
  )
}
