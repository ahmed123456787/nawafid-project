import Badge from '../ui/Badge'
import Button from '../ui/Button'
import type { ProjectMember, Role } from '../../types'

interface MemberRowProps {
  member: ProjectMember
  isCurrentUser: boolean
  canManage: boolean
  onChangeRole: (member: ProjectMember, nextRole: Role) => void
  onRemove: (member: ProjectMember) => void
}

export default function MemberRow({
  member,
  isCurrentUser,
  canManage,
  onChangeRole,
  onRemove,
}: MemberRowProps) {
  const role = member.pivot.role
  const nextRole: Role = role === 'owner' ? 'member' : 'owner'

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">
          {member.name} {isCurrentUser && <span className="text-slate-400">(you)</span>}
        </p>
        <p className="truncate text-xs text-slate-500">{member.email}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge tone={role === 'owner' ? 'indigo' : 'slate'}>{role}</Badge>
        {canManage && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onChangeRole(member, nextRole)}
            >
              Make {nextRole}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(member)}
            >
              Remove
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
