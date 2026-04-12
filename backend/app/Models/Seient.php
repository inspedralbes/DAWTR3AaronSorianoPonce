<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seient extends Model
{
    use HasFactory;
    
    protected $table = 'seients';
    public $timestamps = false;

    protected $fillable = ['categoria_id', 'fila', 'numero', 'estat', 'socket_id', 'expires_at'];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function reserves()
    {
        return $this->hasMany(Reserva::class, 'seient_id');
    }
}
