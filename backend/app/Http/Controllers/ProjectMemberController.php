<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddMemberRequest;
use App\Http\Requests\UpdateMemberRoleRequest;
use App\Models\Project;
use App\Models\User;
use App\Services\ProjectMembershipService;
use Illuminate\Http\JsonResponse;

class ProjectMemberController extends Controller
{
    public function __construct(protected ProjectMembershipService $memberships)
    {
    }

    /**
     * Add a user to the project with a role.
     */
    public function store(AddMemberRequest $request, Project $project): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        $project = $this->memberships->add(
            $project,
            $request->integer('user_id'),
            (string) $request->string('role'),
        );

        return response()->json($project, 201);
    }

    /**
     * Change a member's role.
     */
    public function update(UpdateMemberRoleRequest $request, Project $project, User $user): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        $project = $this->memberships->changeRole(
            $project,
            $user,
            (string) $request->string('role'),
        );

        return response()->json($project);
    }

    /**
     * Remove a member from the project.
     */
    public function destroy(Project $project, User $user): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        $this->memberships->remove($project, $user);

        return response()->json(null, 204);
    }
}
