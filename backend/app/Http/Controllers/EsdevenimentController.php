<?php

namespace App\Http\Controllers;

use App\Models\Esdeveniment;
use Illuminate\Http\Request;

// Aquest controlador s'encarrega de servir la informació pública dels esdeveniments.
// Actua com el proveïdor de dades per a la cartellera i el mapa de seients.
class EsdevenimentController extends Controller
{
    /**
     * Retorna el llistat complet d'esdeveniments per a la pàgina principal.
     * Inclou lògica de càlcul de disponibilitat en temps real.
     */
    public function index()
    {
        // Recuperem els esdeveniments amb les seves categories i seients associats.
        $events = Esdeveniment::with(['categories.seients'])->get();

        // Calculem les mètriques d'ocupació per a cada event .
        $formatted = $events->map(function ($ev) {
            $lliures = 0;
            $totals = 0;
            foreach ($ev->categories as $cat) {
                foreach ($cat->seients as $seient) {
                    $totals++;
                    // Un seient es considera lliure si el seu estat és 'Lliure'.
                    if ($seient->estat === 'Lliure') {
                        $lliures++;
                    }
                }
            }

            // Retornem un objecte net i optimitzat per al llistat de Nuxt.
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

    /**
     * Retorna el detall d'un esdeveniment específic i el seu mapa de seients.
     */
    public function show($id)
    {
        // Busquem l'esdeveniment i carreguem tota la jerarquia de butaques.
        $ev = Esdeveniment::with(['categories.seients'])->findOrFail($id);

        $seats = [];
        foreach ($ev->categories as $cat) {
            foreach ($cat->seients as $seient) {
                // Preparem la col·lecció de seients amb la informació necessària per al plànol interactiu.
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
