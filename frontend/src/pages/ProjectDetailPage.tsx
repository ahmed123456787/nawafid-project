import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/common/ConfirmDialog'
import MembersSection from '../components/members/MembersSection'
import ProjectFormModal from '../components/projects/ProjectFormModal'
import ProjectHeader from '../components/projects/ProjectHeader'
import TasksSection from '../components/tasks/TasksSection'
import ErrorState from '../components/ui/ErrorState'
import Spinner from '../components/ui/Spinner'
import { projectsApi } from '../api/projects'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import type { Project, Role } from '../types'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const {
    data: project,
    loading,
    error,
    refetch,
  } = useFetch<Project>(() => projectsApi.get(projectId), [projectId])

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const role: Role | null =
    project?.members?.find((m) => m.id === user?.id)?.pivot.role ?? null

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await projectsApi.remove(projectId)
      navigate('/projects', { replace: true })
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message ?? 'Failed to delete project.')
      setDeleteOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <ErrorState
        message={error ?? deleteError ?? 'Project not found.'}
        onRetry={refetch}
      />
    )
  }

  return (
    <div className="space-y-6">
      <ProjectHeader
        project={project}
        role={role}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      {deleteError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {deleteError}
        </p>
      )}

      <TasksSection project={project} canManage={!!role} />

      <MembersSection
        project={project}
        canManage={role === 'owner'}
        onChanged={refetch}
      />

      <ProjectFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={refetch}
        project={project}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete project?"
        message="This will permanently remove the project and all its tasks."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  )
}
