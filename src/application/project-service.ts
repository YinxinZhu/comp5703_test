import { z } from 'zod'
import { calculatePolygonArea, calculatePolygonPerimeter, parsePolygonGeometry } from '../domain/geometry.js'
import type { EstimateRecord } from '../domain/estimate.js'
import {
  CreateProjectInputSchema,
  CreateVersionInputSchema,
  type CreateProjectInput,
  type CreateVersionInput,
  type Project,
  type ProjectVersion
} from '../domain/project.js'
import type { PricingTable, ProjectParameters } from '../domain/types.js'
import { repositories, resetStore } from '../infrastructure/in-memory-store.js'
import { createId } from '../shared/id.js'
import { estimateFromPolygon } from './estimate-engine.js'

const EstimateProjectInputSchema = z.object({
  actorId: z.string().min(1),
  projectId: z.string().min(1),
  versionId: z.string().min(1),
  thicknessMm: z.number().positive(),
  pricingTable: z.object({
    concretePerM3: z.number().nonnegative(),
    laborPerM2: z.number().nonnegative()
  })
})

const CreateVersionAuthorizedInputSchema = z.object({
  actorId: z.string().min(1),
  projectId: z.string().min(1),
  note: z.string().min(1),
  geometry: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.tuple([z.number(), z.number()])).min(3)
  })
})

export class NotFoundError extends Error {}
export class ValidationError extends Error {}
export class ForbiddenError extends Error {}

export function createProject(input: CreateProjectInput): Project {
  const parsed = CreateProjectInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }

  const now = new Date().toISOString()
  const project: Project = {
    id: createId('prj'),
    ownerId: parsed.data.ownerId,
    structureType: parsed.data.structureType,
    region: parsed.data.region,
    currency: parsed.data.currency,
    status: 'draft',
    currentVersion: 0,
    wizardAnswers: parsed.data.wizardAnswers,
    createdAt: now,
    updatedAt: now
  }

  repositories.projects.save(project)
  return project
}

export function saveProjectVersion(input: CreateVersionInput & { actorId: string }): ProjectVersion {
  const parsed = CreateVersionAuthorizedInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }

  const project = repositories.projects.findById(parsed.data.projectId)
  if (!project) {
    throw new NotFoundError(`Project ${parsed.data.projectId} not found`)
  }
  if (project.ownerId !== parsed.data.actorId) {
    throw new ForbiddenError('Only owner can save project versions')
  }

  const geometry = parsePolygonGeometry(parsed.data.geometry)
  const areaM2 = calculatePolygonArea(geometry.coordinates)
  const perimeterM = calculatePolygonPerimeter(geometry.coordinates)
  const existingVersions = repositories.versions.findByProjectId(project.id)

  const version: ProjectVersion = {
    id: createId('ver'),
    projectId: project.id,
    versionNo: existingVersions.length + 1,
    note: parsed.data.note,
    geometry,
    quantities: {
      areaM2,
      perimeterM
    },
    createdAt: new Date().toISOString()
  }

  repositories.versions.save(version)

  repositories.projects.save({
    ...project,
    currentVersion: version.versionNo,
    updatedAt: new Date().toISOString()
  })

  return version
}

export function estimateProjectVersion(input: {
  actorId: string
  projectId: string
  versionId: string
  thicknessMm: number
  pricingTable: PricingTable
}): { project: Project; version: ProjectVersion; estimateRecord: EstimateRecord } {
  const parsed = EstimateProjectInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }

  const project = repositories.projects.findById(parsed.data.projectId)
  if (!project) {
    throw new NotFoundError(`Project ${parsed.data.projectId} not found`)
  }
  if (project.ownerId !== parsed.data.actorId) {
    throw new ForbiddenError('Only owner can estimate project versions')
  }

  const version = repositories.versions.findById(parsed.data.versionId)
  if (!version || version.projectId !== project.id) {
    throw new NotFoundError(`Version ${parsed.data.versionId} not found in project ${project.id}`)
  }

  const projectParameters: ProjectParameters = {
    thicknessMm: parsed.data.thicknessMm,
    currency: project.currency
  }

  const estimate = estimateFromPolygon({
    estimateId: createId('est'),
    polygonCoordinates: version.geometry.coordinates,
    pricingTable: parsed.data.pricingTable,
    projectParameters
  })

  const estimateRecord: EstimateRecord = {
    id: createId('estrec'),
    projectId: project.id,
    versionId: version.id,
    pricingSnapshot: {
      concretePerM3: parsed.data.pricingTable.concretePerM3,
      laborPerM2: parsed.data.pricingTable.laborPerM2,
      thicknessMm: parsed.data.thicknessMm
    },
    result: estimate,
    createdAt: new Date().toISOString()
  }

  repositories.estimates.save(estimateRecord)

  const updatedProject: Project = {
    ...project,
    status: 'estimated',
    updatedAt: new Date().toISOString()
  }
  repositories.projects.save(updatedProject)

  return {
    project: updatedProject,
    version,
    estimateRecord
  }
}

export function listProjectEstimates(projectId: string): EstimateRecord[] {
  const project = repositories.projects.findById(projectId)
  if (!project) {
    throw new NotFoundError(`Project ${projectId} not found`)
  }

  return repositories.estimates.findByProjectId(projectId)
}

export function resetStoreForTests(): void {
  resetStore()
}
