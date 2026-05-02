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
