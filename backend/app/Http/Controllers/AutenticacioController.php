<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuari;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

// Aquest controlador gestiona tot el flux d'accés dels clients a la plataforma.
// S'encarrega del registre i la validació de sessions mitjançant tokens de Sanctum.
class AutenticacioController extends Controller
{
    /**
     * Registra un nou usuari al sistema.
     * Inclou validació de dades i encriptació de la contrasenya per seguretat.
     */
    public function register(Request $request)
    {
        // Validació d'entrada: assegurem que les dades són correctes i el correu és únic.
        $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|email|unique:usuaris,email',
            'password' => 'required|min:6'
        ]);

        // Creació de l'entitat usuari a la base de dades utilitzant el model Usuari.
        $user = Usuari::create([
            'nom' => $request->nom,
            'email' => $request->email,
            'contrasenya' => Hash::make($request->password), // Encriptació Bcrypt.
            'admin' => false
        ]);

        return response()->json([
            'message' => 'Usuari registrat correctament.',
            'user' => [
                'id' => $user->id, 
                'nom' => $user->nom, 
                'email' => $user->email, 
                'admin' => $user->admin
            ]
        ]);
    }

    /**
     * Gestiona l'inici de sessió i retorna un token d'accés.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // Busquem l'usuari pel correu electrònic.
        $user = Usuari::where('email', $request->email)->first();

        // Verificació de l'existència i de la contrasenya encriptada.
        if (! $user || ! Hash::check($request->password, $user->contrasenya)) {
            return response()->json(['error' => 'Les credencials introduïdes són invàlides.'], 401);
        }

        // Generació del token d'API per a comunicacions autenticades futures.
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login correcte',
            'token' => $token,
            'user' => [
                'id' => $user->id, 
                'nom' => $user->nom, 
                'email' => $user->email, 
                'admin' => $user->admin
            ]
        ]);
    }

    /**
     * Retorna el llistat d'entrades adquirides per l'usuari autenticat.
     * Demostra la separació entre lògica d'usuari i gestió de reserves.
     */
    public function tickets(Request $request)
    {
        $user = $request->user();
        
        // Càrrega optimitzada de relacions per evitar el problema de les consultes N+1.
        $tickets = $user->reserves()->with(['seient.categoria.esdeveniment'])->get();
        
        // Transformació de les dades per adaptar-les exactament al que espera el frontend (Nuxt).
        $formatted = $tickets->map(function($r) {
            $s = $r->seient;
            return [
                'id' => $r->id,
                'fila' => $s->fila,
                'numero' => $s->numero,
                'categoria' => $s->categoria->nom,
                'event_nom' => $s->categoria->esdeveniment->nom,
                'event_data' => $s->categoria->esdeveniment->data,
                'imatge' => $s->categoria->esdeveniment->imatge,
                'estat' => $r->estat
            ];
        });

        return response()->json($formatted);
    }
}
