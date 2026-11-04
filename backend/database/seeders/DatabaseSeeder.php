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
     *
     * Creates a known demo account (test@example.com / password) that is the
     * owner of every seeded project, so anyone cloning the repo can log in
     * and exercise owner-only features (edit, delete, manage members)
     * straight away.
     */
    public function run(): void
    {
        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $otherUsers = User::factory()->count(5)->create();

        Project::factory()->count(3)->create()->each(function (Project $project) use ($otherUsers, $testUser) {
            // Demo user is the owner of every seeded project.
            $project->members()->attach($testUser->id, ['role' => 'owner']);

            // Attach 3 other users as regular members.
            foreach ($otherUsers->random(3) as $member) {
                $project->members()->attach($member->id, ['role' => 'member']);
            }

            $projectMemberIds = $project->members()->pluck('users.id');

            Task::factory()->count(8)->create([
                'project_id' => $project->id,
                'assigned_to' => fn () => $projectMemberIds->random(),
                'created_by' => $testUser->id,
            ]);

            Task::factory()->overdue()->count(2)->create([
                'project_id' => $project->id,
                'assigned_to' => fn () => $projectMemberIds->random(),
                'created_by' => $testUser->id,
            ]);

            Task::factory()->done()->count(3)->create([
                'project_id' => $project->id,
                'assigned_to' => fn () => $projectMemberIds->random(),
                'created_by' => $testUser->id,
            ]);
        });

        $this->command->info('');
        $this->command->info('Demo account: test@example.com / password  (owner of all seeded projects)');
    }
}
