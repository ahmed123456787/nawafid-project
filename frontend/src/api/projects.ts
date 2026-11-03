import api from '../lib/api'
import type { Paginated, Project } from '../types'

export interface ProjectListParams {
  q?: string
  page?: number
  per_page?: number
}

export interface ProjectPayload {
  name: string
  description?: string | null
}

export const projectsApi = {
  list: (params: ProjectListParams = {}) =>
    api.get<Paginated<Project>>('/projects', { params }).then((r) => r.data),

  get: (id: number) =>
    api.get<Project>(`/projects/${id}`).then((r) => r.data),

  create: (payload: ProjectPayload) =>
    api.post<Project>('/projects', payload).then((r) => r.data),

  update: (id: number, payload: ProjectPayload) =>
    api.put<Project>(`/projects/${id}`, payload).then((r) => r.data),

  remove: (id: number) =>
    api.delete<void>(`/projects/${id}`).then((r) => r.data),
}
