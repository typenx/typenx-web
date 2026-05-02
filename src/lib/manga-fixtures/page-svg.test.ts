import { describe, expect, it } from 'vitest'

import { escapeXml, pageSvgDataUrl, paletteForPage } from './page-svg'

describe('escapeXml', () => {
  it('escapes the five XML metacharacters', () => {
    expect(escapeXml('<a & "b">\'')).toBe(
      '&lt;a &amp; &quot;b&quot;&gt;&apos;',
    )
  })

  it('returns plain text untouched', () => {
    expect(escapeXml('Hello World')).toBe('Hello World')
  })
})

describe('paletteForPage', () => {
  it('alternates palettes by even/odd page', () => {
    const a = paletteForPage(0)
    const b = paletteForPage(1)
    expect(a).not.toEqual(b)
    expect(paletteForPage(2)).toEqual(a)
    expect(paletteForPage(3)).toEqual(b)
  })
})

describe('pageSvgDataUrl', () => {
  it('returns a percent-encoded SVG data URL', () => {
    const url = pageSvgDataUrl({
      manga: 'Demo',
      chapter: 1,
      title: null,
      page: 1,
      total: 5,
    })
    expect(url.startsWith('data:image/svg+xml;utf8,')).toBe(true)
    expect(url).toContain(encodeURIComponent('Demo'))
  })

  it('escapes HTML-unsafe characters from the title', () => {
    const url = pageSvgDataUrl({
      manga: 'A & B',
      chapter: 1,
      title: '<script>',
      page: 1,
      total: 1,
    })
    const decoded = decodeURIComponent(url.split(',')[1])
    expect(decoded).not.toContain('<script>')
    expect(decoded).toContain('&lt;script&gt;')
    expect(decoded).toContain('A &amp; B')
  })
})
