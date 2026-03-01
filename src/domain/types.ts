export type Point = readonly [number, number]

export interface PolygonGeometry {
  readonly type: 'Polygon'
  readonly coordinates: readonly Point[]
}

export interface PricingTable {
  readonly concretePerM3: number
  readonly laborPerM2: number
}

export interface ProjectParameters {
  readonly thicknessMm: number
  readonly currency: string
}

export interface EstimateLine {
  readonly category: 'material' | 'labor'
  readonly code: string
  readonly qty: number
  readonly unit: 'm3' | 'm2'
  readonly unitPrice: number
  readonly cost: number
}

export interface EstimateResult {
  readonly estimateId: string
  readonly total: number
  readonly currency: string
  readonly lines: readonly EstimateLine[]
}
