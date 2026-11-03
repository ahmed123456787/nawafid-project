<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_only_projects_user_belongs_to(): void
    {
        $alice = User::factory()->create();
        $bob = User::factory()->create();

        $aliceProject = Project::factory()->create();
        $aliceProject->members()->attach($alice->id, ['role' => 'owner']);

        $bobProject = Project::factory()->create();
        $bobProject->members()->attach($bob->id, ['role' => 'owner']);

        $this->actingAs($alice, 'sanctum')
            ->getJson('/api/projects')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $aliceProject->id);
    }

    public function test_index_supports_search_by_name(): void
    {
        $user = User::factory()->create();

        $alpha = Project::factory()->create(['name' => 'Alpha Project']);
        $beta = Project::factory()->create(['name' => 'Beta Project']);
        $alpha->members()->attach($user->id, ['role' => 'owner']);
        $beta->members()->attach($user->id, ['role' => 'owner']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/projects?q=alpha')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $alpha->id);
    }

    public function test_authenticated_user_can_create_project_and_becomes_owner(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/projects', [
                'name' => 'My Project',
                'description' => 'desc',
            ])
            ->assertStatus(201)
            ->assertJsonPath('name', 'My Project');

        $projectId = $response->json('id');

        $this->assertDatabaseHas('project_user', [
            'project_id' => $projectId,
            'user_id' => $user->id,
            'role' => 'owner',
        ]);
    }

    public function test_member_can_view_project(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $project = Project::factory()->create();
        $project->members()->attach($owner->id, ['role' => 'owner']);
        $project->members()->attach($member->id, ['role' => 'member']);

        $this->actingAs($member, 'sanctum')
            ->getJson("/api/projects/{$project->id}")
            ->assertStatus(200)
            ->assertJsonPath('id', $project->id);
    }

    public function test_non_member_cannot_view_project(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $project = Project::factory()->create();
        $project->members()->attach($owner->id, ['role' => 'owner']);

        $this->actingAs($outsider, 'sanctum')
            ->getJson("/api/projects/{$project->id}")
            ->assertStatus(403);
    }

    public function test_owner_can_update_project(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create();
        $project->members()->attach($owner->id, ['role' => 'owner']);

        $this->actingAs($owner, 'sanctum')
            ->putJson("/api/projects/{$project->id}", ['name' => 'Renamed'])
            ->assertStatus(200)
            ->assertJsonPath('name', 'Renamed');
    }

    public function test_non_owner_member_cannot_update_project(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $project = Project::factory()->create();
        $project->members()->attach($owner->id, ['role' => 'owner']);
        $project->members()->attach($member->id, ['role' => 'member']);

        $this->actingAs($member, 'sanctum')
            ->putJson("/api/projects/{$project->id}", ['name' => 'Hacked'])
            ->assertStatus(403);
    }

    public function test_owner_can_delete_project(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create();
        $project->members()->attach($owner->id, ['role' => 'owner']);

        $this->actingAs($owner, 'sanctum')
            ->deleteJson("/api/projects/{$project->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    public function test_non_owner_member_cannot_delete_project(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $project = Project::factory()->create();
        $project->members()->attach($owner->id, ['role' => 'owner']);
        $project->members()->attach($member->id, ['role' => 'member']);

        $this->actingAs($member, 'sanctum')
            ->deleteJson("/api/projects/{$project->id}")
            ->assertStatus(403);
    }
}
