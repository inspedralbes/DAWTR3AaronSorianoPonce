<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $esdeveniments = [
            ['nom' => 'Concert Final de Gira', 'data' => '2026-10-15 21:00:00', 'descripcio' => 'El concert musical més esperat de l\'any amb escenografies increïbles.', 'aforament' => 280, 'tag' => 'Música', 'imatge' => '/img/concert.webp'],
            ['nom' => 'Estrena Cinematogràfica', 'data' => '2026-11-01 19:30:00', 'descripcio' => 'Projecció exclusiva d\'avantguardes cinemàtiques en pantalla gegant IMAX i so immersiu multidireccional.', 'aforament' => 280, 'tag' => 'Cinema', 'imatge' => '/img/cine.webp'],
            ['nom' => 'Obra de Teatre Clàssica', 'data' => '2026-11-20 18:00:00', 'descripcio' => 'Adaptació contemporània del gran clàssic de Shakespeare amb actrius de renom.', 'aforament' => 280, 'tag' => 'Teatre', 'imatge' => '/img/teatre.webp'],
            ['nom' => 'Masterclass de Desenvolupament', 'data' => '2026-12-05 10:00:00', 'descripcio' => 'Aprofundeix en l\'arquitectura de programari avançat amb els millors enginyers de la indústria.', 'aforament' => 280, 'tag' => 'Tecnologia', 'imatge' => '/img/tech.webp']
        ];

        foreach ($esdeveniments as $ev) {
            $evId = DB::table('esdeveniments')->insertGetId($ev);

            $cat1Name = str_contains($ev['nom'], 'Concert') ? 'VIP' : 'Platea';
            $cat1Id = DB::table('categories')->insertGetId(['esdeveniment_id' => $evId, 'nom' => $cat1Name, 'preu' => 120.00]);
            $cat2Id = DB::table('categories')->insertGetId(['esdeveniment_id' => $evId, 'nom' => 'General', 'preu' => 50.00]);
            $cat3Id = DB::table('categories')->insertGetId(['esdeveniment_id' => $evId, 'nom' => 'Superior', 'preu' => 30.00]);

            $seients = [];
            $filesVIP = ['A', 'B'];
            $filesGen = ['C', 'D'];
            $filesSup = ['E', 'F', 'G', 'H'];
            $seientsPerFila = 35;

            foreach ($filesVIP as $f) {
                for ($i = 1; $i <= $seientsPerFila; $i++) {
                    $seients[] = ['categoria_id' => $cat1Id, 'fila' => $f, 'numero' => $i];
                }
            }
            foreach ($filesGen as $f) {
                for ($i = 1; $i <= $seientsPerFila; $i++) {
                    $seients[] = ['categoria_id' => $cat2Id, 'fila' => $f, 'numero' => $i];
                }
            }
            foreach ($filesSup as $f) {
                for ($i = 1; $i <= $seientsPerFila; $i++) {
                    $seients[] = ['categoria_id' => $cat3Id, 'fila' => $f, 'numero' => $i];
                }
            }

            // Insert in chunks to avoid large query limits if necessary (here it's small)
            DB::table('seients')->insert($seients);
        }
    }
}
