import type { EstimateRecord } from '../domain/estimate.js'
import type { Project, ProjectVersion } from '../domain/project.js'
import type { EstimateReport } from '../domain/report.js'

export interface StoreTables {
  projects: Map<string, Project>
  versions: Map<string, ProjectVersion>
  versionsByProject: Map<string, ProjectVersion[]>
  estimates: Map<string, EstimateRecord>
  estimatesByProject: Map<string, EstimateRecord[]>
  reports: Map<string, EstimateReport>
  reportsByEstimateRecord: Map<string, EstimateReport[]>
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
  findById(estimateRecordId: string): EstimateRecord | undefined
}

export interface ReportRepository {
  save(report: EstimateReport): void
  findByEstimateRecordId(estimateRecordId: string): EstimateReport[]
  findById(reportId: string): EstimateReport | undefined
}

export function createStore(): StoreTables {
  return {
    projects: new Map(),
    versions: new Map(),
    versionsByProject: new Map(),
    estimates: new Map(),
    estimatesByProject: new Map(),
    reports: new Map(),
    reportsByEstimateRecord: new Map()
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
    },
    findById(estimateRecordId) {
      return store.estimates.get(estimateRecordId)
    }
  }
}

function createReportRepository(store: StoreTables): ReportRepository {
  return {
    save(report) {
      store.reports.set(report.id, report)
      const list = store.reportsByEstimateRecord.get(report.estimateRecordId) ?? []
      store.reportsByEstimateRecord.set(report.estimateRecordId, [...list, report])
    },
    findByEstimateRecordId(estimateRecordId) {
      return store.reportsByEstimateRecord.get(estimateRecordId) ?? []
    },
    findById(reportId) {
      return store.reports.get(reportId)
    }
  }
}

export const defaultStore = createStore()
export const repositories = {
  projects: createProjectRepository(defaultStore),
  versions: createVersionRepository(defaultStore),
  estimates: createEstimateRepository(defaultStore),
  reports: createReportRepository(defaultStore)
}

export function resetStore(): void {
  defaultStore.projects.clear()
  defaultStore.versions.clear()
  defaultStore.versionsByProject.clear()
  defaultStore.estimates.clear()
  defaultStore.estimatesByProject.clear()
  defaultStore.reports.clear()
  defaultStore.reportsByEstimateRecord.clear()
}
