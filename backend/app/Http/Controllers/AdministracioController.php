<?php

namespace App\Http\Controllers;

use App\Models\Esdeveniment;
use App\Models\Reserva;
use App\Models\Seient;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdministracioController extends Controller
{
    public function globalStats()
    {
        $seients = Seient::with('categoria')->get();
        $lliures = 0;
        $venuts = 0;
        $reservats = 0;
        $recaptacio = 0;

        foreach ($seients as $s) {
            if ($s->estat === 'Lliure' && $s->socket_id) {
                $reservats++;
            } elseif ($s->estat === 'Lliure') {
                $lliures++;
            } elseif ($s->estat === 'Venut') {
                $venuts++;
                $recaptacio += $s->categoria->preu;
            }
        }

        return response()->json([
            'lliures' => $lliures,
            'venuts' => $venuts,
            'reservats' => $reservats,
            'recaptacio' => $recaptacio
        ]);
    }

    public function eventsStats()
    {
        $events = Esdeveniment::with('categories.seients')->get();
        $res = [];
        foreach ($events as $ev) {
            $lliures = 0; $venuts = 0; $reservats = 0; $total = 0;
            foreach ($ev->categories as $c) {
                foreach ($c->seients as $s) {
                    $total++;
                    if ($s->estat === 'Lliure' && $s->socket_id) $reservats++;
                    elseif ($s->estat === 'Lliure') $lliures++;
                    elseif ($s->estat === 'Venut') $venuts++;
                }
            }
            $ocupacio = $total > 0 ? round(($venuts / $total) * 100) : 0;
            $res[] = [
                'id' => $ev->id,
                'nom' => $ev->nom,
                'tag' => $ev->tag,
                'imatge' => $ev->imatge,
                'aforament' => $ev->aforament,
                'lliures' => $lliures,
                'venuts' => $venuts,
                'reservats' => $reservats,
                'ocupacio' => $ocupacio
            ];
        }
        return response()->json($res);
    }

    public function reports()
    {
        $cats = DB::select("SELECT c.nom as categoria, SUM(c.preu) as total_recapte, COUNT(s.id) as entrades_venudes FROM categories c JOIN seients s ON s.categoria_id = c.id WHERE s.estat = 'Venut' GROUP BY c.nom");
        return response()->json(['categories' => $cats]);
    }

    public function purchases()
    {
        $reserves = Reserva::with(['usuari', 'seient.categoria.esdeveniment'])->get();
        $formatted = $reserves->map(function($r) {
            return [
                'id' => $r->id,
                'client_nom' => $r->usuari->nom,
                'email' => $r->usuari->email,
                'event_nom' => $r->seient->categoria->esdeveniment->nom,
                'categoria' => $r->seient->categoria->nom,
                'fila' => $r->seient->fila,
                'numero' => $r->seient->numero
            ];
        });
        return response()->json($formatted);
    }

    public function store(Request $request)
    {
        // Simple mock of generation
        $ev = Esdeveniment::create([
            'nom' => $request->nom,
            'data' => $request->data,
            'descripcio' => $request->descripcio,
            'tag' => $request->tag,
            'imatge' => $request->imatge,
            'aforament' => $request->numSeientsPerFila * $request->files * 2
        ]);
        return response()->json($ev);
    }

    public function destroy($id)
    {
        Esdeveniment::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }
}
