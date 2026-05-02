import type { FixtureManga } from './types'

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

export const FIXTURE_LIST: Array<FixtureManga> = [SAMPLE_MANGA]

export function listFixtureManga(): Array<FixtureManga> {
  return FIXTURE_LIST
}

export function getFixtureManga(id: string): FixtureManga | null {
  return FIXTURE_LIST.find((m) => m.id === id) ?? null
}

export function getFixtureChapter(chapterId: string): {
  manga: FixtureManga
  chapter: import('./types').FixtureChapter
} | null {
  for (const manga of FIXTURE_LIST) {
    const chapter = manga.chapters.find((c) => c.id === chapterId)
    if (chapter) return { manga, chapter }
  }
  return null
}
