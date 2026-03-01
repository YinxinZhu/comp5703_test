import { beforeEach, describe, expect, it } from 'vitest'
import { createProject, estimateProjectVersion, resetStoreForTests, saveProjectVersion } from '../src/application/project-service.js'
import { createEstimateReport, getEstimateReport } from '../src/application/report-service.js'

describe('report service', () => {
  beforeEach(() => {
    resetStoreForTests()
  })

  it('creates and retrieves html report from estimate record', () => {
    const project = createProject({
      ownerId: 'owner',
      structureType: 'paving',
      region: 'AU-NSW',
      currency: 'AUD',
      wizardAnswers: {}
    })

    const version = saveProjectVersion({
      actorId: 'owner',
      projectId: project.id,
      note: 'v1',
      geometry: {
        type: 'Polygon',
        coordinates: [[0, 0], [8, 0], [8, 3], [0, 3]]
      }
    })

    const estimate = estimateProjectVersion({
      actorId: 'owner',
      projectId: project.id,
      versionId: version.id,
      thicknessMm: 80,
      pricingTable: {
        concretePerM3: 220,
        laborPerM2: 18
      }
    })

    const report = createEstimateReport({
      actorId: 'owner',
      estimateRecordId: estimate.estimateRecord.id,
      format: 'html'
    })

    expect(report.format).toBe('html')
    expect(report.content).toContain('<!doctype html>')
    expect(report.content).toContain('Estimate Report')

    const loaded = getEstimateReport(report.id)
    expect(loaded.id).toBe(report.id)
  })
})
