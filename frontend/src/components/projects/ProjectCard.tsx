import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import type { Project } from '../../types'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const role = project.pivot?.role
  const createdAt = new Date(project.created_at).toLocaleDateString()

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">{project.name}</h3>
        {role && (
          <Badge tone={role === 'owner' ? 'indigo' : 'slate'}>{role}</Badge>
        )}
      </div>
      {project.description && (
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
          {project.description}
        </p>
      )}
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span>{project.tasks_count ?? 0} tasks</span>
        <span>Created {createdAt}</span>
      </div>
    </Link>
  )
}
