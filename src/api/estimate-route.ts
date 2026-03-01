import { z } from 'zod'
import { parsePolygonGeometry } from '../domain/geometry.js'
import { estimateFromPolygon } from '../application/estimate-engine.js'

const EstimateRequestSchema = z.object({
  versionId: z.string().min(1),
  geometry: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.tuple([z.number(), z.number()])).min(3)
  }),
  pricingTable: z.object({
    concretePerM3: z.number().nonnegative(),
    laborPerM2: z.number().nonnegative()
  }),
  projectParameters: z.object({
    thicknessMm: z.number().positive(),
    currency: z.string().min(1)
  })
})

export interface HttpResponse<T> {
  status: number
  body: T
}

export async function postProjectEstimate(body: unknown): Promise<HttpResponse<unknown>> {
  const parsed = EstimateRequestSchema.safeParse(body)
  if (!parsed.success) {
    return {
      status: 400,
      body: {
        error: 'Invalid request payload',
        details: parsed.error.flatten()
      }
    }
  }

  const geometry = parsePolygonGeometry(parsed.data.geometry)

  const result = estimateFromPolygon({
    estimateId: `est_${parsed.data.versionId}`,
    polygonCoordinates: geometry.coordinates,
    pricingTable: parsed.data.pricingTable,
    projectParameters: parsed.data.projectParameters
  })

  return {
    status: 200,
    body: result
  }
}
