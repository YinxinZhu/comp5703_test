import { describe, expect, it } from 'vitest'
import { postProjectEstimate } from '../src/api/estimate-route.js'

describe('estimate route', () => {
  it('returns 200 for valid request', async () => {
    const response = await postProjectEstimate({
      versionId: 'v1',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [0, 0],
          [8, 0],
          [8, 3],
          [0, 3]
        ]
      },
      pricingTable: {
        concretePerM3: 220,
        laborPerM2: 18
      },
      projectParameters: {
        thicknessMm: 80,
        currency: 'AUD'
      }
    })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      estimateId: 'est_v1',
      total: 854.4,
      currency: 'AUD'
    })
  })

  it('returns 400 for invalid request', async () => {
    const response = await postProjectEstimate({
      versionId: '',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [0, 0],
          [1, 0],
          [1, 1]
        ]
      },
      pricingTable: {
        concretePerM3: -1,
        laborPerM2: 18
      },
      projectParameters: {
        thicknessMm: 0,
        currency: ''
      }
    })

    expect(response.status).toBe(400)
  })
})
