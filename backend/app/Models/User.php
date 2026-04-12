<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuaris';
    public $timestamps = false; // Original node app didn't use created_at, but we added it to migration, so we can leave it. Wait, I added it to migration, so it's true.

    protected $fillable = [
        'nom',
        'email',
        'contrasenya',
        'admin'
    ];

    protected $hidden = [
        'contrasenya',
    ];

    public function getAuthPassword()
    {
        return $this->contrasenya;
    }

    public function reserves()
    {
        return $this->hasMany(Reserva::class, 'usuari_id');
    }
}
