import { useState } from 'react'
import AddMemberModal from './AddMemberModal'
import MemberRow from './MemberRow'
import ConfirmDialog from '../common/ConfirmDialog'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import { membersApi } from '../../api/members'
import { useAuth } from '../../context/AuthContext'
import type { Project, ProjectMember, Role } from '../../types'

interface MembersSectionProps {
  project: Project
  canManage: boolean
  onChanged: () => void
}

export default function MembersSection({
  project,
  canManage,
  onChanged,
}: MembersSectionProps) {
  const { user } = useAuth()
  const members = project.members ?? []

  const [addOpen, setAddOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<ProjectMember | null>(null)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChangeRole = async (member: ProjectMember, nextRole: Role) => {
    setError(null)
    try {
      await membersApi.updateRole(project.id, member.id, { role: nextRole })
      onChanged()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to change role.')
    }
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    setRemoving(true)
    setError(null)
    try {
      await membersApi.remove(project.id, removeTarget.id)
      onChanged()
      setRemoveTarget(null)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to remove member.')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">Members</h2>
        {canManage && (
          <Button size="sm" onClick={() => setAddOpen(true)}>
            Add member
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-2">
        {members.length === 0 ? (
          <EmptyState title="No members" />
        ) : (
          members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              isCurrentUser={m.id === user?.id}
              canManage={canManage}
              onChangeRole={handleChangeRole}
              onRemove={setRemoveTarget}
            />
          ))
        )}
      </div>

      <AddMemberModal
        open={addOpen}
        projectId={project.id}
        existingMembers={members}
        onClose={() => setAddOpen(false)}
        onAdded={onChanged}
      />

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove member?"
        message={
          removeTarget
            ? `Remove ${removeTarget.name} from this project?`
            : undefined
        }
        confirmLabel="Remove"
        danger
        loading={removing}
        onConfirm={handleRemove}
        onClose={() => setRemoveTarget(null)}
      />
    </section>
  )
}
