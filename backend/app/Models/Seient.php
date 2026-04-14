<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// El model Seient gestiona l'estat individual de cada cadira de la sala.
// Inclou lògica per al bloqueig temporal mitjançant socket_id per evitar col·lisions.
class Seient extends Model
{
    use HasFactory;
    
    protected $table = 'seients';
    public $timestamps = false;

    // 'socket_id' i 'expires_at' són claus per a la funcionalitat de reserva en temps real.
    protected $fillable = ['categoria_id', 'fila', 'numero', 'estat', 'socket_id', 'expires_at'];

    // Determina a quina categoria (i preu) pertany aquest seient.
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    // Un seient pot haver tingut diverses reserves en el temps, tot i que habitualment ens interessa l'actual.
    public function reserves()
    {
        return $this->hasMany(Reserva::class, 'seient_id');
    }
}
