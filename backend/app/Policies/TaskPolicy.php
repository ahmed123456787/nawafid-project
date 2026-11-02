<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Listing tasks always happens scoped to a project.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Any member of the task's project can view it.
     */
    public function view(User $user, Task $task): bool
    {
        return $this->isMember($user, $task->project);
    }

    /**
     * Any member of the given project can create tasks within it.
     * Called via Gate::authorize('create', [Task::class, $project]).
     */
    public function create(User $user, Project $project): bool
    {
        return $this->isMember($user, $project);
    }

    /**
     * Any member of the task's project can update any task in it.
     */
    public function update(User $user, Task $task): bool
    {
        return $this->isMember($user, $task->project);
    }

    /**
     * Any member of the task's project can delete tasks in it.
     * Tighten to owner-only if you want stricter rules.
     */
    public function delete(User $user, Task $task): bool
    {
        return $this->isMember($user, $task->project);
    }

    /**
     * Check if the user belongs to the given project (any role).
     */
    protected function isMember(User $user, Project $project): bool
    {
        return $project->members()
            ->where('users.id', $user->id)
            ->exists();
    }
}
