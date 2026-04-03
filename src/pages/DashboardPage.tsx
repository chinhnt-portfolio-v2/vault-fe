import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bookmark, Folder, Star, Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BookmarkCard } from '@/components/bookmark-card'
import { AddBookmarkDialog } from '@/components/add-bookmark-dialog'
import { useDashboard } from '@/hooks/useDashboard'

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: number
  href: string
}) {
  return (
    <Link
      to={href}
      className="card p-4 flex items-center gap-4 hover:border-brand/30 hover:shadow-brand-glow transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { data: dash, isLoading } = useDashboard()
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('appName')}</p>
        </div>
        <Button variant="accent" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" />
          {t('bookmarks.addBookmark')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Bookmark className="w-5 h-5" />}
          label={t('dashboard.totalBookmarks')}
          value={dash?.totalBookmarks ?? 0}
          href="/bookmarks"
        />
        <StatCard
          icon={<Folder className="w-5 h-5" />}
          label={t('dashboard.totalFolders')}
          value={dash?.totalFolders ?? 0}
          href="/folders"
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          label={t('dashboard.totalFavorites')}
          value={dash?.totalFavorites ?? 0}
          href="/bookmarks/favorites"
        />
      </div>

      {/* Tag cloud */}
      {dash?.allTags && dash.allTags.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3">{t('dashboard.tagCloud')}</h2>
          <div className="flex flex-wrap gap-2">
            {dash.allTags.map((tag) => (
              <Link
                key={tag}
                to={`/bookmarks?tag=${encodeURIComponent(tag)}`}
                className="tag-chip hover:opacity-80 transition-opacity"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent bookmarks */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">{t('dashboard.recentBookmarks')}</h2>
          {dash?.recentBookmarks && dash.recentBookmarks.length > 0 && (
            <Link
              to="/bookmarks"
              className="text-xs text-brand flex items-center gap-1 hover:underline"
            >
              {t('common.noData') === 'Không có dữ liệu' ? 'Xem tất cả' : 'View all'}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-36 rounded-lg" />
            ))}
          </div>
        ) : dash?.recentBookmarks && dash.recentBookmarks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dash.recentBookmarks.slice(0, 8).map((bm) => (
              <BookmarkCard key={bm.id} bookmark={bm} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-sm text-muted-foreground">{t('dashboard.noBookmarks')}</p>
            <Button variant="accent" className="mt-3" onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4" />
              {t('bookmarks.addBookmark')}
            </Button>
          </div>
        )}
      </section>

      <AddBookmarkDialog open={showAdd} onOpenChange={setShowAdd} />
    </div>
  )
}
