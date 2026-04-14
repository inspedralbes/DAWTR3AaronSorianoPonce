<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('esdeveniments', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->dateTime('data');
            $table->text('descripcio')->nullable();
            $table->string('tag', 100)->default('General');
            $table->string('imatge')->nullable();
            $table->integer('aforament');
            $table->timestamp('creada_en')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('esdeveniments');
    }
};
