<?php

namespace App\Models;

// El model Usuari gestiona la identitat i les capacitats d'accés a la plataforma.
// Extén de Authenticatable per permetre l'ús de Laravel Sanctum i el sistema d'autenticació base.
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuari extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // Especifiquem la taula explícitament per seguir la nomenclatura en català definida a les migracions.
    protected $table = 'usuaris';
    
    // Desactivem els timestamps si la taula original no els requereix, 
    // tot i que en Laravel 11 és recomanable mantenir-los per traçabilitat.
    public $timestamps = false;

    // Camps que es poden assignar massivament per seguretat.
    protected $fillable = [
        'nom',
        'email',
        'contrasenya',
        'admin'
    ];

    // Amaguem el camp de la contrasenya en les res Dylan JSON per evitar fugues de dades.
    protected $hidden = [
        'contrasenya',
    ];

    // Laravel espera una columna 'password', en canviar-la a 'contrasenya' hem de mapejar-la.
    public function getAuthPassword()
    {
        return $this->contrasenya;
    }

    // Relació d'un usuari amb les seves reserves de seients.
    public function reserves()
    {
        return $this->hasMany(Reserva::class, 'usuari_id');
    }
}
