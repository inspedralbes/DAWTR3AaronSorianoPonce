<?php

namespace App\Http\Controllers;

use App\Models\Esdeveniment;
use Illuminate\Http\Request;

class EsdevenimentController extends Controller
{
    public function index()
    {
        $events = Esdeveniment::with(['categories.seients'])->get();

        $formatted = $events->map(function ($ev) {
            $lliures = 0;
            $totals = 0;
            foreach ($ev->categories as $cat) {
                foreach ($cat->seients as $seient) {
                    $totals++;
                    if ($seient->estat === 'Lliure') {
                        $lliures++;
                    }
                }
            }

            return [
                'id' => $ev->id,
                'nom' => $ev->nom,
                'data' => $ev->data,
                'descripcio' => $ev->descripcio,
                'tag' => $ev->tag,
                'imatge' => $ev->imatge,
                'aforament' => $ev->aforament,
                'lliures' => $lliures,
                'venuts' => $totals - $lliures
            ];
        });

        return response()->json($formatted);
    }

    public function show($id)
    {
        $ev = Esdeveniment::with(['categories.seients'])->findOrFail($id);

        $seats = [];
        foreach ($ev->categories as $cat) {
            foreach ($cat->seients as $seient) {
                $seats[] = [
                    'id' => $seient->id,
                    'categoria' => $cat->nom,
                    'preu' => $cat->preu,
                    'fila' => $seient->fila,
                    'numero' => $seient->numero,
                    'estat' => $seient->estat,
                    'socketId' => $seient->socket_id,
                    'expiresAt' => $seient->expires_at
                ];
            }
        }

        return response()->json([
            'id' => $ev->id,
            'nom' => $ev->nom,
            'data' => $ev->data,
            'descripcio' => $ev->descripcio,
            'imatge' => $ev->imatge,
            'seats' => $seats
        ]);
    }
}
