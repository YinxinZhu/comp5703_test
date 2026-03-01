import { z } from 'zod'
import type { HttpResponse } from './estimate-route.js'
import { createEstimateReport, getEstimateReport } from '../application/report-service.js'
import { ForbiddenError, NotFoundError, ValidationError } from '../application/project-service.js'

const CreateReportRequestSchema = z.object({
  actorId: z.string().min(1),
  estimateRecordId: z.string().min(1),
  format: z.literal('html').default('html')
})

function toErrorResponse(error: unknown): HttpResponse<unknown> {
  if (error instanceof ValidationError) {
    return { status: 400, body: { error: error.message } }
  }

  if (error instanceof ForbiddenError) {
    return { status: 403, body: { error: error.message } }
  }

  if (error instanceof NotFoundError) {
    return { status: 404, body: { error: error.message } }
  }

  return { status: 500, body: { error: 'Internal server error' } }
}

export async function postEstimateReport(body: unknown): Promise<HttpResponse<unknown>> {
  const parsed = CreateReportRequestSchema.safeParse(body)
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
    const report = createEstimateReport(parsed.data)
    return {
      status: 201,
      body: report
    }
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function getReport(input: { actorId: string; reportId: string }): Promise<HttpResponse<unknown>> {
  try {
    const report = getEstimateReport(input)
    return {
      status: 200,
      body: report
    }
  } catch (error) {
    return toErrorResponse(error)
  }
}
