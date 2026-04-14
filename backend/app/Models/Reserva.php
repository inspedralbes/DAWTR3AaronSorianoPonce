<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// El model Reserva formalitza la compra o el bloqueig ferm d'un seient per part d'un usuari.
// Actua com a taula d'enllaç entre l'usuari final i l'inventari de butaques.
class Reserva extends Model
{
    use HasFactory;
    
    protected $table = 'reserves';
    
    // Per simplicitat acadèmica i mantenir la coherència amb l'esquema SQL inicial, 
    // desactivem els timestamps d'Eloquent i gestionem 'data_expiracio' manualment.
    public $timestamps = false;

    protected $fillable = ['usuari_id', 'seient_id', 'data_expiracio', 'estat'];

    // Identifica el propietari de l'entrada.
    public function usuari()
    {
        return $this->belongsTo(Usuari::class, 'usuari_id');
    }

    // Identifica el seient concret adquirit.
    public function seient()
    {
        return $this->belongsTo(Seient::class, 'seient_id');
    }
}
