require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const pool = require('./db');
const crypto = require('crypto');

// Migració instantània de seguretat sense pèrdua de dades if not exists
pool.query('ALTER TABLE usuaris ADD COLUMN contrasenya VARCHAR(255) DEFAULT NULL').catch(e => { /* Silenci si ja estava afegit */ });

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Estat de reserves en memòria
// format: { "id_esdeveniment": { "id_seient": { socketId, expiresAt, status: 'Reservat' } } }
const seatsState = {}; 
const timers = {}; // per guardar els setTimeout id

const RESERVE_TIME = 3 * 60 * 1000; // 3 minuts

let usersConnected = 0;

io.on('connection', (socket) => {
  usersConnected++;
  io.emit('users_count', usersConnected);
  console.log('Un usuari s\'ha connectat:', socket.id, 'Total:', usersConnected);

  socket.on('join_event', async (eventId) => {
    socket.join(`event_${eventId}`);
    
    // Obtenir estat de la base de dades
    try {
      const [seats] = await pool.query(`
        SELECT s.id, s.estat, c.nom as categoria, c.preu, s.fila, s.numero 
        FROM seients s 
        JOIN categories c ON s.categoria_id = c.id 
        WHERE c.esdeveniment_id = ?`, [eventId]);
      
      // Combinar amb estat en memòria
      if (!seatsState[eventId]) {
        seatsState[eventId] = {};
      }

      const mergedSeats = seats.map(seat => {
        const memState = seatsState[eventId][seat.id];
        return {
          ...seat,
          estat: memState ? memState.status : seat.estat,
          socketId: memState ? memState.socketId : null,
          expiresAt: memState ? memState.expiresAt : null
        };
      });

      socket.emit('init_seats', mergedSeats);
    } catch(err) {
      console.error(err);
    }
  });

  socket.on('reserve_seat', async ({ eventId, seatId }) => {
    if (!seatsState[eventId]) seatsState[eventId] = {};
    
    const currentState = seatsState[eventId][seatId];
    
    // Si ja està reservat en memòria o a punt de caducar però actiu
    if (currentState && currentState.status === 'Reservat') {
      return socket.emit('reserve_error', { seatId, message: 'Seient ja està reservat per un altre usuari' });
    }

    // Comprovar a BD que no estigui venut
    try {
      const [rows] = await pool.query('SELECT estat FROM seients WHERE id = ?', [seatId]);
      if (rows.length > 0 && rows[0].estat === 'Venut') {
        return socket.emit('reserve_error', { seatId, message: 'Seient ja venut' });
      }

      // Procedir a reservar
      const expiresAt = Date.now() + RESERVE_TIME;
      seatsState[eventId][seatId] = {
        socketId: socket.id,
        status: 'Reservat',
        expiresAt
      };

      // Avisar a tothom
      io.to(`event_${eventId}`).emit('seat_updated', {
        id: seatId,
        estat: 'Reservat',
        socketId: socket.id,
        expiresAt
      });

      // Configurar el temporitzador
      if (timers[seatId]) clearTimeout(timers[seatId]);
      timers[seatId] = setTimeout(() => {
        // Expirat
        if (seatsState[eventId] && seatsState[eventId][seatId] && seatsState[eventId][seatId].socketId === socket.id) {
            delete seatsState[eventId][seatId];
            io.to(`event_${eventId}`).emit('seat_updated', {
                id: seatId,
                estat: 'Lliure',
                socketId: null,
                expiresAt: null
            });
        }
      }, RESERVE_TIME);

    } catch(err) {
      console.error(err);
    }
  });

  socket.on('cancel_reserve', ({ eventId, seatId }) => {
    if (seatsState[eventId] && seatsState[eventId][seatId] && seatsState[eventId][seatId].socketId === socket.id) {
        delete seatsState[eventId][seatId];
        if (timers[seatId]) clearTimeout(timers[seatId]);
        
        io.to(`event_${eventId}`).emit('seat_updated', {
            id: seatId,
            estat: 'Lliure',
            socketId: null,
            expiresAt: null
        });
    }
  });

  socket.on('disconnect', () => {
    usersConnected--;
    io.emit('users_count', usersConnected);
    console.log('Usuari desconnectat:', socket.id, 'Total:', usersConnected);
    // Alliberar tots els seients que tingués aquest usuari
    for (const eventId in seatsState) {
        for (const seatId in seatsState[eventId]) {
            if (seatsState[eventId][seatId].socketId === socket.id) {
                delete seatsState[eventId][seatId];
                if (timers[seatId]) clearTimeout(timers[seatId]);
                
                io.to(`event_${eventId}`).emit('seat_updated', {
                    id: parseInt(seatId),
                    estat: 'Lliure',
                    socketId: null,
                    expiresAt: null
                });
            }
        }
    }
  });
});

// --- AUTHENTICATION API ---
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

app.post('/api/auth/register', async (req, res) => {
    try {
        const { nom, email, password } = req.body;
        if (!nom || !email || !password) return res.status(400).json({ error: "Tots els camps són obligatoris." });

        const [exists] = await pool.query('SELECT id FROM usuaris WHERE email = ?', [email]);
        if (exists.length > 0) return res.status(409).json({ error: "Ja existeix un compte amb aquest correu o ja va comprar alguna entrada." });

        const hashed = hashPassword(password);
        const [result] = await pool.query('INSERT INTO usuaris (nom, email, contrasenya) VALUES (?, ?, ?)', [nom, email, hashed]);
        
        res.json({ success: true, user: { id: result.insertId, nom, email } });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Dades incompletes." });

        const [users] = await pool.query('SELECT id, nom, email, contrasenya FROM usuaris WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ error: "Credencials incorrectes." });

        const user = users[0];
        
        // Excepció si era un usuari vell de fa dies on null
        if (!user.contrasenya) {
            return res.status(401).json({ error: "Sembla que aquest correu és temporal sense contrasenya. Has de registrar-te de nou." });
        }
        
        if (user.contrasenya !== hashPassword(password)) {
            return res.status(401).json({ error: "Credencials incorrectes." });
        }

        res.json({ success: true, user: { id: user.id, nom: user.nom, email: user.email } });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// API endpoints regulars
app.get('/api/events', async (req, res) => {
  try {
    const [events] = await pool.query('SELECT * FROM esdeveniments');
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const [events] = await pool.query('SELECT * FROM esdeveniments WHERE id = ?', [req.params.id]);
    if (events.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(events[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/buy', async (req, res) => {
  const { eventId, seats, user } = req.body; // seats: array of seat ids
  const socketId = req.headers['x-socket-id'];

  if (!seats || seats.length === 0) return res.status(400).json({ error: 'No seats provided' });

  try {
    // 1. Validar que la reserva pertany a l'usuari/socket
    for (const seatId of seats) {
      const memState = seatsState[eventId] ? seatsState[eventId][seatId] : null;
      if (!memState || memState.socketId !== socketId) {
         return res.status(403).json({ error: 'Expired or invalid reservation for seat: ' + seatId });
      }
    }

    // 2. Crear usuari si no existeix (simplificat per l'exemple)
    let [users] = await pool.query('SELECT id FROM usuaris WHERE email = ?', [user.email]);
    let userId;
    if (users.length === 0) {
      const [resUser] = await pool.query('INSERT INTO usuaris (nom, email) VALUES (?, ?)', [user.nom, user.email]);
      userId = resUser.insertId;
    } else {
      userId = users[0].id;
    }

    // 3. Fer UPDATE a base de dades a Venut i inserir reserva
    for (const seatId of seats) {
      await pool.query('UPDATE seients SET estat = ? WHERE id = ?', ['Venut', seatId]);
      await pool.query('INSERT INTO reserves (usuari_id, seient_id, data_expiracio, estat) VALUES (?, ?, ?, ?)', 
        [userId, seatId, new Date(), 'Completada']);
      
      // Alliberar timer i memòria
      delete seatsState[eventId][seatId];
      if (timers[seatId]) clearTimeout(timers[seatId]);

      // Emitir estat actualitzat
      io.to(`event_${eventId}`).emit('seat_updated', {
          id: seatId,
          estat: 'Venut',
          socketId: null,
          expiresAt: null
      });
    }

    res.json({ success: true, message: 'Compra finalitzada' });

  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', async (req, res) => {
    // Retornar estadístiques globals
    try {
        const [totalSeats] = await pool.query('SELECT count(*) as total, estat FROM seients GROUP BY estat');
        let stats = { lliures: 0, venuts: 0, reservats: 0, recaptacio: 0 };
        totalSeats.forEach(row => {
            if (row.estat === 'Lliure') stats.lliures = row.total;
            if (row.estat === 'Venut') stats.venuts = row.total;
        });

        const [recaptacioArray] = await pool.query('SELECT sum(c.preu) as total FROM seients s JOIN categories c ON s.categoria_id = c.id WHERE s.estat = "Venut"');
        stats.recaptacio = recaptacioArray[0].total || 0;

        let memoryReserved = 0;
        for (const ev in seatsState) {
            memoryReserved += Object.keys(seatsState[ev]).length;
        }
        
        stats.lliures -= memoryReserved;
        stats.reservats = memoryReserved;
        
        res.json(stats);
    } catch(err) {
         res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/events-stats', async (req, res) => {
    try {
        const [events] = await pool.query('SELECT id, nom, aforament, imatge, tag FROM esdeveniments');
        const [seatStats] = await pool.query('SELECT c.esdeveniment_id as `event`, s.estat, count(*) as count FROM seients s JOIN categories c ON s.categoria_id = c.id GROUP BY c.esdeveniment_id, s.estat');
        
        let formatted = events.map(ev => {
            const evStats = seatStats.filter(s => s.event === ev.id);
            let dict = { lliures: 0, venuts: 0, reservats: 0 };
            evStats.forEach(s => {
                if (s.estat === 'Lliure') dict.lliures = s.count;
                if (s.estat === 'Venut') dict.venuts = s.count;
            });
            // sumar temporal memory per aquest esdeveniment
            const memResv = seatsState[ev.id] ? Object.keys(seatsState[ev.id]).length : 0;
            dict.lliures -= memResv;
            dict.reservats = memResv;
            
            return {
               id: ev.id, nom: ev.nom, imatge: ev.imatge, tag: ev.tag, aforament: ev.aforament,
               ...dict,
               ocupacio: Math.round((dict.venuts / ev.aforament) * 100) || 0
            }
        });
        
        res.json(formatted);
    } catch(err) {
         res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/purchases', async (req, res) => {
    try {
        const [purchases] = await pool.query(`
            SELECT r.id, u.nom as client_nom, u.email, e.nom as event_nom, c.nom as categoria, s.fila, s.numero, r.data_expiracio
            FROM reserves r
            JOIN usuaris u ON r.usuari_id = u.id
            JOIN seients s ON r.seient_id = s.id
            JOIN categories c ON s.categoria_id = c.id
            JOIN esdeveniments e ON c.esdeveniment_id = e.id
            WHERE r.estat = "Completada"
            ORDER BY r.id DESC LIMIT 100
        `);
        res.json(purchases);
    } catch(err) {
         res.status(500).json({ error: err.message });
    }
});

app.get('/api/user/tickets', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email is required" });
        
        const [tickets] = await pool.query(`
            SELECT r.id as reserva_id, r.data_expiracio, s.fila, s.numero, c.nom as categoria, c.preu, e.nom as event_nom, e.data as event_data, e.imatge as event_imatge, e.tag
            FROM reserves r
            JOIN usuaris u ON r.usuari_id = u.id
            JOIN seients s ON r.seient_id = s.id
            JOIN categories c ON s.categoria_id = c.id
            JOIN esdeveniments e ON c.esdeveniment_id = e.id
            WHERE u.email = ? AND r.estat = "Completada"
            ORDER BY r.id DESC
        `, [email]);
        
        res.json(tickets);
    } catch(err) {
         res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/events', async (req, res) => {
    try {
        const { nom, descripcio, imatge, tag, data, preuGeneral, preuVip, files, numSeientsPerFila } = req.body;
        const totalAforament = files * numSeientsPerFila;
        
        // 1. Inserir Esdeveniment
        const [resEv] = await pool.query(
            'INSERT INTO esdeveniments (nom, descripcio, data, aforament, imatge, tag) VALUES (?, ?, ?, ?, ?, ?)',
            [nom, descripcio || '', data || new Date(), totalAforament, imatge || '/img/concert.webp', tag || 'ALTRE']
        );
        const evId = resEv.insertId;

        // 2. Crear Categories
        const [catGen] = await pool.query('INSERT INTO categories (esdeveniment_id, nom, preu) VALUES (?, ?, ?)', [evId, 'General', preuGeneral || 30]);
        const [catVip] = await pool.query('INSERT INTO categories (esdeveniment_id, nom, preu) VALUES (?, ?, ?)', [evId, 'VIP', preuVip || 90]);
        const catGenId = catGen.insertId;
        const catVipId = catVip.insertId;

        // 3. Matriu constructiva per als seients
        const abecedario = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        
        for (let i = 0; i < files; i++) {
             // Determinem la lletra de la Fila
             const nomFila = abecedario[i % abecedario.length] + (i >= abecedario.length ? Math.floor(i / abecedario.length) : '');
             // Posem les primeres 2 files com a VIP per a tots
             const catId = i < 2 ? catVipId : catGenId; 
             for (let j = 0; j < numSeientsPerFila; j++) {
                  await pool.query('INSERT INTO seients (categoria_id, fila, numero, estat) VALUES (?, ?, ?, ?)', 
                  [catId, nomFila, j + 1, 'Lliure']);
             }
        }
        res.json({ success: true, message: "Esdeveniment construït i publicat d'immediat respectant les físiques de matriu", id: evId });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/reports', async (req, res) => {
    try {
        const [catStats] = await pool.query(`
            SELECT c.nom as categoria, count(s.id) as entrades_venudes, sum(c.preu) as total_recapte
            FROM seients s
            JOIN categories c ON s.categoria_id = c.id
            WHERE s.estat = "Venut"
            GROUP BY c.nom
        `);
        
        const [timeStats] = await pool.query(`
            SELECT DATE(r.data_expiracio) as dia, count(r.id) as reserves, sum(c.preu) as recaptacio
            FROM reserves r
            JOIN seients s ON r.seient_id = s.id
            JOIN categories c ON s.categoria_id = c.id
            WHERE r.estat = 'Completada'
            GROUP BY dia
            ORDER BY dia DESC LIMIT 10
        `);

        res.json({ categories: catStats, timeSeries: timeStats });
    } catch(err) {
         res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/events/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM esdeveniments WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: "Esdeveniment eliminat correctament" });
    } catch(err) {
         res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor de backend en funcionament al port ${PORT}`);
});
