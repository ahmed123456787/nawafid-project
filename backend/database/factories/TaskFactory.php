<?php

namespace Database\Factories;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'status' => fake()->randomElement(TaskStatus::cases()),
            'priority' => fake()->randomElement(TaskPriority::cases()),
            'due_date' => fake()->optional()->dateTimeBetween('-1 week', '+1 month'),
            'assigned_to' => User::factory(),
            'created_by' => User::factory(),
        ];
    }

    /**
     * Indicate the task is overdue.
     */
    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'due_date' => fake()->dateTimeBetween('-1 month', '-1 day'),
            'status' => fake()->randomElement([TaskStatus::Todo, TaskStatus::InProgress]),
        ]);
    }

    /**
     * Indicate the task is done.
     */
    public function done(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => TaskStatus::Done,
        ]);
    }
}
