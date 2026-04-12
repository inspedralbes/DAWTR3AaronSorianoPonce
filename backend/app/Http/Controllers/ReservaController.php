<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Seient;
use App\Models\Usuari;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Events\SeientActualitzat;

// Controlador encarregat de la formalització de les compres.
// Gestiona la transaccionalitat del procés de pagament simulat.
class ReservaController extends Controller
{
    /**
     * Finalitza el procés de compra per a un conjunt de seients i un usuari.
     * Implementa una transacció de base de dades per assegurar la integritat de la informació.
     */
    public function buy(Request $request)
    {
        $request->validate([
            'eventId' => 'required',
            'seats' => 'required|array',
            'user' => 'required'
        ]);

        $usuariEmail = $request->user['email'];
        $user = Usuari::where('email', $usuariEmail)->first();

        if (!$user) {
            return response()->json(['error' => 'Cal estar registrat per realitzar la compra.'], 401);
        }

        // Iniciem una transacció per evitar que es venguin seients duplicats en cas d'un error parcial.
        DB::beginTransaction();
        try {
            foreach ($request->seats as $seatId) {
                $seient = Seient::lockForUpdate()->find($seatId);
                
                // Verifiquem que el seient no hagi estat venut mentre es realitzava el pagament.
                if ($seient->estat === 'Venut') {
                    throw new \Exception("El seient {$seient->numero} ja ha estat adquirit per un altre client.");
                }

                // Actualitzem l'estat del seient a 'Venut' i netegem la reserva temporal del socket.
                $seient->update([
                    'estat' => 'Venut',
                    'socket_id' => null,
                    'expires_at' => null
                ]);

                // Creem el registre permanent de la reserva i el dret d'accés (ticket).
                Reserva::create([
                    'usuari_id' => $user->id,
                    'seient_id' => $seatId,
                    'data_expiracio' => null, // Una entrada venuda no expira.
                    'estat' => 'Venut'
                ]);

                // Notifiquem a la resta d'usuaris que el seient ja no està disponible (Broadcast Reverb).
                broadcast(new SeientActualitzat($seient))->toOthers();
            }

            DB::commit(); // Confirmem tots els canvis.
            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            DB::rollBack(); // Si hi ha qualsevol error, revertim tota l'operació.
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
