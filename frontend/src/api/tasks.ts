import api from '../lib/api'
import type { Paginated, Task, TaskPriority, TaskStatus } from '../types'

export interface TaskListParams {
  status?: TaskStatus
  priority?: TaskPriority
  assigned_to?: number
  q?: string
  page?: number
  per_page?: number
}

export interface TaskPayload {
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string | null
  assigned_to?: number | null
}

export const tasksApi = {
  list: (projectId: number, params: TaskListParams = {}) =>
    api
      .get<Paginated<Task>>(`/projects/${projectId}/tasks`, { params })
      .then((r) => r.data),

  get: (id: number) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),

  create: (projectId: number, payload: TaskPayload) =>
    api
      .post<Task>(`/projects/${projectId}/tasks`, payload)
      .then((r) => r.data),

  update: (id: number, payload: Partial<TaskPayload>) =>
    api.patch<Task>(`/tasks/${id}`, payload).then((r) => r.data),

  remove: (id: number) => api.delete<void>(`/tasks/${id}`).then((r) => r.data),
}
