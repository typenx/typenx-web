export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export type PagePalette = {
  bg: string
  bgEnd: string
  panel: string
  border: string
  headerFill: string
  text: string
  subtext: string
  gridStroke: string
}

const PALETTES: Array<PagePalette> = [
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

export function paletteForPage(page: number): PagePalette {
  return PALETTES[page % PALETTES.length]
}

export function pageSvgDataUrl(args: {
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
