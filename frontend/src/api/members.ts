import api from '../lib/api'
import type { Project, Role } from '../types'

export interface AddMemberPayload {
  user_id: number
  role: Role
}

export interface UpdateMemberRolePayload {
  role: Role
}

export const membersApi = {
  add: (projectId: number, payload: AddMemberPayload) =>
    api
      .post<Project>(`/projects/${projectId}/members`, payload)
      .then((r) => r.data),

  updateRole: (
    projectId: number,
    userId: number,
    payload: UpdateMemberRolePayload,
  ) =>
    api
      .patch<Project>(`/projects/${projectId}/members/${userId}`, payload)
      .then((r) => r.data),

  remove: (projectId: number, userId: number) =>
    api
      .delete<void>(`/projects/${projectId}/members/${userId}`)
      .then((r) => r.data),
}
