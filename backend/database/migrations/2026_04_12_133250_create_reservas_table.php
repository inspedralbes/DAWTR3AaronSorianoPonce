<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reserves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuari_id')->constrained('usuaris')->onDelete('cascade');
            $table->foreignId('seient_id')->constrained('seients')->onDelete('cascade');
            $table->dateTime('data_expiracio');
            $table->enum('estat', ['Pendent', 'Completada', 'Expirada'])->default('Pendent');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reserves');
    }
};
