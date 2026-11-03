export type Role = 'owner' | 'member'

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high'

export interface User {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface ProjectMember extends User {
  pivot: {
    project_id: number
    user_id: number
    role: Role
    created_at: string
    updated_at: string
  }
}

export interface Project {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
  tasks_count?: number
  members?: ProjectMember[]
  pivot?: {
    project_id: number
    user_id: number
    role: Role
    created_at: string
    updated_at: string
  }
}

export interface Task {
  id: number
  project_id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  assigned_to: number | null
  created_by: number | null
  created_at: string
  updated_at: string
  assignee?: User | null
  creator?: User | null
  project?: Project
}

export interface Paginated<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number | null
  last_page: number
  last_page_url: string
  links: { url: string | null; label: string; active: boolean }[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
