<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// El model Categoria defineix els nivells de preu i zones de seients d'un esdeveniment.
// Aquesta estructura permet una gestió modular dels preus segons la zona de la sala.
class Categoria extends Model
{
    use HasFactory;
    
    protected $table = 'categories';
    
    // Un cop definits els preus, no solen canviar sovint, per tant no necessitem timestamps per fila.
    public $timestamps = false;

    protected $fillable = ['esdeveniment_id', 'nom', 'preu'];

    // Relació inversa: Cada categoria pertany a un esdeveniment concret.
    public function esdeveniment()
    {
        return $this->belongsTo(Esdeveniment::class, 'esdeveniment_id');
    }

    // Una categoria conté múltiples seients físics.
    public function seients()
    {
        return $this->hasMany(Seient::class, 'categoria_id');
    }
}
