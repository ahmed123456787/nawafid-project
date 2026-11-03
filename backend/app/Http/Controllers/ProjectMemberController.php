<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddMemberRequest;
use App\Http\Requests\UpdateMemberRoleRequest;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ProjectMemberController extends Controller
{
    /**
     * Add a user to the project with a role.
     */
    public function store(AddMemberRequest $request, Project $project): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        $project->members()->attach(
            $request->integer('user_id'),
            ['role' => $request->string('role')]
        );

        return response()->json(
            $project->load('members'),
            201
        );
    }

    /**
     * Change a member's role.
     */
    public function update(UpdateMemberRoleRequest $request, Project $project, User $user): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        $this->ensureUserIsMember($project, $user);

        $newRole = (string) $request->string('role');

        if ($newRole !== 'owner') {
            $this->ensureNotLastOwner($project, $user);
        }

        $project->members()->updateExistingPivot($user->id, ['role' => $newRole]);

        return response()->json(
            $project->load('members')
        );
    }

    /**
     * Remove a member from the project.
     */
    public function destroy(Project $project, User $user): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        $this->ensureUserIsMember($project, $user);
        $this->ensureNotLastOwner($project, $user);

        $project->members()->detach($user->id);

        return response()->json(null, 204);
    }

    /**
     * Abort with 404 if the user is not a member of the project.
     */
    protected function ensureUserIsMember(Project $project, User $user): void
    {
        $isMember = $project->members()
            ->where('users.id', $user->id)
            ->exists();

        abort_unless($isMember, 404, 'User is not a member of this project.');
    }

    /**
     * Abort with 422 if removing or demoting this user would leave
     * the project with no owners.
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
