<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AutenticacioController;
use App\Http\Controllers\EsdevenimentController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\AdministracioController;

Route::post('/auth/register', [AutenticacioController::class, 'register']);
Route::post('/auth/login', [AutenticacioController::class, 'login']);

Route::get('/events', [EsdevenimentController::class, 'index']);
Route::get('/events/{id}', [EsdevenimentController::class, 'show']);

use App\Http\Controllers\SocketController;
Route::post('/seat/reserve', [SocketController::class, 'reserve']);
Route::post('/seat/cancel', [SocketController::class, 'cancel']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/tickets', [AutenticacioController::class, 'tickets']);
    Route::post('/buy', [ReservaController::class, 'buy']);
});

Route::get('/admin/stats', [AdministracioController::class, 'globalStats']);
Route::get('/admin/events-stats', [AdministracioController::class, 'eventsStats']);
Route::get('/admin/purchases', [AdministracioController::class, 'purchases']);
Route::get('/admin/reports', [AdministracioController::class, 'reports']);
Route::post('/admin/events', [AdministracioController::class, 'store']);
Route::delete('/admin/events/{id}', [AdministracioController::class, 'destroy']);
