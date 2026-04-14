<?php

namespace App\Http\Controllers;

use App\Models\Esdeveniment;
use App\Models\Reserva;
use App\Models\Seient;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Gestor de les operacions internes i d'anàlisi de dades per al perfil d'administrador.
// Aquest controlador reflecteix la separació entre la vista pública i el panell de control.
class AdministracioController extends Controller
{
    /**
     * Genera estadístiques globals de la plataforma.
     * Útil per tenir un resum ràpid de l'estat dels ingressos i l'ocupació.
     */
    public function globalStats()
    {
        // Recuperem tots els seients per fer un recompte d'estats.
        $seients = Seient::with('categoria')->get();
        $lliures = 0;
        $venuts = 0;
        $reservats = 0;
        $recaptacio = 0;

        foreach ($seients as $s) {
            // Diferenciem entre lliure real i reserva temporal (en procés).
            if ($s->estat === 'Lliure' && $s->socket_id) {
                $reservats++;
            } elseif ($s->estat === 'Lliure') {
                $lliures++;
            } elseif ($s->estat === 'Venut') {
                $venuts++;
                $recaptacio += $s->categoria->preu; // Sumem el preu segons la categoria.
            }
        }

        return response()->json([
            'lliures' => $lliures,
            'venuts' => $venuts,
            'reservats' => $reservats,
            'recaptacio' => $recaptacio
        ]);
    }

    /**
     * Calcula l'estat detallat per a cada esdeveniment individual.
     */
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
            // Percentatge d'ocupació sobre l'aforament total.
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

    /**
     * Genera un informe resumit d'ingressos per categories de preu.
     * Utilitza consultes SQL directes per a una major eficiència en agregacions complexes.
     */
    public function reports()
    {
        $cats = DB::select("SELECT c.nom as categoria, SUM(c.preu) as total_recapte, COUNT(s.id) as entrades_venudes FROM categories c JOIN seients s ON s.categoria_id = c.id WHERE s.estat = 'Venut' GROUP BY c.nom");
        return response()->json(['categories' => $cats]);
    }

    /**
     * Llistat de compres realitzades amb tota la informació del client i el seient.
     */
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

    /**
     * Crea un nou esdeveniment al sistema.
     * En una fase real, aquí hi hauria la lògica per generar els seients automàticament.
     */
    public function store(Request $request)
    {
        $ev = Esdeveniment::create([
            'nom' => $request->nom,
            'data' => $request->data,
            'descripcio' => $request->descripcio,
            'tag' => $request->tag,
            'imatge' => $request->imatge,
            // Càlcul simulat d'aforament segons l'esquema de files triat.
            'aforament' => $request->numSeientsPerFila * $request->files * 2
        ]);
        return response()->json($ev);
    }

    /**
     * Elimina un esdeveniment del sistema.
     */
    public function destroy($id)
    {
        Esdeveniment::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }
}
