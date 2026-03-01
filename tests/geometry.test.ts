import { describe, expect, it } from 'vitest'
import {
  calculatePolygonArea,
  calculatePolygonPerimeter,
  ensureClosedRing
} from '../src/domain/geometry.js'

describe('geometry utilities', () => {
  it('calculates area for rectangle', () => {
    const area = calculatePolygonArea([
      [0, 0],
      [8, 0],
      [8, 3],
      [0, 3]
    ])

    expect(area).toBe(24)
  })

  it('calculates perimeter for rectangle', () => {
    const perimeter = calculatePolygonPerimeter([
      [0, 0],
      [8, 0],
      [8, 3],
      [0, 3]
    ])

    expect(perimeter).toBe(22)
  })

  it('closes ring if not closed', () => {
    const ring = ensureClosedRing([
      [0, 0],
      [1, 0],
      [1, 1]
    ])

    expect(ring[0]).toEqual(ring[ring.length - 1])
  })
})
