<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    use HasFactory;
    
    protected $table = 'reserves';
    public $timestamps = false; // matching init.sql structure

    protected $fillable = ['usuari_id', 'seient_id', 'data_expiracio', 'estat'];

    public function usuari()
    {
        return $this->belongsTo(Usuari::class, 'usuari_id');
    }

    public function seient()
    {
        return $this->belongsTo(Seient::class, 'seient_id');
    }
}
