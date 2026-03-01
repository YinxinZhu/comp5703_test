import { z } from 'zod'
import type { HttpResponse } from './estimate-route.js'
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
  createProject,
  estimateProjectVersion,
  listProjectEstimates,
  saveProjectVersion
} from '../application/project-service.js'

const CreateProjectRequestSchema = z.object({
  ownerId: z.string().min(1),
  structureType: z.string().min(1),
  region: z.string().min(1),
  currency: z.string().min(1),
  wizardAnswers: z.record(z.unknown()).default({})
})

const CreateProjectVersionRequestSchema = z.object({
  actorId: z.string().min(1),
  projectId: z.string().min(1),
  note: z.string().min(1),
  geometry: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.tuple([z.number(), z.number()])).min(3)
  })
})

const EstimateProjectVersionRequestSchema = z.object({
  actorId: z.string().min(1),
  projectId: z.string().min(1),
  versionId: z.string().min(1),
  thicknessMm: z.number().positive(),
  pricingTable: z.object({
    concretePerM3: z.number().nonnegative(),
    laborPerM2: z.number().nonnegative()
  })
})

function toErrorResponse(error: unknown): HttpResponse<unknown> {
  if (error instanceof ValidationError) {
    return {
      status: 400,
      body: {
        error: error.message
      }
    }
  }

  if (error instanceof ForbiddenError) {
    return {
      status: 403,
      body: {
        error: error.message
      }
    }
  }

  if (error instanceof NotFoundError) {
    return {
      status: 404,
      body: {
        error: error.message
      }
    }
  }

  return {
    status: 500,
    body: {
      error: 'Internal server error'
    }
  }
}

export async function postProject(body: unknown): Promise<HttpResponse<unknown>> {
  const parsed = CreateProjectRequestSchema.safeParse(body)
  if (!parsed.success) {
    return {
      status: 400,
      body: {
        error: 'Invalid request payload',
        details: parsed.error.flatten()
      }
    }
  }

  try {
    const project = createProject(parsed.data)
    return { status: 201, body: project }
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function postProjectVersion(body: unknown): Promise<HttpResponse<unknown>> {
  const parsed = CreateProjectVersionRequestSchema.safeParse(body)
  if (!parsed.success) {
    return {
      status: 400,
      body: {
        error: 'Invalid request payload',
        details: parsed.error.flatten()
      }
    }
  }

  try {
    const version = saveProjectVersion(parsed.data)
    return { status: 201, body: version }
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function postProjectEstimate(body: unknown): Promise<HttpResponse<unknown>> {
  const parsed = EstimateProjectVersionRequestSchema.safeParse(body)
  if (!parsed.success) {
    return {
      status: 400,
      body: {
        error: 'Invalid request payload',
        details: parsed.error.flatten()
      }
    }
  }

  try {
    const result = estimateProjectVersion(parsed.data)
    return { status: 200, body: result }
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function getProjectEstimates(projectId: string): Promise<HttpResponse<unknown>> {
  if (!projectId.trim()) {
    return {
      status: 400,
      body: {
        error: 'projectId is required'
      }
    }
  }

  try {
    const records = listProjectEstimates(projectId)
    return {
      status: 200,
      body: {
        items: records,
        count: records.length
      }
    }
  } catch (error) {
    return toErrorResponse(error)
  }
}
