<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;
    
    protected $table = 'categories';
    public $timestamps = false;

    protected $fillable = ['esdeveniment_id', 'nom', 'preu'];

    public function esdeveniment()
    {
        return $this->belongsTo(Esdeveniment::class, 'esdeveniment_id');
    }

    public function seients()
    {
        return $this->hasMany(Seient::class, 'categoria_id');
    }
}
