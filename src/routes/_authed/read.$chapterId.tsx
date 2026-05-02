import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'

import { withAuthRedirect } from '#/lib/loaders'
import { typenx } from '#/sdk'
import type { AnimeMetadata, EpisodeMetadata, MangaPageImage } from '#/sdk'
import { MangaReader } from '#/components/custom/manga-reader'
import type {
  ChapterSummary,
  ReaderChapter,
  ReaderPage,
} from '#/components/custom/manga-reader'
import {
  buildReaderChapter,
  buildSyntheticReaderChapter,
  getFixtureChapter,
} from '#/lib/manga-fixtures'

type ReaderSearch = {
  manga_id?: string
  manga?: string
  addon_id?: string
  chapter?: number
  volume?: number
  title?: string
  pages?: number
}

export const Route = createFileRoute('/_authed/read/$chapterId')({
  validateSearch: (search): ReaderSearch => ({
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
  loader: ({ params, location }) =>
    withAuthRedirect(
      () => loadReaderChapter(params.chapterId, location.search as ReaderSearch),
      location.href,
    ),
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  component: ReadPage,
})

function ReadPage() {
  const params = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const router = useRouter()
  const chapter = Route.useLoaderData()

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

  const seriesTitle = search.manga ?? chapter.title ?? 'Manga'
  const fixture = getFixtureChapter(params.chapterId)

  return (
    <MangaReader
      seriesTitle={seriesTitle}
      groupName={fixture?.manga.groupName ?? 'Typenx'}
      uploaders={fixture?.manga.uploaders ?? [{ name: 'Typenx' }]}
      chapter={chapter}
      onSelectChapter={handleSelectChapter}
      onClose={handleClose}
    />
  )
}

async function loadReaderChapter(
  chapterId: string,
  search: ReaderSearch,
): Promise<ReaderChapter> {
  const fixture = getFixtureChapter(chapterId)
  if (fixture) return buildReaderChapter(fixture.manga, fixture.chapter)

  const fallback = (): ReaderChapter =>
    buildSyntheticReaderChapter({
      chapterId,
      number: search.chapter,
      volume: search.volume ?? null,
      title: search.title ?? null,
      pageCount: search.pages,
    })

  if (!search.manga_id || (search.chapter == null && !chapterId)) {
    return fallback()
  }

  try {
    const addons = await typenx.addons.list()
    const pagesAddon = addons.find(
      (addon) =>
        addon.enabled && addon.manifest?.resources.includes('manga_pages'),
    )
    if (!pagesAddon) return fallback()

    const [pagesResponse, metadata] = await Promise.all([
      typenx.catalog.mangaPages({
        addon_id: pagesAddon.id,
        manga_id: search.manga_id,
        manga_title: search.manga ?? null,
        chapter_id: chapterId,
        chapter_number: search.chapter ?? null,
      }),
      search.addon_id
        ? typenx.catalog
            .manga(search.manga_id, search.addon_id)
            .catch(() => null)
        : Promise.resolve(null),
    ])

    if (pagesResponse.pages.length === 0) return fallback()

    return buildReaderChapterFromResponse({
      chapterId,
      search,
      pages: pagesResponse.pages,
      chapterNumber:
        pagesResponse.chapter_number ?? search.chapter ?? 1,
      metadata,
    })
  } catch {
    return fallback()
  }
}

function buildReaderChapterFromResponse(input: {
  chapterId: string
  search: ReaderSearch
  pages: MangaPageImage[]
  chapterNumber: number
  metadata: AnimeMetadata | null
}): ReaderChapter {
  const summaries = (input.metadata?.episodes ?? [])
    .map(toChapterSummary)
    .sort((a, b) => a.number - b.number)
  const currentIndex = summaries.findIndex(
    (summary) => summary.id === input.chapterId,
  )
  const prev = currentIndex > 0 ? summaries[currentIndex - 1] : null
  const next =
    currentIndex >= 0 && currentIndex < summaries.length - 1
      ? summaries[currentIndex + 1]
      : null

  return {
    id: input.chapterId,
    number: input.chapterNumber,
    volume: input.search.volume ?? null,
    title: input.search.title ?? null,
    pages: input.pages.map(toReaderPage),
    prev,
    next,
    chapters: summaries,
  }
}

function toReaderPage(page: MangaPageImage): ReaderPage {
  return {
    number: page.index,
    src: page.url,
    width: page.width ?? undefined,
    height: page.height ?? undefined,
  }
}

function toChapterSummary(episode: EpisodeMetadata): ChapterSummary {
  return {
    id: episode.id,
    number: episode.number,
    volume: episode.season_number ?? episode.season ?? null,
    title: episode.title,
  }
}
