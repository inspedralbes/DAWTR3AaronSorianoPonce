<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Esdeveniment extends Model
{
    use HasFactory;
    
    protected $table = 'esdeveniments';
    
    // original schema used 'creada_en', but eloquent uses created_at. We'll map or just keep simple.
    const CREATED_AT = 'creada_en';
    const UPDATED_AT = null;

    protected $fillable = ['nom', 'data', 'descripcio', 'tag', 'imatge', 'aforament'];

    public function categories()
    {
        return $this->hasMany(Categoria::class, 'esdeveniment_id');
    }
}
