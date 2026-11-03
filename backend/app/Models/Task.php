<?php

namespace App\Models;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    /** @use HasFactory<\Database\Factories\TaskFactory> */
    use HasFactory;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'status',
        'priority',
        'due_date',
        'assigned_to',
        'created_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'status' => TaskStatus::class,
            'priority' => TaskPriority::class,
        ];
    }

    /**
     * The project this task belongs to.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * The user this task is assigned to.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * The user who created this task.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Determine whether the task is completed.
     */
    public function isDone(): bool
    {
        return $this->status === TaskStatus::Done;
    }

    /**
     * Determine whether the task is past its due date and still open.
     */
    public function isOverdue(): bool
    {
        return $this->due_date !== null
            && $this->due_date->lt(today())
            && ! $this->isDone();
    }

    /**
     * Limit the query to overdue tasks.
     */
    #[Scope]
    protected function overdue(Builder $query): void
    {
        $query->whereDate('due_date', '<', today())
            ->whereNot('status', TaskStatus::Done->value);
    }

    /**
     * Limit the query to tasks assigned to the given user.
     */
    #[Scope]
    protected function assignedTo(Builder $query, int $userId): void
    {
        $query->where('assigned_to', $userId);
    }

    /**
     * Limit the query to tasks belonging to the given project.
     */
    #[Scope]
    protected function forProject(Builder $query, int $projectId): void
    {
        $query->where('project_id', $projectId);
    }
}
