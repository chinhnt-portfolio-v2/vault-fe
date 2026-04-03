import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BookmarkCard } from '@/components/bookmark-card'
import { FolderTree } from '@/components/folder-tree'
import { AddBookmarkDialog } from '@/components/add-bookmark-dialog'
import { useBookmarks, useBookmarksByFolder, useFavoriteBookmarks, useSearchBookmarks } from '@/hooks/useBookmarks'
import { useSearch } from '@/hooks/useSearch'
import type { Bookmark } from '@/api/vault'

export default function BookmarksPage() {
  const { t } = useTranslation()
  const { folderId } = useParams<{ folderId?: string }>()
  const location = useLocation()
  const { query, setQuery, debounced } = useSearch()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editBookmark, setEditBookmark] = useState<Bookmark | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(folderId ?? null)

  // Derive view mode from URL path
  const path = location.pathname
  const viewMode: 'all' | 'favorites' | 'folder' | 'unfiled' =
    path.includes('/favorites') ? 'favorites'
    : path.includes('/unfiled') ? 'unfiled'
    : path.includes('/folder/') ? 'folder'
    : 'all'

  // All bookmarks paginated
  const { data: allData, isLoading: allLoading } = useBookmarks(0, 30)
  // By folder
  const { data: folderData, isLoading: folderLoading } = useBookmarksByFolder(
    viewMode === 'folder' ? (folderId ?? selectedFolder) : null
  )
  // Favorites
  const { data: favData, isLoading: favLoading } = useFavoriteBookmarks()
  // Search
  const { data: searchData, isLoading: searchLoading } = useSearchBookmarks(debounced)

  // Cmd/Ctrl+K → focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const isSearching = debounced.trim().length > 0

  const isLoading = isSearching
    ? searchLoading
    : viewMode === 'favorites'
    ? favLoading
    : viewMode === 'folder'
    ? folderLoading
    : allLoading

  const bookmarks: Bookmark[] = isSearching
    ? searchData?.content ?? []
    : viewMode === 'favorites'
    ? favData ?? []
    : viewMode === 'folder'
    ? folderData ?? []
    : allData?.content ?? []

  const pageTitle = viewMode === 'favorites'
    ? t('bookmarks.favorites')
    : folderId
    ? t('folders.title')
    : t('bookmarks.all')

  return (
    <div className="flex gap-5 min-h-screen pb-20">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 hidden md:block">
        <div className="sticky top-20">
          <FolderTree
            selectedFolderId={folderId ?? selectedFolder}
            onFolderClick={setSelectedFolder}
          />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-bold text-foreground flex-1">{pageTitle}</h1>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('bookmarks.searchPlaceholder')}
              className="pl-9 w-48"
              aria-label={t('bookmarks.searchPlaceholder')}
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hidden sm:block pointer-events-none">
              ⌘K
            </kbd>
          </div>
          <Button variant="accent" size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('bookmarks.addBookmark')}</span>
          </Button>
        </div>

        {/* Bookmark grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-36 rounded-lg" />
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-muted-foreground">{t('bookmarks.noResults')}</p>
            {!isSearching && (
              <Button variant="accent" className="mt-3" onClick={() => setShowAdd(true)}>
                <Plus className="w-4 h-4" />
                {t('bookmarks.addBookmark')}
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {bookmarks.map((bm) => (
              <BookmarkCard
                key={bm.id}
                bookmark={bm}
                onEdit={(b) => setEditBookmark(b)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Add/Edit dialog */}
      <AddBookmarkDialog
        open={showAdd || !!editBookmark}
        onOpenChange={(open) => {
          if (!open) {
            setShowAdd(false)
            setEditBookmark(null)
          }
        }}
        editBookmark={editBookmark}
      />
    </div>
  )
}
