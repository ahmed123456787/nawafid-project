<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectMemberTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_add_member(): void
    {
        $owner = User::factory()->create();
        $newMember = User::factory()->create();
        $project = Project::factory()->create();
        $project->members()->attach($owner->id, ['role' => 'owner']);

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/projects/{$project->id}/members", [
                'user_id' => $newMember->id,
                'role' => 'member',
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('project_user', [
            'project_id' => $project->id,
            'user_id' => $newMember->id,
            'role' => 'member',
        ]);
    }

    public function test_non_owner_cannot_add_member(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $stranger = User::factory()->create();
        $project = Project::factory()->create();
        $project->members()->attach($owner->id, ['role' => 'owner']);
        $project->members()->attach($member->id, ['role' => 'member']);

        $this->actingAs($member, 'sanctum')
            ->postJson("/api/projects/{$project->id}/members", [
                'user_id' => $stranger->id,
                'role' => 'member',
            ])
            ->assertStatus(403);
    }

    public function test_cannot_add_user_already_in_project(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $project = Project::factory()->create();
        $project->members()->attach($owner->id, ['role' => 'owner']);
        $project->members()->attach($member->id, ['role' => 'member']);

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/projects/{$project->id}/members", [
                'user_id' => $member->id,
                'role' => 'member',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['user_id']);
    }

    public function test_owner_can_change_member_role(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $project = Project::factory()->create();
        $project->members()->attach($owner->id, ['role' => 'owner']);
        $project->members()->attach($member->id, ['role' => 'member']);

        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/projects/{$project->id}/members/{$member->id}", [
                'role' => 'owner',
            ])
            ->assertStatus(200);

        $this->assertDatabaseHas('project_user', [
            'project_id' => $project->id,
            'user_id' => $member->id,
            'role' => 'owner',
        ]);
    }

    public function test_owner_can_remove_member(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $project = Project::factory()->create();
        $project->members()->attach($owner->id, ['role' => 'owner']);
        $project->members()->attach($member->id, ['role' => 'member']);

        $this->actingAs($owner, 'sanctum')
            ->deleteJson("/api/projects/{$project->id}/members/{$member->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('project_user', [
            'project_id' => $project->id,
            'user_id' => $member->id,
        ]);
    }

    public function test_cannot_remove_last_owner(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create();
        $project->members()->attach($owner->id, ['role' => 'owner']);

        $this->actingAs($owner, 'sanctum')
            ->deleteJson("/api/projects/{$project->id}/members/{$owner->id}")
            ->assertStatus(422);

        $this->assertDatabaseHas('project_user', [
            'project_id' => $project->id,
            'user_id' => $owner->id,
        ]);
    }

    public function test_cannot_demote_last_owner(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create();
        $project->members()->attach($owner->id, ['role' => 'owner']);

        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/projects/{$project->id}/members/{$owner->id}", [
                'role' => 'member',
            ])
            ->assertStatus(422);
    }
}
