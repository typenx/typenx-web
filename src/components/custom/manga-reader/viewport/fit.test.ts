import { describe, expect, it } from 'vitest'

import { computeFitClass } from './fit'

const baseFit = {
  containWidth: false,
  containHeight: false,
  stretchSmall: false,
  limitMaxWidth: false,
  limitMaxHeight: false,
}

describe('computeFitClass — single mode', () => {
  it('uses max-h/max-w when both contain flags are on', () => {
    const result = computeFitClass(
      { ...baseFit, containWidth: true, containHeight: true },
      'single',
    )
    expect(result).toContain('max-h-full')
    expect(result).toContain('max-w-full')
  })

  it('uses w-full h-auto when only containWidth is on', () => {
    const result = computeFitClass(
      { ...baseFit, containWidth: true },
      'single',
    )
    expect(result).toContain('w-full')
    expect(result).toContain('h-auto')
  })

  it('uses h-full w-auto when only containHeight is on', () => {
    const result = computeFitClass(
      { ...baseFit, containHeight: true },
      'single',
    )
    expect(result).toContain('h-full')
    expect(result).toContain('w-auto')
  })

  it('appends min size when stretchSmall is on', () => {
    const result = computeFitClass(
      { ...baseFit, containWidth: true, stretchSmall: true },
      'single',
    )
    expect(result).toContain('min-w-[40vw]')
    expect(result).toContain('min-h-[60vh]')
  })

  it('appends pixel caps when limit flags are on', () => {
    const result = computeFitClass(
      {
        ...baseFit,
        containWidth: true,
        limitMaxWidth: true,
        limitMaxHeight: true,
      },
      'single',
    )
    expect(result).toContain('max-w-[1200px]')
    expect(result).toContain('max-h-[1600px]')
  })
})

describe('computeFitClass — long-strip mode', () => {
  it('returns w-full when containWidth is on', () => {
    expect(
      computeFitClass({ ...baseFit, containWidth: true }, 'long-strip'),
    ).toBe('w-full')
  })

  it('combines width, stretch, and max-width caps', () => {
    const result = computeFitClass(
      {
        ...baseFit,
        containWidth: true,
        stretchSmall: true,
        limitMaxWidth: true,
      },
      'long-strip',
    )
    expect(result).toBe('w-full min-w-full max-w-screen-md')
  })

  it('returns empty string when nothing applies', () => {
    expect(computeFitClass(baseFit, 'long-strip')).toBe('')
  })
})

describe('computeFitClass — wide-strip mode', () => {
  it('returns h-full when containHeight is on', () => {
    expect(
      computeFitClass({ ...baseFit, containHeight: true }, 'wide-strip'),
    ).toBe('h-full')
  })

  it('combines height, stretch, and max-height caps', () => {
    const result = computeFitClass(
      {
        ...baseFit,
        containHeight: true,
        stretchSmall: true,
        limitMaxHeight: true,
      },
      'wide-strip',
    )
    expect(result).toBe('h-full min-h-full max-h-screen')
  })
})
