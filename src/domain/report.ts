export interface EstimateReport {
  readonly id: string
  readonly estimateRecordId: string
  readonly projectId: string
  readonly versionId: string
  readonly format: 'html'
  readonly content: string
  readonly createdAt: string
}
