<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    /**
     * Create a project and attach the given user as its first owner.
     *
     * @param  array<string, mixed>  $data
     */
    public function createFor(User $user, array $data): Project
    {
        return DB::transaction(function () use ($user, $data) {
            $project = Project::create($data);

            $project->members()->attach($user->id, ['role' => 'owner']);

            return $project;
        });
    }
}
