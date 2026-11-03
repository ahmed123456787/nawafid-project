import api from '../lib/api'
import type { Paginated, User } from '../types'

export interface UserListParams {
  q?: string
  page?: number
  per_page?: number
}

export const usersApi = {
  list: (params: UserListParams = {}) =>
    api.get<Paginated<User>>('/users', { params }).then((r) => r.data),
}
