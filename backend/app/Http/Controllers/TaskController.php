<?php

namespace App\Http\Controllers;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * List tasks within a project. Supports filtering and search.
     *
     * Query params:
     *   status=todo|in_progress|done
     *   priority=low|medium|high
     *   assigned_to=<user_id>
     *   q=<search in title>
     */
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $tasks = $project->tasks()
            ->when(
                $request->filled('status'),
                fn ($q) => $q->where('status', TaskStatus::from($request->string('status')))
            )
            ->when(
                $request->filled('priority'),
                fn ($q) => $q->where('priority', TaskPriority::from($request->string('priority')))
            )
            ->when(
                $request->filled('assigned_to'),
                fn ($q) => $q->where('assigned_to', $request->integer('assigned_to'))
            )
            ->when(
                $request->filled('q'),
                fn ($q) => $q->where('title', 'like', '%'.$request->string('q').'%')
            )
            ->with(['assignee', 'creator'])
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json($tasks);
    }

    /**
     * Create a task in the given project.
     */
    public function store(StoreTaskRequest $request, Project $project): JsonResponse
    {
        $this->authorize('create', [Task::class, $project]);

        $task = $project->tasks()->create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        return response()->json($task->load(['assignee', 'creator']), 201);
    }

    /**
     * Show a single task.
     */
    public function show(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        return response()->json(
            $task->load(['assignee', 'creator', 'project'])
        );
    }

    /**
     * Update a task.
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $task->update($request->validated());

        return response()->json($task->load(['assignee', 'creator']));
    }

    /**
     * Delete a task.
     */
    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);

        $task->delete();

        return response()->json(null, 204);
    }
}
