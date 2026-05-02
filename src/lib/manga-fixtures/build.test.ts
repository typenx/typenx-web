import { describe, expect, it } from 'vitest'

import {
  buildPages,
  buildReaderChapter,
  buildSyntheticReaderChapter,
  toSummary,
} from './build'
import type { FixtureChapter, FixtureManga } from './types'

const sampleManga: FixtureManga = {
  id: 'demo',
  title: 'Demo',
  groupName: 'Group',
  uploaders: [{ name: 'U1' }],
  chapters: [
    { id: 'c1', number: 1, volume: 1, title: 'One', pageCount: 3 },
    { id: 'c2', number: 2, volume: 1, title: 'Two', pageCount: 2 },
    { id: 'c3', number: 3, volume: 1, title: 'Three', pageCount: 4 },
  ],
}

describe('toSummary', () => {
  it('strips fixture-only fields like pageCount', () => {
    const ch: FixtureChapter = {
      id: 'x',
      number: 4,
      volume: 2,
      title: 'X',
      pageCount: 99,
    }
    expect(toSummary(ch)).toEqual({
      id: 'x',
      number: 4,
      volume: 2,
      title: 'X',
    })
  })
})

describe('buildPages', () => {
  it('produces pageCount pages numbered from 1', () => {
    const pages = buildPages(sampleManga, sampleManga.chapters[0])
    expect(pages).toHaveLength(3)
    expect(pages[0].number).toBe(1)
    expect(pages[2].number).toBe(3)
  })

  it('emits SVG data URLs for each page', () => {
    const pages = buildPages(sampleManga, sampleManga.chapters[0])
    for (const page of pages) {
      expect(page.src.startsWith('data:image/svg+xml')).toBe(true)
      expect(page.width).toBe(800)
      expect(page.height).toBe(1200)
    }
  })
})

describe('buildReaderChapter', () => {
  it('wires prev/next from chapter ordering', () => {
    const middle = buildReaderChapter(sampleManga, sampleManga.chapters[1])
    expect(middle.prev?.id).toBe('c1')
    expect(middle.next?.id).toBe('c3')
  })

  it('first chapter has no prev', () => {
    const first = buildReaderChapter(sampleManga, sampleManga.chapters[0])
    expect(first.prev).toBeNull()
    expect(first.next?.id).toBe('c2')
  })

  it('last chapter has no next', () => {
    const last = buildReaderChapter(sampleManga, sampleManga.chapters[2])
    expect(last.prev?.id).toBe('c2')
    expect(last.next).toBeNull()
  })

  it('returns ordered chapter summaries', () => {
    const chapter = buildReaderChapter(sampleManga, sampleManga.chapters[0])
    expect(chapter.chapters.map((c) => c.id)).toEqual(['c1', 'c2', 'c3'])
  })

  it('orders chapters even when input is shuffled', () => {
    const shuffled: FixtureManga = {
      ...sampleManga,
      chapters: [
        sampleManga.chapters[2],
        sampleManga.chapters[0],
        sampleManga.chapters[1],
      ],
    }
    const built = buildReaderChapter(shuffled, sampleManga.chapters[1])
    expect(built.chapters.map((c) => c.number)).toEqual([1, 2, 3])
    expect(built.prev?.id).toBe('c1')
    expect(built.next?.id).toBe('c3')
  })
})

describe('buildSyntheticReaderChapter', () => {
  it('clamps pageCount to [1, 60]', () => {
    expect(
      buildSyntheticReaderChapter({ chapterId: 'a', pageCount: 0 }).pages
        .length,
    ).toBe(1)
    expect(
      buildSyntheticReaderChapter({ chapterId: 'a', pageCount: 100 }).pages
        .length,
    ).toBe(60)
  })

  it('defaults to 24 pages when pageCount is omitted', () => {
    expect(
      buildSyntheticReaderChapter({ chapterId: 'a' }).pages.length,
    ).toBe(24)
  })

  it('has no prev/next siblings', () => {
    const ch = buildSyntheticReaderChapter({ chapterId: 'a' })
    expect(ch.prev).toBeNull()
    expect(ch.next).toBeNull()
  })

  it('uses the given title or falls back', () => {
    expect(
      buildSyntheticReaderChapter({ chapterId: 'a', title: 'Custom' }).title,
    ).toBe('Custom')
  })
})
