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
     * owner of one seeded project and a plain member of the others, so both
     * perspectives (owner-only vs. member-only features) can be exercised
     * right after a fresh clone.
     */
    public function run(): void
    {
        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $otherUsers = User::factory()->count(5)->create();

        Project::factory()
            ->count(3)
            ->create()
            ->each(function (Project $project, int $index) use ($otherUsers, $testUser) {
                // Pick a dedicated owner for the project.
                // The first project is owned by the demo user so they land on
                // owner-only features immediately; the rest are owned by other
                // users so the demo account also sees the member perspective.
                $owner = $index === 0 ? $testUser : $otherUsers->random();

                $project->members()->attach($owner->id, ['role' => 'owner']);

                // Make sure the demo user is in every project so they can see
                // the full seeded dataset.
                if ($owner->id !== $testUser->id) {
                    $project->members()->attach($testUser->id, ['role' => 'member']);
                }

                // Add two more random members for realism.
                foreach ($otherUsers->except([$owner->id])->random(2) as $member) {
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

        $this->command->info('');
        $this->command->info('Demo account: test@example.com / password');
        $this->command->info('  — owner of the first seeded project');
        $this->command->info('  — member of the other two');
    }
}
