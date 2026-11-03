import api from '../lib/api'
import type { AuthResponse, User } from '../types'

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/register', payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/login', payload).then((r) => r.data),

  logout: () => api.post<{ message: string }>('/logout').then((r) => r.data),

  me: () => api.get<{ user: User }>('/me').then((r) => r.data.user),
}
