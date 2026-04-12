<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->constrained('categories')->onDelete('cascade');
            $table->string('fila', 10);
            $table->integer('numero');
            $table->enum('estat', ['Lliure', 'Venut'])->default('Lliure');
            // Adding user socket simulation columns since Laravel state doesn't memory-persist like node
            $table->string('socket_id')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seients');
    }
};
