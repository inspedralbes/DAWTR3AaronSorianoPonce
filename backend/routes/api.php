<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\AdminController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);

use App\Http\Controllers\SocketController;
Route::post('/seat/reserve', [SocketController::class, 'reserve']);
Route::post('/seat/cancel', [SocketController::class, 'cancel']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/tickets', [AuthController::class, 'tickets']);
    Route::post('/buy', [ReservaController::class, 'buy']);
});

Route::get('/admin/stats', [AdminController::class, 'globalStats']);
Route::get('/admin/events-stats', [AdminController::class, 'eventsStats']);
Route::get('/admin/purchases', [AdminController::class, 'purchases']);
Route::get('/admin/reports', [AdminController::class, 'reports']);
Route::post('/admin/events', [AdminController::class, 'store']);
Route::delete('/admin/events/{id}', [AdminController::class, 'destroy']);
