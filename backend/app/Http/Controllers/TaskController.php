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
use Illuminate\Validation\Rule;

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
     *   per_page=<int, default 15, max 100>
     */
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(TaskStatus::class)],
            'priority' => ['nullable', Rule::enum(TaskPriority::class)],
            'assigned_to' => ['nullable', 'integer'],
            'q' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $perPage = $filters['per_page'] ?? 15;

        $tasks = $project->tasks()
            ->when(
                ! empty($filters['status']),
                fn ($q) => $q->where('status', $filters['status'])
            )
            ->when(
                ! empty($filters['priority']),
                fn ($q) => $q->where('priority', $filters['priority'])
            )
            ->when(
                ! empty($filters['assigned_to']),
                fn ($q) => $q->where('assigned_to', $filters['assigned_to'])
            )
            ->when(
                ! empty($filters['q']),
                fn ($q) => $q->where('title', 'like', '%'.$filters['q'].'%')
            )
            ->with(['assignee', 'creator'])
            ->orderByDesc('created_at')
            ->paginate($perPage);

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
