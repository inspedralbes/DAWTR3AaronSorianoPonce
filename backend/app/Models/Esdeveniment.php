<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// El model Esdeveniment representa l'entitat principal de la plataforma: els espectacles.
// Centralitza la informació de dates, aforament i imatge promocional.
class Esdeveniment extends Model
{
    use HasFactory;
    
    // Taula associada definida a la migració.
    protected $table = 'esdeveniments';
    
    // Mapegem els noms dels timestamps als de l'esquema original si cal.
    // Usarem 'creada_en' com a data de creació automàtica d'Eloquent.
    const CREATED_AT = 'creada_en';
    const UPDATED_AT = null;

    protected $fillable = ['nom', 'data', 'descripcio', 'tag', 'imatge', 'aforament'];

    // Relació jeràrquica: Un esdeveniment es divideix en diverses categories de preu.
    public function categories()
    {
        return $this->hasMany(Categoria::class, 'esdeveniment_id');
    }
}
