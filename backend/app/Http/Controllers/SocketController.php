<?php

namespace App\Http\Controllers;

use App\Models\Seient;
use App\Events\SeatUpdated;
use Illuminate\Http\Request;

class SocketController extends Controller
{
    public function reserve(Request $request)
    {
        $request->validate(['eventId' => 'required', 'seatId' => 'required', 'socketId' => 'required']);
        $seient = Seient::find($request->seatId);
        
        if ($seient && $seient->estat === 'Lliure' && !$seient->socket_id) {
            $seient->socket_id = $request->socketId;
            $seient->expires_at = now()->addMinutes(5);
            $seient->save();

            broadcast(new SeatUpdated($request->eventId, $seient))->toOthers();
            return response()->json(['success' => true]);
        }
        return response()->json(['error' => 'No disponible'], 400);
    }

    public function cancel(Request $request)
    {
        $request->validate(['eventId' => 'required', 'seatId' => 'required', 'socketId' => 'required']);
        $seient = Seient::find($request->seatId);

        if ($seient && $seient->socket_id === $request->socketId) {
            $seient->socket_id = null;
            $seient->expires_at = null;
            $seient->save();

            broadcast(new SeatUpdated($request->eventId, $seient))->toOthers();
            return response()->json(['success' => true]);
        }
        return response()->json(['error' => 'No és la teva reserva'], 400);
    }
}
