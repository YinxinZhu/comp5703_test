import { z } from 'zod'
import type { EstimateRecord } from '../domain/estimate.js'
import type { EstimateReport } from '../domain/report.js'
import { repositories } from '../infrastructure/in-memory-store.js'
import { createId } from '../shared/id.js'
import { ForbiddenError, NotFoundError, ValidationError } from './project-service.js'

const CreateEstimateReportInputSchema = z.object({
  actorId: z.string().min(1),
  estimateRecordId: z.string().min(1),
  format: z.literal('html').default('html')
})

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildHtmlReport(estimateRecord: EstimateRecord): string {
  const rows = estimateRecord.result.lines
    .map(
      (line) => `\n<tr><td>${escapeHtml(line.category)}</td><td>${escapeHtml(line.code)}</td><td>${line.qty}</td><td>${escapeHtml(line.unit)}</td><td>${line.unitPrice}</td><td>${line.cost}</td></tr>`
    )
    .join('')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Estimate Report ${escapeHtml(estimateRecord.id)}</title>
</head>
<body>
  <h1>Estimate Report</h1>
  <p>EstimateRecord: ${escapeHtml(estimateRecord.id)}</p>
  <p>Project: ${escapeHtml(estimateRecord.projectId)}</p>
  <p>Version: ${escapeHtml(estimateRecord.versionId)}</p>
  <h2>Cost Lines</h2>
  <table border="1" cellspacing="0" cellpadding="4">
    <thead><tr><th>Category</th><th>Code</th><th>Qty</th><th>Unit</th><th>Unit Price</th><th>Cost</th></tr></thead>
    <tbody>${rows}
    </tbody>
  </table>
  <h3>Total: ${estimateRecord.result.total} ${escapeHtml(estimateRecord.result.currency)}</h3>
</body>
</html>`
}

export function createEstimateReport(input: {
  actorId: string
  estimateRecordId: string
  format?: 'html'
}): EstimateReport {
  const parsed = CreateEstimateReportInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }

  const estimateRecord = repositories.estimates.findById(parsed.data.estimateRecordId)
  if (!estimateRecord) {
    throw new NotFoundError(`Estimate record ${parsed.data.estimateRecordId} not found`)
  }

  const project = repositories.projects.findById(estimateRecord.projectId)
  if (!project) {
    throw new NotFoundError(`Project ${estimateRecord.projectId} not found`)
  }

  if (project.ownerId !== parsed.data.actorId) {
    throw new ForbiddenError('Only owner can generate report')
  }

  const report: EstimateReport = {
    id: createId('rpt'),
    estimateRecordId: estimateRecord.id,
    projectId: estimateRecord.projectId,
    versionId: estimateRecord.versionId,
    format: 'html',
    content: buildHtmlReport(estimateRecord),
    createdAt: new Date().toISOString()
  }

  repositories.reports.save(report)
  return report
}

export function getEstimateReport(reportId: string): EstimateReport {
  if (!reportId.trim()) {
    throw new ValidationError('reportId is required')
  }

  const report = repositories.reports.findById(reportId)
  if (!report) {
    throw new NotFoundError(`Report ${reportId} not found`)
  }

  return report
}
