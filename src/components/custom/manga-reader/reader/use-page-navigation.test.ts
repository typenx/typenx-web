import { describe, expect, it } from 'vitest'

import {
  computeBackwardIndex,
  computeForwardIndex,
  pageStep,
} from './use-page-navigation'

describe('pageStep', () => {
  it('steps by 2 in double mode', () => {
    expect(pageStep('double')).toBe(2)
  })

  it('steps by 1 for single, long-strip, and wide-strip', () => {
    expect(pageStep('single')).toBe(1)
    expect(pageStep('long-strip')).toBe(1)
    expect(pageStep('wide-strip')).toBe(1)
  })
})

describe('computeForwardIndex', () => {
  it('advances by step in single mode', () => {
    expect(
      computeForwardIndex({ current: 0, display: 'single', totalPages: 10 }),
    ).toEqual({ next: 1, pastEnd: false })
  })

  it('advances by 2 in double mode', () => {
    expect(
      computeForwardIndex({ current: 0, display: 'double', totalPages: 10 }),
    ).toEqual({ next: 2, pastEnd: false })
  })

  it('signals pastEnd and clamps to last page when stepping past the end', () => {
    expect(
      computeForwardIndex({ current: 9, display: 'single', totalPages: 10 }),
    ).toEqual({ next: 9, pastEnd: true })
    expect(
      computeForwardIndex({ current: 8, display: 'double', totalPages: 10 }),
    ).toEqual({ next: 8, pastEnd: true })
  })

  it('handles a single-page chapter', () => {
    expect(
      computeForwardIndex({ current: 0, display: 'single', totalPages: 1 }),
    ).toEqual({ next: 0, pastEnd: true })
  })
})

describe('computeBackwardIndex', () => {
  it('moves back by step in single mode', () => {
    expect(computeBackwardIndex({ current: 5, display: 'single' })).toEqual({
      next: 4,
      pastStart: false,
    })
  })

  it('moves back by 2 in double mode', () => {
    expect(computeBackwardIndex({ current: 5, display: 'double' })).toEqual({
      next: 3,
      pastStart: false,
    })
  })

  it('signals pastStart and clamps to 0 when stepping before the beginning', () => {
    expect(computeBackwardIndex({ current: 0, display: 'single' })).toEqual({
      next: 0,
      pastStart: true,
    })
    expect(computeBackwardIndex({ current: 1, display: 'double' })).toEqual({
      next: 0,
      pastStart: true,
    })
  })
})
