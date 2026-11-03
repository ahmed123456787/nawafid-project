import Badge from '../ui/Badge'
import Button from '../ui/Button'
import type { Project, Role } from '../../types'

interface ProjectHeaderProps {
  project: Project
  role: Role | null
  onEdit: () => void
  onDelete: () => void
}

export default function ProjectHeader({
  project,
  role,
  onEdit,
  onDelete,
}: ProjectHeaderProps) {
  const isOwner = role === 'owner'
  const createdAt = new Date(project.created_at).toLocaleDateString()

  return (
    <header className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">
              {project.name}
            </h1>
            {role && (
              <Badge tone={role === 'owner' ? 'indigo' : 'slate'}>{role}</Badge>
            )}
          </div>
          {project.description && (
            <p className="mt-2 text-sm text-slate-600">{project.description}</p>
          )}
          <p className="mt-3 text-xs text-slate-500">Created {createdAt}</p>
        </div>

        {isOwner && (
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={onDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
