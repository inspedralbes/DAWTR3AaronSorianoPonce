<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuari;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AutenticacioController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'nom' => 'required',
            'email' => 'required|email|unique:usuaris,email',
            'password' => 'required|min:6'
        ]);

        $user = Usuari::create([
            'nom' => $request->nom,
            'email' => $request->email,
            'contrasenya' => Hash::make($request->password),
            'admin' => false
        ]);

        return response()->json([
            'message' => 'Usuari registrat correctament.',
            'user' => ['id' => $user->id, 'nom' => $user->nom, 'email' => $user->email, 'admin' => $user->admin]
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = Usuari::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->contrasenya)) {
            return response()->json(['error' => 'Credencials invàlides.'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login correcte',
            'token' => $token,
            'user' => ['id' => $user->id, 'nom' => $user->nom, 'email' => $user->email, 'admin' => $user->admin]
        ]);
    }

    public function tickets(Request $request)
    {
        $user = $request->user();
        $tickets = $user->reserves()->with(['seient.categoria.esdeveniment'])->get();
        // format output as frontend expects
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
