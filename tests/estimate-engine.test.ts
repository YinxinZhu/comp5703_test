import { describe, expect, it } from 'vitest'
import { estimateFromPolygon } from '../src/application/estimate-engine.js'

describe('estimate engine', () => {
  it('returns stable material and labor costs', () => {
    const result = estimateFromPolygon({
      estimateId: 'est_1',
      polygonCoordinates: [
        [0, 0],
        [8, 0],
        [8, 3],
        [0, 3]
      ],
      pricingTable: {
        concretePerM3: 220,
        laborPerM2: 18
      },
      projectParameters: {
        thicknessMm: 80,
        currency: 'AUD'
      }
    })

    expect(result.total).toBe(854.4)
    expect(result.lines).toHaveLength(2)
    expect(result.lines[0]).toMatchObject({
      category: 'material',
      qty: 1.92,
      cost: 422.4
    })
    expect(result.lines[1]).toMatchObject({
      category: 'labor',
      qty: 24,
      cost: 432
    })
  })
})
