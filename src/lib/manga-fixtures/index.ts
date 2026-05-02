export type { FixtureChapter, FixtureManga } from './types'
export {
  FIXTURE_LIST,
  getFixtureChapter,
  getFixtureManga,
  listFixtureManga,
} from './data'
export {
  buildPages,
  buildReaderChapter,
  buildSyntheticReaderChapter,
  toSummary,
} from './build'
export {
  escapeXml,
  pageSvgDataUrl,
  paletteForPage,
} from './page-svg'
export type { PagePalette } from './page-svg'
