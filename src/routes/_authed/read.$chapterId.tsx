import * as React from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'

import { MangaReader } from '#/components/custom/manga-reader'
import type { ChapterSummary, ReaderChapter } from '#/components/custom/manga-reader'
import {
  buildReaderChapter,
  buildSyntheticReaderChapter,
  getFixtureChapter,
} from '#/lib/manga-fixtures'

export const Route = createFileRoute('/_authed/read/$chapterId')({
  validateSearch: (
    search,
  ): {
    manga_id?: string
    manga?: string
    addon_id?: string
    chapter?: number
    volume?: number
    title?: string
    pages?: number
  } => ({
    manga_id: typeof search.manga_id === 'string' ? search.manga_id : undefined,
    manga: typeof search.manga === 'string' ? search.manga : undefined,
    addon_id: typeof search.addon_id === 'string' ? search.addon_id : undefined,
    chapter:
      typeof search.chapter === 'number' && Number.isFinite(search.chapter)
        ? search.chapter
        : undefined,
    volume:
      typeof search.volume === 'number' && Number.isFinite(search.volume)
        ? search.volume
        : undefined,
    title: typeof search.title === 'string' ? search.title : undefined,
    pages:
      typeof search.pages === 'number' && Number.isFinite(search.pages)
        ? search.pages
        : undefined,
  }),
  component: ReadPage,
})

function ReadPage() {
  const params = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const router = useRouter()

  const initialChapter = React.useMemo(
    () => loadChapter(params.chapterId, search),
    [params.chapterId, search],
  )

  const [chapter, setChapter] = React.useState<ReaderChapter>(initialChapter)

  React.useEffect(() => {
    setChapter(initialChapter)
  }, [initialChapter])

  const handleSelectChapter = (next: ChapterSummary) => {
    void navigate({
      to: '/read/$chapterId',
      params: { chapterId: next.id },
      search: {
        manga_id: search.manga_id,
        manga: search.manga,
        addon_id: search.addon_id,
        chapter: next.number,
        volume: next.volume ?? undefined,
        title: next.title ?? undefined,
        pages: search.pages,
      },
      replace: false,
    })
  }

  const handleClose = () => {
    if (router.history.canGoBack()) {
      router.history.back()
      return
    }
    if (search.manga_id) {
      void navigate({
        to: '/show/$id',
        params: { id: search.manga_id },
        search: { addon_id: search.addon_id },
      })
      return
    }
    void navigate({ to: '/manga' })
  }

  const seriesTitle =
    search.manga ??
    chapter.title ??
    'Manga'

  const fixture = getFixtureChapter(params.chapterId)

  return (
    <MangaReader
      seriesTitle={seriesTitle}
      groupName={fixture?.manga.groupName ?? 'Typenx Sample Scans'}
      uploaders={fixture?.manga.uploaders ?? [{ name: 'Typenx' }]}
      chapter={chapter}
      onSelectChapter={handleSelectChapter}
      onClose={handleClose}
    />
  )
}

function loadChapter(
  chapterId: string,
  search: {
    chapter?: number
    volume?: number
    title?: string
    pages?: number
  },
): ReaderChapter {
  const fixture = getFixtureChapter(chapterId)
  if (fixture) return buildReaderChapter(fixture.manga, fixture.chapter)
  return buildSyntheticReaderChapter({
    chapterId,
    number: search.chapter,
    volume: search.volume ?? null,
    title: search.title ?? null,
    pageCount: search.pages,
  })
}
