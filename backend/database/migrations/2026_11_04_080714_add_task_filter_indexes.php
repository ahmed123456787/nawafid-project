<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Composite indexes aligned with the task list query, which always
     * filters by project first and then optionally by status/priority and
     * always orders by created_at.
     *
     * The leftmost-prefix rule means each of these also serves queries that
     * filter by project_id alone, so we do not lose anything that was already
     * covered by the implicit FK index on project_id.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->index(['project_id', 'status']);
            $table->index(['project_id', 'priority']);
            $table->index(['project_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'status']);
            $table->dropIndex(['project_id', 'priority']);
            $table->dropIndex(['project_id', 'created_at']);
        });
    }
};
