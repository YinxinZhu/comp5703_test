import { z } from 'zod'
import { calculatePolygonArea } from '../domain/geometry.js'
import type { EstimateResult, PricingTable, ProjectParameters } from '../domain/types.js'

const PricingTableSchema = z.object({
  concretePerM3: z.number().nonnegative(),
  laborPerM2: z.number().nonnegative()
})

const ProjectParametersSchema = z.object({
  thicknessMm: z.number().positive(),
  currency: z.string().min(1)
})

function round(value: number, precision = 2): number {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

export function estimateFromPolygon(input: {
  estimateId: string
  polygonCoordinates: readonly (readonly [number, number])[]
  pricingTable: PricingTable
  projectParameters: ProjectParameters
}): EstimateResult {
  const pricing = PricingTableSchema.parse(input.pricingTable)
  const params = ProjectParametersSchema.parse(input.projectParameters)

  const areaM2 = calculatePolygonArea(input.polygonCoordinates)
  const volumeM3 = areaM2 * (params.thicknessMm / 1000)

  const materialCost = volumeM3 * pricing.concretePerM3
  const laborCost = areaM2 * pricing.laborPerM2
  const total = materialCost + laborCost

  return {
    estimateId: input.estimateId,
    total: round(total),
    currency: params.currency,
    lines: [
      {
        category: 'material',
        code: 'CONCRETE',
        qty: round(volumeM3, 3),
        unit: 'm3',
        unitPrice: round(pricing.concretePerM3),
        cost: round(materialCost)
      },
      {
        category: 'labor',
        code: 'LABOR',
        qty: round(areaM2, 2),
        unit: 'm2',
        unitPrice: round(pricing.laborPerM2),
        cost: round(laborCost)
      }
    ]
  }
}
