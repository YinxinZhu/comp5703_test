import { beforeEach, describe, expect, it } from 'vitest'
import { createProject, estimateProjectVersion, resetStoreForTests, saveProjectVersion } from '../src/application/project-service.js'
import { getReport, postEstimateReport } from '../src/api/report-routes.js'

describe('report routes', () => {
  beforeEach(() => {
    resetStoreForTests()
  })

  it('returns 201 and report payload for valid request', async () => {
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

    const response = await postEstimateReport({
      actorId: 'owner',
      estimateRecordId: estimate.estimateRecord.id,
      format: 'html'
    })

    expect(response.status).toBe(201)
    const report = response.body as { id: string }

    const getResponse = await getReport({ actorId: 'owner', reportId: report.id })
    expect(getResponse.status).toBe(200)
  })

  it('returns 400 for invalid payload', async () => {
    const response = await postEstimateReport({ actorId: '', estimateRecordId: '' })
    expect(response.status).toBe(400)
  })

  it('returns 403 when non-owner reads report', async () => {
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

    const created = await postEstimateReport({
      actorId: 'owner',
      estimateRecordId: estimate.estimateRecord.id,
      format: 'html'
    })

    const report = created.body as { id: string }
    const read = await getReport({ actorId: 'intruder', reportId: report.id })
    expect(read.status).toBe(403)
  })
})
