require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function seed() {
    try {
        console.log('Connectant a MySQL per inicialitzar...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        const sql = fs.readFileSync(path.join(__dirname, '../db/init.sql'), 'utf8');
        
        console.log('Executant script SQL (Eliminant i creant taules)...');
        await connection.query(sql);

        // Canvia el focus de la base de dades
        await connection.changeUser({ database: process.env.DB_NAME || 'ticketing_db' });

        console.log('Generant dades (Esdeveniments, Categories i Centenars de Seients)...');
        
        const esdeveniments = [
            { nom: 'Concert Final de Gira', data: '2026-10-15 21:00:00', descripcio: 'El concert musical més esperat de l\'any amb escenografies increïbles.', aforament: 280, tag: 'Música', imatge: '/img/concert.webp' },
            { nom: 'Estrena Cinematogràfica', data: '2026-11-01 19:30:00', descripcio: 'Projecció exclusiva d\'avantguardes cinemàtiques en pantalla gegant IMAX i so immersiu multidireccional.', aforament: 280, tag: 'Cinema', imatge: '/img/cine.webp' },
            { nom: 'Obra de Teatre Clàssica', data: '2026-11-20 18:00:00', descripcio: 'Adaptació contemporània del gran clàssic de Shakespeare amb actrius de renom.', aforament: 280, tag: 'Teatre', imatge: '/img/teatre.webp' },
            { nom: 'Masterclass de Desenvolupament', data: '2026-12-05 10:00:00', descripcio: 'Aprofundeix en l\'arquitectura de programari avançat amb els millors enginyers de la indústria.', aforament: 280, tag: 'Tecnologia', imatge: '/img/tech.webp' }
        ];

        for (const ev of esdeveniments) {
            const [evResult] = await connection.query(
                'INSERT INTO esdeveniments (nom, data, descripcio, aforament, tag, imatge) VALUES (?, ?, ?, ?, ?, ?)',
                [ev.nom, ev.data, ev.descripcio, ev.aforament, ev.tag, ev.imatge]
            );
            const esdevenimentId = evResult.insertId;

            // Dues categories base
            const cat1Name = ev.nom.includes('Concert') ? 'VIP' : 'Platea';
            const cat2Name = 'General';
            const cat3Name = 'Superior';
            
            const [cat1Res] = await connection.query('INSERT INTO categories (esdeveniment_id, nom, preu) VALUES (?, ?, ?)', [esdevenimentId, cat1Name, 120.00]);
            const [cat2Res] = await connection.query('INSERT INTO categories (esdeveniment_id, nom, preu) VALUES (?, ?, ?)', [esdevenimentId, cat2Name, 50.00]);
            const [cat3Res] = await connection.query('INSERT INTO categories (esdeveniment_id, nom, preu) VALUES (?, ?, ?)', [esdevenimentId, cat3Name, 30.00]);
            
            const cat1Id = cat1Res.insertId;
            const cat2Id = cat2Res.insertId;
            const cat3Id = cat3Res.insertId;

            const filesVIP = ['A', 'B'];
            const filesGen = ['C', 'D'];
            const filesSup = ['E', 'F', 'G', 'H'];
            const SEIENTS_PER_FILA = 35;

            let seatsToInsert = [];
            // Fila A i B (VIP/Platea) - Sèrie llarga i uniforme
            for (const f of filesVIP) {
                for (let i = 1; i <= SEIENTS_PER_FILA; i++) {
                    seatsToInsert.push([cat1Id, f, i]);
                }
            }
            
            // Fila C i D (General) - Exactament la mateixa mesura
            for (const f of filesGen) {
                for (let i = 1; i <= SEIENTS_PER_FILA; i++) {
                    seatsToInsert.push([cat2Id, f, i]);
                }
            }

            // Fila E, F, G, H (Superior) - Les noves afegides
            for (const f of filesSup) {
                for (let i = 1; i <= SEIENTS_PER_FILA; i++) {
                    seatsToInsert.push([cat3Id, f, i]);
                }
            }

            if (seatsToInsert.length > 0) {
                 await connection.query('INSERT INTO seients (categoria_id, fila, numero) VALUES ?', [seatsToInsert]);
            }
        }

        console.log('Base de dades omplerta correctament amb múltiples esdeveniments i molts seients.');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error inicialitzant la base de dades:', error);
        process.exit(1);
    }
}

seed();
