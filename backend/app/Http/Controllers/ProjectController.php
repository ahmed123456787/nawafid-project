<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(protected ProjectService $projects)
    {
    }


    /**
     * List projects the authenticated user belongs to.
     *
     * Query params:
     *   q=<search in name/description>
     *   per_page=<int, default 15, max 100>
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Project::class);

        $perPage = min((int) $request->integer('per_page', 15) ?: 15, 100);

        $projects = $request->user()
            ->projects()
            ->withCount('tasks')
            ->when($request->filled('q'), function ($query) use ($request) {
                $term = '%'.$request->string('q').'%';
                $query->where(function ($q) use ($term) {
                    $q->where('projects.name', 'like', $term)
                        ->orWhere('projects.description', 'like', $term);
                });
            })
            ->orderByDesc('projects.created_at')
            ->paginate($perPage);

        return response()->json($projects);
    }

    /**
     * Create a new project and attach the creator as owner.
     */
    public function store(StoreProjectRequest $request): JsonResponse
    {
        $this->authorize('create', Project::class);

        $project = $this->projects->createFor($request->user(), $request->validated());

        return response()->json($project->load('members'), 201);
    }

    /**
     * Show a single project with its members.
     */
    public function show(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        return response()->json(
            $project->load('members')->loadCount('tasks')
        );
    }

    /**
     * Update the project (owner only).
     */
    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $project->update($request->validated());

        return response()->json($project);
    }

    /**
     * Delete the project (owner only). Cascades tasks and memberships.
     */
    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return response()->json(null, 204);
    }
}
