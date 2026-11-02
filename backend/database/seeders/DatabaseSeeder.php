<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $otherUsers = User::factory()->count(5)->create();
        $allUsers = $otherUsers->push($testUser);

        Project::factory()->count(3)->create()->each(function (Project $project) use ($allUsers, $testUser) {
            $owner = $allUsers->random();

            $project->members()->attach($owner->id, ['role' => 'owner']);

            if (! $project->members()->where('user_id', $testUser->id)->exists()) {
                $project->members()->attach($testUser->id, ['role' => 'member']);
            }

            $members = $allUsers
                ->except([$owner->id, $testUser->id])
                ->random(2);

            foreach ($members as $member) {
                $project->members()->attach($member->id, ['role' => 'member']);
            }

            $projectMemberIds = $project->members()->pluck('users.id');

            Task::factory()->count(8)->create([
                'project_id' => $project->id,
                'assigned_to' => fn () => $projectMemberIds->random(),
                'created_by' => $owner->id,
            ]);

            Task::factory()->overdue()->count(2)->create([
                'project_id' => $project->id,
                'assigned_to' => fn () => $projectMemberIds->random(),
                'created_by' => $owner->id,
            ]);

            Task::factory()->done()->count(3)->create([
                'project_id' => $project->id,
                'assigned_to' => fn () => $projectMemberIds->random(),
                'created_by' => $owner->id,
            ]);
        });
    }
}
