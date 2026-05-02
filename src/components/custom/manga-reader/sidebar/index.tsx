import { Flag, MessageSquare, Pin, PinOff, X } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import { LayoutToggles } from './layout-toggles'
import { Stepper } from './stepper'
import { UploaderRow } from './uploader-row'
import type { ReaderSidebarProps } from './types'

export type { ChapterSummary, ReaderSidebarProps, SettingsShortcut } from './types'

export function ReaderSidebar(props: ReaderSidebarProps) {
  const {
    open,
    pinned,
    onPinToggle,
    onClose,
    seriesTitle,
    chapterTitle,
    pageIndex,
    pageCount,
    onPageChange,
    chapter,
    prevChapter,
    nextChapter,
    onChapterChange,
    uploaders,
    groupName,
    onReportChapter,
    onComment,
    onOpenSettings,
    handle,
  } = props

  if (!open) return null

  return (
    <aside
      className="pointer-events-auto z-30 flex h-full w-80 shrink-0 flex-col border-l border-border/60 bg-background text-sm"
      role="complementary"
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          <X />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
          onClick={onPinToggle}
        >
          {pinned ? <Pin /> : <PinOff />}
        </Button>
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-6">
        <div>
          <p className="text-base font-semibold text-primary">{seriesTitle}</p>
          <p className="text-sm text-muted-foreground">{chapterTitle}</p>
        </div>

        <Stepper
          label="Page"
          value={pageIndex + 1}
          min={1}
          max={Math.max(pageCount, 1)}
          onChange={(next) => onPageChange(Math.max(0, next - 1))}
        />

        <Stepper
          label="Chapter"
          display={`Chapter ${chapter.number}${chapter.title ? ` · ${chapter.title}` : ''}`}
          onPrev={prevChapter ? () => onChapterChange(prevChapter) : null}
          onNext={nextChapter ? () => onChapterChange(nextChapter) : null}
        />

        {onReportChapter && (
          <Button variant="secondary" size="sm" onClick={onReportChapter}>
            <Flag />
            Report Chapter
          </Button>
        )}

        <Button variant="secondary" size="sm" onClick={onComment}>
          <MessageSquare />
          Be the first to comment
        </Button>

        {(uploaders.length > 0 || groupName) && (
          <div>
            <p className="mb-1 text-xs font-medium text-foreground">
              Uploaded By
            </p>
            <div className="flex flex-col gap-1.5">
              {groupName && <UploaderRow icon="group" label={groupName} />}
              {uploaders.map((uploader) => (
                <UploaderRow
                  key={uploader.name}
                  icon="user"
                  label={uploader.name}
                  href={uploader.href}
                />
              ))}
            </div>
          </div>
        )}

        <Separator />

        <LayoutToggles handle={handle} onOpenSettings={onOpenSettings} />
      </div>
    </aside>
  )
}
