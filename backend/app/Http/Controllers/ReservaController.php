<?php

namespace App\Http\Controllers;

use App\Models\Seient;
use App\Models\Reserva;
use App\Events\SeatUpdated;
use Illuminate\Http\Request;

class ReservaController extends Controller
{
    public function buy(Request $request)
    {
        $request->validate([
            'eventId' => 'required',
            'seats' => 'required|array',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'No autènticat'], 401);
        }

        $seatIds = $request->seats;

        // Validació: comprovem que tots estan Lliures o reservats per nosaltres
        $seients = Seient::whereIn('id', $seatIds)->get();
        foreach ($seients as $seient) {
            if ($seient->estat === 'Venut') {
                return response()->json(['error' => 'Un seient ja ha estat venut'], 400);
            }
        }

        foreach ($seients as $seient) {
            $seient->estat = 'Venut';
            $seient->socket_id = null;
            $seient->expires_at = null;
            $seient->save();

            Reserva::create([
                'usuari_id' => $user->id,
                'seient_id' => $seient->id,
                'data_expiracio' => now()->addYears(10), // fake expiry
                'estat' => 'Completada'
            ]);

            // Broadcast websocket event
            broadcast(new SeatUpdated($request->eventId, $seient))->toOthers();
        }

        return response()->json(['success' => true]);
    }
}
