import { z } from 'zod'
import type { PolygonGeometry } from './types.js'

export type ProjectStatus = 'draft' | 'estimated'

export interface Project {
  readonly id: string
  readonly ownerId: string
  readonly structureType: string
  readonly region: string
  readonly currency: string
  readonly status: ProjectStatus
  readonly currentVersion: number
  readonly wizardAnswers: Record<string, unknown>
  readonly createdAt: string
  readonly updatedAt: string
}

export interface ProjectVersion {
  readonly id: string
  readonly projectId: string
  readonly versionNo: number
  readonly note: string
  readonly geometry: PolygonGeometry
  readonly quantities: {
    readonly areaM2: number
    readonly perimeterM: number
  }
  readonly createdAt: string
}

export const CreateProjectInputSchema = z.object({
  ownerId: z.string().min(1),
  structureType: z.string().min(1),
  region: z.string().min(1),
  currency: z.string().min(1),
  wizardAnswers: z.record(z.unknown()).default({})
})

export const CreateVersionInputSchema = z.object({
  projectId: z.string().min(1),
  note: z.string().min(1),
  geometry: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.tuple([z.number(), z.number()])).min(3)
  })
})

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>
export type CreateVersionInput = z.infer<typeof CreateVersionInputSchema>
