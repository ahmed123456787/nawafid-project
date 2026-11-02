<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * Any authenticated user can list projects.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Only members (owner or member) can view the project.
     */
    public function view(User $user, Project $project): bool
    {
        return $project->members()
            ->where('users.id', $user->id)
            ->exists();
    }

    /**
     * Any authenticated user can create a project.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Only an owner of the project can update it.
     */
    public function update(User $user, Project $project): bool
    {
        return $this->isOwner($user, $project);
    }

    /**
     * Only an owner of the project can delete it.
     */
    public function delete(User $user, Project $project): bool
    {
        return $this->isOwner($user, $project);
    }

    /**
     * Only an owner can manage project members (add, remove, change role).
     */
    public function manageMembers(User $user, Project $project): bool
    {
        return $this->isOwner($user, $project);
    }

    /**
     * Check if the user is an owner of the given project.
     */
    protected function isOwner(User $user, Project $project): bool
    {
        return $project->members()
            ->where('users.id', $user->id)
            ->wherePivot('role', 'owner')
            ->exists();
    }
}
