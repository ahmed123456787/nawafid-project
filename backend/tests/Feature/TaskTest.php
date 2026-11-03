<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Helper: create a project with a given owner and optional extra members.
     *
     * @param  array<int, array{0: User, 1: string}>  $extraMembers
     */
    private function projectWith(User $owner, array $extraMembers = []): Project
    {
        $project = Project::factory()->create();
        $project->members()->attach($owner->id, ['role' => 'owner']);
        foreach ($extraMembers as [$user, $role]) {
            $project->members()->attach($user->id, ['role' => $role]);
        }
        return $project;
    }

    public function test_member_can_list_tasks(): void
    {
        $user = User::factory()->create();
        $project = $this->projectWith($user);
        Task::factory()->count(3)->create(['project_id' => $project->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/projects/{$project->id}/tasks")
            ->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_non_member_cannot_list_tasks(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $project = $this->projectWith($owner);

        $this->actingAs($outsider, 'sanctum')
            ->getJson("/api/projects/{$project->id}/tasks")
            ->assertStatus(403);
    }

    public function test_task_list_can_be_filtered_by_status(): void
    {
        $user = User::factory()->create();
        $project = $this->projectWith($user);
        Task::factory()->create(['project_id' => $project->id, 'status' => 'todo']);
        Task::factory()->create(['project_id' => $project->id, 'status' => 'done']);

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/projects/{$project->id}/tasks?status=done")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'done');
    }

    public function test_task_list_can_be_filtered_by_priority(): void
    {
        $user = User::factory()->create();
        $project = $this->projectWith($user);
        Task::factory()->create(['project_id' => $project->id, 'priority' => 'low']);
        Task::factory()->create(['project_id' => $project->id, 'priority' => 'high']);

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/projects/{$project->id}/tasks?priority=high")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.priority', 'high');
    }

    public function test_task_list_can_be_searched_by_title(): void
    {
        $user = User::factory()->create();
        $project = $this->projectWith($user);
        Task::factory()->create(['project_id' => $project->id, 'title' => 'Write docs']);
        Task::factory()->create(['project_id' => $project->id, 'title' => 'Fix bug']);

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/projects/{$project->id}/tasks?q=docs")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Write docs');
    }

    public function test_member_can_create_task(): void
    {
        $user = User::factory()->create();
        $project = $this->projectWith($user);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/projects/{$project->id}/tasks", [
                'title' => 'New task',
                'priority' => 'high',
                'status' => 'todo',
            ])
            ->assertStatus(201)
            ->assertJsonPath('title', 'New task')
            ->assertJsonPath('created_by', $user->id);
    }

    public function test_non_member_cannot_create_task(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $project = $this->projectWith($owner);

        $this->actingAs($outsider, 'sanctum')
            ->postJson("/api/projects/{$project->id}/tasks", ['title' => 'Nope'])
            ->assertStatus(403);
    }

    public function test_cannot_assign_task_to_non_member(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $project = $this->projectWith($owner);

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/projects/{$project->id}/tasks", [
                'title' => 'Bad assign',
                'assigned_to' => $outsider->id,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['assigned_to']);
    }

    public function test_member_can_update_task(): void
    {
        $user = User::factory()->create();
        $project = $this->projectWith($user);
        $task = Task::factory()->create([
            'project_id' => $project->id,
            'status' => 'todo',
        ]);

        $this->actingAs($user, 'sanctum')
            ->patchJson("/api/tasks/{$task->id}", ['status' => 'done'])
            ->assertStatus(200)
            ->assertJsonPath('status', 'done');
    }

    public function test_non_member_cannot_update_task(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $project = $this->projectWith($owner);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $this->actingAs($outsider, 'sanctum')
            ->patchJson("/api/tasks/{$task->id}", ['status' => 'done'])
            ->assertStatus(403);
    }

    public function test_member_can_delete_task(): void
    {
        $user = User::factory()->create();
        $project = $this->projectWith($user);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/tasks/{$task->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_non_member_cannot_delete_task(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $project = $this->projectWith($owner);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $this->actingAs($outsider, 'sanctum')
            ->deleteJson("/api/tasks/{$task->id}")
            ->assertStatus(403);
    }
}
