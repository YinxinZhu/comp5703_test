import type { EstimateResult } from './types.js'

export interface EstimateRecord {
  readonly id: string
  readonly projectId: string
  readonly versionId: string
  readonly pricingSnapshot: {
    readonly concretePerM3: number
    readonly laborPerM2: number
    readonly thicknessMm: number
  }
  readonly result: EstimateResult
  readonly createdAt: string
}
