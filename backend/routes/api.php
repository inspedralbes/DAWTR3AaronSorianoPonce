<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AutenticacioController;
use App\Http\Controllers\EsdevenimentController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\AdministracioController;
use App\Http\Controllers\SocketController;

/**
 * Definició de les rutes d'API per a la plataforma de ticketing.
 * Totes les rutes estan prefixades per /api de manera predeterminada a Laravel.
 */

// --- Rutes Públiques d'Autenticació ---
Route::post('/auth/register', [AutenticacioController::class, 'register']);
Route::post('/auth/login', [AutenticacioController::class, 'login']);

// --- Rutes Públiques de Cartellera i Esdeveniments ---
Route::get('/events', [EsdevenimentController::class, 'index']);
Route::get('/events/{id}', [EsdevenimentController::class, 'show']);

// --- Rutes de Temps Real (Bloqueig de Seients) ---
// S'utilitzen crides HTTP per desencadenar esdeveniments de Broadcast cap a Reverb.
Route::post('/seat/reserve', [SocketController::class, 'reserve']);
Route::post('/seat/cancel', [SocketController::class, 'cancel']);

// --- Rutes Protegides (Sessió de Client) ---
// Requereixen el token de Sanctum obtingut en el login.
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/tickets', [AutenticacioController::class, 'tickets']);
    Route::post('/buy', [ReservaController::class, 'buy']);
});

// --- Rutes d'Administració ---
// En una fase de producció, aquestes rutes haurien d'estar protegides per un middleware 'admin'.
Route::get('/admin/stats', [AdministracioController::class, 'globalStats']);
Route::get('/admin/events-stats', [AdministracioController::class, 'eventsStats']);
Route::get('/admin/purchases', [AdministracioController::class, 'purchases']);
Route::get('/admin/reports', [AdministracioController::class, 'reports']);
Route::post('/admin/events', [AdministracioController::class, 'store']);
Route::delete('/admin/events/{id}', [AdministracioController::class, 'destroy']);
