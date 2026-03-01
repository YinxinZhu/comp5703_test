import { beforeEach, describe, expect, it } from 'vitest'
import {
  createProject,
  estimateProjectVersion,
  ForbiddenError,
  listProjectEstimates,
  NotFoundError,
  resetStoreForTests,
  saveProjectVersion
} from '../src/application/project-service.js'

describe('project service', () => {
  beforeEach(() => {
    resetStoreForTests()
  })

  it('creates project and version, then estimates with snapshot persistence', () => {
    const project = createProject({
      ownerId: 'user_1',
      structureType: 'concrete-driveway',
      region: 'AU-NSW',
      currency: 'AUD',
      wizardAnswers: {
        finish: 'broom'
      }
    })

    const version = saveProjectVersion({
      actorId: 'user_1',
      projectId: project.id,
      note: 'v1',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [0, 0],
          [8, 0],
          [8, 3],
          [0, 3]
        ]
      }
    })

    expect(version.versionNo).toBe(1)
    expect(version.quantities.areaM2).toBe(24)
    expect(version.quantities.perimeterM).toBe(22)

    const result = estimateProjectVersion({
      actorId: 'user_1',
      projectId: project.id,
      versionId: version.id,
      thicknessMm: 80,
      pricingTable: {
        concretePerM3: 220,
        laborPerM2: 18
      }
    })

    expect(result.project.status).toBe('estimated')
    expect(result.estimateRecord.result.currency).toBe('AUD')
    expect(result.estimateRecord.result.total).toBe(854.4)
    expect(result.estimateRecord.pricingSnapshot).toMatchObject({
      concretePerM3: 220,
      laborPerM2: 18,
      thicknessMm: 80
    })

    const records = listProjectEstimates(project.id)
    expect(records).toHaveLength(1)
  })

  it('throws NotFoundError when listing estimates of unknown project', () => {
    expect(() => listProjectEstimates('prj_missing')).toThrow(NotFoundError)
  })

  it('rejects non-owner operations', () => {
    const project = createProject({
      ownerId: 'owner',
      structureType: 'paving',
      region: 'AU-NSW',
      currency: 'AUD',
      wizardAnswers: {}
    })

    expect(() =>
      saveProjectVersion({
        actorId: 'other_user',
        projectId: project.id,
        note: 'v1',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [0, 0],
            [1, 0],
            [1, 1]
          ]
        }
      })
    ).toThrow(ForbiddenError)
  })
})
