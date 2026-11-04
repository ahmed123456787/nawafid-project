<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectMemberController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Auth endpoints are throttled to deter brute-force and sign-up spam.
// 6 attempts per minute per IP (Laravel's default throttle:6,1).
Route::middleware('throttle:6,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('users', [UserController::class, 'index']);

    Route::apiResource('projects', ProjectController::class);

    Route::get('projects/{project}/tasks', [TaskController::class, 'index']);
    Route::post('projects/{project}/tasks', [TaskController::class, 'store']);

    Route::get('tasks/{task}', [TaskController::class, 'show']);
    Route::put('tasks/{task}', [TaskController::class, 'update']);
    Route::patch('tasks/{task}', [TaskController::class, 'update']);
    Route::delete('tasks/{task}', [TaskController::class, 'destroy']);

    Route::post('projects/{project}/members', [ProjectMemberController::class, 'store']);
    Route::patch('projects/{project}/members/{user}', [ProjectMemberController::class, 'update']);
    Route::delete('projects/{project}/members/{user}', [ProjectMemberController::class, 'destroy']);
});
