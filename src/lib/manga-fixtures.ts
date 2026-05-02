import type { ChapterSummary, ReaderChapter, ReaderPage } from '#/components/custom/manga-reader'

export type FixtureManga = {
  id: string
  title: string
  groupName: string
  uploaders: Array<{ name: string; href?: string }>
  chapters: Array<FixtureChapter>
}

export type FixtureChapter = {
  id: string
  number: number
  volume: number | null
  title: string | null
  pageCount: number
}

const SAMPLE_MANGA: FixtureManga = {
  id: 'rekkyou-sensen',
  title: 'Rekkyou Sensen',
  groupName: 'Wartime Scans',
  uploaders: [{ name: 'V-anish' }],
  chapters: [
    { id: 'rekkyou-26', number: 26, volume: 7, title: 'Eve of the storm', pageCount: 22 },
    { id: 'rekkyou-27', number: 27, volume: 7, title: 'First strike', pageCount: 24 },
    { id: 'rekkyou-28', number: 28, volume: 8, title: 'Counter offensive', pageCount: 25 },
    { id: 'rekkyou-29', number: 29, volume: 8, title: 'Aftermath', pageCount: 26 },
    {
      id: 'rekkyou-30',
      number: 30,
      volume: 8,
      title: 'Grandes e Pequenos',
      pageCount: 27,
    },
    { id: 'rekkyou-31', number: 31, volume: 8, title: 'Reset', pageCount: 23 },
    { id: 'rekkyou-32', number: 32, volume: 9, title: 'New rivals', pageCount: 22 },
  ],
}

const FIXTURE_LIST: Array<FixtureManga> = [SAMPLE_MANGA]

export function listFixtureManga(): Array<FixtureManga> {
  return FIXTURE_LIST
}

export function getFixtureManga(id: string): FixtureManga | null {
  return FIXTURE_LIST.find((m) => m.id === id) ?? null
}

export function getFixtureChapter(chapterId: string): {
  manga: FixtureManga
  chapter: FixtureChapter
} | null {
  for (const manga of FIXTURE_LIST) {
    const chapter = manga.chapters.find((c) => c.id === chapterId)
    if (chapter) return { manga, chapter }
  }
  return null
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

function toSummary(chapter: FixtureChapter): ChapterSummary {
  return {
    id: chapter.id,
    number: chapter.number,
    volume: chapter.volume,
    title: chapter.title,
  }
}

function buildPages(
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

function pageSvgDataUrl(args: {
  manga: string
  chapter: number
  title: string | null
  page: number
  total: number
}): string {
  const accent = paletteForPage(args.page)
  const safeTitle = escapeXml(args.title ?? '')
  const safeManga = escapeXml(args.manga)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${accent.bg}" />
      <stop offset="100%" stop-color="${accent.bgEnd}" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${accent.gridStroke}" stroke-width="0.6" />
    </pattern>
  </defs>
  <rect width="800" height="1200" fill="url(#bg)" />
  <rect x="40" y="40" width="720" height="1120" fill="${accent.panel}" stroke="${accent.border}" stroke-width="3" />
  <rect x="40" y="40" width="720" height="1120" fill="url(#grid)" opacity="0.35" />
  <rect x="40" y="40" width="720" height="120" fill="${accent.headerFill}" />
  <text x="64" y="118" font-family="Inter, system-ui, sans-serif" font-size="44" font-weight="700" fill="${accent.text}">${safeManga}</text>
  <text x="64" y="158" font-family="Inter, system-ui, sans-serif" font-size="24" fill="${accent.subtext}">Chapter ${args.chapter}${safeTitle ? ` · ${safeTitle}` : ''}</text>
  <g font-family="Inter, system-ui, sans-serif" fill="${accent.text}">
    <text x="400" y="600" font-size="220" font-weight="800" text-anchor="middle">${args.page}</text>
    <text x="400" y="680" font-size="32" text-anchor="middle" fill="${accent.subtext}">Page ${args.page} of ${args.total}</text>
    <text x="400" y="1080" font-size="18" text-anchor="middle" fill="${accent.subtext}">typenx fixture page</text>
  </g>
  <g stroke="${accent.border}" stroke-width="3" fill="none" opacity="0.7">
    <rect x="120" y="780" width="240" height="200" rx="6" />
    <rect x="440" y="780" width="240" height="200" rx="6" />
    <line x1="120" y1="780" x2="360" y2="980" />
    <line x1="360" y1="780" x2="120" y2="980" />
    <line x1="440" y1="780" x2="680" y2="980" />
    <line x1="680" y1="780" x2="440" y2="980" />
  </g>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function paletteForPage(page: number) {
  const palettes = [
    {
      bg: '#101319',
      bgEnd: '#1a1f2b',
      panel: '#1f2230',
      border: '#3b4051',
      headerFill: '#252a38',
      text: '#f5f7fb',
      subtext: '#a1a8bb',
      gridStroke: '#7a83a0',
    },
    {
      bg: '#0f0f10',
      bgEnd: '#1e1c1f',
      panel: '#221f23',
      border: '#574a5b',
      headerFill: '#2c282c',
      text: '#f9eff7',
      subtext: '#b39bb0',
      gridStroke: '#8a7387',
    },
  ]
  return palettes[page % palettes.length]
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}
