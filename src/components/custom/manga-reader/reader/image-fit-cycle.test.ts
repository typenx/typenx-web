import { describe, expect, it } from 'vitest'

import { nextImageFitFlags } from './image-fit-cycle'

describe('nextImageFitFlags', () => {
  it('cycles both → width-only', () => {
    expect(
      nextImageFitFlags({ containWidth: true, containHeight: true }),
    ).toEqual({ containWidth: true, containHeight: false })
  })

  it('cycles width-only → height-only', () => {
    expect(
      nextImageFitFlags({ containWidth: true, containHeight: false }),
    ).toEqual({ containWidth: false, containHeight: true })
  })

  it('cycles height-only → none', () => {
    expect(
      nextImageFitFlags({ containWidth: false, containHeight: true }),
    ).toEqual({ containWidth: false, containHeight: false })
  })

  it('cycles none → both (wraps)', () => {
    expect(
      nextImageFitFlags({ containWidth: false, containHeight: false }),
    ).toEqual({ containWidth: true, containHeight: true })
  })
})
