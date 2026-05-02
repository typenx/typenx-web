import type {
  ChapterSummary,
  ReaderChapter,
  ReaderPage,
} from '#/components/custom/manga-reader'

import { pageSvgDataUrl } from './page-svg'
import type { FixtureChapter, FixtureManga } from './types'

export function toSummary(chapter: FixtureChapter): ChapterSummary {
  return {
    id: chapter.id,
    number: chapter.number,
    volume: chapter.volume,
    title: chapter.title,
  }
}

export function buildPages(
  manga: FixtureManga,
  chapter: FixtureChapter,
): Array<ReaderPage> {
  const total = chapter.pageCount
  return Array.from({ length: total }, (_, i) => {
    const number = i + 1
    return {
      number,
      src: pageSvgDataUrl({
        manga: manga.title,
        chapter: chapter.number,
        title: chapter.title,
        page: number,
        total,
      }),
      width: 800,
      height: 1200,
    }
  })
}

export function buildReaderChapter(
  manga: FixtureManga,
  chapter: FixtureChapter,
): ReaderChapter {
  const orderedChapters = [...manga.chapters].sort(
    (a, b) => a.number - b.number,
  )
  const index = orderedChapters.findIndex((c) => c.id === chapter.id)
  const prev = index > 0 ? toSummary(orderedChapters[index - 1]) : null
  const next =
    index >= 0 && index < orderedChapters.length - 1
      ? toSummary(orderedChapters[index + 1])
      : null

  return {
    id: chapter.id,
    number: chapter.number,
    volume: chapter.volume,
    title: chapter.title,
    pages: buildPages(manga, chapter),
    prev,
    next,
    chapters: orderedChapters.map(toSummary),
  }
}

export function buildSyntheticReaderChapter(input: {
  chapterId: string
  number?: number
  volume?: number | null
  title?: string | null
  pageCount?: number
}): ReaderChapter {
  const number = input.number ?? 1
  const volume = input.volume ?? null
  const title = input.title ?? null
  const pageCount = Math.max(1, Math.min(input.pageCount ?? 24, 60))
  const surrogateChapter: FixtureChapter = {
    id: input.chapterId,
    number,
    volume,
    title,
    pageCount,
  }
  const surrogateManga: FixtureManga = {
    id: 'synthetic',
    title: title ?? `Chapter ${number}`,
    groupName: 'Typenx Sample Scans',
    uploaders: [{ name: 'Typenx' }],
    chapters: [surrogateChapter],
  }
  return buildReaderChapter(surrogateManga, surrogateChapter)
}
