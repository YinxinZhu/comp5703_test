import { beforeEach, describe, expect, it } from 'vitest'
import { resetStoreForTests } from '../src/application/project-service.js'
import {
  getProjectEstimates,
  postProject,
  postProjectEstimate,
  postProjectVersion
} from '../src/api/project-routes.js'

describe('project routes', () => {
  beforeEach(() => {
    resetStoreForTests()
  })

  it('supports create -> save version -> estimate flow', async () => {
    const projectResponse = await postProject({
      ownerId: 'user_1',
      structureType: 'paving',
      region: 'AU-NSW',
      currency: 'AUD',
      wizardAnswers: {}
    })

    expect(projectResponse.status).toBe(201)
    const project = projectResponse.body as { id: string }

    const versionResponse = await postProjectVersion({
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

    expect(versionResponse.status).toBe(201)
    const version = versionResponse.body as { id: string }

    const estimateResponse = await postProjectEstimate({
      actorId: 'user_1',
      projectId: project.id,
      versionId: version.id,
      thicknessMm: 80,
      pricingTable: {
        concretePerM3: 220,
        laborPerM2: 18
      }
    })

    expect(estimateResponse.status).toBe(200)
    expect(estimateResponse.body).toMatchObject({
      estimateRecord: {
        result: {
          total: 854.4,
          currency: 'AUD'
        }
      }
    })

    const history = await getProjectEstimates(project.id)
    expect(history.status).toBe(200)
    expect(history.body).toMatchObject({ count: 1 })
  })

  it('returns 403 when non-owner estimates', async () => {
    const projectResponse = await postProject({
      ownerId: 'owner',
      structureType: 'paving',
      region: 'AU-NSW',
      currency: 'AUD',
      wizardAnswers: {}
    })
    const project = projectResponse.body as { id: string }

    const versionResponse = await postProjectVersion({
      actorId: 'owner',
      projectId: project.id,
      note: 'v1',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [0, 0],
          [2, 0],
          [2, 1],
          [0, 1]
        ]
      }
    })

    const version = versionResponse.body as { id: string }

    const response = await postProjectEstimate({
      actorId: 'intruder',
      projectId: project.id,
      versionId: version.id,
      thicknessMm: 80,
      pricingTable: {
        concretePerM3: 220,
        laborPerM2: 18
      }
    })

    expect(response.status).toBe(403)
  })

  it('returns 400 for invalid request payload', async () => {
    const response = await postProjectVersion({
      actorId: '',
      projectId: '',
      note: '',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [0, 0],
          [1, 0],
          [1, 1]
        ]
      }
    })

    expect(response.status).toBe(400)
  })

  it('returns 404 for unknown project estimate history', async () => {
    const response = await getProjectEstimates('prj_missing')
    expect(response.status).toBe(404)
  })
})
