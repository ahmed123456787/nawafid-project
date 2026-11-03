<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;

class ProjectMembershipService
{
    /**
     * Add a user to a project with the given role.
     */
    public function add(Project $project, int $userId, string $role): Project
    {
        $project->members()->attach($userId, ['role' => $role]);

        return $project->load('members');
    }

    /**
     * Change an existing member's role, protecting the last owner from demotion.
     */
    public function changeRole(Project $project, User $user, string $role): Project
    {
        $this->ensureMember($project, $user);

        if ($role !== 'owner') {
            $this->ensureNotLastOwner($project, $user);
        }

        $project->members()->updateExistingPivot($user->id, ['role' => $role]);

        return $project->load('members');
    }

    /**
     * Remove a member from a project, protecting the last owner from removal.
     */
    public function remove(Project $project, User $user): void
    {
        $this->ensureMember($project, $user);
        $this->ensureNotLastOwner($project, $user);

        $project->members()->detach($user->id);
    }

    /**
     * Abort with 404 when the given user is not a member of the project.
     */
    protected function ensureMember(Project $project, User $user): void
    {
        $isMember = $project->members()
            ->where('users.id', $user->id)
            ->exists();

        abort_unless($isMember, 404, 'User is not a member of this project.');
    }

    /**
     * Abort with 422 when removing or demoting this user would leave
     * the project without any owner.
     */
    protected function ensureNotLastOwner(Project $project, User $user): void
    {
        $isOwner = $project->members()
            ->where('users.id', $user->id)
            ->wherePivot('role', 'owner')
            ->exists();

        if (! $isOwner) {
            return;
        }

        $ownerCount = $project->members()
            ->wherePivot('role', 'owner')
            ->count();

        abort_if($ownerCount <= 1, 422, 'Cannot remove or demote the last owner of the project.');
    }
}
