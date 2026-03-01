import type { EstimateRecord } from '../domain/estimate.js'
import type { Project, ProjectVersion } from '../domain/project.js'

export interface StoreTables {
  projects: Map<string, Project>
  versions: Map<string, ProjectVersion>
  versionsByProject: Map<string, ProjectVersion[]>
  estimates: Map<string, EstimateRecord>
  estimatesByProject: Map<string, EstimateRecord[]>
}

export interface ProjectRepository {
  save(project: Project): void
  findById(projectId: string): Project | undefined
}

export interface VersionRepository {
  save(version: ProjectVersion): void
  findById(versionId: string): ProjectVersion | undefined
  findByProjectId(projectId: string): ProjectVersion[]
}

export interface EstimateRepository {
  save(record: EstimateRecord): void
  findByProjectId(projectId: string): EstimateRecord[]
}

export function createStore(): StoreTables {
  return {
    projects: new Map(),
    versions: new Map(),
    versionsByProject: new Map(),
    estimates: new Map(),
    estimatesByProject: new Map()
  }
}

function createProjectRepository(store: StoreTables): ProjectRepository {
  return {
    save(project) {
      store.projects.set(project.id, project)
    },
    findById(projectId) {
      return store.projects.get(projectId)
    }
  }
}

function createVersionRepository(store: StoreTables): VersionRepository {
  return {
    save(version) {
      store.versions.set(version.id, version)
      const list = store.versionsByProject.get(version.projectId) ?? []
      store.versionsByProject.set(version.projectId, [...list, version])
    },
    findById(versionId) {
      return store.versions.get(versionId)
    },
    findByProjectId(projectId) {
      return store.versionsByProject.get(projectId) ?? []
    }
  }
}

function createEstimateRepository(store: StoreTables): EstimateRepository {
  return {
    save(record) {
      store.estimates.set(record.id, record)
      const list = store.estimatesByProject.get(record.projectId) ?? []
      store.estimatesByProject.set(record.projectId, [...list, record])
    },
    findByProjectId(projectId) {
      return store.estimatesByProject.get(projectId) ?? []
    }
  }
}

export const defaultStore = createStore()
export const repositories = {
  projects: createProjectRepository(defaultStore),
  versions: createVersionRepository(defaultStore),
  estimates: createEstimateRepository(defaultStore)
}

export function resetStore(): void {
  defaultStore.projects.clear()
  defaultStore.versions.clear()
  defaultStore.versionsByProject.clear()
  defaultStore.estimates.clear()
  defaultStore.estimatesByProject.clear()
}
