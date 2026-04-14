<?php

namespace App\Http\Controllers;

use App\Models\Seient;
use App\Events\SeientActualitzat;
use Illuminate\Http\Request;
use Carbon\Carbon;

// Controlador que gestiona la lògica en temps real (WebSockets) via crides HTTP.
// Simula el comportament de bloqueig temporal que abans gestionava Socket.io directament.
class SocketController extends Controller
{
    /**
     * Bloqueja temporalment un seient quan un usuari el selecciona a la interfície.
     */
    public function reserve(Request $request)
    {
        $seientId = $request->seatId;
        $socketId = $request->socketId; // Identificador únic de la finestra del navegador de l'usuari.

        $seient = Seient::find($seientId);
        if (!$seient || $seient->estat !== 'Lliure') {
            return response()->json(['error' => 'Aquest seient ja no està disponible.'], 400);
        }

        // Establim un temps d'expiració de 10 minuts per a la reserva temporal.
        $expiresAt = Carbon::now()->addMinutes(10);
        
        // Emmagatzemem el bloqueig a la base de dades.
        $seient->update([
            'socket_id' => $socketId,
            'expires_at' => $expiresAt
        ]);

        // Emetem l'event cap a tots els navegadors connectats mitjançant Laravel Reverb.
        broadcast(new SeientActualitzat($seient))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Allibera un seient que s'havia bloquejat prèviament per error o canvi de plans del client.
     */
    public function cancel(Request $request)
    {
        $seientId = $request->seatId;
        
        $seient = Seient::find($seientId);
        if ($seient) {
            // Netegem les dades de bloqueig.
            $seient->update([
                'socket_id' => null,
                'expires_at' => null
            ]);

            // Informem a tothom que el seient torna a estar lliure.
            broadcast(new SeientActualitzat($seient))->toOthers();
        }

        return response()->json(['success' => true]);
    }
}
